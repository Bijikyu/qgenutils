// 🔗 Tests: deepClone.js → JSON.parse/stringify for object cloning
// Tests deep object cloning with reference isolation

const deepClone = require('./deepClone');

describe('deepClone', () => {
  it('should clone primitives', () => {
    expect(deepClone(42)).toBe(42);
    expect(deepClone('string')).toBe('string');
    expect(deepClone(null)).toBe(null);
  });

  it('should clone objects', () => {
    const original = { a: 1, b: { c: 2 } };
    const cloned = deepClone(original);
    
    expect(cloned).toEqual(original);
    expect(cloned).not.toBe(original);
    expect(cloned.b).not.toBe(original.b);
  });

  it('should clone arrays', () => {
    const original = [1, [2, 3], { a: 4 }];
    const cloned = deepClone(original);
    
    expect(cloned).toEqual(original);
    expect(cloned).not.toBe(original);
    expect(cloned[1]).not.toBe(original[1]);
    expect(cloned[2]).not.toBe(original[2]);
  });

  it('should clone dates', () => {
    const original = new Date('2024-01-15');
    const cloned = deepClone(original);
    
    expect(cloned).toEqual(original);
    expect(cloned).not.toBe(original);
  });

  it('should handle nested structures', () => {
    const original = { arr: [{ deep: { value: 1 } }] };
    const cloned = deepClone(original);
    
    cloned.arr[0].deep.value = 2;
    expect(original.arr[0].deep.value).toBe(1);
  });
});
