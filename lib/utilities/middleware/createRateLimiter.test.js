const createRateLimiter = require('./createRateLimiter');

const mockReq = (overrides = {}) => ({
  ip: '127.0.0.1',
  ...overrides
});

const mockRes = () => {
  const headers = {};
  const res = {
    statusCode: 200,
    setHeader: jest.fn((name, value) => { headers[name] = value; }),
    getHeader: (name) => headers[name],
    status: jest.fn(function(code) { this.statusCode = code; return this; }),
    json: jest.fn(function(body) { this.body = body; return this; }),
    once: jest.fn((event, cb) => { res._finishCallback = cb; }),
    triggerFinish: () => { if (res._finishCallback) res._finishCallback(); }
  };
  return res;
};

describe('createRateLimiter', () => {
  beforeEach(() => {
    createRateLimiter.resetDefaultStore();
  });

  afterAll(() => {
    createRateLimiter.resetDefaultStore();
  });

  it('should throw for invalid points', () => {
    expect(() => createRateLimiter({ points: 0 })).toThrow('points must be a positive integer');
    expect(() => createRateLimiter({ points: -1 })).toThrow('points must be a positive integer');
  });

  it('should throw for invalid durationMs', () => {
    expect(() => createRateLimiter({ durationMs: 0 })).toThrow('durationMs must be a positive integer');
  });

  it('should allow requests within limit', () => {
    const limiter = createRateLimiter({ points: 5, durationMs: 60000 });
    const req = mockReq();
    const res = mockRes();
    const next = jest.fn();

    limiter(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.getHeader('X-RateLimit-Limit')).toBe(5);
    expect(res.getHeader('X-RateLimit-Remaining')).toBe(4);
  });

  it('should block requests exceeding limit', () => {
    const limiter = createRateLimiter({ points: 2, durationMs: 60000 });
    const next = jest.fn();

    for (let i = 0; i < 2; i++) {
      limiter(mockReq(), mockRes(), jest.fn());
    }

    const req = mockReq();
    const res = mockRes();
    limiter(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: 'Too many requests',
      code: 'RATE_LIMIT_EXCEEDED'
    }));
    expect(res.getHeader('Retry-After')).toBeGreaterThan(0);
  });

  it('should track different IPs separately', () => {
    const limiter = createRateLimiter({ points: 2, durationMs: 60000 });

    limiter(mockReq({ ip: '1.1.1.1' }), mockRes(), jest.fn());
    limiter(mockReq({ ip: '1.1.1.1' }), mockRes(), jest.fn());

    const res1 = mockRes();
    limiter(mockReq({ ip: '1.1.1.1' }), res1, jest.fn());
    expect(res1.status).toHaveBeenCalledWith(429);

    const res2 = mockRes();
    const next2 = jest.fn();
    limiter(mockReq({ ip: '2.2.2.2' }), res2, next2);
    expect(next2).toHaveBeenCalled();
  });

  it('should call onLimitReached hook', () => {
    const onLimitReached = jest.fn();
    const limiter = createRateLimiter({ points: 1, durationMs: 60000, onLimitReached });

    limiter(mockReq(), mockRes(), jest.fn());

    const req = mockReq();
    limiter(req, mockRes(), jest.fn());

    expect(onLimitReached).toHaveBeenCalledWith(expect.objectContaining({
      req,
      key: expect.any(String),
      result: expect.objectContaining({ exceeded: true })
    }));
  });

  it('should support custom response', () => {
    const limiter = createRateLimiter({
      points: 1,
      durationMs: 60000,
      response: { error: 'Slow down!', customField: true }
    });

    limiter(mockReq(), mockRes(), jest.fn());

    const res = mockRes();
    limiter(mockReq(), res, jest.fn());

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: 'Slow down!',
      customField: true
    }));
  });

  it('should support custom key generator', () => {
    const keyGenerator = jest.fn((req) => `tenant:${req.tenantId}`);
    const limiter = createRateLimiter({ points: 2, durationMs: 60000, keyGenerator });

    const req1 = mockReq({ tenantId: 'A' });
    limiter(req1, mockRes(), jest.fn());

    expect(keyGenerator).toHaveBeenCalledWith(req1);
  });

  it('should skip counting successful requests when configured', () => {
    createRateLimiter.resetDefaultStore();
    const limiter = createRateLimiter({
      points: 2,
      durationMs: 60000,
      skipSuccessfulRequests: true
    });

    for (let i = 0; i < 5; i++) {
      const res = mockRes();
      res.statusCode = 200;
      const next = jest.fn();
      limiter(mockReq(), res, next);
      expect(next).toHaveBeenCalled();
      res.triggerFinish();
    }
  });

  it('should still enforce limit when skipSuccessfulRequests but failed requests count', () => {
    createRateLimiter.resetDefaultStore();
    const limiter = createRateLimiter({
      points: 2,
      durationMs: 60000,
      skipSuccessfulRequests: true
    });

    for (let i = 0; i < 2; i++) {
      const res = mockRes();
      res.statusCode = 500;
      limiter(mockReq(), res, jest.fn());
      res.triggerFinish();
    }

    const res = mockRes();
    const next = jest.fn();
    limiter(mockReq(), res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(429);
  });

  it('should skip counting failed requests when configured', () => {
    createRateLimiter.resetDefaultStore();
    const limiter = createRateLimiter({
      points: 2,
      durationMs: 60000,
      skipFailedRequests: true
    });

    for (let i = 0; i < 5; i++) {
      const res = mockRes();
      res.statusCode = 400;
      const next = jest.fn();
      limiter(mockReq(), res, next);
      expect(next).toHaveBeenCalled();
      res.triggerFinish();
    }
  });

  it('should still enforce limit when skipFailedRequests but successful requests count', () => {
    createRateLimiter.resetDefaultStore();
    const limiter = createRateLimiter({
      points: 2,
      durationMs: 60000,
      skipFailedRequests: true
    });

    for (let i = 0; i < 2; i++) {
      const res = mockRes();
      res.statusCode = 200;
      limiter(mockReq(), res, jest.fn());
      res.triggerFinish();
    }

    const res = mockRes();
    const next = jest.fn();
    limiter(mockReq(), res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(429);
  });

  it('should use different strategies', () => {
    createRateLimiter.resetDefaultStore();
    const limiter = createRateLimiter({
      points: 2,
      durationMs: 60000,
      strategy: 'user'
    });

    const req1 = mockReq({ user: { id: 'userA' } });
    const req2 = mockReq({ user: { id: 'userB' } });

    limiter(req1, mockRes(), jest.fn());
    limiter(req1, mockRes(), jest.fn());

    const res1 = mockRes();
    limiter(req1, res1, jest.fn());
    expect(res1.status).toHaveBeenCalledWith(429);

    const res2 = mockRes();
    const next2 = jest.fn();
    limiter(req2, res2, next2);
    expect(next2).toHaveBeenCalled();
  });
});
