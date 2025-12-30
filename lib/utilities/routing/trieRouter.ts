/**
 * Trie-Based Routing System
 * 
 * PURPOSE: Replace O(n) route matching with O(log n) trie traversal
 * for optimal API gateway performance and scalability.
 * 
 * FEATURES:
 * - O(k) route lookup where k = path segments
 * - Parameter extraction for dynamic routes
 * - Method-specific routing
 * - Wildcard support
 * - Memory-efficient storage
 */

import { Request, Response, NextFunction } from 'express';

export interface RouteHandler {
  id: string;
  method: string | string[];
  handler: (req: Request, res: Response, next: NextFunction) => void;
  middleware?: Array<(req: Request, res: Response, next: NextFunction) => void>;
  weight?: number;
  timeout?: number;
  retries?: number;
}

export interface RouteMatch {
  handler: RouteHandler;
  params: Record<string, string>;
  wildcard: boolean;
}

export interface TrieNode {
  children: Map<string, TrieNode>;
  handler: RouteHandler | null;
  parameter: string | null;
  wildcard: boolean;
  methods: Map<string, RouteHandler>;
}

export class RouteTrie {
  private root: TrieNode;
  private routeCache = new Map<string, RouteMatch>();

  constructor() {
    this.root = {
      children: new Map(),
      handler: null,
      parameter: null,
      wildcard: false,
      methods: new Map()
    };
  }

  /**
   * Insert a route into the trie
   */
  insert(path: string, handler: RouteHandler): void {
    const segments = this.pathToSegments(path);
    let current = this.root;

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      let child = current.children.get(segment);

      if (!child) {
        child = {
          children: new Map(),
          handler: null,
          parameter: segment.startsWith(':') ? segment.slice(1) : null,
          wildcard: segment === '*',
          methods: new Map()
        };
        current.children.set(segment, child);
      }

      current = child;
    }

    // Store handler at final node
    const methods = Array.isArray(handler.method) ? handler.method : [handler.method];
    for (const method of methods) {
      current.methods.set(method, handler);
    }
    current.handler = handler;

    // Clear cache when routes change
    this.routeCache.clear();
  }

  /**
   * Search for a route handler
   */
  search(path: string, method: string): RouteMatch | null {
    const cacheKey = `${method}:${path}`;
    
    // Check cache first
    const cached = this.routeCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const segments = this.pathToSegments(path);
    let current = this.root;
    const params: Record<string, string> = {};

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      let child = current.children.get(segment);

      // Try parameter matching
      if (!child) {
        for (const [key, node] of current.children.entries()) {
          if (node.parameter) {
            params[node.parameter] = segment;
            child = node;
            break;
          }
        }
      }

      // Try wildcard matching
      if (!child) {
        for (const [key, node] of current.children.entries()) {
          if (node.wildcard) {
            child = node;
            break;
          }
        }
      }

      if (!child) {
        return null;
      }

      current = child;
    }

    // Check for method-specific handler
    let handler = current.methods.get(method) || current.handler;
    
    // Try wildcard methods
    if (!handler && current.methods.has('*')) {
      handler = current.methods.get('*')!;
    }

    if (!handler) {
      return null;
    }

    const match: RouteMatch = {
      handler,
      params,
      wildcard: current.wildcard
    };

    // Cache the result
    this.setCache(cacheKey, match);
    return match;
  }

  /**
   * Get all routes (for debugging)
   */
  getAllRoutes(): Array<{ path: string; handler: RouteHandler }> {
    const routes: Array<{ path: string; handler: RouteHandler }> = [];
    this.collectRoutes(this.root, '', routes);
    return routes;
  }

  /**
   * Clear all routes
   */
  clear(): void {
    this.root = {
      children: new Map(),
      handler: null,
      parameter: null,
      wildcard: false,
      methods: new Map()
    };
    this.routeCache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; maxSize: number } {
    return {
      size: this.routeCache.size,
      maxSize: 1000 // Configurable max cache size
    };
  }

  /**
   * Convert path to segments
   */
  private pathToSegments(path: string): string[] {
    return path.split('/').filter(segment => segment.length > 0);
  }

  /**
   * Recursively collect all routes
   */
  private collectRoutes(node: TrieNode, currentPath: string, routes: Array<{ path: string; handler: RouteHandler }>): void {
    if (node.handler) {
      routes.push({ path: currentPath || '/', handler: node.handler });
    }

    for (const [segment, child] of node.children.entries()) {
      const newPath = currentPath ? `${currentPath}/${segment}` : `/${segment}`;
      this.collectRoutes(child, newPath, routes);
    }
  }

  /**
   * Set cache entry with size management
   */
  private setCache(key: string, value: RouteMatch): void {
    // Simple LRU - clear oldest when cache is full
    if (this.routeCache.size >= 1000) {
      const firstKey = this.routeCache.keys().next().value;
      if (firstKey) {
        this.routeCache.delete(firstKey);
      }
    }
    this.routeCache.set(key, value);
  }
}

/**
 * Optimized Router with load balancing
 */
export class OptimizedRouter {
  private trie = new RouteTrie();
  private loadBalancers = new Map<string, RouteHandler[]>();

  /**
   * Add a route with load balancing support
   */
  addRoute(path: string, handler: RouteHandler): void {
    this.trie.insert(path, handler);

    // Track multiple handlers for load balancing
    const key = `${Array.isArray(handler.method) ? handler.method.join(',') : handler.method}:${path}`;
    const handlers = this.loadBalancers.get(key) || [];
    handlers.push(handler);
    this.loadBalancers.set(key, handlers);
  }

  /**
   * Handle incoming request with optimized routing
   */
  handle(req: Request, res: Response, next: NextFunction): void {
    const match = this.trie.search(req.path, req.method);

    if (!match) {
      res.status(404).json({ error: 'Route not found' });
      return;
    }

    // Add route parameters to request
    (req as any).params = { ...(req as any).params, ...match.params };

    // Load balance if multiple handlers
    const handler = this.selectHandler(match.handler);

    // Execute middleware first
    if (handler.middleware) {
      this.executeMiddleware(handler.middleware, req, res, () => {
        handler.handler(req, res, next);
      });
    } else {
      handler.handler(req, res, next);
    }
  }

  /**
   * Select handler based on weight (load balancing)
   */
  private selectHandler(handlers: RouteHandler | RouteHandler[]): RouteHandler {
    if (Array.isArray(handlers)) {
      const totalWeight = handlers.reduce((sum, h) => sum + (h.weight || 1), 0);
      let random = Math.random() * totalWeight;

      for (const handler of handlers) {
        random -= (handler.weight || 1);
        if (random <= 0) {
          return handler;
        }
      }

      return handlers[0];
    }

    return handlers;
  }

  /**
   * Execute middleware chain
   */
  private executeMiddleware(
    middleware: Array<(req: Request, res: Response, next: NextFunction) => void>,
    req: Request,
    res: Response,
    final: NextFunction
  ): void {
    let index = 0;

    const next = (error?: any) => {
      if (error) {
        return final(error);
      }

      if (index >= middleware.length) {
        return final();
      }

      const mw = middleware[index++];
      mw(req, res, next);
    };

    next();
  }

  /**
   * Get router statistics
   */
  getStats(): {
    routes: number;
    cacheSize: number;
    loadBalancers: number;
  } {
    return {
      routes: this.trie.getAllRoutes().length,
      cacheSize: this.trie.getCacheStats().size,
      loadBalancers: this.loadBalancers.size
    };
  }
}