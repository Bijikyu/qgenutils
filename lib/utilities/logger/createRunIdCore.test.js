const createRunIdCore = require('./createRunIdCore');

describe('createRunIdCore', () => {
  it('should create run ID with prefix and executionId', () => {
    const id = createRunIdCore('checkout', 'exec123');
    expect(id).toBe('checkout-exec123');
  });

  it('should create run ID with prefix only (fallback)', () => {
    const id = createRunIdCore('checkout');
    expect(id).toMatch(/^checkout-\d+-[a-f0-9]+$/);
  });

  it('should use timestamp provider for deterministic testing', () => {
    const id = createRunIdCore('test', undefined, () => 1234567890);
    expect(id).toBe('test-1234567890');
  });

  it('should replace spaces in prefix with underscores', () => {
    const id = createRunIdCore('my operation', 'exec1');
    expect(id).toBe('my_operation-exec1');
  });

  it('should use default prefix for empty string', () => {
    const id = createRunIdCore('', 'exec1');
    expect(id).toBe('run-exec1');
  });

  it('should use default prefix for null', () => {
    const id = createRunIdCore(null, 'exec1');
    expect(id).toBe('run-exec1');
  });

  it('should generate unique IDs without executionId', () => {
    const id1 = createRunIdCore('test');
    const id2 = createRunIdCore('test');
    expect(id1).not.toBe(id2);
  });

  it('should trim whitespace from prefix', () => {
    const id = createRunIdCore('  padded  ', 'exec1');
    expect(id).toBe('padded-exec1');
  });

  it('should include secure random bytes in fallback', () => {
    const id = createRunIdCore('test');
    const parts = id.split('-');
    expect(parts.length).toBe(3);
    expect(parts[2]).toMatch(/^[a-f0-9]{8}$/);
  });
});
