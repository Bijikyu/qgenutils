const parsePositiveNumber = require('./parsePositiveNumber');

describe('parsePositiveNumber', () => {
  it('should parse positive numbers', () => {
    expect(parsePositiveNumber(42)).toEqual({ ok: true, value: 42 });
    expect(parsePositiveNumber(0.5)).toEqual({ ok: true, value: 0.5 });
    expect(parsePositiveNumber(1000000)).toEqual({ ok: true, value: 1000000 });
  });

  it('should parse positive number strings', () => {
    expect(parsePositiveNumber('42')).toEqual({ ok: true, value: 42 });
    expect(parsePositiveNumber('3.14')).toEqual({ ok: true, value: 3.14 });
    expect(parsePositiveNumber('0.01')).toEqual({ ok: true, value: 0.01 });
  });

  it('should reject zero', () => {
    expect(parsePositiveNumber(0)).toEqual({ ok: false });
    expect(parsePositiveNumber('0')).toEqual({ ok: false });
  });

  it('should reject negative numbers', () => {
    expect(parsePositiveNumber(-1)).toEqual({ ok: false });
    expect(parsePositiveNumber('-42')).toEqual({ ok: false });
  });

  it('should reject NaN', () => {
    expect(parsePositiveNumber(NaN)).toEqual({ ok: false });
    expect(parsePositiveNumber('not a number')).toEqual({ ok: false });
  });

  it('should reject Infinity', () => {
    expect(parsePositiveNumber(Infinity)).toEqual({ ok: false });
    expect(parsePositiveNumber(-Infinity)).toEqual({ ok: false });
  });

  it('should reject non-numeric types', () => {
    expect(parsePositiveNumber(null)).toEqual({ ok: false });
    expect(parsePositiveNumber(undefined)).toEqual({ ok: false });
    expect(parsePositiveNumber({})).toEqual({ ok: false });
    expect(parsePositiveNumber([])).toEqual({ ok: false });
    expect(parsePositiveNumber(true)).toEqual({ ok: false });
  });
});
