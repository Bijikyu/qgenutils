import { qerrors } from 'qerrors';
import { ValidationConfigOptions, ValidationConfig } from '../../../types/config-interfaces.js';

/**
 * Build Validation Configuration
 *
 * Creates a validation configuration for input sanitization and limits.
 *
 * @param {ValidationConfigOptions} [options] - Validation configuration options
 * @returns {ValidationConfig} Validated validation configuration
 */

function buildValidationConfig(options: ValidationConfigOptions = {}): ValidationConfig {
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
      htmlAttributes: (() => {
        try {
          return JSON.parse(JSON.stringify(allowedAttributes));
        } catch (err) {
          qerrors(err instanceof Error ? err : new Error(String(err)), 'buildValidationConfig', 'Allowed attributes serialization failed');
          return {};
        }
      })(),
      fileTypes: options.allowedFileTypes ? [...options.allowedFileTypes] : [],
      mimeTypes: options.allowedMimeTypes ? [...options.allowedMimeTypes] : []
    },
    customValidators: (() => {
      try {
        return JSON.parse(JSON.stringify(customValidators));
      } catch (err) {
        qerrors(err instanceof Error ? err : new Error(String(err)), 'buildValidationConfig', 'Custom validators serialization failed');
        return {};
      }
    })(),
    errorMessages: (() => {
      try {
        return JSON.parse(JSON.stringify(errorMessages));
      } catch (err) {
        qerrors(err instanceof Error ? err : new Error(String(err)), 'buildValidationConfig', 'Error messages serialization failed');
        return {};
      }
    })(),
    localization: String(localization),
    dateFormat: options.dateFormat || 'YYYY-MM-DD',
    timezone: options.timezone || 'UTC'
  };
}

export default buildValidationConfig;
