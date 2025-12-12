const createApiKeyValidator = require('./createApiKeyValidator');

const mockReq = (overrides = {}) => ({
  headers: {},
  query: {},
  body: {},
  ip: '127.0.0.1',
  path: '/test',
  get: (header) => overrides.headers?.[header.toLowerCase()],
  ...overrides
});

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('createApiKeyValidator', () => {
  it('should throw if apiKey is not provided', () => {
    expect(() => createApiKeyValidator()).toThrow('createApiKeyValidator requires an apiKey');
    expect(() => createApiKeyValidator({})).toThrow('createApiKeyValidator requires an apiKey');
  });

  it('should pass valid API key', () => {
    const validator = createApiKeyValidator({ apiKey: 'secret123' });
    const req = mockReq({ headers: { 'x-api-key': 'secret123' } });
    const res = mockRes();
    const next = jest.fn();

    validator(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(req.validatedApiKey).toBe('secret123');
  });

  it('should reject missing API key with 401', () => {
    const validator = createApiKeyValidator({ apiKey: 'secret123' });
    const req = mockReq();
    const res = mockRes();
    const next = jest.fn();

    validator(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: 'API key required'
    }));
  });

  it('should reject invalid API key with 403', () => {
    const validator = createApiKeyValidator({ apiKey: 'secret123' });
    const req = mockReq({ headers: { 'x-api-key': 'wrong-key' } });
    const res = mockRes();
    const next = jest.fn();

    validator(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: 'Invalid API key'
    }));
  });

  it('should support API key as function', () => {
    const getApiKey = jest.fn().mockReturnValue('dynamic-key');
    const validator = createApiKeyValidator({ apiKey: getApiKey });
    const req = mockReq({ headers: { 'x-api-key': 'dynamic-key' } });
    const res = mockRes();
    const next = jest.fn();

    validator(req, res, next);

    expect(getApiKey).toHaveBeenCalledWith(req);
    expect(next).toHaveBeenCalled();
  });

  it('should call onMissing hook', () => {
    const onMissing = jest.fn();
    const validator = createApiKeyValidator({ apiKey: 'secret', onMissing });
    const req = mockReq();
    const res = mockRes();

    validator(req, res, jest.fn());

    expect(onMissing).toHaveBeenCalledWith({ req, maskedKey: null });
  });

  it('should call onInvalid hook with masked key', () => {
    const onInvalid = jest.fn();
    const validator = createApiKeyValidator({ apiKey: 'secret', onInvalid });
    const req = mockReq({ headers: { 'x-api-key': 'wrong-key-123' } });
    const res = mockRes();

    validator(req, res, jest.fn());

    expect(onInvalid).toHaveBeenCalledWith({
      req,
      maskedKey: 'wron***'
    });
  });

  it('should call onSuccess hook', () => {
    const onSuccess = jest.fn();
    const validator = createApiKeyValidator({ apiKey: 'secret', onSuccess });
    const req = mockReq({ headers: { 'x-api-key': 'secret' } });
    const res = mockRes();
    const next = jest.fn();

    validator(req, res, next);

    expect(onSuccess).toHaveBeenCalledWith({ req });
  });

  it('should support custom responses', () => {
    const validator = createApiKeyValidator({
      apiKey: 'secret',
      responses: {
        missing: { status: 400, body: { error: 'Custom missing' } },
        invalid: { status: 401, body: { error: 'Custom invalid' } }
      }
    });

    const reqMissing = mockReq();
    const resMissing = mockRes();
    validator(reqMissing, resMissing, jest.fn());
    expect(resMissing.status).toHaveBeenCalledWith(400);
    expect(resMissing.json).toHaveBeenCalledWith({ error: 'Custom missing' });

    const reqInvalid = mockReq({ headers: { 'x-api-key': 'wrong' } });
    const resInvalid = mockRes();
    validator(reqInvalid, resInvalid, jest.fn());
    expect(resInvalid.status).toHaveBeenCalledWith(401);
    expect(resInvalid.json).toHaveBeenCalledWith({ error: 'Custom invalid' });
  });

  it('should support Bearer token extraction', () => {
    const validator = createApiKeyValidator({ apiKey: 'bearer-token-value' });
    const req = mockReq({ headers: { authorization: 'Bearer bearer-token-value' } });
    const res = mockRes();
    const next = jest.fn();

    validator(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('should support custom extract options', () => {
    const validator = createApiKeyValidator({
      apiKey: 'custom-key',
      extractOptions: { headerNames: ['my-key'], queryParam: 'token' }
    });
    const req = mockReq({ headers: { 'my-key': 'custom-key' } });
    const res = mockRes();
    const next = jest.fn();

    validator(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
