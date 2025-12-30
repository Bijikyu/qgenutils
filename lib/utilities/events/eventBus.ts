import { timerManager } from '../performance/timerManager.js';
import { OptimizedRouter } from '../routing/trieRouter.js';

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

interface EventBusMetrics {
  totalEvents: number;
  failedEvents: number;
  deadLetteredEvents: number;
  activeSubscriptions: number;
  queuedEvents: number;
  processedEvents: number;
}

interface EventMessage {
  id: string;
  type: string;
  data: any;
  timestamp: number;
  retryCount?: number;
  headers?: Record<string, string>;
}

interface EventSubscription {
  id: string;
  eventType: string;
  handler: (event: EventMessage) => void;
  filter?: (event: EventMessage) => boolean;
  persistent?: boolean;
  createdAt: number;
}

interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  backoffMultiplier?: number;
}

/**
 * Enterprise Event Bus Implementation
 */
export class EventBus {
  private config: Required<EventBusConfig>;
  private subscriptions: Map<string, EventSubscription[]> = new Map();
  private eventQueue: EventMessage[] = [];
  private deadLetterQueue: EventMessage[] = [];
  private metrics: EventBusMetrics = {
    totalEvents: 0,
    failedEvents: 0,
    deadLetteredEvents: 0,
    activeSubscriptions: 0,
    queuedEvents: 0,
    processedEvents: 0
  };
  private timers: Set<NodeJS.Timeout> = new Set();
  private isRunning = false;
  private processingTimer: NodeJS.Timeout | null = null;
  private router: OptimizedRouter;

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

    if (this.config.enablePersistence) {
      this.loadPersistedEvents();
    }

    // Initialize optimized components
    this.router = new OptimizedRouter();
  }

  /**
   * Subscribe to event type
   */
  subscribe(eventType: string, handler: (event: EventMessage) => void, options?: {
    filter?: (event: EventMessage) => boolean;
    persistent?: boolean;
  }): string {
    const subscription: EventSubscription = {
      id: this.generateId(),
      eventType,
      handler,
      filter: options?.filter,
      persistent: options?.persistent || false,
      createdAt: Date.now()
    };

    if (!this.subscriptions.has(eventType)) {
      this.subscriptions.set(eventType, []);
    }

    this.subscriptions.get(eventType)!.push(subscription);
    this.metrics.activeSubscriptions++;

    if (this.config.enablePersistence && subscription.persistent) {
      this.persistSubscription(subscription);
    }

    return subscription.id;
  }

  /**
   * Unsubscribe from event type
   */
  unsubscribe(subscriptionId: string): boolean {
    for (const [eventType, subscriptions] of this.subscriptions) {
      const index = subscriptions.findIndex(sub => sub.id === subscriptionId);
      if (index !== -1) {
        subscriptions.splice(index, 1);
        this.metrics.activeSubscriptions--;
        
        if (subscriptions.length === 0) {
          this.subscriptions.delete(eventType);
        }
        
        return true;
      }
    }
    return false;
  }

  /**
   * Publish event
   */
  async publish(eventType: string, data: any, options?: {
    headers?: Record<string, string>;
    priority?: 'low' | 'normal' | 'high' | 'critical';
    retry?: RetryOptions;
  }): Promise<void> {
    const event: EventMessage = {
      id: this.generateId(),
      type: eventType,
      data,
      timestamp: Date.now(),
      headers: options?.headers || {},
      retryCount: 0
    };

    this.metrics.totalEvents++;
    
    try {
      const deliveryPromises: Promise<void>[] = [];
      const subscriptions = this.subscriptions.get(eventType) || [];
      
      for (const subscription of subscriptions) {
        if (!subscription.filter || subscription.filter(event)) {
          deliveryPromises.push(this.deliverEvent(subscription, event));
        }
      }

      await Promise.allSettled(deliveryPromises);
      this.metrics.processedEvents++;
      
    } catch (error) {
      this.metrics.failedEvents++;
      await this.handleFailedEvent(event, error, options?.retry);
    }
  }

  /**
   * Start event processing
   */
  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.processingTimer = this.addTimer(() => {
      this.processEventBatch();
    }, this.config.batchTimeout);
  }

  /**
   * Stop event processing
   */
  stop(): void {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    
    if (this.processingTimer) {
      this.removeTimer(this.processingTimer);
      this.processingTimer = null;
    }
  }

  /**
   * Get metrics
   */
  getMetrics(): EventBusMetrics {
    return { ...this.metrics };
  }

  /**
   * Destroy event bus
   */
  destroy(): void {
    this.stop();
    
    for (const timer of this.timers) {
      this.removeTimer(timer);
    }
    
    this.subscriptions.clear();
    this.eventQueue.length = 0;
    this.deadLetterQueue.length = 0;
    this.isRunning = false;
  }

  /**
   * Deliver event to subscription
   */
  private async deliverEvent(subscription: EventSubscription, event: EventMessage): Promise<void> {
    try {
      await subscription.handler(event);
    } catch (error) {
      console.error(`Event delivery failed for subscription ${subscription.id}:`, error);
      throw error;
    }
  }

  /**
   * Handle failed event
   */
  private async handleFailedEvent(event: EventMessage, error: any, retryOptions?: RetryOptions): Promise<void> {
    const maxRetries = retryOptions?.maxRetries || this.config.retries;
    const retryDelay = retryOptions?.retryDelay || this.config.retryDelay;
    
    event.retryCount = (event.retryCount || 0) + 1;
    
    if (event.retryCount <= maxRetries) {
      const delay = retryDelay * Math.pow(2, event.retryCount - 1);
      this.addTimer(() => {
        this.publish(event.type, event.data, { retry: retryOptions });
      }, delay);
    } else {
      this.deadLetterQueue.push(event);
      this.metrics.deadLetteredEvents++;
      
      if (this.deadLetterQueue.length > this.config.deadLetterMaxSize) {
        this.deadLetterQueue.shift();
      }
    }
  }

  /**
   * Process event batch
   */
  private async processEventBatch(): Promise<void> {
    if (this.eventQueue.length === 0) return;
    
    const batchSize = Math.min(this.config.batchSize, this.eventQueue.length);
    const batch = this.eventQueue.splice(0, batchSize);
    
    try {
      await Promise.all(batch.map(event => this.publish(event.type, event.data)));
    } catch (error) {
      console.error('Batch processing failed:', error);
    }
  }

  /**
   * Load persisted events
   */
  private loadPersistedEvents(): void {
    // Implementation would load persisted events from storage
  }

  /**
   * Persist subscription
   */
  private persistSubscription(subscription: EventSubscription): void {
    // Implementation would persist subscription to storage
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Add timer with tracking
   */
  private addTimer(callback: () => void, delay: number): NodeJS.Timeout {
    const timer = timerManager.setTimeout(callback, delay);
    this.timers.add(timer);
    return timer;
  }

  /**
   * Remove timer with tracking
   */
  private removeTimer(timer: NodeJS.Timeout): void {
    timerManager.clearTimeout(timer);
    this.timers.delete(timer);
  }
}