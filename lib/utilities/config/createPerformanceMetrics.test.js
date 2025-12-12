const createPerformanceMetrics = require('./createPerformanceMetrics');

describe('createPerformanceMetrics', () => {
  it('should build config with defaults', () => {
    const config = createPerformanceMetrics();
    
    expect(config.enabled).toBe(true);
    expect(config.collection.interval).toBe(60000);
    expect(config.collection.retentionPeriod).toBe(24 * 60 * 60 * 1000);
    expect(config.collection.metrics).toEqual(['cpu', 'memory', 'responseTime', 'throughput']);
    expect(config.collection.samplingRate).toBe(1.0);
    expect(config.aggregation.method).toBe('average');
    expect(config.aggregation.windowSize).toBe(100);
    expect(config.storage.type).toBe('memory');
    expect(config.reporting.enabled).toBe(true);
    expect(config.reporting.destinations).toEqual(['console']);
  });

  it('should validate interval', () => {
    expect(() => createPerformanceMetrics({ interval: 0 })).toThrow('Metrics interval must be positive');
    expect(() => createPerformanceMetrics({ interval: -1000 })).toThrow('Metrics interval must be positive');
  });

  it('should validate sampling rate', () => {
    expect(() => createPerformanceMetrics({ samplingRate: -0.1 })).toThrow('Sampling rate must be between 0 and 1');
    expect(() => createPerformanceMetrics({ samplingRate: 1.5 })).toThrow('Sampling rate must be between 0 and 1');
  });

  it('should build config with custom values', () => {
    const config = createPerformanceMetrics({
      enabled: false,
      interval: 30000,
      retentionPeriod: 7 * 24 * 60 * 60 * 1000,
      metrics: ['cpu', 'memory'],
      alerts: { cpu: 80 },
      aggregation: 'median',
      samplingRate: 0.5,
      aggregationWindowSize: 200,
      storageType: 'file',
      storageLocation: '/var/metrics',
      compressionEnabled: true,
      reportingEnabled: false,
      reportingInterval: 10 * 60 * 1000,
      reportDestinations: ['file', 'console']
    });
    
    expect(config.enabled).toBe(false);
    expect(config.collection.interval).toBe(30000);
    expect(config.collection.retentionPeriod).toBe(7 * 24 * 60 * 60 * 1000);
    expect(config.collection.metrics).toEqual(['cpu', 'memory']);
    expect(config.collection.samplingRate).toBe(0.5);
    expect(config.aggregation.method).toBe('median');
    expect(config.aggregation.windowSize).toBe(200);
    expect(config.alerts).toEqual({ cpu: 80 });
    expect(config.storage.type).toBe('file');
    expect(config.storage.location).toBe('/var/metrics');
    expect(config.storage.compression).toBe(true);
    expect(config.reporting.enabled).toBe(false);
    expect(config.reporting.interval).toBe(10 * 60 * 1000);
    expect(config.reporting.destinations).toEqual(['file', 'console']);
  });

  it('should handle string metrics as array', () => {
    const config = createPerformanceMetrics({ metrics: 'cpu' });
    expect(config.collection.metrics).toEqual(['cpu']);
  });
});
