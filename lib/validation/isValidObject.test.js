// 🔗 Tests: isValidObject → object validation → null/undefined/array checks
const isValidObject = require(`./isValidObject`);

describe(`isValidObject`, () => {
  test(`should return true for plain objects`, () => {
    expect(isValidObject({})).toBe(true);
    expect(isValidObject({ key: `value` })).toBe(true);
    expect(isValidObject({ nested: { object: true } })).toBe(true);
  });

  test(`should return false for null`, () => {
    expect(isValidObject(null)).toBe(false);
  });

  test(`should return false for undefined`, () => {
    expect(isValidObject(undefined)).toBe(false);
  });

  test(`should return false for arrays`, () => {
    expect(isValidObject([])).toBe(false);
    expect(isValidObject([1, 2, 3])).toBe(false);
  });

  test(`should return false for primitive values`, () => {
    expect(isValidObject(`string`)).toBe(false);
    expect(isValidObject(123)).toBe(false);
    expect(isValidObject(true)).toBe(false);
  });
});