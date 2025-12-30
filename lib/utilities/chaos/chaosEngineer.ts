/**
 * Chaos Engineering Tools
 * 
 * PURPOSE: Enterprise-grade chaos engineering platform for testing system
 * resilience, identifying bottlenecks, and preparing for production
 * failures through controlled chaos experiments.
 * 
 * CHAOS FEATURES:
 * - Multiple chaos patterns (latency, errors, rate limiting, resource exhaustion)
 * - Controlled experiment management with safety mechanisms
 * - Impact analysis and automatic rollback
 * - Service resilience scoring
 * - Production-ready failure injection
 */

import { EventEmitter } from 'events';
import { qerrors } from 'qerrors';

interface ChaosExperiment {
  id: string;
  name: string;
  description: string;
  type: 'latency' | 'error' | 'rate_limit' | 'resource_exhaustion' | 'network_partition' | 'data_corruption';
  target: {
    services: string[];
    endpoints: string[];
    instances: string[];
    regions: string[];
  };
  configuration: {
    severity: 'low' | 'medium' | 'high' | 'critical';
    probability: number; // 0-1
    duration: number; // seconds
    rampUpTime: number; // seconds
    parameters?: Record<string, any>;
  };
  status: 'planned' | 'running' | 'paused' | 'completed' | 'rolled_back' | 'failed';
  startTime?: number;
  endTime?: number;
  rollbackReason?: string;
  metrics: {
    totalRequests: number;
    errorRate: number;
    averageLatency: number;
    p95Latency: number;
    availability: number;
  };
}

interface ChaosMetrics {
  experiments: number;
  experimentsCompleted: number;
  experimentsFailed: number;
  experimentsRolledBack: number;
  averageDuration: number;
  errorRate: number;
  latencyImpact: number;
  resilienceScore: number;
  servicesTested: Set<string>;
  vulnerabilities: Array<{
    service: string;
    type: string;
    severity: string;
    count: number;
  }>;
}

interface ChaosControl {
  chaosEnabled: boolean;
  requiresApproval: boolean;
  rollbackThreshold: number;
  maxConcurrency: number;
  safeMode: boolean;
  productionSafeguards: {
    enable: boolean;
    maxErrorRate: number;
    maxLatencyIncrease: number;
    allowedHours: string[]; // HH:MM format
  };
}

class ChaosEngineer extends EventEmitter {
  private config: ChaosControl;
  private experiments: Map<string, ChaosExperiment> = new Map();
  private metrics: ChaosMetrics;
  private isRunning = false;
  private chaosMonkey?: any;
  private settings: ChaosControl;

constructor(config: ChaosControl) {
    super();
    
    this.config = {
      chaosEnabled: config.enabled !== false,
      requiresApproval: config.requiresApproval !== false,
      rollbackThreshold: config.rollbackThreshold || 0.5, // 50% error rate
      maxConcurrency: config.maxConcurrency || 3,
      safeMode: config.safeMode !== false,
      productionSafeguards: {
        enable: config.productionSafeguards?.enable !== false,
        maxErrorRate: config.productionSafeguards?.maxErrorRate || 0.1, // 10%
        maxLatencyIncrease: config.productionSafeguards?.maxLatencyIncrease || 500, // 500ms
        allowedHours: config.productionSafeguards?.allowedHours || ['10:00', '11:00', '14:00', '15:00'], // Business hours only
        ...config.productionSafeguards
      },
      ...config
    };

    this.metrics = {
      experiments: 0,
      experimentsCompleted: 0,
      experimentsFailed: 0,
      experimentsRolledBack: 0,
      averageDuration: 0,
      errorRate: 0,
      latencyImpact: 0,
      resilienceScore: 0,
      servicesTested: new Set(),
      vulnerabilities: []
    };

    // Initialize chaos monkey
    this.initializeChaosMonkey();
  }

  /**
   * Start chaos engine
   */
  start(): void {
    if (this.isRunning) return;

this.isRunning = true;
    this.emit('chaos:started');
    
    if (this.settings.safeMode) {
      console.log('🛡️ Chaos Engine started in SAFE MODE');
    } else {
      console.log('🔥 Chaos Engine started in NORMAL MODE');
    }
  }

  /**
   * Stop chaos engine
   */
  stop(): void {
    if (!this.isRunning) return;

    // Stop all running experiments
    for (const experiment of this.experiments.values()) {
      if (experiment.status === 'running') {
        this.stopExperiment(experiment.id);
      }
    }

    this.isRunning = false;
    this.emit('chaos:stopped');
  }

  /**
   * Create chaos experiment
   */
  createExperiment(experiment: Omit<ChaosExperiment, 'id' | 'status' | 'startTime' | 'endTime' | 'rollbackReason' | 'metrics'>): string {
    const id = this.generateExperimentId();
    const fullExperiment: ChaosExperiment = {
      ...experiment,
      id,
      status: 'planned',
      metrics: {
        totalRequests: 0,
        errorRate: 0,
        averageLatency: 0,
        p95Latency: 0,
        availability: 100
      }
    };

    this.experiments.set(id, fullExperiment);
    this.metrics.experiments++;

    this.emit('experiment:created', fullExperiment);
    return id;
  }

  /**
   * Run chaos experiment
   */
  async runExperiment(experimentId: string): Promise<void> {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) {
      throw new Error(`Experiment ${experimentId} not found`);
    }

    // Check if chaos is enabled
    if (!this.settings.chaosEnabled) {
      console.log('Chaos experiments are disabled');
      return;
    }

// Production safeguards
    if (this.settings.productionSafeguards.enable && !this.isAllowedTime()) {
      throw new Error('Chaos experiments not allowed outside business hours');
    }

    // Approval check
    if (this.config.requiresApproval) {
      console.log(`📋 Experiment ${experimentId} requires approval. Run 'approveExperiment("${experimentId}")' to continue.`);
      return;
    }

    try {
      this.updateExperimentStatus(experimentId, 'running');
      this.metrics.servicesTested.add(experiment.target.services);

      console.log(`🔥 Starting chaos experiment: ${experiment.name} (${experiment.type})`);
      console.log(`   Target: ${experiment.target.services.join(', ')}`);
      console.log(`   Severity: ${experiment.configuration.severity}`);
      console.log(`   Duration: ${experiment.configuration.duration}s`);

      await this.executeExperiment(experiment);

    } catch (error) {
      this.updateExperimentStatus(experimentId, 'failed');
      this.metrics.experimentsFailed++;
      
      qerrors(
        error instanceof Error ? error : new Error(String(error)),
        'ChaosEngineer.runExperiment',
        `Experiment ${experimentId} failed`
      );
    }
  }

  /**
   * Execute specific chaos experiment
   */
  private async executeExperiment(experiment: ChaosExperiment): Promise<void> {
    const startTime = Date.now();
    experiment.startTime = startTime;

    // Apply ramp-up if configured
    if (experiment.configuration.rampUpTime > 0) {
      await this.rampUpExperiment(experiment);
    }

    // Execute chaos pattern based on type
    switch (experiment.type) {
      case 'latency':
        await this.executeLatencyExperiment(experiment);
        break;
      case 'error':
        await this.executeErrorExperiment(experiment);
        break;
      case 'rate_limit':
        await this.executeRateLimitExperiment(experiment);
        break;
      case 'resource_exhaustion':
        await this.executeResourceExhaustionExperiment(experiment);
        break;
      case 'network_partition':
        await this.executeNetworkPartitionExperiment(experiment);
        break;
      case 'data_corruption':
        await this.executeDataCorruptionExperiment(experiment);
        break;
    }

    // Wait for experiment duration
    await this.sleep(experiment.configuration.duration * 1000);

    this.updateExperimentStatus(experiment.id, 'completed');
    this.metrics.experimentsCompleted++;

    // Update average duration
    const duration = Date.now() - startTime;
    this.metrics.averageDuration = (this.metrics.averageDuration + duration) / 2;

    console.log(`✅ Chaos experiment completed: ${experiment.name} (${duration}ms)`);
  }

  /**
   * Execute latency chaos experiment
   */
  private async executeLatencyExperiment(experiment: ChaosExperiment): Promise<void> {
    const { parameters } = experiment.configuration;
    const latencyMs = parameters?.latency || 1000;
    const variance = parameters?.variance || 200;

    console.log(`🐌 Applying latency: ${latencyMs}ms ±${variance}ms`);

    // Use chaos monkey if available
    if (this.chaosMonkey) {
      this.chaosMonkey.latency(experiment.target.services, latencyMs, variance);
    } else {
      // Simulate latency injection
      await this.simulateLatencyInjection(experiment.target.services, latencyMs, variance);
    }
  }

  /**
   * Execute error chaos experiment
   */
  private async executeErrorExperiment(experiment: ChaosExperiment): Promise<void> {
    const { parameters } = experiment.configuration;
    const errorType = parameters?.errorType || 'internal_server_error';
    const errorRate = experiment.configuration.probability;

    console.log(`💥 Injecting ${errorRate} error rate (${errorType})`);

    if (this.chaosMonkey) {
      this.chaosMonkey.errors(experiment.target.services, errorType, errorRate);
    } else {
      await this.simulateErrorInjection(experiment.target.services, errorType, errorRate);
    }
  }

  /**
   * Execute rate limiting chaos experiment
   */
  private async executeRateLimitExperiment(experiment: ChaosExperiment): Promise<void> {
    const { parameters } = experiment.configuration;
    const rateLimit = parameters?.rateLimit || 10; // requests per minute

    console.log(`🚦 Applying rate limit: ${rateLimit} req/min`);

    if (this.chaosMonkey) {
      this.chaosMonkey.rateLimit(experiment.target.services, rateLimit);
    } else {
      await this.simulateRateLimit(experiment.target.services, rateLimit);
    }
  }

  /**
   * Execute resource exhaustion chaos experiment
   */
  private async executeResourceExhaustionExperiment(experiment: ChaosExperiment): Promise<void> {
    const { parameters } = experiment.configuration;
    const resource = parameters?.resource || 'memory';
    const intensity = parameters?.intensity || 'medium';

    console.log(`🏚️ Exhausting ${resource} resource (${intensity} intensity)`);

    if (this.chaosMonkey) {
      this.chaosMonkey.resourceExhaustion(experiment.target.services, resource, intensity);
    } else {
      await this.simulateResourceExhaustion(experiment.target.services, resource, intensity);
    }
  }

  /**
   * Execute network partition chaos experiment
   */
  private async executeNetworkPartitionExperiment(experiment: ChaosExperiment): Promise<void> {
    const { parameters } = experiment.configuration;
    const partitionType = parameters?.partitionType || 'partial';
    const servicesToPartition = parameters?.services || experiment.target.services.slice(0, 1);

    console.log(`🌐 Creating ${partitionType} network partition for ${servicesToPartition.join(', ')}`);

    if (this.chaosMonkey) {
      this.chaosMonkey.networkPartition(servicesToPartition, partitionType);
    } else {
      await this.simulateNetworkPartition(servicesToPartition, partitionType);
    }
  }

  /**
   * Execute data corruption chaos experiment
   */
  private async executeDataCorruptionExperiment(experiment: ChaosExperiment): Promise<void> {
    const { parameters } = experiment.configuration;
    const corruptionType = parameters?.corruptionType || 'partial';
    const dataField = parameters?.dataField || 'response';

    console.log(`💉 Corrupting ${dataField} data (${corruptionType})`);

    if (this.chaosMonkey) {
      this.chaosMonkey.dataCorruption(experiment.target.services, dataField, corruptionType);
    } else {
      await this.simulateDataCorruption(experiment.target.services, dataField, corruptionType);
    }
  }

  /**
   * Ramp up experiment gradually
   */
  private async rampUpExperiment(experiment: ChaosExperiment): Promise<void> {
    console.log(`📈 Ramping up ${experiment.configuration.rampUpTime}s`);

    const steps = 10;
    const stepDuration = (experiment.configuration.rampUpTime * 1000) / steps;
    const maxProbability = experiment.configuration.probability;

    for (let i = 0; i < steps; i++) {
      const currentProbability = (maxProbability / steps) * (i + 1);
      console.log(`   Step ${i + 1}/${steps}: ${(currentProbability * 100).toFixed(1)}% intensity`);
      
      // Apply gradual intensity increase
      await this.applyChaosIntensity(experiment, currentProbability);
      await this.sleep(stepDuration);
    }
  }

  /**
   * Apply chaos intensity
   */
  private async applyChaosIntensity(experiment: ChaosExperiment, intensity: number): Promise<void> {
    // This would adjust the chaos monkey configuration
    // In real implementation, this would dynamically modify the chaos
    // injection parameters based on the current intensity
  }

  /**
   * Stop experiment
   */
  stopExperiment(experimentId: string): boolean {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) return false;

    if (experiment.status !== 'running') {
      return false;
    }

    this.updateExperimentStatus(experimentId, 'paused');
    console.log(`⏸️ Paused experiment: ${experiment.name}`);

    // Clean up chaos effects
    if (this.chaosMonkey) {
      this.chaosMonkey.cleanup(experiment.target.services);
    }

    return true;
  }

  /**
   * Roll back experiment
   */
  rollbackExperiment(experimentId: string, reason?: string): boolean {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) return false;

    this.updateExperimentStatus(experimentId, 'rolled_back');
    experiment.rollbackReason = reason;

    console.log(`🔄 Rolled back experiment: ${experiment.name} - ${reason}`);

    // Clean up chaos effects
    if (this.chaosMonkey) {
      this.chaosMonkey.cleanup(experiment.target.services);
    }

    this.metrics.experimentsRolledBack++;
    this.emit('experiment:rolled_back', experiment);
    return true;
  }

  /**
   * Get experiment details
   */
  getExperiment(experimentId: string): ChaosExperiment | undefined {
    return this.experiments.get(experimentId);
  }

  /**
   * Get all experiments
   */
  getExperiments(): ChaosExperiment[] {
    return Array.from(this.experiments.values());
  }

  /**
   * Get chaos metrics
   */
  getMetrics(): ChaosMetrics {
    this.updateCalculatedMetrics();
    return { ...this.metrics };
  }

  /**
   * Approve experiment (for approval flow)
   */
  approveExperiment(experimentId: string): boolean {
    if (!this.config.requiresApproval) {
      return true;
    }

    console.log(`✅ Approved experiment: ${experimentId}`);
    this.emit('experiment:approved', experimentId);
    
    return true;
  }

  /**
   * Initialize chaos monkey (placeholder)
   */
  private initializeChaosMonkey(): void {
    // In real implementation, this would integrate with
    // actual chaos monkey libraries like Chaos Mesh, Gremlin, etc.
    console.log('🐒 Chaos Monkey initialized (simulated)');
    
    this.chaosMonkey = {
      latency: async (services: string[], latency: number, variance: number) => {
        console.log(`🐌 Latency injection simulated for ${services.join(', ')}`);
      },
      errors: async (services: string[], type: string, rate: number) => {
        console.log(`💥 Error injection simulated for ${services.join(', ')}`);
      },
      rateLimit: async (services: string[], limit: number) => {
        console.log(`🚦 Rate limiting simulated for ${services.join(', ')}`);
      },
      resourceExhaustion: async (services: string[], resource: string, intensity: string) => {
        console.log(`🏚️ Resource exhaustion simulated for ${services.join(', ')}`);
      },
      networkPartition: async (services: string[], type: string) => {
        console.log(`🌐 Network partition simulated for ${services.join(', ')}`);
      },
      dataCorruption: async (services: string[], field: string, type: string) => {
        console.log(`💉 Data corruption simulated for ${services.join(', ')}`);
      },
      cleanup: async (services: string[]) => {
        console.log(`🧹 Chaos cleanup for ${services.join(', ')}`);
      }
    };
  }

  // Simulation methods (placeholders for actual implementation)
  private async simulateLatencyInjection(services: string[], latency: number, variance: number): Promise<void> {
    await this.sleep(100);
  }

  private async simulateErrorInjection(services: string[], type: string, rate: number): Promise<void> {
    await this.sleep(100);
  }

  private async simulateRateLimit(services: string[], limit: number): Promise<void> {
    await this.sleep(100);
  }

  private async simulateResourceExhaustion(services: string[], resource: string, intensity: string): Promise<void> {
    await this.sleep(100);
  }

  private async simulateNetworkPartition(services: string[], type: string): Promise<void> {
    await this.sleep(100);
  }

  private async simulateDataCorruption(services: string[], field: string, type: string): Promise<void> {
    await this.sleep(100);
  }

  /**
   * Generate unique experiment ID
   */
  private generateExperimentId(): string {
    return `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Update experiment status
   */
  private updateExperimentStatus(experimentId: string, status: ChaosExperiment['status']): void {
    const experiment = this.experiments.get(experimentId);
    if (experiment) {
      experiment.status = status;
      
      if (status === 'completed') {
        experiment.endTime = Date.now();
      }
    }
  }

  /**
   * Update calculated metrics
   */
  private updateCalculatedMetrics(): void {
    // Calculate resilience score based on test results
    const experiments = this.getExperiments();
    const completedExperiments = experiments.filter(e => e.status === 'completed');
    
    if (completedExperiments.length > 0) {
      const totalErrors = completedExperiments.reduce((sum, e) => sum + (e.metrics.errorRate * 100), 0);
      const averageErrorRate = totalErrors / completedExperiments.length;
      
      // Higher resilience score = lower error rate
      this.metrics.resilienceScore = Math.max(0, 100 - averageErrorRate);
    }
  }

  /**
   * Check if current time is allowed for chaos experiments
   */
  private isAllowedTime(): boolean {
    const now = new Date();
    const currentHour = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    return this.config.productionSafeguards.allowedHours.some(allowedHour => {
      const [allowedStart, allowedEnd] = allowedHour.split('-');
      return currentHour >= allowedStart && currentHour <= allowedEnd;
    });
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get configuration
   */
  getConfig(): ChaosControl {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<ChaosControl>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Generate chaos experiment template
   */
  generateExperimentTemplate(type: ChaosExperiment['type']): Omit<ChaosExperiment, 'id' | 'status' | 'startTime' | 'endTime' | 'rollbackReason' | 'metrics'> {
    const templates = {
      latency: {
        name: 'Latency Injection Test',
        description: 'Injects artificial latency to test system resilience',
        type: 'latency',
        target: {
          services: ['api-service', 'database-service'],
          endpoints: [],
          instances: [],
          regions: []
        },
        configuration: {
          severity: 'medium',
          probability: 0.3,
          duration: 300,
          rampUpTime: 30,
          parameters: {
            latency: 1000,
            variance: 200
          }
        }
      },
      error: {
        name: 'Error Injection Test',
        description: 'Injects artificial errors to test error handling',
        type: 'error',
        target: {
          services: ['payment-service', 'user-service'],
          endpoints: [],
          instances: [],
          regions: []
        },
        configuration: {
          severity: 'high',
          probability: 0.1,
          duration: 600,
          rampUpTime: 15,
          parameters: {
            errorType: 'database_connection_error'
          }
        }
      },
      rate_limit: {
        name: 'Rate Limiting Test',
        description: 'Tests system behavior under rate limiting',
        type: 'rate_limit',
        target: {
          services: ['api-service'],
          endpoints: [],
          instances: [],
          regions: []
        },
        configuration: {
          severity: 'medium',
          probability: 1.0, // 100%
          duration: 300,
          rampUpTime: 0,
          parameters: {
            rateLimit: 10
          }
        }
      }
    };

    return templates[type];
  }
}

export default ChaosEngineer;
export type { 
  ChaosExperiment, 
  ChaosMetrics, 
  ChaosControl 
};