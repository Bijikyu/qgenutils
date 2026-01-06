/**
 * SHARED UTILITIES TESTS
 * 
 * PURPOSE: Tests all shared utility modules to ensure functionality
 * is preserved and works correctly after refactoring.
 */

import {
  TypeValidators,
  ErrorHandlers,
  InputSanitizers,
  FieldValidators,
  LoggingUtils,
  quickLogger,
  sanitizeString,
  isNonEmptyString,
  createFieldValidator,
  successResponse,
  errorResponse
} from '../lib/utilities/shared/index.js';

describe('Shared Utilities', () => {
  
  describe('TypeValidators', () => {
    describe('isNonEmptyString', () => {
      it('should validate non-empty strings correctly', () => {
        expect(TypeValidators.isNonEmptyString('hello')).toBe(true);
        expect(TypeValidators.isNonEmptyString('  hello  ')).toBe(true);
        expect(TypeValidators.isNonEmptyString('')).toBe(false);
        expect(TypeValidators.isNonEmptyString(null)).toBe(false);
        expect(TypeValidators.isNonEmptyString(undefined)).toBe(false);
        expect(TypeValidators.isNonEmptyString(123)).toBe(false);
      });

      it('should handle options correctly', () => {
        expect(TypeValidators.isNonEmptyString('  ', { trim: true })).toBe(false);
        expect(TypeValidators.isNonEmptyString('  ', { trim: false })).toBe(true);
        expect(TypeValidators.isNonEmptyString('hello', { allowWhitespace: true })).toBe(true);
      });
    });

    describe('isString', () => {
      it('should act as type guard', () => {
        expect(TypeValidators.isString('hello')).toBe(true);
        expect(TypeValidators.isString(123)).toBe(false);
        expect(TypeValidators.isString(null)).toBe(false);
        expect(TypeValidators.isString({})).toBe(false);
      });
    });

    describe('isEmailString', () => {
      it('should validate email strings', () => {
        expect(TypeValidators.isEmailString('test@example.com')).toBe(true);
        expect(TypeValidators.isEmailString('invalid-email')).toBe(false);
        expect(TypeValidators.isEmailString('')).toBe(false);
        expect(TypeValidators.isEmailString(null)).toBe(false);
      });
    });

    describe('isUrlString', () => {
      it('should validate URL strings', () => {
        expect(TypeValidators.isUrlString('https://example.com')).toBe(true);
        expect(TypeValidators.isUrlString('invalid-url')).toBe(false);
        expect(TypeValidators.isUrlString('')).toBe(false);
        expect(TypeValidators.isUrlString(null)).toBe(false);
      });
    });
  });

  describe('InputSanitizers', () => {
    describe('sanitizeString', () => {
      it('should sanitize strings correctly', () => {
        const result = InputSanitizers.sanitizeString('  Hello World  ', {
          trim: true,
          maxLength: 20
        });
        
        expect(result.value).toBe('Hello World');
        expect(result.wasModified).toBe(true);
        expect(result.isValid).toBe(true);
        expect(result.originalValue).toBe('  Hello World  ');
      });

      it('should handle invalid input', () => {
        const result = InputSanitizers.sanitizeString(123);
        
        expect(result.value).toBe('');
        expect(result.isValid).toBe(false);
        expect(result.warnings).toContain('Invalid input type: expected string');
      });
    });

    describe('quickSanitize', () => {
      it('should perform quick sanitization', () => {
        expect(quickSanitize('  hello@world.com  ')).toBe('hello@world.com');
        expect(quickSanitize(123)).toBe('');
        expect(quickSanitize(null)).toBe('');
        expect(quickSanitize('  test  ', true)).toBe('test');
      });
    });

    describe('sanitizeEmail', () => {
      it('should sanitize email addresses', () => {
        expect(InputSanitizers.sanitizeEmail('  TEST@EXAMPLE.COM  ')).toBe('test@example.com');
        expect(InputSanitizers.sanitizeEmail('invalid-email')).toBe('');
        expect(InputSanitizers.sanitizeEmail(123)).toBe('');
      });
    });
  });

  describe('FieldValidators', () => {
    describe('createFieldValidator', () => {
      it('should create a functional field validator', () => {
        const validator = createFieldValidator([
          { validate: (v) => TypeValidators.isNonEmptyString(v), message: 'Required', code: 'REQUIRED' },
          { validate: (v) => v.length >= 2, message: 'Too short', code: 'MIN_LENGTH' }
        ], { fieldName: 'name' });

        const validResult = validator('John');
        const invalidResult = validator('');

        expect(validResult.isValid).toBe(true);
        expect(validResult.value).toBe('John');
        expect(validResult.errors).toHaveLength(0);

        expect(invalidResult.isValid).toBe(false);
        expect(invalidResult.errors).toHaveLength(1);
        expect(invalidResult.errors[0].code).toBe('REQUIRED');
      });
    });

    describe('CommonValidationRules', () => {
      it('should provide common validation rules', () => {
        const requiredRule = FieldValidators.CommonValidationRules.required('name');
        expect(requiredRule.validate('')).toBe(false);
        expect(requiredRule.validate('John')).toBe(true);

        const emailRule = FieldValidators.CommonValidationRules.email('email');
        expect(emailRule.validate('test@example.com')).toBe(true);
        expect(emailRule.validate('invalid-email')).toBe(false);
      });
    });

    describe('quickFieldValidator', () => {
      it('should create quick validators', () => {
        const emailValidator = FieldValidators.quickFieldValidator('email', {
          required: true,
          maxLength: 100
        });

        const result = emailValidator('test@example.com');
        expect(result.isValid).toBe(true);
        expect(result.value).toBe('test@example.com');
      });
    });
  });

  describe('ErrorHandlers', () => {
    describe('handleError', () => {
      it('should handle errors consistently', () => {
        const errorInfo = ErrorHandlers.handleError(new Error('Test error'), {
          functionName: 'testFunction',
          context: 'testing'
        });

        expect(errorInfo.message).toBe('Test error');
        expect(errorInfo.functionName).toBe('testFunction');
        expect(errorInfo.context).toBe('testing');
        expect(errorInfo.timestamp).toBeInstanceOf(Date);
      });
    });

    describe('safeExecute', () => {
      it('should execute functions safely', () => {
        const successResult = ErrorHandlers.safeExecute(() => 'success', {
          functionName: 'testFunction'
        });

        expect(successResult.success).toBe(true);
        expect(successResult.data).toBe('success');

        const errorResult = ErrorHandlers.safeExecute(() => {
          throw new Error('Test error');
        }, { functionName: 'testFunction' });

        expect(errorResult.success).toBe(false);
        expect(errorResult.error.message).toBe('Test error');
      });
    });
  });

  describe('LoggingUtils', () => {
    describe('quickLogger', () => {
      it('should create a functional quick logger', () => {
        const log = quickLogger('testFunction');
        
        // These should not throw errors
        expect(() => log.start('input')).not.toThrow();
        expect(() => log.info('test message')).not.toThrow();
        expect(() => log.debug('debug message')).not.toThrow();
        expect(() => log.warn('warning message')).not.toThrow();
        expect(() => log.error(new Error('test error'))).not.toThrow();
        expect(() => log.end('result')).not.toThrow();
      });
    });

    describe('withLogging', () => {
      it('should wrap functions with logging', () => {
        const loggedFunction = LoggingUtils.withLogging(
          (input) => input.toUpperCase(),
          { functionName: 'toUpperCase', logStart: true, logEnd: true }
        );

        const result = loggedFunction('hello');
        expect(result).toBe('HELLO');
      });
    });
  });

  describe('HTTP Response Utilities', () => {
    // Mock Express Response object
    const mockResponse = () => {
      const res = {};
      res.status = jest.fn().mockReturnValue(res);
      res.json = jest.fn().mockReturnValue(res);
      return res;
    };

    describe('successResponse', () => {
      it('should create success responses', () => {
        const res = mockResponse();
        successResponse(res, 200, { data: 'test' });

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          data: { data: 'test' },
          meta: {
            timestamp: expect.any(String)
          }
        });
      });
    });

    describe('errorResponse', () => {
      it('should create error responses', () => {
        const res = mockResponse();
        errorResponse(res, 400, 'Bad request');

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          error: {
            type: 'BAD_REQUEST',
            message: 'Bad request',
            timestamp: expect.any(String)
          },
          meta: {
            timestamp: expect.any(String)
          }
        });
      });
    });
  });

  describe('Integration Tests', () => {
    it('should work together in a realistic scenario', () => {
      // Create a field validator using shared utilities
      const userValidator = FieldValidators.createFieldValidator([
        FieldValidators.CommonValidationRules.required('name'),
        FieldValidators.CommonValidationRules.minLength(2, 'name'),
        FieldValidators.CommonValidationRules.maxLength(50, 'name'),
        FieldValidators.CommonValidationRules.email('email')
      ], { fieldName: 'user' });

      // Test valid input
      const validInput = 'john@example.com';
      const validResult = userValidator(validInput);

      expect(validResult.isValid).toBe(true);
      expect(validResult.value).toBe(validInput);
      expect(validResult.errors).toHaveLength(0);

      // Test invalid input
      const invalidInput = 'invalid';
      const invalidResult = userValidator(invalidInput);

      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors.length).toBeGreaterThan(0);
      expect(invalidResult.errors.some(e => e.code === 'INVALID_EMAIL')).toBe(true);

      // Test with sanitization
      const messyInput = '  JOHN@EXAMPLE.COM  ';
      const sanitizedResult = userValidator(messyInput);

      expect(sanitizedResult.isValid).toBe(true);
      expect(sanitizedResult.value).toBe('JOHN@EXAMPLE.COM'); // Sanitized by validator
    });

    it('should handle error scenarios gracefully', () => {
      const errorFunction = LoggingUtils.withLogging(() => {
        throw new Error('Test error');
      }, { functionName: 'errorTest' });

      expect(() => errorFunction()).toThrow('Test error');
    });
  });
});