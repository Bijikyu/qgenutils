const validatePositiveAmount = require('./validatePositiveAmount');

describe('validatePositiveAmount', () => {
  let mockRes;

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  it('should validate positive integer amounts', () => {
    const result = validatePositiveAmount({ amount: 1000, res: mockRes });
    expect(result).toEqual({ ok: true, value: 1000 });
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  it('should truncate decimal amounts to integers when >= 1', () => {
    expect(validatePositiveAmount({ amount: 99.99, res: mockRes }))
      .toEqual({ ok: true, value: 99 });
    expect(validatePositiveAmount({ amount: 1.5, res: mockRes }))
      .toEqual({ ok: true, value: 1 });
    expect(validatePositiveAmount({ amount: 1.001, res: mockRes }))
      .toEqual({ ok: true, value: 1 });
  });

  it('should reject sub-cent amounts (< 1 after truncation)', () => {
    expect(validatePositiveAmount({ amount: 0.5, res: mockRes }))
      .toEqual({ ok: false });
    expect(mockRes.status).toHaveBeenCalledWith(400);
    
    mockRes.status.mockClear();
    mockRes.json.mockClear();
    
    expect(validatePositiveAmount({ amount: 0.99, res: mockRes }))
      .toEqual({ ok: false });
    expect(mockRes.status).toHaveBeenCalledWith(400);
    
    mockRes.status.mockClear();
    expect(validatePositiveAmount({ amount: '0.2', res: mockRes }))
      .toEqual({ ok: false });
  });

  it('should parse string amounts', () => {
    expect(validatePositiveAmount({ amount: '500', res: mockRes }))
      .toEqual({ ok: true, value: 500 });
  });

  it('should reject zero and send 400 response', () => {
    const result = validatePositiveAmount({ amount: 0, res: mockRes });
    expect(result).toEqual({ ok: false });
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Amount must be a positive number'
    });
  });

  it('should reject negative amounts', () => {
    const result = validatePositiveAmount({ amount: -50, res: mockRes });
    expect(result).toEqual({ ok: false });
    expect(mockRes.status).toHaveBeenCalledWith(400);
  });

  it('should use custom error message', () => {
    validatePositiveAmount({ 
      amount: 'invalid', 
      res: mockRes, 
      errorMessage: 'Invalid payment amount' 
    });
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Invalid payment amount'
    });
  });

  it('should handle null/undefined', () => {
    expect(validatePositiveAmount({ amount: null, res: mockRes }))
      .toEqual({ ok: false });
    expect(validatePositiveAmount({ amount: undefined, res: mockRes }))
      .toEqual({ ok: false });
  });

  it('should work without res object', () => {
    const result = validatePositiveAmount({ amount: -1 });
    expect(result).toEqual({ ok: false });
  });

  it('should reject sub-cent amounts without res object', () => {
    expect(validatePositiveAmount({ amount: 0.5 })).toEqual({ ok: false });
    expect(validatePositiveAmount({ amount: 0.99 })).toEqual({ ok: false });
    expect(validatePositiveAmount({ amount: '0.2' })).toEqual({ ok: false });
  });

  it('should accept minimum valid amount of 1', () => {
    expect(validatePositiveAmount({ amount: 1, res: mockRes }))
      .toEqual({ ok: true, value: 1 });
  });
});
