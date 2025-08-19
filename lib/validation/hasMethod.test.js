// 🔗 Tests: hasMethod → object method validation → error handling
const hasMethod = require(`./hasMethod`);

describe(`hasMethod`, () => {
  test(`should return true for objects with the specified method`, () => {
    const obj = { testMethod: () => {} };
    expect(hasMethod(obj, `testMethod`)).toBe(true);
  });

  test(`should return false for objects without the specified method`, () => {
    const obj = { otherProperty: `value` };
    expect(hasMethod(obj, `testMethod`)).toBe(false);
  });

  test(`should return false for null objects`, () => {
    expect(hasMethod(null, `testMethod`)).toBe(false);
  });

  test(`should return false for undefined objects`, () => {
    expect(hasMethod(undefined, `testMethod`)).toBe(false);
  });

  test(`should handle property access errors gracefully`, () => {
    const obj = {};
    Object.defineProperty(obj, `problematic`, {
      get() { throw new Error(`Access denied`); }
    });
    expect(hasMethod(obj, `problematic`)).toBe(false);
  });
});