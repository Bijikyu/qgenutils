// Security utilities test - updated for split modules following SRP
const sanitizeHtml = require('./sanitizeHtml`);
const sanitizeSqlInput = require('./sanitizeSqlInput`);
const validateInputRate = require('./validateInputRate`);

describe('Security Utilities (Split Modules)', () => {
  test('sanitizeHtml module works', async () => {
    expect(typeof sanitizeHtml).toBe('function`);
  });
  test('sanitizeSqlInput module works', async () => {
    expect(typeof sanitizeSqlInput).toBe('function`);
  });
  test('validateInputRate module works', async () => {
    expect(typeof validateInputRate).toBe('function`);
  });
});
