'use strict';

const analyzePerformanceMetrics = require('./analyzePerformanceMetrics');

describe('analyzePerformanceMetrics', () => {
  it('should throw for invalid metrics', () => {
    expect(() => analyzePerformanceMetrics(null)).toThrow('Metrics must be an object');
    expect(() => analyzePerformanceMetrics('string')).toThrow('Metrics must be an object');
  });

  it('should return empty array for healthy metrics', () => {
    const metrics = {
      eventLoopLag: 5,
      cpuUsage: 30,
      heapUsedPercent: 40,
      responseTime: 100,
      throughput: 50
    };

    const alerts = analyzePerformanceMetrics(metrics, {}, 10);
    expect(alerts).toEqual([]);
  });

  it('should generate critical alert for high event loop lag', () => {
    const metrics = { eventLoopLag: 50 };
    const alerts = analyzePerformanceMetrics(metrics);

    expect(alerts).toHaveLength(1);
    expect(alerts[0].type).toBe('event_loop');
    expect(alerts[0].severity).toBe('critical');
  });

  it('should generate critical alert for high CPU usage', () => {
    const metrics = { cpuUsage: 95 };
    const alerts = analyzePerformanceMetrics(metrics);

    expect(alerts).toHaveLength(1);
    expect(alerts[0].type).toBe('cpu');
    expect(alerts[0].severity).toBe('critical');
  });

  it('should generate critical alert for high memory usage', () => {
    const metrics = { heapUsedPercent: 90 };
    const alerts = analyzePerformanceMetrics(metrics);

    expect(alerts).toHaveLength(1);
    expect(alerts[0].type).toBe('memory');
    expect(alerts[0].severity).toBe('critical');
  });

  it('should generate warning alert for high response time', () => {
    const metrics = { responseTime: 3000 };
    const alerts = analyzePerformanceMetrics(metrics);

    expect(alerts).toHaveLength(1);
    expect(alerts[0].type).toBe('response_time');
    expect(alerts[0].severity).toBe('warning');
  });

  it('should generate warning alert for low throughput', () => {
    const metrics = { throughput: 5 };
    const alerts = analyzePerformanceMetrics(metrics, {}, 10);

    expect(alerts).toHaveLength(1);
    expect(alerts[0].type).toBe('throughput');
    expect(alerts[0].severity).toBe('warning');
  });

  it('should not alert for low throughput when no requests', () => {
    const metrics = { throughput: 0 };
    const alerts = analyzePerformanceMetrics(metrics, {}, 0);

    expect(alerts).toEqual([]);
  });

  it('should use custom thresholds', () => {
    const metrics = { cpuUsage: 60 };
    const customThresholds = { maxCpuUsage: 50 };

    const alerts = analyzePerformanceMetrics(metrics, customThresholds);
    expect(alerts).toHaveLength(1);
    expect(alerts[0].type).toBe('cpu');
  });

  it('should include all required alert fields', () => {
    const metrics = { eventLoopLag: 50 };
    const alerts = analyzePerformanceMetrics(metrics);

    expect(alerts[0]).toHaveProperty('type');
    expect(alerts[0]).toHaveProperty('severity');
    expect(alerts[0]).toHaveProperty('message');
    expect(alerts[0]).toHaveProperty('value');
    expect(alerts[0]).toHaveProperty('threshold');
    expect(alerts[0]).toHaveProperty('timestamp');
  });
});
