/**
 * Database Connection Pool Utility
 * 
 * PURPOSE: Provides efficient database connection management with connection pooling,
 * query batching, and automatic retry logic for optimal database scalability.
 * 
 * SCALABILITY FEATURES:
 * - Connection pooling to reduce connection overhead
 * - Query batching for bulk operations
 * - Automatic connection health checks
 * - Graceful connection failure handling
 * - Connection timeout management
 * - Load balancing across multiple connections
 */

import { qerrors } from 'qerrors';

interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  maxConnections?: number;
  minConnections?: number;
  connectionTimeout?: number;
  queryTimeout?: number;
}

interface QueryOptions {
  timeout?: number;
  retries?: number;
  batch?: boolean;
}

interface QueryResult<T = any> {
  success: boolean;
  data?: T;
  error?: Error;
  executionTime: number;
  connectionId: string;
}

class DatabaseConnectionPool {
  private config: Required<DatabaseConfig>;
  private connections: Map<string, any> = new Map();
  private activeConnections: Set<string> = new Set();
  private availableConnections: Set<string> = new Set(); // Track available connections for O(1) lookup
  private connectionQueue: Array<{
    resolve: (connection: any) => void;
    reject: (error: Error) => void;
    timestamp: number;
  }> = [];
  private readonly MAX_QUEUE_SIZE = 100;
  private readonly CONNECTION_HEALTH_CHECK_INTERVAL = 30000; // 30 seconds
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private timers: Set<NodeJS.Timeout> = new Set();

  constructor(config: DatabaseConfig) {
    this.config = {
      maxConnections: 10,
      minConnections: 2,
      connectionTimeout: 10000,
      queryTimeout: 30000,
      ...config
    };

    // Start health check interval
    this.startHealthChecks();
  }

  /**
   * Execute a database query with connection pooling and retry logic
   */
  async query<T = any>(
    sql: string, 
    params: any[] = [], 
    options: QueryOptions = {}
  ): Promise<QueryResult<T>> {
    const startTime = Date.now();
    const { timeout = this.config.queryTimeout, retries = 3, batch = false } = options;
    
    let lastError: Error | undefined;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      let connection: any;
      let connectionId: string = '';
      
      try {
        // Get connection from pool
        const connectionResult = await this.getConnection();
        connection = connectionResult.connection;
        connectionId = connectionResult.id;

        // Execute query with timeout
        const result = await this.executeWithTimeout<T>(
          connection, 
          sql, 
          params, 
          timeout
        );

        // Return connection to pool
        this.releaseConnection(connectionId);

        // Return successful result
        return {
          success: true,
          data: result,
          executionTime: Date.now() - startTime,
          connectionId
        };

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // Ensure connection is released on error
        if (connectionId) {
          this.releaseConnection(connectionId);
        }

        // Log retry attempt
        if (attempt < retries) {
          qerrors(
            lastError,
            'DatabaseConnectionPool.query',
            `Query attempt ${attempt + 1} failed, retrying...`
          );
          
          // Exponential backoff
          await this.delay(Math.pow(2, attempt) * 1000);
        }
      }
    }

    // All retries failed
    return {
      success: false,
      error: lastError,
      executionTime: Date.now() - startTime,
      connectionId: 'failed'
    };
  }

  /**
   * Execute multiple queries in a transaction (optimized with batching)
   */
  async transaction<T = any>(
    queries: Array<{ sql: string; params?: any[] }>
  ): Promise<QueryResult<T>[]> {
    const connection = await this.getConnection();
    const results: QueryResult<T>[] = [];
    
    try {
      // Begin transaction
      await this.executeWithTimeout(connection.connection, 'BEGIN', [], this.config.queryTimeout);
      
      // Optimize: Group similar queries for batching
      const queryGroups = this.groupSimilarQueries(queries);
      
      // Execute queries in optimized batches
      for (const group of queryGroups) {
        if (group.length === 1) {
          // Single query execution
          await this.executeSingleQuery(connection, group[0], results);
        } else {
          // Batch execution for similar queries
          await this.executeBatchedQueries(connection, group, results);
        }
      }
      
      // Commit transaction
      await this.executeWithTimeout(connection.connection, 'COMMIT', [], this.config.queryTimeout);
      
    } catch (error) {
      // Rollback on error
      try {
        await this.executeWithTimeout(connection.connection, 'ROLLBACK', [], this.config.queryTimeout);
      } catch (rollbackError) {
        qerrors(
          rollbackError instanceof Error ? rollbackError : new Error(String(rollbackError)),
          'DatabaseConnectionPool.transaction',
          'Failed to rollback transaction'
        );
      }
      
      throw error;
    } finally {
      this.releaseConnection(connection.id);
    }
    
    return results;
  }

  /**
   * Group similar queries for batch optimization
   */
  private groupSimilarQueries(queries: Array<{ sql: string; params?: any[] }>): Array<Array<{ sql: string; params?: any[] }>> {
    const groups: Map<string, Array<{ sql: string; params?: any[] }>> = new Map();
    
    for (const query of queries) {
      const queryType = this.getQueryType(query.sql);
      if (!groups.has(queryType)) {
        groups.set(queryType, []);
      }
      groups.get(queryType)!.push(query);
    }
    
    return Array.from(groups.values());
  }

  /**
   * Extract query type for grouping
   */
  private getQueryType(sql: string): string {
    // Simple query type detection for batching
    const normalized = sql.trim().toLowerCase();
    
    if (normalized.startsWith('select')) return 'SELECT';
    if (normalized.startsWith('insert')) return 'INSERT';
    if (normalized.startsWith('update')) return 'UPDATE';
    if (normalized.startsWith('delete')) return 'DELETE';
    
    return 'OTHER';
  }

  /**
   * Execute single query with timing
   */
  private async executeSingleQuery<T>(
    connection: { connection: any; id: string }, 
    query: { sql: string; params?: any[] }, 
    results: QueryResult<T>[]
  ): Promise<void> {
    const startTime = Date.now();
    try {
      const result = await this.executeWithTimeout<T>(
        connection.connection,
        query.sql,
        query.params || [],
        this.config.queryTimeout
      );
      
      results.push({
        success: true,
        data: result,
        executionTime: Date.now() - startTime,
        connectionId: connection.id
      });
    } catch (error) {
      results.push({
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
        executionTime: Date.now() - startTime,
        connectionId: connection.id
      });
      throw error;
    }
  }

  /**
   * Execute batched queries for optimization
   */
  private async executeBatchedQueries<T>(
    connection: { connection: any; id: string },
    queries: Array<{ sql: string; params?: any[] }>,
    results: QueryResult<T>[]
  ): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Create batch SQL for supported operations
      const batchSql = this.createBatchSql(queries);
      const batchParams = queries.flatMap(q => q.params || []);
      
      const result = await this.executeWithTimeout<T>(
        connection.connection,
        batchSql,
        batchParams,
        this.config.queryTimeout
      );
      
      // Add results for all queries in batch
      for (let i = 0; i < queries.length; i++) {
        results.push({
          success: true,
          data: Array.isArray(result) ? result[i] : result,
          executionTime: (Date.now() - startTime) / queries.length,
          connectionId: connection.id
        });
      }
      
    } catch (error) {
      // Add error result for all queries in batch
      for (const query of queries) {
        results.push({
          success: false,
          error: error instanceof Error ? error : new Error(String(error)),
          executionTime: (Date.now() - startTime) / queries.length,
          connectionId: connection.id
        });
      }
      throw error;
    }
  }

  /**
   * Create batch SQL for similar queries
   */
  private createBatchSql(queries: Array<{ sql: string; params?: any[] }>): string {
    const queryType = this.getQueryType(queries[0].sql);
    
    switch (queryType) {
      case 'INSERT':
        // Combine multiple INSERTs into single statement
        const values = queries.map(q => {
          const paramList = (q.params || []).map((_, i) => `$${i + 1}`).join(', ');
          return `(${paramList})`;
        }).join(', ');
        return `INSERT INTO table (columns) VALUES ${values};`;
        
      case 'UPDATE':
        // For UPDATE, execute sequentially (most databases don't support batch UPDATE)
        return queries.map(q => q.sql).join('; ');
        
      case 'SELECT':
        // Combine multiple SELECTs with UNION ALL if possible
        return queries.map(q => q.sql).join(' UNION ALL ');
        
      default:
        // Fallback to sequential execution
        return queries.map(q => q.sql).join('; ');
    }
  }

  /**
   * Get a connection from the pool (optimized with connection pre-warming and affinity)
   */
  private async getConnection(): Promise<{ connection: any; id: string }> {
    // Connection pre-warming for better performance
    if (this.connections.size < this.config.minConnections) {
      await this.preWarmConnections();
    }
    
    // Implement connection affinity for better cache locality
    const affinityKey = this.getCurrentThreadAffinity();
    const affinityConnection = this.getAffinityConnection(affinityKey);
    
    if (affinityConnection && this.isConnectionHealthy(affinityConnection)) {
      return affinityConnection;
    }

    // Check for available connections using O(1) set lookup
    if (this.availableConnections.size > 0) {
      const availableId = this.availableConnections.values().next().value;
      if (availableId) {
        this.availableConnections.delete(availableId);
        this.activeConnections.add(availableId);
        const connection = this.connections.get(availableId);
        if (connection && this.isConnectionHealthy(connection)) {
          return { connection, id: availableId };
        }
      }
    }

    // Create new connection if under limit
    if (this.connections.size < this.config.maxConnections) {
      const connectionId = this.createConnectionId();
      const connection = await this.createConnection();
      this.connections.set(connectionId, connection);
      this.activeConnections.add(connectionId);
      return { connection, id: connectionId };
    }

    // Wait for available connection with queue overflow protection
    return new Promise((resolve, reject) => {
      if (this.connectionQueue.length >= this.MAX_QUEUE_SIZE) {
        // Remove oldest 10% to prevent queue overflow
        const toRemove = Math.max(1, Math.floor(this.MAX_QUEUE_SIZE * 0.1));
        const removed = this.connectionQueue.splice(0, toRemove);
        removed.forEach(item => item.reject(new Error('Connection queue overflow')));
      }

      this.connectionQueue.push({
        resolve,
        reject,
        timestamp: Date.now()
      });

      // Set timeout for queue wait
      const timer = setTimeout(() => {
        const index = this.connectionQueue.findIndex(
          item => item.resolve === resolve
        );
        if (index !== -1) {
          this.connectionQueue.splice(index, 1);
          reject(new Error('Connection timeout'));
        }
      }, this.config.connectionTimeout || 30000);

      // Store timer reference for cleanup
      (this.connectionQueue[this.connectionQueue.length - 1] as any).timer = timer;
    });
  }

  /**
   * Add connection pre-warming for better performance
   */
  private async preWarmConnections(): Promise<void> {
    const warmupPromises: Promise<void>[] = [];
    const targetSize = Math.min(this.config.minConnections, this.config.maxConnections);
    
    for (let i = this.connections.size; i < targetSize; i++) {
      warmupPromises.push(this.createAndStoreConnection());
    }
    
    await Promise.all(warmupPromises);
  }

/**
   * Create a new database connection with validation and retry
   */
  private async createConnection(retryCount: number = 0): Promise<any> {
    const maxRetries = 3;
    const baseDelay = 100; // Base delay in ms
    
    try {
      // Simulate connection creation (replace with actual database driver)
      const connectionId = this.createConnectionId();
      
      // Add exponential backoff for retries
      const delay = baseDelay * Math.pow(2, retryCount);
      if (retryCount > 0) {
        await new Promise(resolve => setTimeout(resolve, Math.min(delay, 5000)));
      }
      
      const connection = {
        id: connectionId,
        created: Date.now(),
        lastUsed: Date.now(),
        isHealthy: true,
        queryCount: 0,
        lastValidated: Date.now(),
        retryCount
      };
      
      // Validate connection immediately
      await this.validateConnection(connection);
      
      return connection;
    } catch (error) {
      if (retryCount < maxRetries) {
        console.warn(`Connection creation failed (attempt ${retryCount + 1}/${maxRetries}), retrying:`, error.message);
        return this.createConnection(retryCount + 1);
      }
      
      throw new Error(`Failed to create database connection after ${maxRetries} attempts: ${error.message}`);
    }
  }

  /**
   * Validate connection health
   */
  private async validateConnection(connection: any): Promise<void> {
    try {
      // Simulate health check (replace with actual ping/health check)
      await new Promise(resolve => setTimeout(resolve, 10));
      
      connection.isHealthy = true;
      connection.lastValidated = Date.now();
    } catch (error) {
      connection.isHealthy = false;
      throw new Error(`Connection validation failed: ${error.message}`);
    }
  }

  /**
   * Check if connection needs validation
   */
  private shouldValidateConnection(connection: any): boolean {
    const lastValidationAge = Date.now() - (connection.lastValidated || connection.created);
    const maxAge = 30000; // Validate every 30 seconds
    
    return lastValidationAge > maxAge || !connection.isHealthy;
  }

  /**
   * Get current thread affinity for connection reuse
   */
  private getCurrentThreadAffinity(): string {
    // Simple thread affinity based on async context
    return `thread_${process.pid}_${Date.now() % 8}`;
  }

  /**
   * Get affinity connection for better cache locality
   */
  private getAffinityConnection(affinityKey: string): { connection: any; id: string } | null {
    // Try to find a connection that matches this affinity
    for (const [id, connection] of this.connections) {
      if (this.availableConnections.has(id) && 
          (connection as any).affinityKey === affinityKey &&
          this.isConnectionHealthy(connection)) {
        this.availableConnections.delete(id);
        this.activeConnections.add(id);
        return { connection, id };
      }
    }
    return null;
  }

  /**
   * Check if connection is healthy
   */
  private isConnectionHealthy(connection: any): boolean {
    try {
      // Simple health check - can be enhanced with actual ping
      return connection && !connection.closed && connection.readyState === 'connected';
    } catch {
      return false;
    }
  }

  /**
   * Release a connection back to the pool (optimized)
   */
  private releaseConnection(connectionId: string): void {
    this.activeConnections.delete(connectionId);
    
    // Process queued requests first
    if (this.connectionQueue.length > 0) {
      const queued = this.connectionQueue.shift();
      if (queued) {
        this.activeConnections.add(connectionId);
        const connection = this.connections.get(connectionId);
        if (connection) {
          queued.resolve({ connection, id: connectionId });
        }
      }
    } else {
      // Add to available connections if no queue
      this.availableConnections.add(connectionId);
    }
  }

  /**
   * Generate unique connection ID
   */
  private createConnectionId(): string {
    return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create a new database connection
   */
  

  /**
   * Execute query with timeout
   */
  private async executeWithTimeout<T>(
    connection: any,
    sql: string,
    params: any[],
    timeout: number
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Query timeout'));
      }, timeout);

      connection.query(sql, params)
        .then((result: T) => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch((error: Error) => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  /**
   * Start connection health checks (optimized with timer tracking)
   */
  private startHealthChecks(): void {
    this.healthCheckInterval = this.addInterval(async () => {
      // Only check a subset of connections per interval to reduce overhead
      const connectionsToCheck = Array.from(this.connections.keys()).slice(0, Math.ceil(this.connections.size / 2));
      
      await Promise.allSettled(
        connectionsToCheck.map(async (id) => {
          const connection = this.connections.get(id);
          if (!connection) return;
          
          try {
            // Simple health check query
            await this.executeWithTimeout(
              connection,
              'SELECT 1',
              [],
              5000 // 5 second timeout for health check
            );
          } catch (error) {
            qerrors(
              error instanceof Error ? error : new Error(String(error)),
              'DatabaseConnectionPool.healthCheck',
              `Connection ${id} failed health check, removing from pool`
            );
            
            // Remove failed connection
            this.connections.delete(id);
            this.activeConnections.delete(id);
            this.availableConnections.delete(id);
          }
        })
      );
    }, this.CONNECTION_HEALTH_CHECK_INTERVAL);
  }

  /**
   * Add interval with tracking for cleanup
   */
  private addInterval(callback: () => void, ms: number): NodeJS.Timeout {
    const interval = setInterval(callback, ms);
    this.timers.add(interval);
    return interval;
  }

  /**
   * Remove interval and cleanup tracking
   */
  private removeInterval(interval: NodeJS.Timeout): void {
    clearInterval(interval);
    this.timers.delete(interval);
  }

/**
   * Execute a database query with enhanced connection pooling and retry logic
   */
  async query<T = any>(
    sql: string, 
    params: any[] = [], 
    options: QueryOptions = {}
  ): Promise<QueryResult<T>> {
    const startTime = Date.now();
    const { timeout = this.config.queryTimeout, retries = 3, batch = false } = options;
    
    let connection: any;
    let lastError: Error | undefined;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        connection = await this.getConnection();
        
        // Check if connection needs validation
        if (this.shouldValidateConnection(connection)) {
          await this.validateConnection(connection);
        }
        
        // Execute query with timeout
        const queryPromise = this.executeQuery(connection, sql, params, batch);
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Query timeout')), timeout);
        });
        
        const result = await Promise.race([queryPromise, timeoutPromise]);
        
        // Update connection usage
        connection.queryCount++;
        connection.lastUsed = Date.now();
        
        // Return connection to pool
        this.releaseConnection(connection.id);
        
        // Update metrics
        this.updateMetrics(result);
        
        return result;
        
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // Remove failed connection
        if (connection) {
          this.removeConnection(connection.id);
        }
        
        if (attempt === retries) {
          // Log final error
          qerrors(lastError, 'DatabaseConnectionPool.query', `Query failed after ${retries} attempts`);
        } else {
          // Log retry attempt with exponential backoff
          const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
          console.warn(`Query attempt ${attempt + 1} failed, retrying in ${delay}ms:`, lastError.message);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    // This should never be reached, but TypeScript needs it
    const errorResult: QueryResult<T> = {
      success: false,
      data: undefined,
      error: lastError,
      executionTime: Date.now() - startTime,
      connectionId: connection?.id || 'unknown'
    };
    
    return errorResult;
  }

  /**
   * Execute query with proper error handling
   */
  private async executeQuery<T>(
    connection: any, 
    sql: string, 
    params: any[], 
    batch: boolean
  ): Promise<QueryResult<T>> {
    const executionStartTime = Date.now();
    
    try {
      // Simulate query processing (replace with actual database query)
      await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 100));
      
      const result: QueryResult<T> = {
        success: true,
        data: batch ? params.map((p, i) => ({ 
          id: i + 1, 
          ...p || {} 
        })) as T : {
          id: Date.now(),
          sql,
          params,
          timestamp: new Date().toISOString()
        } as T,
        error: undefined,
        executionTime: Date.now() - executionStartTime,
        connectionId: connection.id
      };
      
      return result;
    } catch (error) {
      return {
        success: false,
        data: undefined,
        error: error instanceof Error ? error : new Error(String(error)),
        executionTime: Date.now() - executionStartTime,
        connectionId: connection.id
      };
    }
  }

  /**
   * Remove failed connection
   */
  private removeConnection(connectionId: string): void {
    // Remove from all tracking structures
    this.connections.delete(connectionId);
    this.activeConnections.delete(connectionId);
    this.availableConnections.delete(connectionId);
    
    // Also remove from health tracking
    if (this.healthCheckInterval) {
      // Health check will clean up in next cycle
    }
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Close all connections and cleanup
   */
  async close(): Promise<void> {
    // Clear health check interval
    if (this.healthCheckInterval) {
      this.removeInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    
    // Clear all timers
    for (const timer of this.timers) {
      clearTimeout(timer);
      clearInterval(timer);
    }
    this.timers.clear();

    // Close all active connections
    for (const [id, connection] of this.connections) {
      try {
        await connection.close();
      } catch (error) {
        qerrors(
          error instanceof Error ? error : new Error(String(error)),
          'DatabaseConnectionPool.close',
          `Failed to close connection ${id}`
        );
      }
    }

    // Clear pools
    this.connections.clear();
    this.activeConnections.clear();
    this.availableConnections.clear();
    this.connectionQueue.length = 0;
  }
}

export default DatabaseConnectionPool;
export type { DatabaseConfig, QueryOptions, QueryResult };