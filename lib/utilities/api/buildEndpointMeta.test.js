// 🔗 Tests: buildEndpointMeta.js → attachEndpointMeta.js
// Tests API endpoint metadata creation and attachment functionality

const buildEndpointMeta = require('./buildEndpointMeta');
const attachEndpointMeta = require('./attachEndpointMeta');

describe('buildEndpointMeta', () => {
  it('should build metadata with all options', () => {
    const meta = buildEndpointMeta({
      route: '/api/users',
      method: 'get',
      description: 'Get all users',
      requiredRole: 'admin',
      apiKeyRequired: true,
      collection: 'users',
      plan: 'pro'
    });

    expect(meta.route).toBe('/api/users');
    expect(meta.method).toBe('get');
    expect(meta.description).toBe('Get all users');
    expect(meta.requiredRole).toBe('admin');
    expect(meta.apiKeyRequired).toBe(true);
    expect(meta.collection).toBe('users');
    expect(meta.plan).toBe('pro');
  });

  it('should handle empty options', () => {
    const meta = buildEndpointMeta({});
    expect(meta.route).toBeUndefined();
    expect(meta.method).toBeUndefined();
  });

  it('should handle no options', () => {
    const meta = buildEndpointMeta();
    expect(meta).toBeDefined();
  });

  it('should include schema and exampleInput', () => {
    const schema = { type: 'object' };
    const exampleInput = { name: 'test' };
    
    const meta = buildEndpointMeta({ schema, exampleInput });
    
    expect(meta.schema).toBe(schema);
    expect(meta.exampleInput).toBe(exampleInput);
  });
});

describe('attachEndpointMeta', () => {
  it('should attach metadata to function', () => {
    const handler = () => {};
    attachEndpointMeta(handler, {
      route: '/api/test',
      method: 'post'
    });

    expect(handler.meta).toBeDefined();
    expect(handler.meta.route).toBe('/api/test');
    expect(handler.meta.method).toBe('post');
  });

  it('should not throw for non-function', () => {
    expect(() => attachEndpointMeta(null, {})).not.toThrow();
    expect(() => attachEndpointMeta('string', {})).not.toThrow();
  });
});
