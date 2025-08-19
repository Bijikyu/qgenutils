// 🔗 Tests: isValidString validation utility
const isValidString = require(`./isValidString`);

describe(`isValidString`, () => {
  test(`should return true for valid non-empty strings`, () => {
    expect(isValidString(`hello`)).toBe(true);
    expect(isValidString(`test string`)).toBe(true);
    expect(isValidString(`123`)).toBe(true);
  });

  test(`should return false for empty strings`, () => {
    expect(isValidString(``)).toBe(false);
  });

  test(`should return false for whitespace-only strings`, () => {
    expect(isValidString(`   `)).toBe(false);
    expect(isValidString(`\t\n`)).toBe(false);
  });

  test(`should return false for non-string values`, () => {
    expect(isValidString(null)).toBe(false);
    expect(isValidString(undefined)).toBe(false);
    expect(isValidString(123)).toBe(false);
    expect(isValidString({})).toBe(false);
    expect(isValidString([])).toBe(false);
  });
});