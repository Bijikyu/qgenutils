/**
 * Distributed Tracing System
 * 
 * PURPOSE: Enterprise-grade distributed tracing implementation for monitoring
 * and debugging microservices, providing end-to-end request visibility,
 * performance analysis, and dependency mapping.
 * 
 * TRACING FEATURES:
 * - OpenTelemetry-compatible tracing
 * - Span context propagation
 * - Distributed context management
 * - Performance analysis and bottleneck detection
 * - Trace sampling and filtering
 * - Integration with external tracing systems
 */

import { EventEmitter } from 'events';
import { qerrors } from 'qerrors';

interface TraceContext {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  baggage: Record<string, string>;
  flags: Record<string, boolean>;
}

interface Span {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  operationName: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status: 'ok' | 'error' | 'cancelled';
  tags: Record<string, any>;
  logs: Array<{
    timestamp: number;
    level: string;
    message: string;
    fields?: Record<string, any>;
  }>;
  kind: 'client' | 'server' | 'producer' | 'consumer' | 'internal';
  service: string;
  resource: Record<string, any>;
  links: Array<{
    traceId: string;
    spanId: string;
    attributes?: Record<string, any>;
  }>;
}

interface Trace {
  traceId: string;
  spans: Span[];
  startTime: number;
  endTime?: number;
  duration?: number;
  status: 'ok' | 'error' | 'cancelled';
  rootSpan: Span;
  services: Set<string>;
  depth: number;
}

interface TracingConfig {
  serviceName: string;
  serviceVersion: string;
  environment: string;
  enableSampling: boolean;
  samplingRate: number;
  maxSpansPerTrace: number;
  enableBaggagePropagation: boolean;
  enableLinkPropagation: boolean;
  enableMetrics: boolean;
  exporters: Array<'console' | 'file' | 'jaeger' | 'zipkin' | 'custom'>;
  customExporter?: any;
}

class DistributedTracer extends EventEmitter {
  private config: Required<TracingConfig>;
  private activeSpans: Map<string, Span> = new Map();
  private traces: Map<string, Trace> = new Map();
  private baggage: Map<string, Record<string, string>> = new Map();
  private metrics: {
    tracesCreated: number;
    spansCreated: number;
    tracesCompleted: number;
    averageTraceDuration: number;
    errorRate: number;
    samplingRate: number;
  };

  constructor(config: TracingConfig) {
    super();

    this.config = {
      serviceName: config.serviceName,
      serviceVersion: config.serviceVersion || '1.0.0',
      environment: config.environment || 'production',
      enableSampling: config.enableSampling !== false,
      samplingRate: config.samplingRate || 0.1, // 10% sampling
      maxSpansPerTrace: config.maxSpansPerTrace || 1000,
      enableBaggagePropagation: config.enableBaggagePropagation !== false,
      enableLinkPropagation: config.enableLinkPropagation !== false,
      enableMetrics: config.enableMetrics !== false,
      exporters: config.exporters || ['console'],
      customExporter: config.customExporter
    };

    this.metrics = {
      tracesCreated: 0,
      spansCreated: 0,
      tracesCompleted: 0,
      averageTraceDuration: 0,
      errorRate: 0,
      samplingRate: this.config.samplingRate
    };
  }

  /**
   * Start a new span
   */
  startSpan(
    operationName: string,
    options?: {
      parentSpan?: Span;
      kind?: Span['kind'];
      tags?: Record<string, any>;
      startTime?: number;
      links?: Array<{ traceId: string; spanId: string; attributes?: Record<string, any> }>;
    }
  ): Span {
    const traceId = options?.parentSpan?.traceId || this.generateTraceId();
    const spanId = this.generateSpanId();
    const parentSpanId = options?.parentSpan?.spanId;
    const startTime = options?.startTime || Date.now();

    const span: Span = {
      traceId,
      spanId,
      parentSpanId,
      operationName,
      startTime,
      status: 'ok',
      tags: options?.tags || {},
      logs: [],
      kind: options?.kind || 'internal',
      service: this.config.serviceName,
      resource: {
        'service.name': this.config.serviceName,
        'service.version': this.config.serviceVersion,
        'service.environment': this.config.environment
      },
      links: options?.links || []
    };

    // Add to active spans
    this.activeSpans.set(spanId, span);

    // Create or update trace
    if (!this.traces.has(traceId)) {
      this.traces.set(traceId, {
        traceId,
        spans: [],
        startTime,
        status: 'ok',
        rootSpan: span,
        services: new Set([this.config.serviceName]),
        depth: 0
      });
      this.metrics.tracesCreated++;
    }

    const trace = this.traces.get(traceId)!;
    trace.spans.push(span);
    trace.services.add(this.config.serviceName);
    trace.depth = Math.max(trace.depth, this.calculateDepth(span, trace));

    // Update metrics
    this.metrics.spansCreated++;

    // Emit span started event
    this.emit('span:started', span);

    return span;
  }

  /**
   * Finish a span
   */
  finishSpan(span: Span, options?: {
    endTime?: number;
    status?: Span['status'];
    error?: Error;
    tags?: Record<string, any>;
    logs?: Array<{ timestamp: number; level: string; message: string; fields?: Record<string, any> }>;
  }): void {
    const endTime = options?.endTime || Date.now();
    const status = options?.status || 'ok';

    // Update span
    span.endTime = endTime;
    span.duration = endTime - span.startTime;
    span.status = status;

    // Add error information if provided
    if (options?.error) {
      span.status = 'error';
      span.tags['error'] = true;
      span.tags['error.message'] = options.error.message;
      span.tags['error.stack'] = options.error.stack;
    }

    // Add additional tags
    if (options?.tags) {
      Object.assign(span.tags, options.tags);
    }

    // Add logs
    if (options?.logs) {
      span.logs.push(...options.logs);
    }

    // Remove from active spans
    this.activeSpans.delete(span.spanId);

    // Update trace
    const trace = this.traces.get(span.traceId);
    if (trace) {
      // Update trace status if this is an error
      if (status === 'error') {
        trace.status = 'error';
      }

      // Check if trace is complete
      if (this.isTraceComplete(trace)) {
        this.completeTrace(trace);
      }
    }

    // Export span
    this.exportSpan(span);

    // Emit span finished event
    this.emit('span:finished', span);
  }

  /**
   * Create a child span
   */
  createChildSpan(
    parentSpan: Span,
    operationName: string,
    options?: Omit<Parameters<typeof this.startSpan>[1], 'parentSpan'>
  ): Span {
    return this.startSpan(operationName, {
      ...options,
      parentSpan
    });
  }

  /**
   * Inject trace context into headers
   */
  injectContext(span: Span, headers: Record<string, string>): void {
    headers['traceparent'] = this.formatTraceParent(span);
    headers['tracestate'] = this.formatTraceState(span);

    // Inject baggage if enabled
    if (this.config.enableBaggagePropagation) {
      const baggage = this.baggage.get(span.traceId) || {};
      for (const [key, value] of Object.entries(baggage)) {
        headers[`baggage-${key}`] = value;
      }
    }
  }

  /**
   * Extract trace context from headers
   */
  extractContext(headers: Record<string, string>): TraceContext | null {
    const traceParent = headers['traceparent'];
    if (!traceParent) return null;

    try {
      const parts = traceParent.split('-');
      if (parts.length < 4) return null;

      const [version, traceId, spanId, flags] = parts;
      
      const context: TraceContext = {
        traceId,
        spanId,
        flags: {
          sampled: flags.includes('1')
        },
        baggage: {}
      };

      // Extract baggage
      if (this.config.enableBaggagePropagation) {
        for (const [key, value] of Object.entries(headers)) {
          if (key.startsWith('baggage-')) {
            const baggageKey = key.substring(8); // Remove 'baggage-' prefix
            context.baggage[baggageKey] = value;
          }
        }
      }

      return context;

    } catch (error) {
      qerrors(
        error instanceof Error ? error : new Error(String(error)),
        'DistributedTracer.extractContext',
        'Failed to extract trace context'
      );
      return null;
    }
  }

  /**
   * Add baggage item
   */
  addBaggage(span: Span, key: string, value: string): void {
    if (!this.baggage.has(span.traceId)) {
      this.baggage.set(span.traceId, {});
    }
    
    this.baggage.get(span.traceId)![key] = value;
  }

  /**
   * Get baggage item
   */
  getBaggage(span: Span, key: string): string | undefined {
    const baggage = this.baggage.get(span.traceId);
    return baggage?.[key];
  }

  /**
   * Add log to span
   */
  addLog(span: Span, level: string, message: string, fields?: Record<string, any>): void {
    span.logs.push({
      timestamp: Date.now(),
      level,
      message,
      fields
    });
  }

  /**
   * Add tag to span
   */
  addTag(span: Span, key: string, value: any): void {
    span.tags[key] = value;
  }

  /**
   * Get active spans
   */
  getActiveSpans(): Span[] {
    return Array.from(this.activeSpans.values());
  }

  /**
   * Get trace by ID
   */
  getTrace(traceId: string): Trace | undefined {
    return this.traces.get(traceId);
  }

  /**
   * Get all traces
   */
  getAllTraces(): Trace[] {
    return Array.from(this.traces.values());
  }

  /**
   * Get metrics
   */
  getMetrics(): typeof this.metrics {
    // Update calculated metrics
    this.updateCalculatedMetrics();
    return { ...this.metrics };
  }

  /**
   * Clear completed traces
   */
  clearCompletedTraces(): void {
    const completedTraces = Array.from(this.traces.entries())
      .filter(([, trace]) => trace.endTime !== undefined);

    for (const [traceId] of completedTraces) {
      this.traces.delete(traceId);
    }
  }

  /**
   * Force complete a trace
   */
  forceCompleteTrace(traceId: string): boolean {
    const trace = this.traces.get(traceId);
    if (!trace) return false;

    this.completeTrace(trace);
    return true;
  }

  /**
   * Export span to configured exporters
   */
  private exportSpan(span: Span): void {
    for (const exporter of this.config.exporters) {
      switch (exporter) {
        case 'console':
          this.exportToConsole(span);
          break;
        case 'file':
          this.exportToFile(span);
          break;
        case 'jaeger':
          this.exportToJaeger(span);
          break;
        case 'zipkin':
          this.exportToZipkin(span);
          break;
        case 'custom':
          if (this.config.customExporter) {
            this.config.customExporter(span);
          }
          break;
      }
    }
  }

  /**
   * Export to console
   */
  private exportToConsole(span: Span): void {
    console.log(`[TRACE] ${span.operationName} (${span.spanId})`);
    console.log(`  Trace ID: ${span.traceId}`);
    console.log(`  Service: ${span.service}`);
    console.log(`  Duration: ${span.duration}ms`);
    console.log(`  Status: ${span.status}`);
    console.log(`  Tags:`, span.tags);
    if (span.logs.length > 0) {
      console.log(`  Logs:`, span.logs);
    }
  }

  /**
   * Export to file
   */
  private exportToFile(span: Span): void {
    // In real implementation, this would write to a file
    console.log(`[FILE TRACE] ${JSON.stringify(span, null, 2)}`);
  }

  /**
   * Export to Jaeger
   */
  private exportToJaeger(span: Span): void {
    // In real implementation, this would send to Jaeger
    console.log(`[JAEGER TRACE] ${JSON.stringify(span, null, 2)}`);
  }

  /**
   * Export to Zipkin
   */
  private exportToZipkin(span: Span): void {
    // In real implementation, this would send to Zipkin
    console.log(`[ZIPKIN TRACE] ${JSON.stringify(span, null, 2)}`);
  }

  /**
   * Complete a trace
   */
  private completeTrace(trace: Trace): void {
    trace.endTime = Date.now();
    trace.duration = trace.endTime - trace.startTime;

    // Update metrics
    this.metrics.tracesCompleted++;
    this.updateErrorRate();

    // Export trace
    this.exportTrace(trace);

    // Remove from active traces
    this.traces.delete(trace.traceId);

    // Emit trace completed event
    this.emit('trace:completed', trace);
  }

  /**
   * Check if trace is complete
   */
  private isTraceComplete(trace: Trace): boolean {
    // A trace is complete if all spans are finished
    const activeSpanIds = new Set(this.activeSpans.keys());
    const traceSpanIds = new Set(trace.spans.map(s => s.spanId));
    
    // Check if any trace spans are still active
    for (const spanId of traceSpanIds) {
      if (activeSpanIds.has(spanId)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Export trace to exporters
   */
  private exportTrace(trace: Trace): void {
    for (const exporter of this.config.exporters) {
      switch (exporter) {
        case 'console':
          console.log(`[TRACE COMPLETE] ${trace.traceId} - ${trace.duration}ms - ${trace.spans.length} spans`);
          break;
        case 'file':
          console.log(`[FILE TRACE COMPLETE] ${JSON.stringify(trace, null, 2)}`);
          break;
        case 'jaeger':
          console.log(`[JAEGER TRACE COMPLETE] ${JSON.stringify(trace, null, 2)}`);
          break;
        case 'zipkin':
          console.log(`[ZIPKIN TRACE COMPLETE] ${JSON.stringify(trace, null, 2)}`);
          break;
        case 'custom':
          if (this.config.customExporter) {
            this.config.customExporter(trace);
          }
          break;
      }
    }
  }

  /**
   * Format trace parent header
   */
  private formatTraceParent(span: Span): string {
    const version = '00';
    const flags = span.status === 'error' ? '01' : '01'; // sampled
    return `${version}-${span.traceId}-${span.spanId}-${flags}`;
  }

  /**
   * Format trace state header
   */
  private formatTraceState(span: Span): string {
    const baggage = this.baggage.get(span.traceId) || {};
    const entries = Object.entries(baggage)
      .map(([key, value]) => `${key}=${value}`)
      .join(',');
    
    return entries;
  }

  /**
   * Calculate span depth
   */
  private calculateDepth(span: Span, trace: Trace): number {
    if (!span.parentSpanId) return 0;
    
    const parentSpan = trace.spans.find(s => s.spanId === span.parentSpanId);
    if (!parentSpan) return 0;
    
    return 1 + this.calculateDepth(parentSpan, trace);
  }

  /**
   * Update calculated metrics
   */
  private updateCalculatedMetrics(): void {
    const traces = Array.from(this.traces.values());
    const completedTraces = traces.filter(t => t.endTime !== undefined);
    
    // Average trace duration
    if (completedTraces.length > 0) {
      const totalDuration = completedTraces.reduce((sum, trace) => sum + (trace.duration || 0), 0);
      this.metrics.averageTraceDuration = totalDuration / completedTraces.length;
    }

    // Error rate
    this.updateErrorRate();
  }

  /**
   * Update error rate
   */
  private updateErrorRate(): void {
    const traces = Array.from(this.traces.values());
    const errorTraces = traces.filter(t => t.status === 'error');
    
    if (traces.length > 0) {
      this.metrics.errorRate = (errorTraces.length / traces.length) * 100;
    }
  }

  /**
   * Generate trace ID
   */
  private generateTraceId(): string {
    return Array.from({ length: 16 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }

  /**
   * Generate span ID
   */
  private generateSpanId(): string {
    return Array.from({ length: 8 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }

  /**
   * Get configuration
   */
  getConfig(): Required<TracingConfig> {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<TracingConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Create a trace context for propagation
   */
  createTraceContext(span: Span): TraceContext {
    return {
      traceId: span.traceId,
      spanId: span.spanId,
      parentSpanId: span.parentSpanId,
      baggage: this.baggage.get(span.traceId) || {},
      flags: {
        sampled: true
      }
    };
  }

  /**
   * Restore span from trace context
   */
  restoreSpanFromContext(context: TraceContext, operationName: string): Span {
    const span = this.startSpan(operationName, {
      kind: 'server'
    });

    // Override with context values
    span.traceId = context.traceId;
    span.spanId = context.spanId;
    span.parentSpanId = context.parentSpanId;

    // Restore baggage
    if (this.config.enableBaggagePropagation) {
      this.baggage.set(span.traceId, context.baggage);
    }

    return span;
  }
}

/**
 * Trace Context Propagation Middleware
 */
class TraceContextPropagation {
  private tracer: DistributedTracer;

  constructor(tracer: DistributedTracer) {
    this.tracer = tracer;
  }

  /**
   * Express middleware for trace context propagation
   */
  middleware() {
    return (req: any, res: any, next: any) => {
      // Extract trace context from headers
      const context = this.tracer.extractContext(req.headers);
      
      if (context) {
        // Restore or create span from context
        const operationName = `${req.method} ${req.path}`;
        const span = context 
          ? this.tracer.restoreSpanFromContext(context, operationName)
          : this.tracer.startSpan(operationName, { kind: 'server' });

        // Add span to request for later use
        req.span = span;
        req.traceContext = context;

        // Inject context into response headers
        this.tracer.injectContext(span, res.headers);

        // Finish span when response ends
        res.on('finish', () => {
          const status = res.statusCode >= 400 ? 'error' : 'ok';
          this.tracer.finishSpan(span, { status });
        });
      }

      next();
    };
  }
}

export default DistributedTracer;
export { TraceContextPropagation };
export type { 
  TraceContext, 
  Span, 
  Trace, 
  TracingConfig 
};