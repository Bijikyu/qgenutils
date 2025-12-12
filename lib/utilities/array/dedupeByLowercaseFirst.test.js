const dedupeByLowercaseFirst = require('./dedupeByLowercaseFirst');

describe('dedupeByLowercaseFirst', () => {
  it('should deduplicate by lowercase key preserving first occurrence', () => {
    const items = [
      { name: 'Alice', id: 1 },
      { name: 'ALICE', id: 2 },
      { name: 'alice', id: 3 },
      { name: 'Bob', id: 4 }
    ];
    const result = dedupeByLowercaseFirst(items, item => item.name);
    expect(result).toEqual([
      { name: 'Alice', id: 1 },
      { name: 'Bob', id: 4 }
    ]);
  });

  it('should preserve original casing from first occurrence', () => {
    const items = [
      { email: 'User@Example.COM' },
      { email: 'user@example.com' },
      { email: 'USER@EXAMPLE.COM' }
    ];
    const result = dedupeByLowercaseFirst(items, item => item.email);
    expect(result).toEqual([{ email: 'User@Example.COM' }]);
  });

  it('should handle empty array', () => {
    const result = dedupeByLowercaseFirst([], item => item.name);
    expect(result).toEqual([]);
  });

  it('should skip items with null keys', () => {
    const items = [
      { name: 'Alice' },
      { name: null },
      { name: 'Bob' }
    ];
    const result = dedupeByLowercaseFirst(items, item => item.name);
    expect(result).toEqual([{ name: 'Alice' }, { name: 'Bob' }]);
  });

  it('should skip items with undefined keys', () => {
    const items = [
      { name: 'Alice' },
      { value: 123 },
      { name: 'Bob' }
    ];
    const result = dedupeByLowercaseFirst(items, item => item.name);
    expect(result).toEqual([{ name: 'Alice' }, { name: 'Bob' }]);
  });

  it('should skip items with empty string keys', () => {
    const items = [
      { name: 'Alice' },
      { name: '' },
      { name: 'Bob' }
    ];
    const result = dedupeByLowercaseFirst(items, item => item.name);
    expect(result).toEqual([{ name: 'Alice' }, { name: 'Bob' }]);
  });

  it('should skip items with whitespace-only keys', () => {
    const items = [
      { name: 'Alice' },
      { name: '   ' },
      { name: '\t\n' },
      { name: 'Bob' }
    ];
    const result = dedupeByLowercaseFirst(items, item => item.name);
    expect(result).toEqual([{ name: 'Alice' }, { name: 'Bob' }]);
  });

  it('should trim keys before comparison', () => {
    const items = [
      { name: '  Alice  ' },
      { name: 'alice' },
      { name: 'ALICE   ' }
    ];
    const result = dedupeByLowercaseFirst(items, item => item.name);
    expect(result).toEqual([{ name: '  Alice  ' }]);
  });

  it('should work with nested key extraction', () => {
    const items = [
      { user: { email: 'test@example.com' }, id: 1 },
      { user: { email: 'TEST@EXAMPLE.COM' }, id: 2 },
      { user: { email: 'other@example.com' }, id: 3 }
    ];
    const result = dedupeByLowercaseFirst(items, item => item.user.email);
    expect(result).toEqual([
      { user: { email: 'test@example.com' }, id: 1 },
      { user: { email: 'other@example.com' }, id: 3 }
    ]);
  });

  it('should return empty array for non-array input', () => {
    expect(dedupeByLowercaseFirst(null, x => x)).toEqual([]);
    expect(dedupeByLowercaseFirst(undefined, x => x)).toEqual([]);
    expect(dedupeByLowercaseFirst('string', x => x)).toEqual([]);
    expect(dedupeByLowercaseFirst({}, x => x)).toEqual([]);
  });

  it('should return empty array for non-function keyOf', () => {
    const items = [{ name: 'Alice' }];
    expect(dedupeByLowercaseFirst(items, null)).toEqual([]);
    expect(dedupeByLowercaseFirst(items, 'name')).toEqual([]);
    expect(dedupeByLowercaseFirst(items, undefined)).toEqual([]);
  });

  it('should work with simple string arrays using identity function', () => {
    const items = ['Apple', 'APPLE', 'apple', 'Banana', 'BANANA'];
    const result = dedupeByLowercaseFirst(items, x => x);
    expect(result).toEqual(['Apple', 'Banana']);
  });

  it('should maintain insertion order', () => {
    const items = [
      { name: 'Charlie' },
      { name: 'Alice' },
      { name: 'CHARLIE' },
      { name: 'Bob' },
      { name: 'ALICE' }
    ];
    const result = dedupeByLowercaseFirst(items, item => item.name);
    expect(result).toEqual([
      { name: 'Charlie' },
      { name: 'Alice' },
      { name: 'Bob' }
    ]);
  });
});
