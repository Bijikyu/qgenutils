/**
 * API Gateway Patterns Implementation
 * 
 * PURPOSE: Enterprise-grade API gateway providing unified entry point,
 * request routing, load balancing, security, and traffic management for
 * microservices architecture.
 * 
 * GATEWAY FEATURES:
 * - Multiple routing strategies (path-based, header-based, weight-based)
 * - Request/response transformation and enrichment
 * - Rate limiting and throttling
 * - Authentication and authorization
 * - Circuit breaker integration
 * - API versioning and deprecation
 * - Request/response logging and monitoring
 */

import { Request, Response, NextFunction } from 'express';
import { EventEmitter } from 'events';
import { qerrors } from 'qerrors';
import CircuitBreaker from '../resilience/circuitBreaker.js';
import HealthChecker from '../health/healthChecker.js';
import DistributedTracer from '../tracing/distributedTracer.js';
import asyncLogger from '../logging/asyncLogger.js';
import responseCompressor from '../performance/responseCompression.js';

interface Route {
  id: string;
  path: string;
  method: string | string[];
  target: {
    service: string;
    endpoint: string;
    protocol: 'http' | 'https';
    host: string;
    port: number;
  };
  weight?: number;
  enabled: boolean;
  version?: string;
  deprecated?: boolean;
  middleware?: Array<(req: Request, res: Response, next: NextFunction) => void>;
  circuitBreaker?: CircuitBreaker<any, any>;
  timeout?: number;
  retries?: number;
  transformRequest?: (req: Request) => Request;
  transformResponse?: (res: Response, data: any) => any;
}

interface GatewayConfig {
  name: string;
  version: string;
  environment: string;
  enableTracing?: boolean;
  enableMetrics?: boolean;
  enableLogging?: boolean;
  defaultTimeout?: number;
  defaultRetries?: number;
  enableCircuitBreaker?: boolean;
  enableRateLimiting?: boolean;
  enableAuthentication?: boolean;
  enableCompression?: boolean;
  cors?: {
    enabled: boolean;
    origins: string[];
    methods: string[];
    headers: string[];
  };
  security?: {
    enableApiKeyAuth?: boolean;
    enableJwtAuth?: boolean;
    enableOauth?: boolean;
    apiKeys?: Record<string, string[]>;
    jwtSecret?: string;
    oauthProvider?: string;
};
   }
};

    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      requestsByRoute: new Map(),
      requestsByService: new Map(),
      errorRate: 0,
      throughput: 0,
      activeConnections: 0
    };

    // Initialize optional components
    if (this.config.enableTracing) {
      this.tracer = new DistributedTracer({
        serviceName: `${this.config.name}-gateway`,
        serviceVersion: this.config.version,
        environment: this.config.environment,
        enableSampling: true,
        samplingRate: 0.1,
        maxSpansPerTrace: 1000,
        enableBaggagePropagation: true,
        enableLinkPropagation: true,
        enableMetrics: true,
        exporters: ['console']
      });
    }

    if (this.config.enableCircuitBreaker) {
      this.healthChecker = new HealthChecker({
        name: `${this.config.name}-gateway`,
        enableSystemChecks: true
      });
    }

    // Initialize middleware
    this.initializeMiddleware();

    // Start cleanup interval to prevent memory leaks
    this.startCleanupInterval();
  }

  private startCleanupInterval(): void {
    // Clean up every 10 minutes to prevent memory leaks
    this.cleanupInterval = this.addInterval(() => {
      this.cleanupExpiredData();
    }, 10 * 60 * 1000);
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

  private cleanupExpiredData(): void {
    // Limit routes size
    if (this.routes.size > this.maxCacheSize) {
      const entries = Array.from(this.routes.entries());
      const toDelete = entries.slice(0, entries.length - this.maxCacheSize);
      toDelete.forEach(([key]) => this.routes.delete(key));
    }

    // Limit circuit breakers size
    if (this.circuitBreakers.size > this.maxCacheSize) {
      const entries = Array.from(this.circuitBreakers.entries());
      const toDelete = entries.slice(0, entries.length - this.maxCacheSize);
      toDelete.forEach(([key]) => this.circuitBreakers.delete(key));
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      this.removeInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    
    // Clear all timers
    for (const timer of this.timers) {
      clearInterval(timer);
    }
    this.timers.clear();
    
    this.routes.clear();
    this.routeCache.clear();
    this.circuitBreakers.clear();
    
    // Clear request deduplication data
    this.pendingRequests.clear();
    this.responseCache.clear();
    
    if (this.tracer) {
      this.tracer.destroy();
    }

    // Flush any remaining logs
    asyncLogger.destroy().catch(() => {
      // Ignore logger cleanup errors
    });
  }

  /**
   * Add a route to the gateway
   */
  addRoute(route: Omit<Route, 'id'>): string {
    const routeId = this.generateRouteId();
    const fullRoute: Route = {
      ...route,
      id: routeId
    };

    // Add to routes map
    const key = `${route.method}:${route.path}`;
    if (!this.routes.has(key)) {
      this.routes.set(key, []);
    }
    this.routes.get(key)!.push(fullRoute);

    // Clear route cache when routes change
    this.routeCache.clear();

    // Create circuit breaker if enabled
    if (this.config.enableCircuitBreaker) {
      fullRoute.circuitBreaker = new CircuitBreaker(
        async (data) => {
          return this.forwardRequest(fullRoute, data);
        },
        {
          name: `${routeId}-circuit-breaker`,
          failureThreshold: 5,
          recoveryTimeout: 30000,
          timeout: route.timeout || this.config.defaultTimeout
        }
      );
    }

    this.emit('route:added', fullRoute);
    return routeId;
  }

  /**
   * Remove a route from the gateway
   */
  removeRoute(routeId: string): boolean {
    for (const [key, routes] of this.routes) {
      const index = routes.findIndex(r => r.id === routeId);
      if (index !== -1) {
        const removed = routes.splice(index, 1)[0];
        
        // Clean up circuit breaker
        if (removed.circuitBreaker) {
          this.circuitBreakers.delete(routeId);
        }
        
        if (routes.length === 0) {
          this.routes.delete(key);
        }
        
        this.emit('route:removed', removed);
        return true;
      }
    }
    return false;
  }

  /**
   * Get all routes
   */
  getRoutes(): Route[] {
    const allRoutes: Route[] = [];
    for (const routes of this.routes.values()) {
      allRoutes.push(...routes);
    }
    return allRoutes;
  }

  /**
   * Get routes by service
   */
  getRoutesByService(serviceName: string): Route[] {
    const allRoutes = this.getRoutes();
    return allRoutes.filter(route => route.target.service === serviceName);
  }

  /**
   * Create Express middleware for the gateway
   */
  createMiddleware(): (req: Request, res: Response, next: NextFunction) => void {
    return async (req: Request, res: Response, next: NextFunction) => {
      const startTime = Date.now();
      let span: any = null;

      try {
        // Start tracing if enabled
        if (this.tracer) {
          span = this.tracer.startSpan(`${req.method} ${req.path}`, {
            kind: 'server',
            tags: {
              'http.method': req.method,
              'http.path': req.path,
              'http.host': req.headers.host
            }
          });
        }

        // Update metrics
        this.metrics.totalRequests++;
        this.metrics.activeConnections++;

        // Apply gateway middleware
        await this.applyMiddleware(req, res, next);

        // Find matching route
        const route = this.findMatchingRoute(req);
        if (!route) {
          res.status(404).json({ error: 'Route not found' });
          return;
        }

        // Apply route-specific middleware
        if (route.middleware) {
          for (const middleware of route.middleware) {
            await middleware(req, res, next);
          }
        }

        // Transform request if configured
        let transformedReq = req;
        if (route.transformRequest) {
          transformedReq = route.transformRequest(req);
        }

        // Forward request
        const response = await this.forwardRequest(route, transformedReq);

        // Transform response if configured
        let transformedResponse = response;
        if (route.transformResponse) {
          transformedResponse = route.transformResponse(res, response);
        }

        // Apply compression if enabled
        let responseData = transformedResponse;
        let shouldCompress = false;
        
        if (this.config.enableCompression !== false) {
          const contentType = res.getHeader('content-type') as string || 'application/json';
          const acceptEncoding = req.headers['accept-encoding'];
          
          try {
            const compressionResult = await responseCompressor.compressResponse(
              responseData,
              contentType,
              acceptEncoding
            );
            
            if (compressionResult.compressed) {
              responseData = compressionResult.data;
              res.setHeader('Content-Encoding', compressionResult.algorithm ? responseCompressor.getContentEncoding(compressionResult.algorithm) : 'gzip');
              res.setHeader('Content-Length', compressionResult.compressedSize);
              shouldCompress = true;
            }
          } catch (error) {
            // Continue without compression on error
            asyncLogger.warn('Compression failed', { error: error.message });
          }
        }

        // Send response
        res.status(response.status || 200).json(responseData);

        // Update success metrics
        this.metrics.successfulRequests++;
        this.updateResponseTimeMetrics(Date.now() - startTime);

      } catch (error) {
        // Update error metrics
        this.metrics.failedRequests++;
        this.metrics.errorRate = (this.metrics.failedRequests / this.metrics.totalRequests) * 100;

        // Log error (non-blocking)
        if (this.config.enableLogging) {
          asyncLogger.error('[Gateway] Request failed:', { 
            error: error.message,
            stack: error.stack,
            requestId: req.headers['x-request-id']
          });
        }

        // Add error to span
        if (span) {
          this.tracer.addTag(span, 'error', true);
          this.tracer.addLog(span, 'error', error.message, {
            stack: error.stack
          });
        }

        // Send error response
        res.status(500).json({
          error: 'Internal server error',
          message: this.config.environment === 'development' ? error.message : undefined
        });

      } finally {
        // Finish span
        if (span) {
          this.tracer.finishSpan(span, {
            status: res.statusCode >= 400 ? 'error' : 'ok',
            tags: {
              'http.status_code': res.statusCode
            }
          });
        }

        // Update connection metrics
        this.metrics.activeConnections--;
      }
    };
  }

  /**
   * Find matching route for request (optimized with caching)
   */
  private findMatchingRoute(req: Request): Route | null {
    const method = req.method;
    const path = req.path;
    const cacheKey = `${method}:${path}`;

    // Check cache first
    const cachedRoutes = this.routeCache.get(cacheKey);
    if (cachedRoutes && cachedRoutes.length > 0) {
      return this.selectRouteByWeight(cachedRoutes);
    }

    // Find exact match
    const exactKey = `${method}:${path}`;
    const exactRoutes = this.routes.get(exactKey);
    if (exactRoutes && exactRoutes.length > 0) {
      // Cache the result
      this.routeCache.set(cacheKey, exactRoutes);
      return this.selectRouteByWeight(exactRoutes);
    }

    // Find pattern match (optimized order)
    const methodKey = `${method}:`;
    const wildcardKey = `*:`;

    // Check method-specific patterns first
    for (const [key, routes] of this.routes) {
      if (key.startsWith(methodKey) && key !== exactKey) {
        const [, routePath] = key.split(':');
        if (this.pathMatches(routePath, path)) {
          // Cache the result
          this.routeCache.set(cacheKey, routes);
          return this.selectRouteByWeight(routes);
        }
      }
    }

    // Check wildcard patterns last
    for (const [key, routes] of this.routes) {
      if (key.startsWith(wildcardKey)) {
        const [, routePath] = key.split(':');
        if (this.pathMatches(routePath, path)) {
          // Cache the result
          this.routeCache.set(cacheKey, routes);
          return this.selectRouteByWeight(routes);
        }
      }
    }

    return null;
  }

  /**
   * Select route by weight (for load balancing)
   */
  private selectRouteByWeight(routes: Route[]): Route {
    if (routes.length === 1) return routes[0];

    // Calculate total weight
    const totalWeight = routes.reduce((sum, route) => sum + (route.weight || 1), 0);
    
    // Select route based on weight
    let random = Math.random() * totalWeight;
    
    for (const route of routes) {
      random -= (route.weight || 1);
      if (random <= 0) {
        return route;
      }
    }

    return routes[0]; // Fallback
  }

  /**
   * Check if path matches pattern
   */
  private pathMatches(pattern: string, path: string): boolean {
    // Simple pattern matching (can be enhanced with regex)
    if (pattern === path) return true;
    
    // Handle wildcard patterns
    if (pattern.includes('*')) {
      const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
      return regex.test(path);
    }
    
    // Handle parameter patterns
    if (pattern.includes(':')) {
      const patternParts = pattern.split('/');
      const pathParts = path.split('/');
      
      if (patternParts.length !== pathParts.length) return false;
      
      for (let i = 0; i < patternParts.length; i++) {
        if (!patternParts[i].startsWith(':') && patternParts[i] !== pathParts[i]) {
          return false;
        }
      }
      
      return true;
    }
    
    return false;
  }

  /**
   * Forward request to target service (with deduplication and caching)
   */
  private async forwardRequest(route: Route, req: Request): Promise<any> {
    const target = route.target;
    const url = `${target.protocol}://${target.host}:${target.port}${target.endpoint}`;
    
    // Create request fingerprint for deduplication
    const fingerprint = this.createRequestFingerprint(req, route);
    
    // Check response cache first
    const cached = this.responseCache.get(fingerprint);
    if (cached && (Date.now() - cached.timestamp) < cached.ttl) {
      return cached.data;
    }

    // Check for identical pending request
    const pending = this.pendingRequests.get(fingerprint);
    if (pending && pending.length < this.MAX_PENDING_PER_KEY) {
      return new Promise((resolve, reject) => {
        pending.push({
          resolve,
          reject,
          timestamp: Date.now()
        });
      });
    }

    // Create new pending request entry
    if (!pending) {
      this.pendingRequests.set(fingerprint, []);
    }

    // Use circuit breaker if available
    let response: any;
    try {
      if (route.circuitBreaker) {
        response = await route.circuitBreaker.execute(req);
      } else {
        response = await this.simulateHttpRequest(url, req);
      }

      // Cache successful responses
      this.responseCache.set(fingerprint, {
        data: response,
        timestamp: Date.now(),
        ttl: this.REQUEST_CACHE_TTL
      });

      // Resolve all pending requests for this fingerprint
      const pendingRequests = this.pendingRequests.get(fingerprint) || [];
      pendingRequests.forEach(p => {
        p.resolve(response);
      });
      this.pendingRequests.delete(fingerprint);

      return response;

    } catch (error) {
      // Reject all pending requests for this fingerprint
      const pendingRequests = this.pendingRequests.get(fingerprint) || [];
      pendingRequests.forEach(p => {
        p.reject(error);
      });
      this.pendingRequests.delete(fingerprint);

      throw new Error(`Failed to forward request to ${target.service}: ${error.message}`);
    }
  }

  /**
   * Create request fingerprint for deduplication
   */
  private createRequestFingerprint(req: Request, route: Route): string {
    const keyData = {
      method: req.method,
      path: req.path,
      query: req.query,
      service: route.target.service,
      endpoint: route.target.endpoint
    };
    
    return Buffer.from(JSON.stringify(keyData)).toString('base64');
  }

  /**
   * Simulate HTTP request (placeholder)
   */
  private async simulateHttpRequest(url: string, req: Request): Promise<any> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));

    // Simulate response
    return {
      status: 200,
      data: {
        message: 'Response from ' + url,
        timestamp: new Date().toISOString(),
        requestId: Math.random().toString(36).substr(2, 9)
      }
    };
  }

  /**
   * Apply gateway middleware (optimized with parallel execution where possible)
   */
  private async applyMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
    // Group middleware by type for parallel execution
    const authMiddleware = this.middleware.filter(m => 
      m.name?.includes('auth') || m.name?.includes('validation')
    );
    const loggingMiddleware = this.middleware.filter(m => 
      m.name?.includes('log') || m.name?.includes('metrics')
    );
    const otherMiddleware = this.middleware.filter(m => 
      !authMiddleware.includes(m) && !loggingMiddleware.includes(m)
    );

    try {
      // Execute non-blocking middleware in parallel
      const [, authResults] = await Promise.allSettled([
        this.executeSequentially(otherMiddleware, req, res, next),
        this.executeInParallel(authMiddleware, req, res, next)
      ]);

      // Execute logging middleware (non-blocking)
      this.executeInParallel(loggingMiddleware, req, res, next).catch(() => {
        // Ignore logging errors
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Execute middleware sequentially (for dependent operations)
   */
  private async executeSequentially(
    middleware: Array<(req: Request, res: Response, next: NextFunction) => void>,
    req: Request, 
    res: Response, 
    next: NextFunction
  ): Promise<void> {
    for (const mw of middleware) {
      await new Promise<void>((resolve, reject) => {
        const nextFn = (error?: any) => error ? reject(error) : resolve();
        mw(req, res, nextFn);
      });
    }
  }

  /**
   * Execute middleware in parallel (for independent operations)
   */
  private async executeInParallel(
    middleware: Array<(req: Request, res: Response, next: NextFunction) => void>,
    req: Request, 
    res: Response, 
    next: NextFunction
  ): Promise<void> {
    await Promise.allSettled(
      middleware.map(mw => 
        new Promise<void>((resolve, reject) => {
          const nextFn = (error?: any) => error ? reject(error) : resolve();
          mw(req, res, nextFn);
        })
      )
    );
  }

  /**
   * Initialize gateway middleware
   */
  private initializeMiddleware(): void {
    // CORS middleware
    if (this.config.cors.enabled) {
      this.middleware.push(this.createCORSMiddleware());
    }

    // Authentication middleware
    if (this.config.enableAuthentication) {
      this.middleware.push(this.createAuthenticationMiddleware());
    }

    // Rate limiting middleware
    if (this.config.enableRateLimiting) {
      this.middleware.push(this.createRateLimitingMiddleware());
    }

    // Request logging middleware
    if (this.config.enableLogging) {
      this.middleware.push(this.createLoggingMiddleware());
    }

    // Metrics middleware
    if (this.config.enableMetrics) {
      this.middleware.push(this.createMetricsMiddleware());
    }
  }

  /**
   * Create CORS middleware
   */
  private createCORSMiddleware(): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction) => {
      res.header('Access-Control-Allow-Origin', this.config.cors.origins.join(', '));
      res.header('Access-Control-Allow-Methods', this.config.cors.methods.join(', '));
      res.header('Access-Control-Allow-Headers', this.config.cors.headers.join(', '));

      if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
      }

      next();
    };
  }

  /**
   * Create authentication middleware (optimized with parallel validation)
   */
  private createAuthenticationMiddleware(): (req: Request, res: Response, next: NextFunction) => void {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        // Run authentication methods in parallel for performance
        const authPromises: Promise<boolean>[] = [];
        
        if (this.config.security.enableApiKeyAuth) {
          authPromises.push(
            Promise.resolve().then(() => {
              const apiKey = req.headers['x-api-key'] as string;
              return this.validateApiKey(apiKey);
            })
          );
        }

        if (this.config.security.enableJwtAuth) {
          authPromises.push(
            Promise.resolve().then(() => {
              const token = req.headers.authorization?.replace('Bearer ', '');
              return this.validateJWT(token);
            })
          );
        }

        // Wait for all validations to complete
        const results = await Promise.allSettled(authPromises);
        
        // Check for failures
        const hasApiKeyAuth = this.config.security.enableApiKeyAuth;
        const hasJwtAuth = this.config.security.enableJwtAuth;
        
        if (hasApiKeyAuth && results[0]?.status === 'fulfilled' && !results[0].value) {
          res.status(401).json({ error: 'Invalid API key' });
          return;
        }
        
        if (hasJwtAuth) {
          const jwtResult = results[results.length - 1]; // Last result is JWT
          if (jwtResult?.status === 'fulfilled' && !jwtResult.value) {
            res.status(401).json({ error: 'Invalid JWT token' });
            return;
          }
        }
          res.status(401).json({ error: 'Invalid JWT token' });
          return;
        }

        next();
      } catch (error) {
        res.status(401).json({ error: 'Authentication failed' });
      }
    };
    };
  }

  /**
   * Create rate limiting middleware
   */
  private createRateLimitingMiddleware(): (req: Request, res: Response, next: NextFunction) => void {
    const requestCounts = new Map<string, { count: number; resetTime: number }>();
    const limit = 100; // requests per minute
    const windowMs = 60000; // 1 minute

    return (req: Request, res: Response, next: NextFunction) => {
      const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
      const now = Date.now();
      const clientData = requestCounts.get(clientIp);

      if (!clientData || now > clientData.resetTime) {
        requestCounts.set(clientIp, { count: 1, resetTime: now + windowMs });
        return next();
      }

      if (clientData.count >= limit) {
        res.status(429).json({ error: 'Rate limit exceeded' });
        return;
      }

      clientData.count++;
      next();
    };
  }

  /**
   * Create logging middleware
   */
  private createLoggingMiddleware(): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction) => {
      const startTime = Date.now();

      res.on('finish', () => {
        const duration = Date.now() - startTime;
        // Non-blocking request logging
        asyncLogger.info(`[Gateway] ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`, {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          duration,
          requestId: req.headers['x-request-id']
        });
      });

      next();
    };
  }

  /**
   * Create metrics middleware
   */
  private createMetricsMiddleware(): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction) => {
      const route = this.findMatchingRoute(req);
      
      if (route) {
        const routeKey = `${route.method}:${route.path}`;
        const currentCount = this.metrics.requestsByRoute.get(routeKey) || 0;
        this.metrics.requestsByRoute.set(routeKey, currentCount + 1);

        const serviceCount = this.metrics.requestsByService.get(route.target.service) || 0;
        this.metrics.requestsByService.set(route.target.service, serviceCount + 1);
      }

      next();
    };
  }

  /**
   * Validate API key
   */
  private validateApiKey(apiKey: string): boolean {
    for (const [service, keys] of Object.entries(this.config.security.apiKeys)) {
      if (keys.includes(apiKey)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Validate JWT token
   */
  private validateJWT(token: string): boolean {
    // In real implementation, use proper JWT validation
    try {
      // Simple validation (placeholder)
      return token.length > 10;
    } catch {
      return false;
    }
  }

  /**
   * Update response time metrics
   */
  private updateResponseTimeMetrics(responseTime: number): void {
    // Update average response time (exponential moving average)
    if (this.metrics.averageResponseTime === 0) {
      this.metrics.averageResponseTime = responseTime;
    } else {
      this.metrics.averageResponseTime = 
        this.metrics.averageResponseTime * 0.9 + responseTime * 0.1;
    }
  }

  /**
   * Get gateway metrics
   */
  getMetrics(): GatewayMetrics {
    // Calculate throughput
    this.metrics.throughput = this.metrics.totalRequests / 60; // requests per minute

    return { ...this.metrics };
  }

  /**
   * Get configuration
   */
  getConfig(): Required<GatewayConfig> {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<GatewayConfig>): void {
    this.config = { ...this.config, ...updates };
  }

/**
   * Cleanup expired route cache entries and request data
   */
  private cleanupExpiredData(): void {
    const now = Date.now();

    // Limit routes size
    if (this.routes.size > this.maxCacheSize) {
      const entries = Array.from(this.routes.entries());
      const toDelete = entries.slice(0, entries.length - this.maxCacheSize);
      toDelete.forEach(([key]) => this.routes.delete(key));
    }

    // Limit circuit breakers size
    if (this.circuitBreakers.size > this.maxCacheSize) {
      const entries = Array.from(this.circuitBreakers.entries());
      const toDelete = entries.slice(0, entries.length - this.maxCacheSize);
      toDelete.forEach(([key]) => this.circuitBreakers.delete(key));
    }

    // Clean expired response cache
    for (const [key, cached] of this.responseCache.entries()) {
      if ((now - cached.timestamp) > cached.ttl) {
        this.responseCache.delete(key);
      }
    }

    // Limit response cache size
    if (this.responseCache.size > this.maxCacheSize) {
      const entries = Array.from(this.responseCache.entries());
      const toDelete = entries.slice(0, entries.length - this.maxCacheSize);
      toDelete.forEach(([key]) => this.responseCache.delete(key));
    }

    // Clean stale pending requests (older than 30 seconds)
    for (const [key, pending] of this.pendingRequests.entries()) {
      const stillPending = pending.filter(p => (now - p.timestamp) < 30000);
      if (stillPending.length === 0) {
        this.pendingRequests.delete(key);
      } else if (stillPending.length !== pending.length) {
        this.pendingRequests.set(key, stillPending);
      }
    }

    // Limit pending requests size
    if (this.pendingRequests.size > this.maxCacheSize) {
      const entries = Array.from(this.pendingRequests.entries());
      const toDelete = entries.slice(0, entries.length - this.maxCacheSize);
      toDelete.forEach(([key]) => this.pendingRequests.delete(key));
    }
  }
}

export default APIGateway;
export type { 
  Route, 
  GatewayConfig, 
  GatewayMetrics 
};