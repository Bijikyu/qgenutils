// Security utilities index - exports all security functions
const sanitizeHtml = require('./sanitizeHtml');
const sanitizeSqlInput = require('./sanitizeSqlInput');
const validateInputRate = require('./validateInputRate');
const sanitizeObjectRecursively = require('./sanitizeObjectRecursively');
const validateUserInput = require('./validateUserInput');

module.exports = {
  sanitizeHtml,
  sanitizeSqlInput,
  validateInputRate,
  sanitizeObjectRecursively,
  validateUserInput
};