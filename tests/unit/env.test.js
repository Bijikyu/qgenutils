// Unit tests for environment variable utilities. These tests ensure proper
// validation of environment variables with consistent error handling and
// fail-safe behavior when configuration is uncertain.
const { requireEnvVars, hasEnvVar, getEnvVar } = require('../../lib/env');

describe('Environment Variable Utilities', () => { // validates environment configuration
  let originalEnv;

  beforeEach(() => {
    // Save original environment and clear for testing
    originalEnv = { ...process.env };
    // Clear environment variables that might interfere with tests
    delete process.env.TEST_VAR;
    delete process.env.TEST_VAR_1;
    delete process.env.TEST_VAR_2;
    delete process.env.EMPTY_VAR;
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('requireEnvVars', () => { // validates presence of required environment variables
    
    // verifies should return empty array when all variables are present
    test('should return empty array when all variables are present', () => {
      process.env.TEST_VAR_1 = 'value1';
      process.env.TEST_VAR_2 = 'value2';
      
      const result = requireEnvVars(['TEST_VAR_1', 'TEST_VAR_2']);
      
      expect(result).toEqual([]); // all variables present
      expect(Array.isArray(result)).toBe(true); // returns array
    });

    // verifies should return array of missing variables
    test('should return array of missing variables', () => {
      process.env.TEST_VAR_1 = 'value1';
      // TEST_VAR_2 is intentionally missing
      
      const result = requireEnvVars(['TEST_VAR_1', 'TEST_VAR_2']);
      
      expect(result).toEqual(['TEST_VAR_2']); // only missing variable returned
      expect(result.length).toBe(1); // exactly one missing
    });

    // verifies should return all variables when none are present
    test('should return all variables when none are present', () => {
      const result = requireEnvVars(['TEST_VAR_1', 'TEST_VAR_2']);
      
      expect(result).toEqual(['TEST_VAR_1', 'TEST_VAR_2']); // all variables missing
      expect(result.length).toBe(2); // both missing
    });

    // verifies should treat empty string as missing
    test('should treat empty string as missing', () => {
      process.env.TEST_VAR_1 = 'value1';
      process.env.EMPTY_VAR = ''; // empty string should be treated as missing
      
      const result = requireEnvVars(['TEST_VAR_1', 'EMPTY_VAR']);
      
      expect(result).toEqual(['EMPTY_VAR']); // empty string considered missing
    });

    // verifies should treat whitespace-only string as missing
    test('should treat whitespace-only string as missing', () => {
      process.env.TEST_VAR_1 = 'value1';
      process.env.EMPTY_VAR = '   '; // whitespace-only should be treated as missing
      
      const result = requireEnvVars(['TEST_VAR_1', 'EMPTY_VAR']);
      
      expect(result).toEqual(['EMPTY_VAR']); // whitespace considered missing
    });

    // verifies should handle invalid input gracefully
    test('should handle invalid input gracefully', () => {
      const result1 = requireEnvVars(null);
      const result2 = requireEnvVars(undefined);
      const result3 = requireEnvVars('not-an-array');
      
      expect(result1).toEqual([]); // null input returns empty array
      expect(result2).toEqual([]); // undefined input returns empty array
      expect(result3).toEqual([]); // invalid input returns empty array
    });

    // verifies should handle invalid variable names
    test('should handle invalid variable names', () => {
      process.env.VALID_VAR = 'value';
      
      const result = requireEnvVars(['VALID_VAR', '', '   ', null, undefined]);
      
      // Invalid variable names should be considered missing
      const missing = result.filter(name => name !== 'VALID_VAR');
      expect(missing.length).toBe(4); // four invalid names
      expect(result).not.toContain('VALID_VAR'); // valid var should not be in missing list
    });

    // verifies should handle array with mixed valid and invalid names
    test('should handle array with mixed valid and invalid names', () => {
      process.env.TEST_VAR = 'value';
      
      const result = requireEnvVars(['TEST_VAR', '', 'MISSING_VAR']);
      
      expect(result).toContain(''); // empty string name considered missing
      expect(result).toContain('MISSING_VAR'); // missing variable
      expect(result).not.toContain('TEST_VAR'); // present variable not in missing list
    });
  });

  describe('hasEnvVar', () => { // checks single environment variable existence
    
    // verifies should return true when variable exists with value
    test('should return true when variable exists with value', () => {
      process.env.TEST_VAR = 'some-value';
      
      const result = hasEnvVar('TEST_VAR');
      
      expect(result).toBe(true); // variable exists
    });

    // verifies should return false when variable is missing
    test('should return false when variable is missing', () => {
      const result = hasEnvVar('MISSING_VAR');
      
      expect(result).toBe(false); // variable does not exist
    });

    // verifies should return false when variable is empty string
    test('should return false when variable is empty string', () => {
      process.env.EMPTY_VAR = '';
      
      const result = hasEnvVar('EMPTY_VAR');
      
      expect(result).toBe(false); // empty string considered missing
    });

    // verifies should return false when variable is whitespace only
    test('should return false when variable is whitespace only', () => {
      process.env.EMPTY_VAR = '   ';
      
      const result = hasEnvVar('EMPTY_VAR');
      
      expect(result).toBe(false); // whitespace considered missing
    });

    // verifies should handle invalid variable names
    test('should handle invalid variable names', () => {
      const result1 = hasEnvVar('');
      const result2 = hasEnvVar('   ');
      const result3 = hasEnvVar(null);
      const result4 = hasEnvVar(undefined);
      
      expect(result1).toBe(false); // empty name
      expect(result2).toBe(false); // whitespace name
      expect(result3).toBe(false); // null name
      expect(result4).toBe(false); // undefined name
    });

    // verifies should work with numeric and special character values
    test('should work with numeric and special character values', () => {
      process.env.NUMERIC_VAR = '123';
      process.env.SPECIAL_VAR = 'value!@#$%';
      process.env.ZERO_VAR = '0';
      
      expect(hasEnvVar('NUMERIC_VAR')).toBe(true); // numeric string value
      expect(hasEnvVar('SPECIAL_VAR')).toBe(true); // special characters
      expect(hasEnvVar('ZERO_VAR')).toBe(true); // zero is valid value
    });
  });

  describe('getEnvVar', () => { // gets environment variable with optional default
    
    // verifies should return actual value when variable exists
    test('should return actual value when variable exists', () => {
      process.env.TEST_VAR = 'environment-value';
      
      const result = getEnvVar('TEST_VAR', 'default-value');
      
      expect(result).toBe('environment-value'); // actual value returned
    });

    // verifies should return default when variable is missing
    test('should return default when variable is missing', () => {
      const result = getEnvVar('MISSING_VAR', 'default-value');
      
      expect(result).toBe('default-value'); // default returned
    });

    // verifies should return default when variable is empty string
    test('should return default when variable is empty string', () => {
      process.env.EMPTY_VAR = '';
      
      const result = getEnvVar('EMPTY_VAR', 'default-value');
      
      expect(result).toBe('default-value'); // default used for empty string
    });

    // verifies should return default when variable is whitespace only
    test('should return default when variable is whitespace only', () => {
      process.env.EMPTY_VAR = '   ';
      
      const result = getEnvVar('EMPTY_VAR', 'default-value');
      
      expect(result).toBe('default-value'); // default used for whitespace
    });

    // verifies should return undefined when no default provided and variable missing
    test('should return undefined when no default provided and variable missing', () => {
      const result = getEnvVar('MISSING_VAR');
      
      expect(result).toBeUndefined(); // undefined when no default
    });

    // verifies should work with different default value types
    test('should work with different default value types', () => {
      const stringDefault = getEnvVar('MISSING_VAR', 'string');
      const numberDefault = getEnvVar('MISSING_VAR', 42);
      const booleanDefault = getEnvVar('MISSING_VAR', true);
      const objectDefault = getEnvVar('MISSING_VAR', { key: 'value' });
      const arrayDefault = getEnvVar('MISSING_VAR', ['item1', 'item2']);
      
      expect(stringDefault).toBe('string'); // string default
      expect(numberDefault).toBe(42); // number default
      expect(booleanDefault).toBe(true); // boolean default
      expect(objectDefault).toEqual({ key: 'value' }); // object default
      expect(arrayDefault).toEqual(['item1', 'item2']); // array default
    });

    // verifies should handle invalid variable names gracefully
    test('should handle invalid variable names gracefully', () => {
      const result1 = getEnvVar('', 'default');
      const result2 = getEnvVar('   ', 'default');
      const result3 = getEnvVar(null, 'default');
      const result4 = getEnvVar(undefined, 'default');
      
      expect(result1).toBe('default'); // empty name uses default
      expect(result2).toBe('default'); // whitespace name uses default
      expect(result3).toBe('default'); // null name uses default
      expect(result4).toBe('default'); // undefined name uses default
    });

    // verifies should preserve actual environment variable values exactly
    test('should preserve actual environment variable values exactly', () => {
      process.env.JSON_VAR = '{"key": "value"}';
      process.env.NUMERIC_VAR = '123';
      process.env.BOOLEAN_VAR = 'true';
      process.env.SPECIAL_VAR = 'value with spaces and !@#$%';
      
      expect(getEnvVar('JSON_VAR')).toBe('{"key": "value"}'); // JSON string preserved
      expect(getEnvVar('NUMERIC_VAR')).toBe('123'); // numeric string preserved
      expect(getEnvVar('BOOLEAN_VAR')).toBe('true'); // boolean string preserved
      expect(getEnvVar('SPECIAL_VAR')).toBe('value with spaces and !@#$%'); // special chars preserved
    });
  });

  describe('Error Handling', () => { // validates error conditions and edge cases
    
    // verifies functions handle process.env access errors gracefully
    test('should handle process.env access errors gracefully', () => {
      // Mock process.env to throw an error
      const originalEnv = process.env;
      Object.defineProperty(global, 'process', {
        value: {
          ...process,
          env: new Proxy({}, {
            get() {
              throw new Error('Environment access error');
            }
          })
        },
        configurable: true
      });

      try {
        const result1 = requireEnvVars(['TEST_VAR']);
        const result2 = hasEnvVar('TEST_VAR');
        const result3 = getEnvVar('TEST_VAR', 'default');

        expect(Array.isArray(result1)).toBe(true); // should return array on error
        expect(result2).toBe(false); // should return false on error
        expect(result3).toBe('default'); // should return default on error
      } finally {
        // Restore original process.env
        Object.defineProperty(global, 'process', {
          value: {
            ...process,
            env: originalEnv
          },
          configurable: true
        });
      }
    });
  });

  describe('Integration Scenarios', () => { // tests realistic usage patterns
    
    // verifies startup validation scenario
    test('should support startup validation scenario', () => {
      process.env.DATABASE_URL = 'postgres://localhost/test';
      process.env.API_KEY = 'secret-key';
      // PORT is missing
      
      const missing = requireEnvVars(['DATABASE_URL', 'API_KEY', 'PORT']);
      
      expect(missing).toEqual(['PORT']); // only PORT is missing
      
      // Simulate startup validation
      if (missing.length > 0) {
        const errorMessage = `Missing environment variables: ${missing.join(', ')}`;
        expect(errorMessage).toBe('Missing environment variables: PORT');
      }
    });

    // verifies feature flag scenario  
    test('should support feature flag scenario', () => {
      process.env.FEATURE_ANALYTICS = 'enabled';
      // FEATURE_DEBUG is missing
      
      const hasAnalytics = hasEnvVar('FEATURE_ANALYTICS');
      const hasDebug = hasEnvVar('FEATURE_DEBUG');
      
      expect(hasAnalytics).toBe(true); // analytics enabled
      expect(hasDebug).toBe(false); // debug disabled
    });

    // verifies configuration with defaults scenario
    test('should support configuration with defaults scenario', () => {
      process.env.API_TIMEOUT = '5000';
      // PORT and LOG_LEVEL are missing
      
      const apiTimeout = getEnvVar('API_TIMEOUT', '3000');
      const port = getEnvVar('PORT', 3000);
      const logLevel = getEnvVar('LOG_LEVEL', 'info');
      
      expect(apiTimeout).toBe('5000'); // uses environment value
      expect(port).toBe(3000); // uses default number
      expect(logLevel).toBe('info'); // uses default string
    });
  });
});