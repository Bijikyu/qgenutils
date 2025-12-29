/**
 * Microservice Orchestration System
 * 
 * PURPOSE: Enterprise-grade service orchestration platform for managing
 * distributed microservices with automatic discovery, health monitoring,
 * load balancing, and lifecycle management.
 * 
 * ORCHESTRATION FEATURES:
 * - Service discovery and registration
 * - Automatic load balancing strategies
 * - Health monitoring and self-healing
 * - Circuit breaker integration
 * - Version management and canary deployments
 * - Distributed configuration management
 */

import { EventEmitter } from 'events';
import { qerrors } from 'qerrors';
import CircuitBreaker from '../resilience/circuitBreaker.js';
import HealthChecker from '../health/healthChecker.js';

interface ServiceInstance {
  id: string;
  name: string;
  version: string;
  host: string;
  port: number;
  protocol: 'http' | 'https' | 'tcp';
  healthEndpoint?: string;
  metadata?: Record<string, any>;
  tags?: string[];
  weight?: number;
  region?: string;
  zone?: string;
  registeredAt: number;
  lastHealthCheck: number;
  isHealthy: boolean;
  circuitBreaker?: CircuitBreaker<any, any>;
  metrics: {
    requests: number;
    successes: number;
    failures: number;
    averageResponseTime: number;
  };
}

interface ServiceRegistry {
  services: Map<string, ServiceInstance[]>;
  healthChecks: Map<string, HealthChecker>;
  loadBalancers: Map<string, LoadBalancer>;
  subscriptions: Map<string, ServiceSubscription>;
}

interface LoadBalancer {
  strategy: 'round-robin' | 'weighted' | 'least-connections' | 'random';
  instances: ServiceInstance[];
  currentIndex: number;
  connectionCounts: Map<string, number>;
}

interface ServiceSubscription {
  serviceName: string;
  version?: string;
  callback: (instances: ServiceInstance[]) => void;
  filter?: (instance: ServiceInstance) => boolean;
}

interface OrchestrationConfig {
  name: string;
  region?: string;
  enableServiceDiscovery?: boolean;
  enableHealthMonitoring?: boolean;
  enableLoadBalancing?: boolean;
  healthCheckInterval?: number;
  serviceTtl?: number; // Time to live for service registration
  loadBalancingStrategy?: 'round-robin' | 'weighted' | 'least-connections';
  enableCanaryDeployments?: boolean;
  canaryTrafficPercentage?: number;
  enableMetrics?: boolean;
}

class ServiceOrchestrator extends EventEmitter {
  private config: Required<OrchestrationConfig>;
  private registry: ServiceRegistry;
  private healthCheckIntervals: Map<string, NodeJS.Timeout> = new Map();
  private isRunning = false;

  constructor(config: OrchestrationConfig) {
    super();

    this.config = {
      name: config.name,
      region: config.region || 'us-west-1',
      enableServiceDiscovery: config.enableServiceDiscovery !== false,
      enableHealthMonitoring: config.enableHealthMonitoring !== false,
      enableLoadBalancing: config.enableLoadBalancing !== false,
      healthCheckInterval: config.healthCheckInterval || 30000,
      serviceTtl: config.serviceTtl || 60000, // 1 minute
      loadBalancingStrategy: config.loadBalancingStrategy || 'round-robin',
      enableCanaryDeployments: config.enableCanaryDeployments || false,
      canaryTrafficPercentage: config.canaryTrafficPercentage || 10,
      enableMetrics: config.enableMetrics !== false
    };

    this.registry = {
      services: new Map(),
      healthChecks: new Map(),
      loadBalancers: new Map(),
      subscriptions: new Map()
    };
  }

  /**
   * Start orchestration services
   */
  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    
    // Start health monitoring
    if (this.config.enableHealthMonitoring) {
      this.startHealthMonitoring();
    }

    // Start metrics collection
    if (this.config.enableMetrics) {
      this.startMetricsCollection();
    }

    this.emit('orchestrator:started', this.config.name);
  }

  /**
   * Stop orchestration services
   */
  stop(): void {
    if (!this.isRunning) return;

    // Stop all health checks
    for (const interval of this.healthCheckIntervals.values()) {
      clearInterval(interval);
    }
    this.healthCheckIntervals.clear();

    // Clear all services
    this.registry.services.clear();
    this.registry.healthChecks.clear();
    this.registry.loadBalancers.clear();

    this.isRunning = false;
    this.emit('orchestrator:stopped', this.config.name);
  }

  /**
   * Register a service instance
   */
  async registerService(service: Omit<ServiceInstance, 'registeredAt' | 'lastHealthCheck' | 'isHealthy' | 'metrics'>): Promise<boolean> {
    try {
      const serviceInstance: ServiceInstance = {
        registeredAt: Date.now(),
        lastHealthCheck: Date.now(),
        isHealthy: true,
        metrics: {
          requests: 0,
          successes: 0,
          failures: 0,
          averageResponseTime: 0
        },
        ...service
      };

      // Add to service registry
      if (!this.registry.services.has(service.name)) {
        this.registry.services.set(service.name, []);
      }
      
      this.registry.services.get(service.name)!.push(serviceInstance);

      // Create load balancer for service
      if (!this.registry.loadBalancers.has(service.name)) {
        this.registry.loadBalancers.set(service.name, {
          strategy: this.config.loadBalancingStrategy,
          instances: [],
          currentIndex: 0,
          connectionCounts: new Map()
        });
      }

      // Update load balancer
      this.updateLoadBalancer(service.name);

      // Create health checker
      if (this.config.enableHealthMonitoring && service.healthEndpoint) {
        const healthChecker = new HealthChecker({
          name: `${service.name}-${serviceInstance.id}`,
          timeout: 5000,
          enableSystemChecks: false
        });

        // Add custom health check for service
        healthChecker.addCheck({
          name: 'service-endpoint',
          critical: true,
          tags: ['service', 'endpoint'],
          check: async () => {
            try {
              const response = await this.performHealthCheck(serviceInstance);
              serviceInstance.isHealthy = response.success;
              return response.success;
            } catch (error) {
              serviceInstance.isHealthy = false;
              return false;
            }
          }
        });

        this.registry.healthChecks.set(serviceInstance.id, healthChecker);

        // Start health monitoring
        const interval = setInterval(() => {
          healthChecker.runLivenessProbe();
        }, this.config.healthCheckInterval);

        this.healthCheckIntervals.set(serviceInstance.id, interval);
      }

      // Create circuit breaker
      serviceInstance.circuitBreaker = new CircuitBreaker(
        async (data) => {
          return this.callService(serviceInstance, data);
        },
        {
          name: `${service.name}-${serviceInstance.id}`,
          failureThreshold: 5,
          recoveryTimeout: 30000,
          timeout: 10000
        }
      );

      // Notify subscribers
      this.notifyServiceSubscribers(service.name);

      this.emit('service:registered', serviceInstance);
      return true;

    } catch (error) {
      qerrors(
        error instanceof Error ? error : new Error(String(error)),
        'ServiceOrchestrator.registerService',
        `Failed to register service: ${service.name}`
      );
      return false;
    }
  }

  /**
   * Unregister a service instance
   */
  async unregisterService(serviceName: string, serviceId: string): Promise<boolean> {
    try {
      const services = this.registry.services.get(serviceName);
      if (!services) return false;

      const index = services.findIndex(s => s.id === serviceId);
      if (index === -1) return false;

      const serviceInstance = services[index];

      // Remove health monitoring
      const interval = this.healthCheckIntervals.get(serviceId);
      if (interval) {
        clearInterval(interval);
        this.healthCheckIntervals.delete(serviceId);
      }

      // Remove from registry
      services.splice(index, 1);

      // Update load balancer
      this.updateLoadBalancer(serviceName);

      // Remove health checker
      this.registry.healthChecks.delete(serviceId);

      // Notify subscribers
      this.notifyServiceSubscribers(serviceName);

      this.emit('service:unregistered', serviceInstance);
      return true;

    } catch (error) {
      qerrors(
        error instanceof Error ? error : new Error(String(error)),
        'ServiceOrchestrator.unregisterService',
        `Failed to unregister service: ${serviceName}`
      );
      return false;
    }
  }

  /**
   * Discover service instances
   */
  discoverService(serviceName: string, version?: string): ServiceInstance[] {
    const services = this.registry.services.get(serviceName) || [];
    
    let instances = version 
      ? services.filter(s => s.version === version)
      : services;

    // Filter by health
    instances = instances.filter(s => s.isHealthy);

    // Apply canary deployment logic
    if (this.config.enableCanaryDeployments && this.hasCanaryVersion(services, version)) {
      instances = this.applyCanaryLogic(instances, version);
    }

    return instances;
  }

  /**
   * Get next service instance using load balancing
   */
  getNextInstance(serviceName: string): ServiceInstance | null {
    const loadBalancer = this.registry.loadBalancers.get(serviceName);
    if (!loadBalancer || loadBalancer.instances.length === 0) {
      return null;
    }

    const healthyInstances = loadBalancer.instances.filter(s => s.isHealthy);
    if (healthyInstances.length === 0) {
      return null;
    }

    let selectedInstance: ServiceInstance;

    switch (loadBalancer.strategy) {
      case 'round-robin':
        selectedInstance = this.roundRobinSelection(healthyInstances, loadBalancer);
        break;

      case 'weighted':
        selectedInstance = this.weightedSelection(healthyInstances, loadBalancer);
        break;

      case 'least-connections':
        selectedInstance = this.leastConnectionsSelection(healthyInstances, loadBalancer);
        break;

      case 'random':
        selectedInstance = healthyInstances[Math.floor(Math.random() * healthyInstances.length)];
        break;

      default:
        selectedInstance = healthyInstances[0];
    }

    // Update connection count
    if (loadBalancer.connectionCounts) {
      const currentCount = loadBalancer.connectionCounts.get(selectedInstance.id) || 0;
      loadBalancer.connectionCounts.set(selectedInstance.id, currentCount + 1);
    }

    return selectedInstance;
  }

  /**
   * Subscribe to service changes
   */
  subscribe(
    serviceName: string,
    callback: (instances: ServiceInstance[]) => void,
    options?: {
      version?: string;
      filter?: (instance: ServiceInstance) => boolean;
    }
  ): string {
    const subscription: ServiceSubscription = {
      serviceName,
      version: options?.version,
      callback,
      filter: options?.filter
    };

    const subscriptionId = `sub-${serviceName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.registry.subscriptions.set(subscriptionId, subscription);

    // Immediately provide current instances
    const instances = this.discoverService(serviceName, subscription.version);
    const filteredInstances = subscription.filter 
      ? instances.filter(subscription.filter)
      : instances;
    
    callback(filteredInstances);

    return subscriptionId;
  }

  /**
   * Unsubscribe from service changes
   */
  unsubscribe(subscriptionId: string): boolean {
    return this.registry.subscriptions.delete(subscriptionId);
  }

  /**
   * Call a service instance
   */
  async callService<T = any>(instance: ServiceInstance, data: any): Promise<T> {
    if (!instance.circuitBreaker) {
      throw new Error(`Service instance ${instance.id} has no circuit breaker`);
    }

    this.updateServiceMetrics(instance, 'request');

    try {
      const result = await instance.circuitBreaker.execute(data);
      this.updateServiceMetrics(instance, 'success');
      return result;

    } catch (error) {
      this.updateServiceMetrics(instance, 'failure');
      throw error;
    }
  }

  /**
   * Get orchestration metrics
   */
  getMetrics(): {
    totalServices: number;
    totalInstances: number;
    healthyInstances: number;
    unhealthyInstances: number;
    averageInstancesPerService: number;
    circuitBreakerStates: Record<string, any>;
    loadBalancingMetrics: Record<string, any>;
  } {
    let totalInstances = 0;
    let healthyInstances = 0;
    let unhealthyInstances = 0;
    const circuitBreakerStates: Record<string, any> = {};
    const loadBalancingMetrics: Record<string, any> = {};

    for (const [serviceName, instances] of this.registry.services) {
      totalInstances += instances.length;
      healthyInstances += instances.filter(s => s.isHealthy).length;
      unhealthyInstances += instances.filter(s => !s.isHealthy).length;

      // Circuit breaker metrics
      if (instances.length > 0 && instances[0].circuitBreaker) {
        circuitBreakerStates[serviceName] = instances[0].circuitBreaker.getMetrics();
      }

      // Load balancing metrics
      const loadBalancer = this.registry.loadBalancers.get(serviceName);
      if (loadBalancer) {
        loadBalancingMetrics[serviceName] = {
          strategy: loadBalancer.strategy,
          instanceCount: loadBalancer.instances.length,
          healthyCount: loadBalancer.instances.filter(s => s.isHealthy).length,
          currentConnections: Array.from(loadBalancer.connectionCounts.values()).reduce((sum, count) => sum + count, 0)
        };
      }
    }

    const totalServices = this.registry.services.size;
    const averageInstancesPerService = totalServices > 0 ? totalInstances / totalServices : 0;

    return {
      totalServices,
      totalInstances,
      healthyInstances,
      unhealthyInstances,
      averageInstancesPerService,
      circuitBreakerStates,
      loadBalancingMetrics
    };
  }

  /**
   * Get all registered services
   */
  getAllServices(): Record<string, ServiceInstance[]> {
    const result: Record<string, ServiceInstance[]> = {};
    
    for (const [serviceName, instances] of this.registry.services) {
      result[serviceName] = [...instances];
    }

    return result;
  }

  /**
   * Get service configuration
   */
  getConfig(): Required<OrchestrationConfig> {
    return { ...this.config };
  }

  /**
   * Start health monitoring for all services
   */
  private startHealthMonitoring(): void {
    // Health monitoring is started per service instance in registerService
  }

  /**
   * Start metrics collection
   */
  private startMetricsCollection(): void {
    setInterval(() => {
      this.emit('metrics:updated', this.getMetrics());
    }, 10000); // Every 10 seconds
  }

  /**
   * Update load balancer for a service
   */
  private updateLoadBalancer(serviceName: string): void {
    const instances = this.registry.services.get(serviceName) || [];
    const loadBalancer = this.registry.loadBalancers.get(serviceName);
    
    if (loadBalancer) {
      loadBalancer.instances = [...instances];
    }
  }

  /**
   * Notify service subscribers
   */
  private notifyServiceSubscribers(serviceName: string): void {
    const instances = this.discoverService(serviceName);

    for (const subscription of this.registry.subscriptions.values()) {
      if (subscription.serviceName === serviceName) {
        const filteredInstances = subscription.filter 
          ? instances.filter(subscription.filter)
          : instances;
        subscription.callback(filteredInstances);
      }
    }
  }

  /**
   * Perform health check on service instance
   */
  private async performHealthCheck(instance: ServiceInstance): Promise<{ success: boolean; responseTime: number }> {
    const startTime = Date.now();

    try {
      const endpoint = instance.healthEndpoint || 
        `${instance.protocol}://${instance.host}:${instance.port}/health`;

      // In a real implementation, you would make an HTTP request here
      // For now, simulate health check
      const response = await this.simulateHealthCheck(endpoint);

      return {
        success: response.success,
        responseTime: Date.now() - startTime
      };

    } catch (error) {
      return {
        success: false,
        responseTime: Date.now() - startTime
      };
    }
  }

  /**
   * Simulate health check (placeholder for actual HTTP request)
   */
  private async simulateHealthCheck(endpoint: string): Promise<{ success: boolean }> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));

    // Simulate 95% success rate
    return {
      success: Math.random() > 0.05
    };
  }

  /**
   * Update service metrics
   */
  private updateServiceMetrics(instance: ServiceInstance, type: 'request' | 'success' | 'failure'): void {
    switch (type) {
      case 'request':
        instance.metrics.requests++;
        break;
      case 'success':
        instance.metrics.successes++;
        break;
      case 'failure':
        instance.metrics.failures++;
        break;
    }
  }

  /**
   * Round-robin selection algorithm
   */
  private roundRobinSelection(instances: ServiceInstance[], loadBalancer: LoadBalancer): ServiceInstance {
    const instance = instances[loadBalancer.currentIndex];
    loadBalancer.currentIndex = (loadBalancer.currentIndex + 1) % instances.length;
    return instance;
  }

  /**
   * Weighted selection algorithm
   */
  private weightedSelection(instances: ServiceInstance[], loadBalancer: LoadBalancer): ServiceInstance {
    const totalWeight = instances.reduce((sum, instance) => sum + (instance.weight || 1), 0);
    let random = Math.random() * totalWeight;
    
    for (const instance of instances) {
      random -= (instance.weight || 1);
      if (random <= 0) {
        return instance;
      }
    }

    return instances[0]; // Fallback
  }

  /**
   * Least connections selection algorithm
   */
  private leastConnectionsSelection(instances: ServiceInstance[], loadBalancer: LoadBalancer): ServiceInstance {
    let selectedInstance = instances[0];
    let minConnections = Infinity;

    for (const instance of instances) {
      const connections = loadBalancer.connectionCounts.get(instance.id) || 0;
      if (connections < minConnections) {
        minConnections = connections;
        selectedInstance = instance;
      }
    }

    return selectedInstance;
  }

  /**
   * Check if service has canary version
   */
  private hasCanaryVersion(instances: ServiceInstance[], currentVersion?: string): boolean {
    if (!currentVersion) return false;

    const versions = new Set(instances.map(s => s.version));
    const canaryVersion = `${currentVersion}-canary`;
    return versions.has(canaryVersion);
  }

  /**
   * Apply canary deployment logic
   */
  private applyCanaryLogic(instances: ServiceInstance[], version?: string): ServiceInstance[] {
    if (!version) return instances;

    const stableInstances = instances.filter(s => !s.version.includes('-canary'));
    const canaryInstances = instances.filter(s => s.version.includes('-canary'));

    if (canaryInstances.length === 0) return instances;

    const canaryTraffic = this.config.canaryTrafficPercentage / 100;
    const totalTraffic = instances.length;
    const canaryCount = Math.ceil(totalTraffic * canaryTraffic);
    const stableCount = totalTraffic - canaryCount;

    // Return mixed instances based on canary percentage
    const mixedInstances = [
      ...stableInstances.slice(0, stableCount),
      ...canaryInstances.slice(0, canaryCount)
    ];

    return mixedInstances.length > 0 ? mixedInstances : instances;
  }

  /**
   * Cleanup expired services
   */
  private cleanupExpiredServices(): void {
    const now = Date.now();
    const ttl = this.config.serviceTtl;

    for (const [serviceName, instances] of this.registry.services) {
      const validInstances = instances.filter(instance => 
        (now - instance.lastHealthCheck) < ttl
      );

      if (validInstances.length !== instances.length) {
        this.registry.services.set(serviceName, validInstances);
        this.updateLoadBalancer(serviceName);
        this.notifyServiceSubscribers(serviceName);
      }
    }
  }

  /**
   * Force cleanup of expired services
   */
  forceCleanup(): void {
    this.cleanupExpiredServices();
  }
}

export default ServiceOrchestrator;
export type { 
  ServiceInstance, 
  OrchestrationConfig, 
  LoadBalancer, 
  ServiceSubscription 
};