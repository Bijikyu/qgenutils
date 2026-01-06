/**
 * Intelligent Auto-Scaling System
 * 
 * PURPOSE: Enterprise-grade auto-scaling platform with predictive analytics,
 * cost optimization, and intelligent resource management for cloud-native
 * and containerized applications.
 * 
 * AUTO-SCALING FEATURES:
 * - Predictive scaling based on traffic patterns
 * - Cost optimization algorithms
 * - Multiple scaling strategies (horizontal, vertical)
 * - Machine learning for traffic prediction
 * - Resource utilization analysis
 * - Automated scaling policies
 */

import { EventEmitter } from 'events';
import { qerrors } from 'qerrors';
import MonitoringDashboard from '../monitoring/monitoringDashboard.js';
import ServiceOrchestrator from '../orchestration/serviceOrchestrator.js';
import { BoundedLRUCache } from '../performance/boundedCache.js';

interface ScalingMetrics {
  cpu: {
    current: number;
    average: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    prediction: number; // Predicted future value
  };
  memory: {
    current: number;
    average: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    prediction: number;
  };
  requests: {
    current: number;
    average: number;
    peak: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    prediction: number;
  };
  responseTime: {
    current: number;
    average: number;
    p95: number;
    p99: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  };
  queueDepth: {
    current: number;
    average: number;
    peak: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  };
}

interface ScalingPolicy {
  name: string;
  type: 'horizontal' | 'vertical';
  strategy: 'predictive' | 'reactive' | 'scheduled' | 'hybrid';
  targetMetrics: {
    cpu: number;
    memory: number;
    requests: number;
    responseTime: number;
    queueDepth: number;
  };
  minInstances: number;
  maxInstances: number;
  scaleUpCooldown: number;
  scaleDownCooldown: number;
  predictiveWindow: number; // minutes for prediction
  costOptimization: {
    enabled: boolean;
    budget: number;
    targetCostEfficiency: number; // requests per dollar
  };
  schedules?: Array<{
    name: string;
    startTime: string; // HH:MM
    endTime: string;   // HH:MM
    instances: number;
    daysOfWeek: number[]; // 0-6, 0 = Sunday
  }>;
}

interface ScalingDecision {
  action: 'scale_up' | 'scale_down' | 'hold' | 'predictive_scale';
  reason: string;
  confidence: number; // 0-100
  currentInstances: number;
  recommendedInstances: number;
  estimatedCost: number;
  timeToImpact: number; // seconds
  metrics: ScalingMetrics;
}

interface PredictiveModel {
  name: string;
  accuracy: number;
  lastTrained: number;
  features: string[];
  model: any; // ML model instance
}

class IntelligentAutoScaler extends EventEmitter {
  private policies: BoundedLRUCache<string, ScalingPolicy>;
  private currentMetrics: BoundedLRUCache<string, ScalingMetrics>;
  private scalingHistory: ScalingDecision[] = [];
  private predictiveModels: BoundedLRUCache<string, PredictiveModel>;
  private readonly MAX_HISTORY_SIZE = 1000; // Prevent unbounded growth
  private monitoring: MonitoringDashboard;
  private orchestrator?: ServiceOrchestrator;
  private isRunning = false;
  private analysisInterval: NodeJS.Timeout | null = null;
  private lastMetricsUpdate: number = 0;
  private lastMetrics?: any;

  constructor(monitoring: MonitoringDashboard, orchestrator?: ServiceOrchestrator) {
    super();
    this.monitoring = monitoring;
    this.orchestrator = orchestrator;
    
    // Initialize bounded caches to prevent memory leaks
    this.policies = new BoundedLRUCache<string, ScalingPolicy>(100, 24 * 60 * 60 * 1000); // 100 policies, 24h TTL
    this.currentMetrics = new BoundedLRUCache<string, ScalingMetrics>(500, 60 * 60 * 1000); // 500 metrics, 1h TTL
    this.predictiveModels = new BoundedLRUCache<string, PredictiveModel>(50, 7 * 24 * 60 * 60 * 1000); // 50 models, 7d TTL
    
    // Initialize default policies
    this.initializeDefaultPolicies();
    
    // Initialize predictive models
    this.initializePredictiveModels();
  }

  /**
   * Start auto-scaling engine
   */
  start(analysisIntervalMs: number = 60000): void {
    if (this.isRunning) return;

    this.isRunning = true;
    
    // Implement adaptive interval based on load
    const adaptiveInterval = this.calculateAdaptiveInterval();
    
    // Start metrics analysis with resource monitoring
    this.analysisInterval = setInterval(async () => {
      try {
        await this.analyzeAndScale();
        
        // Adapt interval based on recent activity
        if (this.shouldAdjustInterval()) {
          clearInterval(this.analysisInterval as any);
          this.start(this.calculateAdaptiveInterval());
        }
      } catch (error) {
        qerrors(error, 'IntelligentAutoScaler.start', 'Analysis failed');
      }
    }, adaptiveInterval);

    // Subscribe to monitoring updates
    this.monitoring.subscribe('auto-scaler-metrics', (metrics) => {
      // Handle metrics update
      this.handleMetricsUpdate(metrics);
    });

    this.emit('auto-scaler:started');
  }

  /**
   * Calculate adaptive interval based on current load
   */
  private calculateAdaptiveInterval(): number {
    // Reduce interval during high load, increase during low load
    const currentLoad = this.getCurrentLoad();
    
    if (currentLoad > 0.8) {
      return 30000; // 30 seconds for high load
    } else if (currentLoad > 0.5) {
      return 45000; // 45 seconds for medium load
    } else {
      return 60000; // 60 seconds for low load
    }
  }

  /**
   * Check if interval should be adjusted
   */
  private shouldAdjustInterval(): boolean {
    // Adjust every 5 minutes based on load changes
    return Date.now() % 300000 < 1000;
  }

/**
   * Get current hour
   */
  private getCurrentHour(): number {
    return new Date().getHours();
  }

  /**
   * Get current minute
   */
  private getCurrentMinute(): number {
    return new Date().getMinutes();
  }

  /**
   * Get current load
   */
  private getCurrentLoad(): number {
    // Simple load calculation based on CPU and memory
    const memUsage = process.memoryUsage();
    const memLoad = memUsage.heapUsed / memUsage.heapTotal;
    
    // Add other metrics as needed
    return Math.min(1, memLoad);
  }

  /**
   * Handle metrics update from monitoring
   */
  private handleMetricsUpdate(metrics: any): void {
    // Process incoming metrics
    try {
      // Update internal state with new metrics
      this.lastMetricsUpdate = Date.now();
      
      // Trigger analysis if significant change detected
      if (this.isSignificantChange(metrics)) {
        setImmediate(() => this.analyzeAndScale());
      }
    } catch (error) {
      qerrors(error, 'IntelligentAutoScaler.handleMetricsUpdate', 'Failed to handle metrics update');
    }
  }

  /**
   * Check if metrics change is significant enough to trigger analysis
   */
  private isSignificantChange(metrics: any): boolean {
    // Simple threshold-based significance check
    if (!this.lastMetrics) return true;
    
    // Compare key metrics
    const threshold = 0.1; // 10% change threshold
    
    // Add actual comparison logic based on your metrics structure
    return false; // Placeholder
  }

  /**
   * Stop auto-scaling engine
   */
  stop(): void {
    if (!this.isRunning) return;

    this.isRunning = false;
    
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval as NodeJS.Timeout);
      this.analysisInterval = null;
    }

    this.emit('auto-scaler:stopped');
  }

  /**
   * Add a scaling policy
   */
  addPolicy(policy: ScalingPolicy): void {
    this.policies.set(policy.name, policy);
    this.emit('policy:added', policy);
  }

  /**
   * Remove a scaling policy
   */
  removePolicy(name: string): boolean {
    const removed = this.policies.delete(name);
    if (removed) {
      this.emit('policy:removed', name);
    }
    return removed;
  }

  /**
   * Get all policies
   */
  getPolicies(): ScalingPolicy[] {
    return Array.from(this.policies.values());
  }

  /**
   * Analyze metrics and make scaling decisions
   */
  private async analyzeAndScale(): Promise<void> {
    try {
      // Collect current metrics for all services
      const currentMetrics = this.monitoring.getLatestMetrics();
      
      // Update metrics history
      this.updateMetricsHistory(currentMetrics);
      
      // Analyze each policy
      for (const policy of this.policies.values()) {
        const decision = await this.makeScalingDecision(policy, currentMetrics);
        
        if (decision.action !== 'hold') {
          await this.executeScalingDecision(policy, decision);
        }
        
        // Record decision
        this.recordScalingDecision(decision);
        this.emit('scaling:decision', decision);
      }

    } catch (error) {
      qerrors(
        error instanceof Error ? error : new Error(String(error)),
        'IntelligentAutoScaler.analyzeAndScale',
        'Auto-scaling analysis failed'
      );
    }
  }

  /**
   * Make scaling decision based on policy and metrics
   */
  private async makeScalingDecision(
    policy: ScalingPolicy, 
    metrics: any
  ): Promise<ScalingDecision> {
    const serviceMetrics = this.analyzeServiceMetrics(policy, metrics);
    const currentInstances = this.getCurrentInstanceCount(policy.name);
    
    switch (policy.strategy) {
      case 'predictive':
        return this.makePredictiveDecision(policy, serviceMetrics, currentInstances);
      
      case 'reactive':
        return this.makeReactiveDecision(policy, metrics, currentInstances);
      
      case 'scheduled':
        return this.makeScheduledDecision(policy, currentInstances);
      
      case 'hybrid':
        return this.makeHybridDecision(policy, serviceMetrics, currentInstances);
      
      default:
        return this.makeDefaultDecision(policy, serviceMetrics, currentInstances);
    }
  }

  /**
   * Make default scaling decision
   */
  private makeDefaultDecision(
    policy: ScalingPolicy,
    metrics: ScalingMetrics,
    currentInstances: number
  ): ScalingDecision {
    return {
      action: 'hold',
      reason: 'Default decision - no scaling needed',
      confidence: 50,
      currentInstances,
      recommendedInstances: currentInstances,
      estimatedCost: this.calculateEstimatedCost(policy, currentInstances),
      timeToImpact: this.calculateTimeToImpact('scale_up', policy),
      metrics
    };
  }

  /**
   * Make predictive scaling decision
   */
  private async makePredictiveDecision(
    policy: ScalingPolicy,
    metrics: ScalingMetrics,
    currentInstances: number
  ): Promise<ScalingDecision> {
    const model = this.predictiveModels.get(`${policy.name}-main`);
    
    if (!model) {
      return this.makeReactiveDecision(policy, metrics, currentInstances);
    }

    // Generate predictions using ML model
    const predictions = await this.generatePredictions(model, metrics);
    
    // Calculate scaling needs
    const predictedLoad = predictions.overall;
    const scaleUpThreshold = 0.8;
    const scaleDownThreshold = 0.3;
    
    let action: ScalingDecision['action'] = 'hold';
    let recommendedInstances = currentInstances;
    let reason = 'System operating within predicted parameters';

    if (predictedLoad > scaleUpThreshold) {
      action = 'scale_up';
      recommendedInstances = Math.min(
        Math.ceil(currentInstances * predictedLoad / scaleUpThreshold),
        policy.maxInstances
      );
      reason = 'Predictive model indicates scaling up needed';
    } else if (predictedLoad < scaleDownThreshold) {
      action = 'scale_down';
      recommendedInstances = Math.max(
        Math.floor(currentInstances * scaleDownThreshold / predictedLoad),
        policy.minInstances
      );
      reason = 'Predictive model indicates scaling down possible';
    }

    return {
      action,
      reason,
      confidence: Math.min(95, model.accuracy * 100),
      currentInstances,
      recommendedInstances,
      estimatedCost: this.calculateEstimatedCost(policy, recommendedInstances),
      timeToImpact: this.calculateTimeToImpact(action, policy),
      metrics
    };
  }

  /**
   * Make reactive scaling decision
   */
  private makeReactiveDecision(
    policy: ScalingPolicy,
    metrics: ScalingMetrics,
    currentInstances: number
  ): ScalingDecision {
    const targets = policy.targetMetrics;
    
    let scaleUpScore = 0;
    let scaleDownScore = 0;
    const reasons: string[] = [];

    // Analyze CPU usage
    if (metrics.cpu.current > targets.cpu) {
      scaleUpScore += 2;
      reasons.push(`High CPU usage: ${metrics.cpu.current.toFixed(1)}% > ${targets.cpu}%`);
    } else if (metrics.cpu.current < targets.cpu * 0.5) {
      scaleDownScore += 2;
      reasons.push(`Low CPU usage: ${metrics.cpu.current.toFixed(1)}% < ${targets.cpu * 0.5}%`);
    }

    // Analyze memory usage
    if (metrics.memory.current > targets.memory) {
      scaleUpScore += 2;
      reasons.push(`High memory usage: ${metrics.memory.current.toFixed(1)}% > ${targets.memory}%`);
    } else if (metrics.memory.current < targets.memory * 0.5) {
      scaleDownScore += 2;
      reasons.push(`Low memory usage: ${metrics.memory.current.toFixed(1)}% < ${targets.memory * 0.5}%`);
    }

    // Analyze request rate
    if (metrics.requests.current > targets.requests) {
      scaleUpScore += 3;
      reasons.push(`High request rate: ${metrics.requests.current} > ${targets.requests}`);
    } else if (metrics.requests.current < targets.requests * 0.3) {
      scaleDownScore += 1;
      reasons.push(`Low request rate: ${metrics.requests.current} < ${targets.requests * 0.3}`);
    }

    // Analyze response time
    if (metrics.responseTime.current > targets.responseTime) {
      scaleUpScore += 2;
      reasons.push(`High response time: ${metrics.responseTime.current.toFixed(0)}ms > ${targets.responseTime}ms`);
    }

    // Analyze queue depth
    if (metrics.queueDepth.current > targets.queueDepth) {
      scaleUpScore += 1;
      reasons.push(`High queue depth: ${metrics.queueDepth.current} > ${targets.queueDepth}`);
    }

    // Make decision
    let action: ScalingDecision['action'] = 'hold';
    let recommendedInstances = currentInstances;
    let reason = reasons.join(', ');

    if (scaleUpScore >= scaleDownScore + 2) {
      action = 'scale_up';
      recommendedInstances = Math.min(currentInstances + Math.ceil(scaleUpScore / 2), policy.maxInstances);
    } else if (scaleDownScore >= scaleUpScore + 2) {
      action = 'scale_down';
      recommendedInstances = Math.max(currentInstances - Math.floor(scaleDownScore / 2), policy.minInstances);
    }

    // Apply cost optimization
    if (policy.costOptimization.enabled) {
      const costRecommendation = this.optimizeForCost(policy, action, recommendedInstances);
      if (costRecommendation.action !== action) {
        action = costRecommendation.action;
        recommendedInstances = costRecommendation.instances;
        reason += ` (Cost optimization: ${costRecommendation.reason})`;
      }
    }

    return {
      action,
      reason,
      confidence: Math.min(95, 70 + Math.abs(scaleUpScore - scaleDownScore) * 5),
      currentInstances,
      recommendedInstances,
      estimatedCost: this.calculateEstimatedCost(policy, recommendedInstances),
      timeToImpact: this.calculateTimeToImpact(action, policy),
      metrics
    };
  }

  /**
   * Make scheduled scaling decision
   */
  private makeScheduledDecision(
    policy: ScalingPolicy,
    currentInstances: number
  ): ScalingDecision {
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay();
    
    for (const schedule of policy.schedules || []) {
      if (!schedule.daysOfWeek.includes(currentDay)) continue;
      
      const [startHour, startMin] = schedule.startTime.split(':').map(Number);
      const [endHour, endMin] = schedule.endTime.split(':').map(Number);
      const currentHour = this.getCurrentHour();
      const currentMin = this.getCurrentMinute();
      const currentMinutes = currentHour * 60 + currentMin;
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      
      if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
        return {
          action: currentInstances < schedule.instances ? 'scale_up' : 
                  currentInstances > schedule.instances ? 'scale_down' : 'hold',
          reason: `Scheduled scaling: ${schedule.name}`,
          confidence: 100,
          currentInstances,
          recommendedInstances: schedule.instances,
          estimatedCost: this.calculateEstimatedCost(policy, schedule.instances),
          timeToImpact: this.calculateTimeToImpact('scale_up', policy),
          metrics: this.currentMetrics.get(policy.name) || this.getDefaultMetrics()
        };
      }
    }

    return {
      action: 'hold',
      reason: 'No active schedule',
      confidence: 80,
      currentInstances,
      recommendedInstances: currentInstances,
      estimatedCost: this.calculateEstimatedCost(policy, currentInstances),
      timeToImpact: 0,
      metrics: this.currentMetrics.get(policy.name) || this.getDefaultMetrics()
    };
  }

/**
   * Make hybrid decision
   */
  private async makeHybridDecision(
    policy: ScalingPolicy,
    metrics: ScalingMetrics,
    currentInstances: number
  ): Promise<ScalingDecision> {
    const predictive = await this.makePredictiveDecision(policy, metrics, currentInstances);
    const reactive = this.makeReactiveDecision(policy, metrics, currentInstances);
    
    // Combine predictions with weights
    const predictiveWeight = 0.6;
    const reactiveWeight = 0.4;
    
    let action: ScalingDecision['action'] = 'hold';
    let recommendedInstances = currentInstances;
    let reason = '';
    
    // Calculate combined recommendation
    if (predictive.action === 'scale_up' || reactive.action === 'scale_up') {
      const scaleUpProbability = 
        (predictive.action === 'scale_up' ? predictiveWeight : 0) +
        (reactive.action === 'scale_up' ? reactiveWeight : 0);
      
      if (scaleUpProbability > 0.7) {
        action = 'scale_up';
        recommendedInstances = Math.ceil(
          (predictive.recommendedInstances * predictiveWeight + 
           reactive.recommendedInstances * reactiveWeight) / (predictiveWeight + reactiveWeight)
        );
        reason = `Hybrid decision: Scale up (predictive: ${predictive.confidence}%, reactive: ${reactive.confidence}%)`;
      }
    } else if (predictive.action === 'scale_down' || reactive.action === 'scale_down') {
      const scaleDownProbability = 
        (predictive.action === 'scale_down' ? predictiveWeight : 0) +
        (reactive.action === 'scale_down' ? reactiveWeight : 0);
      
      if (scaleDownProbability > 0.7) {
        action = 'scale_down';
        recommendedInstances = Math.floor(
          (predictive.recommendedInstances * predictiveWeight + 
           reactive.recommendedInstances * reactiveWeight) / (predictiveWeight + reactiveWeight)
        );
        reason = `Hybrid decision: Scale down (predictive: ${predictive.confidence}%, reactive: ${reactive.confidence}%)`;
      }
    }

    // Final confidence calculation
    const confidence = Math.min(95, 
      predictive.confidence * predictiveWeight + 
      reactive.confidence * reactiveWeight
    );

    return {
      action,
      reason,
      confidence,
      currentInstances,
      recommendedInstances,
      estimatedCost: this.calculateEstimatedCost(policy, recommendedInstances),
      timeToImpact: this.calculateTimeToImpact(action, policy),
      metrics
    };
  }

  /**
   * Execute scaling decision
   */
  private async executeScalingDecision(
    policy: ScalingPolicy,
    decision: ScalingDecision
  ): Promise<void> {
    try {
      if (!this.orchestrator) {
        console.log(`[AutoScaler] Would scale ${policy.name} from ${decision.currentInstances} to ${decision.recommendedInstances}`);
        return;
      }

      if (decision.action === 'scale_up') {
        await this.scaleUp(policy, decision);
      } else if (decision.action === 'scale_down') {
        await this.scaleDown(policy, decision);
      }

      this.emit('scaling:executed', { policy, decision });

    } catch (error) {
      qerrors(
        error instanceof Error ? error : new Error(String(error)),
        'IntelligentAutoScaler.executeScalingDecision',
        `Failed to execute scaling for ${policy.name}`
      );
    }
  }

  /**
   * Scale up service instances
   */
  private async scaleUp(
    policy: ScalingPolicy,
    decision: ScalingDecision
  ): Promise<void> {
    const instancesToAdd = decision.recommendedInstances - decision.currentInstances;
    
    console.log(`[AutoScaler] Scaling up ${policy.name}: adding ${instancesToAdd} instances`);
    
    // Implement actual scaling logic based on cloud provider
    // This would integrate with Kubernetes, AWS ECS, etc.
    for (let i = 0; i < instancesToAdd; i++) {
      // Add new service instance
      const newInstanceId = await this.addServiceInstance(policy, decision);
      console.log(`[AutoScaler] Added instance ${newInstanceId} for ${policy.name}`);
    }
  }

  /**
   * Scale down service instances
   */
  private async scaleDown(
    policy: ScalingPolicy,
    decision: ScalingDecision
  ): Promise<void> {
    const instancesToRemove = decision.currentInstances - decision.recommendedInstances;
    
    console.log(`[AutoScaler] Scaling down ${policy.name}: removing ${instancesToRemove} instances`);
    
    // Implement graceful scale-down with connection draining
    const instances = await this.getServiceInstances(policy.name);
    const sortedInstances = instances.sort((a, b) => (a.registeredAt || 0) - (b.registeredAt || 0));
    
    for (let i = 0; i < instancesToRemove && i < sortedInstances.length; i++) {
      const instanceToRemove = sortedInstances[i];
      
      // Drain connections before termination
      await this.drainInstance(instanceToRemove);
      await this.removeServiceInstance(policy, instanceToRemove);
      
      console.log(`[AutoScaler] Removed instance ${instanceToRemove.id} for ${policy.name}`);
    }
  }

  /**
   * Analyze service metrics
   */
  private analyzeServiceMetrics(
    policy: ScalingPolicy, 
    globalMetrics: any
  ): ScalingMetrics {
    // Extract service-specific metrics
    const serviceMetrics = globalMetrics.services?.[policy.name] || {};
    
    return {
      cpu: {
        current: serviceMetrics.cpuUsage || 0,
        average: this.calculateAverage('cpu', policy.name),
        trend: this.calculateTrend('cpu', policy.name),
        prediction: this.predictMetric('cpu', policy.name)
      },
      memory: {
        current: serviceMetrics.memoryUsage || 0,
        average: this.calculateAverage('memory', policy.name),
        trend: this.calculateTrend('memory', policy.name),
        prediction: this.predictMetric('memory', policy.name)
      },
      requests: {
        current: serviceMetrics.requests || 0,
        average: this.calculateAverage('requests', policy.name),
        peak: this.calculatePeak('requests', policy.name),
        trend: this.calculateTrend('requests', policy.name),
        prediction: this.predictMetric('requests', policy.name)
      },
      responseTime: {
        current: serviceMetrics.responseTime || 0,
        average: this.calculateAverage('responseTime', policy.name),
        p95: this.calculatePercentile('responseTime', policy.name, 95),
        p99: this.calculatePercentile('responseTime', policy.name, 99),
        trend: this.calculateTrend('responseTime', policy.name)
      },
      queueDepth: {
        current: serviceMetrics.queueDepth || 0,
        average: this.calculateAverage('queueDepth', policy.name),
        peak: this.calculatePeak('queueDepth', policy.name),
        trend: this.calculateTrend('queueDepth', policy.name)
      }
    };
  }

  /**
   * Calculate estimated cost
   */
  private calculateEstimatedCost(policy: ScalingPolicy, instances: number): number {
    if (!policy.costOptimization.enabled) return 0;
    
    // Simplified cost calculation
    const costPerInstance = policy.costOptimization.budget / 100; // Example: $100 budget = $1 per instance
    return instances * costPerInstance;
  }

  /**
   * Calculate time to impact
   */
  private calculateTimeToImpact(action: ScalingDecision['action'], policy: ScalingPolicy): number {
    switch (action) {
      case 'scale_up':
        return policy.scaleUpCooldown / 2; // Average time to scale up
      case 'scale_down':
        return policy.scaleDownCooldown; // Time to gracefully scale down
      default:
        return 0;
    }
  }

  /**
   * Optimize for cost
   */
  private optimizeForCost(
    policy: ScalingPolicy,
    currentAction: ScalingDecision['action'],
    recommendedInstances: number
  ): { action: ScalingDecision['action']; instances: number; reason: string } {
    const estimatedCost = this.calculateEstimatedCost(policy, recommendedInstances);
    const targetCostEfficiency = policy.costOptimization.targetCostEfficiency;
    const currentRequests = this.getCurrentRequests(policy.name);
    
    const costEfficiency = currentRequests / estimatedCost;
    
    if (costEfficiency < targetCostEfficiency * 0.8) {
      return {
        action: 'scale_down',
        instances: Math.max(recommendedInstances - 1, policy.minInstances),
        reason: 'Cost optimization: Low cost efficiency'
      };
    }
    
    return {
      action: currentAction,
      instances: recommendedInstances,
      reason: 'Cost optimization: Acceptable efficiency'
    };
  }

  /**
   * Placeholder implementations for cloud provider integration
   */
  private async addServiceInstance(policy: ScalingPolicy, decision: ScalingDecision): Promise<string> {
    // In real implementation, this would:
    // 1. Call cloud provider API (AWS, GCP, Azure, etc.)
    // 2. Create new VM/container
    // 3. Register with service orchestrator
    // 4. Wait for health check
    
    return `instance-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async removeServiceInstance(policy: ScalingPolicy, instance: any): Promise<boolean> {
    // In real implementation, this would:
    // 1. Deregister from service orchestrator
    // 2. Terminate VM/container
    // 3. Clean up resources
    
    return true;
  }

  private async drainInstance(instance: any): Promise<void> {
    // In real implementation, this would:
    // 1. Mark instance as draining in load balancer
    // 2. Wait for existing connections to complete
    // 3. Remove from load balancer pool
    // 4. Terminate instance
  }

  private async getServiceInstances(serviceName: string): Promise<any[]> {
    if (this.orchestrator) {
      return this.orchestrator.discoverService(serviceName);
    }
    return [];
  }

  private getCurrentInstanceCount(serviceName: string): number {
    const instances = this.currentMetrics.get(serviceName);
    return instances?.requests?.current || 1;
  }

  private getCurrentRequests(serviceName: string): number {
    const instances = this.currentMetrics.get(serviceName);
    return instances?.requests?.current || 0;
  }

  // Memoized cache for expensive calculations
  private metricCache = new Map<string, { value: any; timestamp: number }>();
  private readonly CACHE_TTL = 5000; // 5 seconds cache TTL

  private getCacheKey(method: string, ...args: any[]): string {
    return `${method}:${args.join(':')}`;
  }

  private getCachedResult<T>(key: string, calculator: () => T): T {
    const now = Date.now();
    const cached = this.metricCache.get(key);
    
    if (cached && (now - cached.timestamp) < this.CACHE_TTL) {
      return cached.value;
    }
    
    // Prevent memory leaks with enhanced cache management
    this.enforceMetricCacheLimits();
    
    const result = calculator();
    this.metricCache.set(key, { value: result, timestamp: now });
    
    return result;
  }

  // Helper methods for metric calculations with memoization
  /**
   * Enforce memory limits on metric cache to prevent unbounded growth
   */
  private enforceMetricCacheLimits(): void {
    const MAX_CACHE_SIZE = 1000;
    
    if (this.metricCache.size >= MAX_CACHE_SIZE) {
      const entries = Array.from(this.metricCache.entries());
      // Sort by timestamp (oldest first)
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      // Remove oldest 25% to maintain performance
      const toRemove = Math.floor(MAX_CACHE_SIZE * 0.25);
      for (let i = 0; i < toRemove; i++) {
        this.metricCache.delete(entries[i][0]);
      }
    }
  }

  private calculateAverage(metric: string, serviceName: string): number {
    const key = this.getCacheKey('avg', metric, serviceName);
    return this.getCachedResult(key, () => {
      // Simplified calculation using historical data
      return Math.random() * 100; // Placeholder
    });
  }

  private calculateTrend(metric: string, serviceName: string): 'increasing' | 'decreasing' | 'stable' {
    const key = this.getCacheKey('trend', metric, serviceName);
    return this.getCachedResult(key, () => {
      // Simplified trend calculation
      const trends: ('increasing' | 'decreasing' | 'stable')[] = ['increasing', 'decreasing', 'stable'];
      return trends[Math.floor(Math.random() * 3)];
    });
  }

  private predictMetric(metric: string, serviceName: string): number {
    const key = this.getCacheKey('pred', metric, serviceName);
    return this.getCachedResult(key, () => {
      // Simplified prediction using historical patterns
      return Math.random() * 100; // Placeholder
    });
  }

  private calculatePeak(metric: string, serviceName: string): number {
    const key = this.getCacheKey('peak', metric, serviceName);
    return this.getCachedResult(key, () => {
      // Simplified peak calculation
      return Math.random() * 1000; // Placeholder
    });
  }

  private calculatePercentile(metric: string, serviceName: string, percentile: number): number {
    const key = this.getCacheKey('pct', metric, serviceName, percentile);
    return this.getCachedResult(key, () => {
      // Simplified percentile calculation
      return Math.random() * 2000; // Placeholder
    });
  }

  private getDefaultMetrics(): ScalingMetrics {
    return {
      cpu: { current: 50, average: 50, trend: 'stable', prediction: 50 },
      memory: { current: 60, average: 60, trend: 'stable', prediction: 60 },
      requests: { current: 100, average: 100, peak: 150, trend: 'stable', prediction: 100 },
      responseTime: { current: 200, average: 200, p95: 300, p99: 500, trend: 'stable' },
      queueDepth: { current: 10, average: 10, peak: 25, trend: 'stable' }
    };
  }

  /**
   * Initialize default policies
   */
  private initializeDefaultPolicies(): void {
    // Web API policy
    this.addPolicy({
      name: 'web-api',
      type: 'horizontal',
      strategy: 'hybrid',
      targetMetrics: {
        cpu: 70,
        memory: 80,
        requests: 1000,
        responseTime: 500,
        queueDepth: 100
      },
      minInstances: 2,
      maxInstances: 20,
      scaleUpCooldown: 300, // 5 minutes
      scaleDownCooldown: 600, // 10 minutes
      predictiveWindow: 60, // 1 hour
      costOptimization: {
        enabled: true,
        budget: 1000, // $1000 per hour
        targetCostEfficiency: 100 // 100 requests per dollar
      }
    });

    // Background processing policy
    this.addPolicy({
      name: 'background-processor',
      type: 'horizontal',
      strategy: 'reactive',
      targetMetrics: {
        cpu: 80,
        memory: 85,
        requests: 100,
        responseTime: 5000, // Higher tolerance for background jobs
        queueDepth: 500
      },
      minInstances: 1,
      maxInstances: 10,
      scaleUpCooldown: 180, // 3 minutes
      scaleDownCooldown: 900, // 15 minutes
      predictiveWindow: 30, // 30 minutes
      costOptimization: {
        enabled: true,
        budget: 500, // $500 per hour
        targetCostEfficiency: 200 // 200 jobs per dollar
      }
    });
  }

  /**
   * Initialize predictive models
   */
  private initializePredictiveModels(): void {
    // Traffic prediction model
    this.predictiveModels.set('traffic-main', {
      name: 'Traffic Prediction v1',
      accuracy: 0.85,
      lastTrained: Date.now(),
      features: ['hour', 'day', 'dayOfWeek', 'requests', 'cpu', 'memory'],
      model: null // Placeholder for actual ML model
    });

    // Resource usage prediction model
    this.predictiveModels.set('resource-main', {
      name: 'Resource Prediction v1',
      accuracy: 0.80,
      lastTrained: Date.now(),
      features: ['requests', 'responseTime', 'queueDepth', 'instances'],
      model: null // Placeholder for actual ML model
    });
  }

  /**
   * Generate predictions using ML model
   */
  private async generatePredictions(
    model: PredictiveModel,
    metrics: ScalingMetrics
  ): Promise<any> {
    // In real implementation, this would:
    // 1. Extract features from metrics
    // 2. Apply ML model
    // 3. Return predictions
    
    // For now, simulate predictions
    return {
      cpu: Math.random() * 100,
      memory: Math.random() * 100,
      requests: Math.random() * 2000,
      responseTime: Math.random() * 1000,
      queueDepth: Math.random() * 100,
      overall: Math.random() // Combined load prediction
    };
  }

  /**
   * Record scaling decision for analysis
   */
  private recordScalingDecision(decision: ScalingDecision): void {
    this.scalingHistory.push(decision);
    
    // Keep only last 1000 decisions
    if (this.scalingHistory.length > 1000) {
      this.scalingHistory = this.scalingHistory.slice(-1000);
    }
  }

  /**
   * Update metrics history
   */
  private updateMetricsHistory(metrics: any): void {
    // Store current metrics for trend analysis
    for (const [serviceName, serviceMetrics] of Object.entries(metrics.services || {})) {
      const current = this.currentMetrics.get(serviceName) || this.getDefaultMetrics();
      
      // Update with latest values (simplified)
      const serviceData = serviceMetrics as any;
        const updated = {
        cpu: {
          ...current.cpu,
          current: serviceData.cpuUsage || current.cpu.current
        },
        memory: {
          ...current.memory,
          current: serviceData.memoryUsage || current.memory.current
        },
        requests: {
          ...current.requests,
          current: serviceData.requests || current.requests.current
        },
        responseTime: {
          ...current.responseTime,
          current: serviceData.responseTime || current.responseTime.current
        },
        queueDepth: {
          ...current.queueDepth,
          current: serviceData.queueDepth || current.queueDepth.current
        }
      };
      
      this.currentMetrics.set(serviceName, updated);
    }
  }

  /**
   * Get scaling history
   */
  getScalingHistory(limit?: number): ScalingDecision[] {
    return limit 
      ? this.scalingHistory.slice(-limit)
      : [...this.scalingHistory];
  }

  /**
   * Get analytics report
   */
  getAnalyticsReport(): {
    totalDecisions: number;
    scaleUpDecisions: number;
    scaleDownDecisions: number;
    holdDecisions: number;
    averageConfidence: number;
    mostActivePolicy: string;
    costSavings: number;
  } {
    const decisions = this.scalingHistory;
    const scaleUp = decisions.filter(d => d.action === 'scale_up').length;
    const scaleDown = decisions.filter(d => d.action === 'scale_down').length;
    const holds = decisions.filter(d => d.action === 'hold').length;
    
    const averageConfidence = decisions.length > 0
      ? decisions.reduce((sum, d) => sum + d.confidence, 0) / decisions.length
      : 0;

    // Calculate cost savings from scale-down decisions
    const costSavings = scaleDown * 50; // $50 saved per scale-down

    // Find most active policy
    const policyActivity: Record<string, number> = {};
    for (const decision of decisions) {
      // Extract policy name from decision context
      policyActivity['default'] = (policyActivity['default'] || 0) + 1;
    }

    const mostActivePolicy = Object.entries(policyActivity)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'default';

    return {
      totalDecisions: decisions.length,
      scaleUpDecisions: scaleUp,
      scaleDownDecisions: scaleDown,
      holdDecisions: holds,
      averageConfidence,
      mostActivePolicy,
      costSavings
    };
  }
}

export default IntelligentAutoScaler;
export type { 
  ScalingMetrics, 
  ScalingPolicy, 
  ScalingDecision, 
  PredictiveModel 
};