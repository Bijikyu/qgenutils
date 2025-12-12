const validateRequiredFieldsObj = require('./validateRequiredFieldsObj');

describe('validateRequiredFieldsObj', () => {
  it('should return isValid true and empty missingFields when all fields present', () => {
    const result = validateRequiredFieldsObj({ 
      obj: { name: 'John', email: 'john@test.com' }, 
      requiredFields: ['name', 'email'] 
    });
    expect(result).toEqual({ isValid: true, missingFields: [] });
  });

  it('should return isValid true for empty required fields array', () => {
    const result = validateRequiredFieldsObj({ obj: {}, requiredFields: [] });
    expect(result).toEqual({ isValid: true, missingFields: [] });
  });

  it('should return isValid false with missing field listed', () => {
    const result = validateRequiredFieldsObj({ 
      obj: { name: 'John' }, 
      requiredFields: ['name', 'email'] 
    });
    expect(result).toEqual({ isValid: false, missingFields: ['email'] });
  });

  it('should return isValid false when field is undefined', () => {
    const result = validateRequiredFieldsObj({ 
      obj: { name: 'John', email: undefined }, 
      requiredFields: ['name', 'email'] 
    });
    expect(result).toEqual({ isValid: false, missingFields: ['email'] });
  });

  it('should return isValid false when field is null', () => {
    const result = validateRequiredFieldsObj({ 
      obj: { name: 'John', email: null }, 
      requiredFields: ['name', 'email'] 
    });
    expect(result).toEqual({ isValid: false, missingFields: ['email'] });
  });

  it('should return isValid false when field is empty string', () => {
    const result = validateRequiredFieldsObj({ 
      obj: { name: 'John', email: '' }, 
      requiredFields: ['name', 'email'] 
    });
    expect(result).toEqual({ isValid: false, missingFields: ['email'] });
  });

  it('should list all missing fields', () => {
    const result = validateRequiredFieldsObj({ 
      obj: {}, 
      requiredFields: ['name', 'email', 'age'] 
    });
    expect(result).toEqual({ isValid: false, missingFields: ['name', 'email', 'age'] });
  });

  it('should return isValid false for non-object input', () => {
    const result = validateRequiredFieldsObj({ obj: null, requiredFields: ['name'] });
    expect(result.isValid).toBe(false);
    expect(result.missingFields).toContain('name');
  });

  it('should accept 0 as valid value', () => {
    const result = validateRequiredFieldsObj({ 
      obj: { count: 0 }, 
      requiredFields: ['count'] 
    });
    expect(result).toEqual({ isValid: true, missingFields: [] });
  });

  it('should accept false as valid value', () => {
    const result = validateRequiredFieldsObj({ 
      obj: { active: false }, 
      requiredFields: ['active'] 
    });
    expect(result).toEqual({ isValid: true, missingFields: [] });
  });
});
