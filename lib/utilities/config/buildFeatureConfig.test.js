const buildFeatureConfig = require('./buildFeatureConfig');

describe('buildFeatureConfig', () => {
  it('should require name', () => {
    expect(() => buildFeatureConfig()).toThrow('Feature name is required');
    expect(() => buildFeatureConfig({})).toThrow('Feature name is required');
    expect(() => buildFeatureConfig({ name: '' })).toThrow('Feature name is required');
    expect(() => buildFeatureConfig({ name: 123 })).toThrow('Feature name is required');
  });

  it('should validate enabled is boolean', () => {
    expect(() => buildFeatureConfig({ name: 'test', enabled: 'yes' })).toThrow('enabled flag must be a boolean');
  });

  it('should validate dependencies is array', () => {
    expect(() => buildFeatureConfig({ name: 'test', dependencies: 'dep1' })).toThrow('dependencies must be an array');
  });

  it('should validate rollout percentage range', () => {
    expect(() => buildFeatureConfig({ name: 'test', rolloutPercentage: -1 })).toThrow('Rollout percentage');
    expect(() => buildFeatureConfig({ name: 'test', rolloutPercentage: 101 })).toThrow('Rollout percentage');
    expect(() => buildFeatureConfig({ name: 'test', rolloutPercentage: 'full' })).toThrow('Rollout percentage');
  });

  it('should build config with defaults', () => {
    const config = buildFeatureConfig({ name: 'my-feature' });
    
    expect(config.name).toBe('my-feature');
    expect(config.enabled).toBe(false);
    expect(config.version).toBe('1.0.0');
    expect(config.environment).toBe('development');
    expect(config.dependencies).toEqual([]);
    expect(config.metadata).toEqual({});
    expect(config.rolloutPercentage).toBe(100);
    expect(config.conditions).toEqual({});
    expect(config.createdAt).toBeDefined();
    expect(config.updatedAt).toBeDefined();
  });

  it('should build config with custom values', () => {
    const config = buildFeatureConfig({
      name: 'premium-feature',
      enabled: true,
      version: '2.0.0',
      environment: 'production',
      dependencies: ['auth', 'billing'],
      metadata: { tier: 'premium' },
      rolloutPercentage: 50,
      conditions: { region: 'US' }
    });
    
    expect(config.name).toBe('premium-feature');
    expect(config.enabled).toBe(true);
    expect(config.version).toBe('2.0.0');
    expect(config.environment).toBe('production');
    expect(config.dependencies).toEqual(['auth', 'billing']);
    expect(config.metadata).toEqual({ tier: 'premium' });
    expect(config.rolloutPercentage).toBe(50);
    expect(config.conditions).toEqual({ region: 'US' });
  });

  it('should trim feature name', () => {
    const config = buildFeatureConfig({ name: '  spaced-name  ' });
    expect(config.name).toBe('spaced-name');
  });

  it('should stringify dependencies', () => {
    const config = buildFeatureConfig({ name: 'test', dependencies: [1, 2, 3] });
    expect(config.dependencies).toEqual(['1', '2', '3']);
  });
});
