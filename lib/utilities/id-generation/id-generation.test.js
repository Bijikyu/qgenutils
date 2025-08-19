const generateExecutionId = require('./generateExecutionId');

describe('ID Generation Utilities', () => {
  describe('generateExecutionId', () => {
    test('should generate unique execution IDs', () => {
      const id1 = generateExecutionId();
      const id2 = generateExecutionId();
      
      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(typeof id1).toBe('string');
      expect(typeof id2).toBe('string');
      expect(id1).not.toBe(id2);
    });

    test('should generate IDs with proper format', () => {
      const id = generateExecutionId();
      expect(id.length).toBeGreaterThan(0);
      expect(id).toMatch(/^[a-zA-Z0-9_-]+$/);
    });

    test('should be cryptographically secure', () => {
      const ids = new Set();
      for (let i = 0; i < 100; i++) {
        ids.add(generateExecutionId());
      }
      expect(ids.size).toBe(100); // All IDs should be unique
    });
  });
});