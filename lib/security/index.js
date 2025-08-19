// Security utilities index - exports all security functions
const sanitizeHtml = require('./sanitizeHtml');
const sanitizeSqlInput = require('./sanitizeSqlInput');
const validateInputRate = require('./validateInputRate');

module.exports = {
  sanitizeHtml,
  sanitizeSqlInput,
  validateInputRate
};