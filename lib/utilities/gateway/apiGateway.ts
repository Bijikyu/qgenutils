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

interface GatewayMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  requestsByRoute: Map<string, number>;
  requestsByService: Map<string, number>;
  errorRate: number;
  throughput: number;
  activeConnections: number;
}

class APIGateway extends EventEmitter {
  private config: Required<GatewayConfig>;
  private routes: Map<string, Route[]> = new Map();
  private circuitBreakers: Map<string, CircuitBreaker<any, any>> = new Map();
  private maxCacheSize: number = 5000; // Prevent memory leaks
  private cleanupInterval: NodeJS.Timeout | null = null;
  private tracer?: DistributedTracer;
  private healthChecker?: HealthChecker;
  private metrics: GatewayMetrics;
  private middleware: Array<(req: Request, res: Response, next: NextFunction) => void> = [];

  constructor(config: GatewayConfig) {
    super();

    this.config = {
      name: config.name,
      version: config.version || '1.0.0',
      environment: config.environment || 'production',
      enableTracing: config.enableTracing !== false,
      enableMetrics: config.enableMetrics !== false,
      enableLogging: config.enableLogging !== false,
      defaultTimeout: config.defaultTimeout || 30000,
      defaultRetries: config.defaultRetries || 3,
      enableCircuitBreaker: config.enableCircuitBreaker !== false,
      enableRateLimiting: config.enableRateLimiting !== false,
      enableAuthentication: config.enableAuthentication !== false,
      cors: {
        enabled: config.cors?.enabled !== false,
        origins: config.cors?.origins || ['*'],
        methods: config.cors?.methods || ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        headers: config.cors?.headers || ['Content-Type', 'Authorization'],
        ...config.cors
      },
      security: {
        enableApiKeyAuth: config.security?.enableApiKeyAuth || false,
        enableJwtAuth: config.security?.enableJwtAuth || false,
        enableOauth: config.security?.enableOauth || false,
        apiKeys: config.security?.apiKeys || {},
        jwtSecret: config.security?.jwtSecret,
        oauthProvider: config.security?.oauthProvider,
        ...config.security
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
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredData();
    }, 10 * 60 * 1000);
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
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.routes.clear();
    this.circuitBreakers.clear();
    if (this.tracer) {
      this.tracer.destroy();
    }
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

        // Send response
        res.status(response.status || 200).json(transformedResponse);

        // Update success metrics
        this.metrics.successfulRequests++;
        this.updateResponseTimeMetrics(Date.now() - startTime);

      } catch (error) {
        // Update error metrics
        this.metrics.failedRequests++;
        this.metrics.errorRate = (this.metrics.failedRequests / this.metrics.totalRequests) * 100;

        // Log error
        if (this.config.enableLogging) {
          console.error('[Gateway] Request failed:', error);
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
   * Find matching route for request
   */
  private findMatchingRoute(req: Request): Route | null {
    const method = req.method;
    const path = req.path;

    // Find exact match
    const exactKey = `${method}:${path}`;
    const exactRoutes = this.routes.get(exactKey);
    if (exactRoutes && exactRoutes.length > 0) {
      return this.selectRouteByWeight(exactRoutes);
    }

    // Find pattern match
    for (const [key, routes] of this.routes) {
      const [routeMethod, routePath] = key.split(':');
      
      if (routeMethod !== '*' && routeMethod !== method) continue;
      
      if (this.pathMatches(routePath, path)) {
        return this.selectRouteByWeight(routes);
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
   * Forward request to target service
   */
  private async forwardRequest(route: Route, req: Request): Promise<any> {
    const target = route.target;
    const url = `${target.protocol}://${target.host}:${target.port}${target.endpoint}`;

    // Use circuit breaker if available
    if (route.circuitBreaker) {
      return await route.circuitBreaker.execute(req);
    }

    // Simple HTTP request (in real implementation, use proper HTTP client)
    try {
      // Simulate HTTP request
      const response = await this.simulateHttpRequest(url, req);
      return response;
    } catch (error) {
      throw new Error(`Failed to forward request to ${target.service}: ${error.message}`);
    }
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
   * Apply gateway middleware
   */
  private async applyMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
    for (const middleware of this.middleware) {
      await middleware(req, res, next);
    }
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
   * Create authentication middleware
   */
  private createAuthenticationMiddleware(): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction) => {
      // API Key authentication
      if (this.config.security.enableApiKeyAuth) {
        const apiKey = req.headers['x-api-key'] as string;
        if (!apiKey || !this.validateApiKey(apiKey)) {
          res.status(401).json({ error: 'Invalid API key' });
          return;
        }
      }

      // JWT authentication
      if (this.config.security.enableJwtAuth) {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token || !this.validateJWT(token)) {
          res.status(401).json({ error: 'Invalid JWT token' });
          return;
        }
      }

      next();
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
        console.log(`[Gateway] ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
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
   * Generate route ID
   */
  private generateRouteId(): string {
    return `route-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default APIGateway;
export type { 
  Route, 
  GatewayConfig, 
  GatewayMetrics 
};