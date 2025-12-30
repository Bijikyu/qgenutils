/**
 * Event-Driven Architecture Implementation
 * 
 * PURPOSE: Comprehensive event system supporting decoupled microservices,
 * event streaming, and asynchronous communication patterns for scalable
 * distributed applications.
 * 
 * EVENT SYSTEM FEATURES:
 * - Multiple event patterns (pub/sub, request/reply, streams)
 * - Event persistence and replay
 * - Dead letter queues for failed events
 * - Event aggregation and batching
 * - Distributed event bus support
 * - Performance monitoring and metrics
 */

import { EventEmitter } from 'events';
import { qerrors } from 'qerrors';
import { BoundedLRUCache, CircularBuffer } from '../performance/boundedCache.js';
import { timerManager } from '../performance/timerManager.js';

interface Event {
  id: string;
  type: string;
  data: any;
  timestamp: number;
  source: string;
  version: number;
  correlationId?: string;
  causationId?: string;
  metadata?: Record<string, any>;
  ttl?: number;
}

interface EventSubscription {
  id: string;
  eventType: string;
  handler: EventHandler;
  filter?: (event: Event) => boolean;
  retries?: number;
  timeout?: number;
  deadLetterQueue?: boolean;
}

interface EventHandler {
  (event: Event): Promise<void> | void;
}

interface EventPattern {
  name: string;
  events: Event[];
  aggregation?: (events: Event[]) => any;
  windowSize?: number;
  timeWindow?: number;
}

interface EventMetrics {
  totalEvents: number;
  eventsByType: Map<string, number>;
  averageProcessingTime: number;
  failedEvents: number;
  deadLetteredEvents: number;
  activeSubscriptions: number;
  queuedEvents: number;
  processedEvents: number;
}

interface EventBusConfig {
  name: string;
  enablePersistence?: boolean;
  enableMetrics?: boolean;
  maxQueueSize?: number;
  deadLetterMaxSize?: number;
  batchSize?: number;
  batchTimeout?: number;
  retries?: number;
  retryDelay?: number;
}

import { BoundedLRUCache, CircularBuffer } from '../performance/boundedCache.js';
import { timerManager } from '../performance/timerManager.js';

  constructor(config: EventBusConfig) {
    this.config = {
      enablePersistence: config.enablePersistence || false,
      enableMetrics: config.enableMetrics !== false,
      maxQueueSize: config.maxQueueSize || 10000,
      deadLetterMaxSize: config.deadLetterMaxSize || 1000,
      batchSize: config.batchSize || 100,
      batchTimeout: config.batchTimeout || 1000,
      retries: config.retries || 3,
      retryDelay: config.retryDelay || 1000,
      ...config
    };

    // Initialize bounded collections to prevent memory leaks
    this.subscriptions = new BoundedLRUCache<string, EventSubscription[]>(1000, 3600000);
    this.deadLetterQueue = new CircularBuffer<Event>(this.config.deadLetterMaxSize);
    this.eventQueue = new CircularBuffer<Event>(this.config.maxQueueSize);
    this.eventStore = new BoundedLRUCache<string, Event>(this.maxCacheSize, 300000);

    this.eventEmitter = new EventEmitter();
    this.metrics = {
      totalEvents: 0,
      eventsByType: new Map(),
      averageProcessingTime: 0,
      failedEvents: 0,
      deadLetteredEvents: 0,
      activeSubscriptions: 0,
      queuedEvents: 0,
      processedEvents: 0
    };

    this.startBatchProcessing();

    // Start cleanup interval to prevent memory leaks
    this.startCleanupInterval();
  }

  private startCleanupInterval(): void {
    // Clean up every 15 minutes to prevent memory leaks
    this.cleanupInterval = timerManager.setInterval(() => {
      this.cleanupExpiredData();
    }, 15 * 60 * 1000);
  }

  private cleanupExpiredData(): void {
    // Limit subscriptions size
    if (this.subscriptions.size > this.maxCacheSize) {
      const entries = Array.from(this.subscriptions.entries());
      const toDelete = entries.slice(0, entries.length - this.maxCacheSize);
      toDelete.forEach(([key]) => this.subscriptions.delete(key));
    }

    // Limit event store size
    if (this.eventStore.size > this.maxCacheSize) {
      const entries = Array.from(this.eventStore.entries());
      const toDelete = entries.slice(0, entries.length - this.maxCacheSize);
      toDelete.forEach(([key]) => this.eventStore.delete(key));
    }

    // Clean up old events from event store (older than 1 hour)
    const now = Date.now();
    const maxAge = 60 * 60 * 1000; // 1 hour
    for (const [eventId, event] of this.eventStore.entries()) {
      if ((now - event.timestamp) > maxAge) {
        this.eventStore.delete(eventId);
      }
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
    this.subscriptions.clear();
    this.eventStore.clear();
    this.deadLetterQueue.length = 0;
    this.eventQueue.length = 0;
  }

  /**
   * Publish an event to the event bus
   */
  async publish(event: Omit<Event, 'id' | 'timestamp' | 'version'>): Promise<boolean> {
    try {
      const fullEvent: Event = {
        id: this.generateEventId(),
        timestamp: Date.now(),
        version: 1,
        ...event
      };

      // Add to metrics
      this.metrics.totalEvents++;
      
      const eventType = event.type;
      const currentCount = this.metrics.eventsByType.get(eventType) || 0;
      this.metrics.eventsByType.set(eventType, currentCount + 1);

      // Store event if persistence is enabled
      if (this.config.enablePersistence) {
        this.eventStore.set(fullEvent.id, fullEvent);
      }

      // Check TTL
      if (fullEvent.ttl && Date.now() - fullEvent.timestamp > fullEvent.ttl) {
        return false; // Event expired
      }

      // Add to queue for batch processing
      if (this.eventQueue.length >= this.config.maxQueueSize) {
        qerrors(
          new Error('Event queue is full'),
          'EventBus.publish',
          'Event queue overflow'
        );
        return false;
      }

      this.eventQueue.push(fullEvent);
      this.metrics.queuedEvents = this.eventQueue.length;

      return true;

    } catch (error) {
      this.metrics.failedEvents++;
      qerrors(
        error instanceof Error ? error : new Error(String(error)),
        'EventBus.publish',
        `Failed to publish event: ${event.type}`
      );
      return false;
    }
  }

  /**
   * Subscribe to event types
   */
  subscribe(
    eventType: string,
    handler: EventHandler,
    options?: {
      filter?: (event: Event) => boolean;
      retries?: number;
      timeout?: number;
      deadLetterQueue?: boolean;
    }
  ): string {
    const subscription: EventSubscription = {
      id: this.generateSubscriptionId(),
      eventType,
      handler,
      filter: options?.filter,
      retries: options?.retries || this.config.retries,
      timeout: options?.timeout,
      deadLetterQueue: options?.deadLetterQueue !== false
    };

    // Add to subscriptions
    if (!this.subscriptions.has(eventType)) {
      this.subscriptions.set(eventType, []);
    }
    
    this.subscriptions.get(eventType)!.push(subscription);
    this.metrics.activeSubscriptions++;

    return subscription.id;
  }

  /**
   * Unsubscribe from events
   */
  unsubscribe(subscriptionId: string): boolean {
    for (const [eventType, subs] of this.subscriptions) {
      const index = subs.findIndex(sub => sub.id === subscriptionId);
      
      if (index !== -1) {
        subs.splice(index, 1);
        this.metrics.activeSubscriptions--;
        
        // Clean up empty subscription lists
        if (subs.length === 0) {
          this.subscriptions.delete(eventType);
        }
        
        return true;
      }
    }
    
    return false;
  }

  /**
   * Request/response pattern
   */
  async request<T = any>(
    requestType: string,
    data: any,
    timeout: number = 30000
  ): Promise<T> {
    const requestId = this.generateEventId();
    const responseType = `${requestType}.response`;
    
    return new Promise((resolve, reject) => {
      const timeoutTimer = setTimeout(() => {
        this.unsubscribe(responseSubscriptionId);
        reject(new Error(`Request timeout: ${requestType}`));
      }, timeout);

      // Subscribe to response
      const responseSubscriptionId = this.subscribe(responseType, (event) => {
        if (event.correlationId === requestId) {
          clearTimeout(timeoutTimer);
          this.unsubscribe(responseSubscriptionId);
          
          if (event.metadata?.error) {
            reject(new Error(event.metadata.error));
          } else {
            resolve(event.data);
          }
        }
      }, { timeout: 0 }); // No timeout for response subscription

      // Send request
      this.publish({
        type: requestType,
        data,
        source: this.config.name,
        correlationId: requestId
      });
    });
  }

  /**
   * Reply to a request
   */
  async reply<T = any>(
    originalEvent: Event,
    responseData: T,
    error?: Error
  ): Promise<boolean> {
    const responseType = `${originalEvent.type}.response`;
    
    return this.publish({
      type: responseType,
      data: responseData,
      source: this.config.name,
      correlationId: originalEvent.correlationId,
      causationId: originalEvent.id,
      metadata: error ? { error: error.message } : undefined
    });
  }

  /**
   * Create event pattern for aggregation
   */
  createPattern(
    name: string,
    eventTypes: string[],
    options?: {
      aggregation?: (events: Event[]) => any;
      windowSize?: number;
      timeWindow?: number;
    }
  ): string {
    // Store pattern configuration
    const pattern: EventPattern = {
      name,
      events: [],
      aggregation: options?.aggregation,
      windowSize: options?.windowSize || 100,
      timeWindow: options?.timeWindow || 60000 // 1 minute
    };

    // Subscribe to all relevant event types
    for (const eventType of eventTypes) {
      this.subscribe(eventType, (event) => {
        pattern.events.push(event);
        
        // Maintain window size
        if (pattern.events.length > (pattern.windowSize ?? 100)) {
          pattern.events.shift();
        }
        
        // Apply time window constraint
        const now = Date.now();
        const windowStart = now - pattern.timeWindow!;
        pattern.events = pattern.events.filter(e => e.timestamp > windowStart);
        
        // Trigger aggregation if function is provided
        if (pattern.aggregation) {
          const result = pattern.aggregation([...pattern.events]);
          this.publish({
            type: `pattern.${name}.result`,
            data: result,
            source: this.config.name,
            correlationId: event.correlationId
          });
        }
      });
    }

    return name;
  }

  /**
   * Get events from store (for replay)
   */
  getEvents(filter?: {
    type?: string;
    source?: string;
    fromTimestamp?: number;
    toTimestamp?: number;
    correlationId?: string;
  }): Event[] {
    let events = Array.from(this.eventStore.values());

    if (filter) {
      if (filter.type) {
        events = events.filter(e => e.type === filter.type);
      }
      if (filter.source) {
        events = events.filter(e => e.source === filter.source);
      }
      if (filter.fromTimestamp) {
        events = events.filter(e => e.timestamp >= filter.fromTimestamp!);
      }
      if (filter.toTimestamp) {
        events = events.filter(e => e.timestamp <= filter.toTimestamp!);
      }
      if (filter.correlationId) {
        events = events.filter(e => e.correlationId === filter.correlationId);
      }
    }

    return events.sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Replay events from store
   */
  async replayEvents(filter?: {
    type?: string;
    source?: string;
    fromTimestamp?: number;
    toTimestamp?: number;
  }): Promise<void> {
    const events = this.getEvents(filter);
    
    for (const event of events) {
      await this.processEvent(event);
    }
  }

  /**
   * Get event bus metrics
   */
  getMetrics(): EventMetrics {
    this.metrics.queuedEvents = this.eventQueue.length;
    return { ...this.metrics };
  }

  /**
   * Get dead letter queue contents
   */
  getDeadLetterQueue(): Event[] {
    return [...this.deadLetterQueue];
  }

  /**
   * Clear dead letter queue
   */
  clearDeadLetterQueue(): void {
    this.deadLetterQueue.length = 0;
  }

  /**
   * Shutdown event bus
   */
  async shutdown(): Promise<void> {
    // Stop batch processing
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    // Process remaining events
    while (this.eventQueue.length > 0) {
      await this.processBatch();
    }

    // Clear all data
    this.subscriptions.clear();
    this.eventStore.clear();
    this.deadLetterQueue.length = 0;
    this.eventQueue.length = 0;

    // Remove all listeners
    this.eventEmitter.removeAllListeners();
  }

  /**
   * Start batch processing
   */
  private startBatchProcessing(): void {
    const processBatch = async () => {
      if (this.eventQueue.length > 0) {
        await this.processBatch();
      }

      this.batchTimer = setTimeout(processBatch, this.config.batchTimeout);
    };

    // Start first batch
    this.batchTimer = setTimeout(processBatch, this.config.batchTimeout);
  }

  /**
   * Process a batch of events
   */
  private async processBatch(): Promise<void> {
    if (this.isProcessing) return;

    this.isProcessing = true;

    try {
      const batchSize = Math.min(this.config.batchSize, this.eventQueue.length);
      const batch = this.eventQueue.splice(0, batchSize);

      // Process events in parallel
      const processingPromises = batch.map(event => this.processEvent(event));
      await Promise.allSettled(processingPromises);

      this.metrics.processedEvents += batch.length;
      this.metrics.queuedEvents = this.eventQueue.length;

    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process a single event
   */
  private async processEvent(event: Event): Promise<void> {
    const startTime = Date.now();

    try {
      const subscriptions = this.subscriptions.get(event.type) || [];
      
      // Process each subscription
      for (const subscription of subscriptions) {
        // Apply filter if present
        if (subscription.filter && !subscription.filter(event)) {
          continue;
        }

        await this.processSubscription(subscription, event);
      }

      // Update metrics
      const processingTime = Date.now() - startTime;
      this.updateAverageProcessingTime(processingTime);

    } catch (error) {
      this.metrics.failedEvents++;
      qerrors(
        error instanceof Error ? error : new Error(String(error)),
        'EventBus.processEvent',
        `Failed to process event: ${event.type}`
      );
    }
  }

  /**
   * Process a single subscription
   */
  private async processSubscription(subscription: EventSubscription, event: Event): Promise<void> {
    let retries = 0;
    const maxRetries = subscription.retries || this.config.retries;

    while (retries <= maxRetries) {
      try {
        // Add timeout if specified
        let handlerPromise = Promise.resolve(subscription.handler(event));
        
        if (subscription.timeout) {
          handlerPromise = this.addTimeout(handlerPromise, subscription.timeout);
        }

        await handlerPromise;
        return; // Success, exit retry loop

      } catch (error) {
        retries++;

        if (retries <= maxRetries) {
          // Wait before retry
          await this.delay(this.config.retryDelay);
        } else {
          // All retries failed, add to dead letter queue
          if (subscription.deadLetterQueue) {
            this.addToDeadLetterQueue(event);
          }
          
          qerrors(
            error instanceof Error ? error : new Error(String(error)),
            'EventBus.processSubscription',
            `Subscription failed after ${maxRetries} retries: ${subscription.id}`
          );
        }
      }
    }
  }

  /**
   * Add event to dead letter queue
   */
  private addToDeadLetterQueue(event: Event): void {
    if (this.deadLetterQueue.length >= this.config.deadLetterMaxSize) {
      // Remove oldest event to make room
      this.deadLetterQueue.shift();
    }
    
    this.deadLetterQueue.push(event);
    this.metrics.deadLetteredEvents++;
  }

  /**
   * Update average processing time
   */
  private updateAverageProcessingTime(newTime: number): void {
    // Exponential moving average
    if (this.metrics.averageProcessingTime === 0) {
      this.metrics.averageProcessingTime = newTime;
    } else {
      this.metrics.averageProcessingTime = 
        this.metrics.averageProcessingTime * 0.9 + newTime * 0.1;
    }
  }

  /**
   * Add timeout to promise
   */
  private addTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Handler timeout after ${timeoutMs}ms`));
      }, timeoutMs);

      promise
        .then(result => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique subscription ID
   */
  private generateSubscriptionId(): string {
    return `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default EventBus;
export type { 
  Event, 
  EventSubscription, 
  EventHandler, 
  EventPattern, 
  EventMetrics, 
  EventBusConfig 
};