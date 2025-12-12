/**
 * Build Validation Configuration
 * 
 * Creates a validation configuration for input sanitization and limits.
 * 
 * @param {object} [options] - Validation configuration options
 * @returns {object} Validated validation configuration
 */
function buildValidationConfig(options = {}) {
  const {
    strictMode = true,
    sanitizeHtml = true,
    sanitizeXss = true,
    maxFieldLength = 1000,
    allowedTags = [],
    allowedAttributes = {},
    customValidators = {},
    errorMessages = {},
    localization = 'en'
  } = options;

  if (maxFieldLength <= 0) { // validate limits
    throw new Error('Max field length must be positive');
  }

  return {
    strictMode: Boolean(strictMode),
    sanitization: {
      html: Boolean(sanitizeHtml),
      xss: Boolean(sanitizeXss),
      sqlInjection: options.sanitizeSqlInjection !== false,
      nosqlInjection: options.sanitizeNoSqlInjection || false
    },
    limits: {
      maxFieldLength: Number(maxFieldLength),
      maxFileSize: options.maxFileSize || 5 * 1024 * 1024,
      maxArrayLength: options.maxArrayLength || 1000,
      maxObjectDepth: options.maxObjectDepth || 10
    },
    allowedContent: {
      htmlTags: Array.isArray(allowedTags) ? [...allowedTags] : [],
      htmlAttributes: JSON.parse(JSON.stringify(allowedAttributes)),
      fileTypes: options.allowedFileTypes ? [...options.allowedFileTypes] : [],
      mimeTypes: options.allowedMimeTypes ? [...options.allowedMimeTypes] : []
    },
    customValidators: JSON.parse(JSON.stringify(customValidators)),
    errorMessages: JSON.parse(JSON.stringify(errorMessages)),
    localization: String(localization),
    dateFormat: options.dateFormat || 'YYYY-MM-DD',
    timezone: options.timezone || 'UTC'
  };
}

module.exports = buildValidationConfig;
