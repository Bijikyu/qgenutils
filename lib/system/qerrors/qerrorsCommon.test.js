const { formatErrorMessage, loadQerrors } = require('./qerrorsCommon');

describe('qerrorsCommon', () => {
  describe('formatErrorMessage', () => {
    it('should format Error instance', () => {
      const error = new Error('Test error');
      expect(formatErrorMessage(error)).toBe('Test error');
    });

    it('should format string error', () => {
      expect(formatErrorMessage('String error')).toBe('String error');
    });

    it('should format object as JSON', () => {
      const error = { code: 'ERR_001', message: 'Failed' };
      expect(formatErrorMessage(error)).toBe('{"code":"ERR_001","message":"Failed"}');
    });

    it('should handle circular references', () => {
      const error = {};
      error.self = error;
      expect(formatErrorMessage(error)).toBe('Unknown error');
    });

    it('should handle null', () => {
      expect(formatErrorMessage(null)).toBe('null');
    });
  });

  describe('loadQerrors', () => {
    it('should return qerrors module or null', async () => {
      const qerrors = await loadQerrors();
      expect(qerrors === null || typeof qerrors === 'object').toBe(true);
    });
  });
});
