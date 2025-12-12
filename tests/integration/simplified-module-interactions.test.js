// Simplified integration tests focusing only on utility functions
const utils = require('../../index');
const { 
  formatDateTime, 
  formatDuration,
  addDays,
  ensureProtocol,
  normalizeUrlOrigin,
  generateExecutionId,
  groupBy,
  chunk,
  pick,
  omit,
  deepMerge
} = utils;

describe('Clean Module Integration Tests', () => { 
  describe('URL Processing Integration', () => { 
    test('should process URL with different protocols', () => {
      const url = 'api.example.com/users';
      
      const processedUrl = ensureProtocol(url);
      expect(processedUrl).toBe('https://api.example.com/users');
    });

    test('should normalize URLs consistently', () => {
      const url1 = 'HTTPS://API.Example.com/v1';
      const url3 = 'HTTP://api.example.com/v1';
      
      const normalized1 = normalizeUrlOrigin(url1);
      const normalized3 = normalizeUrlOrigin(url3);
      
      expect(normalized1).toBe('https://api.example.com');
      expect(normalized3).toBe('http://api.example.com');
    });
  });

  describe('DateTime Integration', () => {
    test('should integrate datetime formatting', () => {
      const testData = { 
        event: 'user-login',
        timestamp: '2023-12-25T10:00:00.000Z'
      };
      
      const formattedTime = formatDateTime(testData.timestamp);
      expect(formattedTime).toBe('12/25/2023, 10:00:00 AM');
      
      const processingId = generateExecutionId();
      expect(processingId).toMatch(/^[a-zA-Z0-9_-]+$/);
    });

    test('should calculate future dates', () => {
      const futureDate = addDays(30);
      expect(futureDate instanceof Date).toBe(true);
      expect(futureDate.getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe('ID Generation Integration', () => {
    test('should generate unique execution IDs', () => {
      const id1 = generateExecutionId();
      const id2 = generateExecutionId();
      
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^[a-zA-Z0-9_-]+$/);
      expect(id2).toMatch(/^[a-zA-Z0-9_-]+$/);
    });
  });

  describe('Collection Utilities Integration', () => {
    test('should group and chunk data', () => {
      const items = [
        { type: 'a', value: 1 },
        { type: 'b', value: 2 },
        { type: 'a', value: 3 }
      ];
      
      const grouped = groupBy(items, item => item.type);
      expect(grouped.a.length).toBe(2);
      expect(grouped.b.length).toBe(1);
      
      const chunked = chunk([1, 2, 3, 4, 5], 2);
      expect(chunked).toEqual([[1, 2], [3, 4], [5]]);
    });

    test('should pick and omit object keys', () => {
      const obj = { a: 1, b: 2, c: 3, d: 4 };
      
      const picked = pick(obj, ['a', 'c']);
      expect(picked).toEqual({ a: 1, c: 3 });
      
      const omitted = omit(obj, ['b', 'd']);
      expect(omitted).toEqual({ a: 1, c: 3 });
    });

    test('should deep merge objects', () => {
      const obj1 = { a: { b: 1 } };
      const obj2 = { a: { c: 2 } };
      
      const merged = deepMerge(obj1, obj2);
      expect(merged).toEqual({ a: { b: 1, c: 2 } });
    });
  });
});
