const createRunId = require('./createRunId');

describe('createRunId', () => {
  it('should create run ID with prefix', () => {
    const id = createRunId('checkout');
    expect(id).toMatch(/^checkout_[a-zA-Z0-9_-]+$/);
  });

  it('should create unique IDs', () => {
    const id1 = createRunId('test');
    const id2 = createRunId('test');
    expect(id1).not.toBe(id2);
  });

  it('should replace spaces with underscores', () => {
    const id = createRunId('my operation');
    expect(id).toMatch(/^my_operation_/);
  });

  it('should use default prefix for empty string', () => {
    const id = createRunId('');
    expect(id).toMatch(/^run_/);
  });

  it('should use default prefix for null', () => {
    const id = createRunId(null);
    expect(id).toMatch(/^run_/);
  });

  it('should use default prefix for undefined', () => {
    const id = createRunId(undefined);
    expect(id).toMatch(/^run_/);
  });

  it('should trim whitespace from prefix', () => {
    const id = createRunId('  padded  ');
    expect(id).toMatch(/^padded_/);
  });
});
