import { qerrors } from '@bijikyu/qerrors';

/**
 * API Key Validation Middleware Factory
 *
 * Creates Express-compatible middleware for validating API keys.
 * Uses constant-time comparison to prevent timing attacks and supports
 * configurable key sources and logging.
 *
 * @param {object} config - Validator configuration
 * @param {string|Function} config.apiKey - Expected API key or function returning it
 * @param {object} [config.extractOptions] - Options for extractApiKey
 * @param {Function} [config.onMissing] - Called when API key is missing
 * @param {Function} [config.onInvalid] - Called when API key is invalid
 * @param {Function} [config.onSuccess] - Called when validation succeeds
 * @param {object} [config.responses] - Custom response messages
 * @returns {Function} Express middleware function (req, res, next)
 */
import extractApiKey from '../security/extractApiKey.js';
import timingSafeCompare from '../security/timingSafeCompare.js';
import maskApiKey from '../security/maskApiKey.js';

interface Request {
  headers?: Record<string, string | string[] | undefined>;
  query?: Record<string, string | string[] | undefined>;
  body?: Record<string, unknown>;
  validatedApiKey?: string;
}

interface Response {
  status: (code: number) => Response;
  json: (data: object) => void;
}

interface NextFunction {
  (error?: any): void;
}

interface ApiKeyValidatorConfig {
  apiKey: string | ((req: Request) => string);
  extractOptions?: object;
  onMissing?: (data: { req: Request; res: Response; error?: any }) => void;
  onInvalid?: (data: { req: Request; res: Response; apiKey: string; maskedKey: string }) => void;
  onSuccess?: (data: any) => void;
  responses?: {
    missing?: any;
    invalid?: any;
  };
}

function createApiKeyValidator(config: ApiKeyValidatorConfig) {
  if (!config.apiKey) { // validate required configuration
    throw new Error('createApiKeyValidator requires an apiKey in config');
  }

  const {
    apiKey: expectedKeyOrFn,
    extractOptions = {},
    onMissing = null,
    onInvalid = null,
    onSuccess = null,
    responses = {}
  } = config;

  const defaultResponses = { // default error responses
    missing: {
      status: 401,
      body: {
        error: 'API key required',
        message: 'Please provide an API key in the request header or query parameter'
      }
    },
    invalid: {
      status: 403,
      body: {
        error: 'Invalid API key',
        message: 'The provided API key is not valid'
      }
    }
  };

  const missingResponse: any = { ...defaultResponses.missing, ...responses.missing }; // merge custom responses
  const invalidResponse: any = { ...defaultResponses.invalid, ...responses.invalid };

  return function apiKeyValidator(req: Request, res: Response, next: NextFunction) { // return middleware function
    let providedKey: string | null = null;

    try {
      providedKey = extractApiKey(req, extractOptions); // extract key from request
    } catch (error) {
      qerrors(error instanceof Error ? error : new Error(String(error)), 'createApiKeyValidator', 'API key extraction failed');
      // Handle extraction errors gracefully
      if (onMissing) {
        onMissing({ req, res, error });
      }
      return res.status(missingResponse.status).json(missingResponse.body);
    }

    if (!providedKey) { // handle missing key
      if (onMissing) {
        onMissing({ req, res }); // call logging hook
      }
      return res.status(missingResponse.status).json(missingResponse.body);
    }

    const expectedKey = typeof expectedKeyOrFn === 'function' // resolve expected key
      ? expectedKeyOrFn(req)
      : expectedKeyOrFn;

    let isValid: boolean = false;
    try {
      isValid = timingSafeCompare(providedKey, expectedKey); // constant-time comparison
    } catch (error) {
      qerrors(error instanceof Error ? error : new Error(String(error)), 'createApiKeyValidator', 'API key timing comparison failed');
      // Handle timingSafeCompare failure securely
      console.error('Security: timingSafeCompare failed in API key validation', {
        timestamp: new Date().toISOString(),
        context: 'api_key_validation_failure'
      });
      isValid = false;
    }

    if (!isValid) { // handle invalid key
      const maskedKey: string = maskApiKey(providedKey);
      if (onInvalid) {
        onInvalid({ req, res, apiKey: providedKey, maskedKey }); // call logging hook with masked key
      }
      return res.status(invalidResponse.status).json(invalidResponse.body);
    }

    req.validatedApiKey = providedKey; // attach validated key to request

    if (onSuccess) { // call success hook
      onSuccess({ req });
    }

    next(); // proceed to next middleware
  };
}

export default createApiKeyValidator;
