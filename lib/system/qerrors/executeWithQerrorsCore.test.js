const executeWithQerrorsCore = require('./executeWithQerrorsCore');

describe('executeWithQerrorsCore', () => {
  it('should execute successful operation', async () => {
    const result = await executeWithQerrorsCore({
      opName: 'testOp',
      operation: async () => 'success',
      failureMessage: 'Failed'
    });
    expect(result).toBe('success');
  });

  it('should handle async operations', async () => {
    const result = await executeWithQerrorsCore({
      opName: 'asyncOp',
      operation: async () => {
        await new Promise(r => setTimeout(r, 10));
        return 'async result';
      },
      failureMessage: 'Failed'
    });
    expect(result).toBe('async result');
  });

  it('should accept context option', async () => {
    const result = await executeWithQerrorsCore({
      opName: 'testOp',
      operation: async () => 'result',
      failureMessage: 'Failed',
      context: { userId: '123' }
    });
    expect(result).toBe('result');
  });

  it('should accept hooks parameter', async () => {
    const result = await executeWithQerrorsCore({
      opName: 'testOp',
      operation: async () => 'result',
      failureMessage: 'Failed'
    }, {
      augmentContext: (error, ctx) => ctx
    });
    expect(result).toBe('result');
  });
});
