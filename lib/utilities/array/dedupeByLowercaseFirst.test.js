const { default: dedupeByLowercaseFirst } = require('./dedupeByLowercaseFirst');

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
    expect(result).toEqual([
      { email: 'User@Example.COM' }
    ]);
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
    expect(result).toEqual([
      { name: 'Alice' },
      { name: 'Bob' }
    ]);
  });

  it('should skip items with undefined keys', () => {
    const items = [
      { name: 'Alice' },
      { value: 123 },
      { name: 'Bob' }
    ];
    const result = dedupeByLowercaseFirst(items, item => item.name);
    expect(result).toEqual([
      { name: 'Alice' },
      { name: 'Bob' }
    ]);
  });

  it('should skip items with empty string keys', () => {
    const items = [
      { name: 'Alice' },
      { name: '' },
      { name: 'Bob' }
    ];
    const result = dedupeByLowercaseFirst(items, item => item.name);
    expect(result).toEqual([
      { name: 'Alice' },
      { name: 'Bob' }
    ]);
  });

  it('should skip items with whitespace-only keys', () => {
    const items = [
      { name: 'Alice' },
      { name: '   ' },
      { name: '\t\n' },
      { name: 'Bob' }
    ];
    const result = dedupeByLowercaseFirst(items, item => item.name);
    expect(result).toEqual([
      { name: 'Alice' },
      { name: 'Bob' }
    ]);
  });

  it('should trim keys before comparison', () => {
    const items = [
      { name: '  Alice  ' },
      { name: 'alice' },
      { name: 'ALICE   ' }
    ];
    const result = dedupeByLowercaseFirst(items, item => item.name);
    expect(result).toEqual([
      { name: '  Alice  ' }
    ]);
  });

  it('should work with nested key extraction', () => {
    const items = [
      { user: { email: 'test@example.com' }, id: 1 },
      { user: { email: 'TEST@EXAMPLE.COM' }, id: 2 },
      { user: { email: 'test@example.com' }, id: 3 }
    ];
    const result = dedupeByLowercaseFirst(items, item => item.user.email);
    expect(result).toEqual([
      { user: { email: 'test@example.com' }, id: 1 }
    ]);
  });

  it('should handle edge cases with mixed data types', () => {
    const items = [
      { name: 123, id: 1 },
      { name: '123', id: 2 },
      { name: 456, id: 3 }
    ];
    const result = dedupeByLowercaseFirst(items, item => String(item.name));
    expect(result).toEqual([
      { name: 123, id: 1 },
      { name: 456, id: 3 }
    ]);
  });

  it('should handle duplicate objects by reference', () => {
    const obj1 = { key: 'value' };
    const items = [
      { data: obj1, id: 1 },
      { data: { key: 'value' }, id: 2 },
      { data: obj1, id: 3 }
    ];
    const result = dedupeByLowercaseFirst(items, item => JSON.stringify(item.data));
    expect(result).toEqual([
      { data: obj1, id: 1 }
    ]);
  });

  it('should not modify original array', () => {
    const originalItems = [
      { name: 'Alice', id: 1 },
      { name: 'ALICE', id: 2 }
    ];
    const itemsCopy = [...originalItems];
    dedupeByLowercaseFirst(itemsCopy, item => item.name);
    expect(originalItems).toEqual([
      { name: 'Alice', id: 1 },
      { name: 'ALICE', id: 2 }
    ]);
  });

  it('should handle special characters correctly', () => {
    const items = [
      { name: 'café', id: 1 },
      { name: 'CAFÉ', id: 2 },
      { name: 'naïve', id: 3 },
      { name: 'NAÏVE', id: 4 }
    ];
    const result = dedupeByLowercaseFirst(items, item => item.name);
    expect(result).toEqual([
      { name: 'café', id: 1 },
      { name: 'naïve', id: 3 }
    ]);
  });
});
