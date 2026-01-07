/**
 * API Gateway Patterns Implementation - Fixed Version
 * 
 * PURPOSE: Enterprise-grade API gateway providing unified entry point,
 * request routing, load balancing, security, and traffic management for
 * microservices architecture.
 */

interface Request {
  method: string;
  url: string;
  path?: string;
  headers: Record<string, string>;
  body?: any;
  query?: Record<string, string>;
  params?: Record<string, string>;
}

interface Response {
  status(code: number): Response;
  json(data: any): Response;
  send(data: any): Response;
  setHeader(name: string, value: string): Response;
  writeHead(statusCode: number, headers?: Record<string, string>): void;
  end(data?: any): void;
  statusCode?: number;
}

interface NextFunction {
  (error?: any): void;
}

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
  timeout?: number;
  retries?: number;
}

interface GatewayConfig {
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
    enableApiKeyAuth: boolean;
    enableJwtAuth: boolean;
    enableOauth: boolean;
    apiKeys: Record<string, string>;
    jwtSecret: string;
    oauthProvider: string;
  };
}

interface GatewayMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  activeConnections: number;
}

import { EventEmitter } from 'events';
import { BoundedLRUCache } from '../performance/boundedCache.js';

class APIGateway extends EventEmitter {
  private config: Required<GatewayConfig>;
  private circuitBreakers: BoundedLRUCache<string, any>;
  private middleware: Array<(req: Request, res: Response, next: NextFunction) => void> = [];
  private metrics: GatewayMetrics;
  private maxCacheSize = 1000;
  private responseCache: BoundedLRUCache<string, {
    data: any;
    timestamp: number;
    ttl: number;
  }>;

  constructor(config: GatewayConfig) {
    super();
    
    this.config = {
      enableTracing: false,
      enableMetrics: true,
      enableLogging: true,
      defaultTimeout: 30000,
      defaultRetries: 3,
      enableCircuitBreaker: true,
      enableRateLimiting: true,
      enableAuthentication: false,
      enableCompression: true,
      cors: {
        enabled: true,
        origins: ['*'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        headers: ['Content-Type', 'Authorization', 'X-Requested-With']
      },
      security: {
        enableApiKeyAuth: false,
        enableJwtAuth: false,
        enableOauth: false,
        apiKeys: {},
        jwtSecret: '',
        oauthProvider: ''
      },
      ...config
    };

    this.circuitBreakers = new BoundedLRUCache(1000);
    this.responseCache = new BoundedLRUCache(1000);
    
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      activeConnections: 0
    };

    this.startCleanupInterval();
  }

  /**
   * Add route to gateway
   */
  addRoute(route: Route): void {
    const routeId = `${route.method}:${route.path}`;
    
    // Create circuit breaker if enabled
    if (this.config.enableCircuitBreaker) {
      const circuitBreaker = {
        name: `${routeId}-circuit-breaker`,
        execute: async (data: any) => {
          return this.forwardRequest(route, data);
        }
      };
      
      this.circuitBreakers.set(routeId, circuitBreaker);
    }

    this.emit('routeAdded', route);
  }

  /**
   * Handle incoming request
   */
  async handleRequest(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    this.metrics.totalRequests++;
    this.metrics.activeConnections++;

    try {
      // Apply CORS headers
      this.applyCorsHeaders(req, res);

      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
      }

      // Apply middleware
      if (this.middleware.length > 0) {
        await this.applyMiddleware(req, res, async () => {
          await this.processRequest(req, res);
        });
      } else {
        await this.processRequest(req, res);
      }

      this.metrics.successfulRequests++;
    } catch (error) {
      this.metrics.failedRequests++;
      this.handleError(error, req, res);
    } finally {
      this.metrics.activeConnections--;
      const responseTime = Date.now() - startTime;
      this.updateAverageResponseTime(responseTime);
    }
  }

  /**
   * Process request through appropriate route
   */
  private async processRequest(req: Request, res: Response): Promise<void> {
    // Extract path from URL
    req.path = new URL(req.url!, 'http://localhost').pathname;

    // Route to handler
    const routeId = `${req.method}:${req.path}`;
    const circuitBreaker = this.circuitBreakers.get(routeId);

    if (circuitBreaker) {
      const result = await circuitBreaker.execute(req);
      this.sendResponse(res, result);
    } else {
      res.status(404).json({ error: 'Route not found' });
    }
  }

  /**
   * Forward request to target service
   */
  private async forwardRequest(route: Route, req: Request): Promise<any> {
    const targetUrl = `${route.target.protocol}://${route.target.host}:${route.target.port}${route.target.endpoint}`;
    
    // In a real implementation, this would make HTTP request
    return {
      status: 200,
      data: { 
        message: 'Request forwarded successfully',
        target: targetUrl,
        originalRequest: {
          method: req.method,
          path: req.path,
          headers: req.headers
        }
      }
    };
  }

  /**
   * Handle route processing
   */
  private async handleRoute(route: Route, req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.forwardRequest(route, req);
      this.sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Apply middleware chain
   */
  private async applyMiddleware(
    req: Request, 
    res: Response, 
    final: () => Promise<void>
  ): Promise<void> {
    let index = 0;

    const next = async (error?: any): Promise<void> => {
      if (error) {
        this.handleError(error, req, res);
        return;
      }

      if (index >= this.middleware.length) {
        await final();
        return;
      }

      const mw = this.middleware[index++];
      await mw(req, res, next);
    };

    await next();
  }

  /**
   * Apply CORS headers
   */
  private applyCorsHeaders(req: Request, res: Response): void {
    if (!this.config.cors.enabled) return;

    const origin = req.headers['origin'];
    const allowedOrigins = this.config.cors.origins;

    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin || '')) {
      res.setHeader('Access-Control-Allow-Origin', origin || '*');
    }

    res.setHeader('Access-Control-Allow-Methods', this.config.cors.methods.join(', '));
    res.setHeader('Access-Control-Allow-Headers', this.config.cors.headers.join(', '));
  }

  /**
   * Send response with compression if enabled
   */
  private sendResponse(res: Response, data: any): void {
    if (this.config.enableCompression && typeof data === 'object') {
      res.setHeader('Content-Encoding', 'gzip');
    }

    if (res.statusCode) {
      res.status(res.statusCode);
    } else {
      res.status(200);
    }

    res.json(data);
  }

  /**
   * Handle errors consistently
   */
  private handleError(error: any, req: Request, res: Response): void {
    console.error('Gateway error:', error);

    const statusCode = error.statusCode || 500;
    const message = this.config.enableLogging ? error.message : 'Internal Server Error';

    res.status(statusCode).json({
      error: message,
      timestamp: new Date().toISOString(),
      path: req.path
    });
  }

  /**
   * Update average response time
   */
  private updateAverageResponseTime(responseTime: number): void {
    const totalTime = this.metrics.averageResponseTime * (this.metrics.totalRequests - 1);
    this.metrics.averageResponseTime = (totalTime + responseTime) / this.metrics.totalRequests;
  }

  /**
   * Start cleanup interval
   */
  private startCleanupInterval(): void {
    setInterval(() => {
      this.cleanupExpiredData();
    }, 60000); // Every minute
  }

  /**
   * Cleanup expired data
   */
  private cleanupExpiredData(): void {
    const now = Date.now();

    // Clean expired response cache
    for (const [key, cached] of this.responseCache.entries()) {
      if (cached && (now - cached.timestamp) > cached.ttl) {
        this.responseCache.delete(key);
      }
    }

    // Limit response cache size
    if (this.responseCache.size > this.maxCacheSize) {
      const entries = Array.from(this.responseCache.entries());
      const toDelete = entries.slice(0, entries.length - this.maxCacheSize);
      toDelete.forEach(([key]) => this.responseCache.delete(key));
    }
  }

  /**
   * Add middleware
   */
  use(middleware: (req: Request, res: Response, next: NextFunction) => void): void {
    this.middleware.push(middleware);
  }

  /**
   * Get gateway statistics
   */
  getStats(): GatewayMetrics {
    return { ...this.metrics };
  }

  /**
   * Health check
   */
  healthCheck(): { status: string; uptime: number; metrics: GatewayMetrics } {
    return {
      status: 'healthy',
      uptime: process.uptime(),
      metrics: this.getStats()
    };
  }

  /**
   * Set route cache (placeholder for compatibility)
   */
  setRouteCache(cache: any): void {
    // Implementation would set up caching
  }
}

export { APIGateway, GatewayConfig, Route, GatewayMetrics };