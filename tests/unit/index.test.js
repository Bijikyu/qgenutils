require('qtests/setup');

const utils = require('../../index');

describe('Index Module Exports', () => {
  test('should export all utility functions', () => {
    const expected = [
      'formatDateTime',
      'formatDuration',
      'calculateContentLength',
      'buildCleanHeaders',
      'sendJsonResponse',
      'getRequiredHeader',
      'ensureProtocol',
      'normalizeUrlOrigin',
      'stripProtocol',
      'parseUrlParts',
      'requireFields',
      'checkPassportAuth',
      'hasGithubStrategy',
      'renderView',
      'registerViewRoute'
    ];

    expected.forEach(name => {
      expect(typeof utils[name]).toBe('function');
    });
  });

  test('exported utilities should be callable', () => {
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis(), render: jest.fn(), send: jest.fn().mockReturnThis() };
    const req = { headers: {}, isAuthenticated: jest.fn().mockReturnValue(true) };

    expect(() => utils.formatDateTime(new Date().toISOString())).not.toThrow();
    expect(() => utils.formatDuration(new Date().toISOString(), new Date().toISOString())).not.toThrow();
    expect(() => utils.calculateContentLength('test')).not.toThrow();
    expect(() => utils.buildCleanHeaders({}, 'GET', null)).not.toThrow();
    expect(() => utils.sendJsonResponse(res, 200, { ok: true })).not.toThrow();
    expect(() => utils.getRequiredHeader({ headers: { authorization: 'a' } }, res, 'authorization', 401, 'err')).not.toThrow();
    expect(() => utils.ensureProtocol('example.com')).not.toThrow();
    expect(() => utils.normalizeUrlOrigin('example.com')).not.toThrow();
    expect(() => utils.stripProtocol('https://example.com')).not.toThrow();
    expect(() => utils.parseUrlParts('example.com/path')).not.toThrow();
    expect(() => utils.requireFields({ name: 'a' }, ['name'], res)).not.toThrow();
    expect(() => utils.checkPassportAuth(req)).not.toThrow();
    global.passport = { _strategies: {} };
    expect(() => utils.hasGithubStrategy()).not.toThrow();
    expect(() => utils.renderView(res, 'view', 'Error')).not.toThrow();
    global.app = { get: jest.fn() };
    expect(() => utils.registerViewRoute('/test', 'view', 'Error')).not.toThrow();
  });
});
