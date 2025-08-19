// Unit tests for real-time communication utilities. These tests ensure proper
// broadcast registry functionality, data validation, and graceful handling
// when real-time features are unavailable.
const createBroadcastRegistry = require('./createBroadcastRegistry`);

describe('Real-time Communication Utilities', () => { // validates real-time functionality

  describe('createBroadcastRegistry', () => { // factory for custom broadcast registries
    
    // verifies should create registry with specified functions
    test('should create registry with specified functions', () => {
      const config = {
        functions: ['broadcastNotification', 'broadcastUpdate']
      };
      
      const registry = createBroadcastRegistry(config);
      
      expect(typeof registry).toBe('object'); // returns object
      expect(registry.broadcastNotification).toBeNull(); // functions start as null
      expect(registry.broadcastUpdate).toBeNull(); // functions start as null
      expect(typeof registry.allFunctionsReady).toBe('function'); // utility methods available
      expect(typeof registry.getMissingFunctions).toBe('function'); // utility methods available
    });

    // verifies should handle invalid configuration gracefully
    test('should handle invalid configuration gracefully', () => {
      expect(() => createBroadcastRegistry(null)).toThrow('Configuration object required`);
      expect(() => createBroadcastRegistry({})).toThrow('Functions array required in configuration`);
      expect(() => createBroadcastRegistry({ functions: [] })).toThrow('Functions array required in configuration`);
      expect(() => createBroadcastRegistry({ functions: 'not-array' })).toThrow('Functions array required in configuration`);
    });

    // verifies should allow setting and getting broadcast functions
    test('should allow setting and getting broadcast functions', () => {
      const registry = createBroadcastRegistry({
        functions: ['testBroadcast']
      });
      
      const mockBroadcastFn = jest.fn();
      registry.testBroadcast = mockBroadcastFn;
      
      expect(registry.testBroadcast).toBe(mockBroadcastFn); // function properly set and retrieved
    });

    // verifies should reject non-function values
    test('should reject non-function values', () => {
      const registry = createBroadcastRegistry({
        functions: ['testBroadcast']
      });
      
      expect(() => {
        registry.testBroadcast = 'not-a-function';
      }).toThrow('Broadcast function testBroadcast must be a function or null`);
      
      expect(() => {
        registry.testBroadcast = 123;
      }).toThrow('Broadcast function testBroadcast must be a function or null`);
      
      expect(() => {
        registry.testBroadcast = {};
      }).toThrow('Broadcast function testBroadcast must be a function or null`);
    });

    // verifies should allow setting functions to null
    test('should allow setting functions to null', () => {
      const registry = createBroadcastRegistry({
        functions: ['testBroadcast']
      });
      
      const mockFn = jest.fn();
      registry.testBroadcast = mockFn;
      expect(registry.testBroadcast).toBe(mockFn);
      
      registry.testBroadcast = null;
      expect(registry.testBroadcast).toBeNull(); // can be reset to null
    });

    // verifies should track function readiness correctly
    test('should track function readiness correctly', () => {
      const registry = createBroadcastRegistry({
        functions: ['func1', 'func2', 'func3']
      });
      
      expect(registry.allFunctionsReady()).toBe(false); // no functions registered
      expect(registry.getMissingFunctions()).toEqual(['func1', 'func2', 'func3']); // all missing
      
      registry.func1 = jest.fn();
      expect(registry.allFunctionsReady()).toBe(false); // partial registration
      expect(registry.getMissingFunctions()).toEqual(['func2', 'func3']); // two missing
      
      registry.func2 = jest.fn();
      registry.func3 = jest.fn();
      expect(registry.allFunctionsReady()).toBe(true); // all registered
      expect(registry.getMissingFunctions()).toEqual([]); // none missing
    });

    // verifies should clear all functions
    test('should clear all functions', () => {
      const registry = createBroadcastRegistry({
        functions: ['func1', 'func2']
      });
      
      registry.func1 = jest.fn();
      registry.func2 = jest.fn();
      expect(registry.allFunctionsReady()).toBe(true);
      
      registry.clearAllFunctions();
      expect(registry.func1).toBeNull(); // cleared
      expect(registry.func2).toBeNull(); // cleared
      expect(registry.allFunctionsReady()).toBe(false); // no longer ready
    });

    // verifies should skip invalid function names
    test('should skip invalid function names', () => {
      const registry = createBroadcastRegistry({
        functions: ['validFunction', '', '   ', null, undefined, 123]
      });
      
      expect(registry.validFunction).toBeNull(); // valid function available
      expect(registry['']).toBeUndefined(); // invalid names not added
      expect(registry['   ']).toBeUndefined(); // whitespace names not added
      expect(registry[null]).toBeUndefined(); // null names not added
    });

    // verifies should prevent deletion of registry properties
    test('should prevent deletion of registry properties', () => {
      const registry = createBroadcastRegistry({
        functions: ['testFunction']
      });
      
      registry.testFunction = jest.fn();
      expect(registry.testFunction).not.toBeNull();
      
      delete registry.testFunction;
      expect(registry.testFunction).not.toBeUndefined(); // property still exists (configurable: false)
    });
  });

  describe('createPaymentBroadcastRegistry', () => { // pre-configured payment registry
    
    // verifies should create registry with standard payment functions
    test('should create registry with standard payment functions', () => {
      const registry = createPaymentBroadcastRegistry();
      
      expect(typeof registry).toBe('object'); // returns object
      expect(registry.broadcastOutcome).toBeNull(); // standard payment function
      expect(registry.broadcastUsageUpdate).toBeNull(); // standard usage function
      expect(typeof registry.allFunctionsReady).toBe('function'); // utility methods available
    });

    // verifies should work with standard payment workflow
    test('should work with standard payment workflow', () => {
      const registry = createPaymentBroadcastRegistry();
      
      const mockOutcomeFn = jest.fn();
      const mockUsageFn = jest.fn();
      
      registry.broadcastOutcome = mockOutcomeFn;
      registry.broadcastUsageUpdate = mockUsageFn;
      
      expect(registry.broadcastOutcome).toBe(mockOutcomeFn); // outcome function set
      expect(registry.broadcastUsageUpdate).toBe(mockUsageFn); // usage function set
      expect(registry.allFunctionsReady()).toBe(true); // all standard functions ready
    });

    // verifies should support typical usage patterns
    test('should support typical usage patterns', () => {
      const registry = createPaymentBroadcastRegistry();
      
      // Simulate socket server registration
      const mockIo = {
        emit: jest.fn()
      };
      
      registry.broadcastOutcome = (data) => mockIo.emit('payment:outcome', data);
      registry.broadcastUsageUpdate = (data) => mockIo.emit('usage:update', data);
      
      // Simulate service usage
      registry.broadcastOutcome({ status: 'success', id: '123' });
      registry.broadcastUsageUpdate({ credits: 500, usage: 120 });
      
      expect(mockIo.emit).toHaveBeenCalledWith('payment:outcome', { status: 'success', id: '123' });
      expect(mockIo.emit).toHaveBeenCalledWith('usage:update', { credits: 500, usage: 120 });
    });
  });

  describe('createSocketBroadcastRegistry', () => { // validates static interface broadcast registry
    
    // verifies should create registry with static interface
    test('should create registry with static interface', () => {
      const registry = createSocketBroadcastRegistry();
      
      expect(registry).toBeDefined(); // registry created
      expect(typeof registry).toBe('object'); // returns object
      expect(registry.broadcastOutcome).toBeNull(); // initial state null
      expect(registry.broadcastUsageUpdate).toBeNull(); // initial state null
      expect(typeof registry.allFunctionsReady).toBe('function'); // utility method available
      expect(typeof registry.getMissingFunctions).toBe('function'); // utility method available
      expect(typeof registry.clearAllFunctions).toBe('function'); // utility method available
    });

    // verifies should allow function assignment through setters
    test('should allow function assignment through setters', () => {
      const registry = createSocketBroadcastRegistry();
      const mockOutcomeFunction = jest.fn();
      const mockUsageFunction = jest.fn();
      
      // Assign functions through setters
      registry.broadcastOutcome = mockOutcomeFunction;
      registry.broadcastUsageUpdate = mockUsageFunction;
      
      expect(registry.broadcastOutcome).toBe(mockOutcomeFunction); // outcome function assigned
      expect(registry.broadcastUsageUpdate).toBe(mockUsageFunction); // usage function assigned
    });

    // verifies should execute assigned functions correctly
    test('should execute assigned functions correctly', () => {
      const registry = createSocketBroadcastRegistry();
      const mockOutcomeFunction = jest.fn();
      const mockUsageFunction = jest.fn();
      
      registry.broadcastOutcome = mockOutcomeFunction;
      registry.broadcastUsageUpdate = mockUsageFunction;
      
      const outcomeData = { status: 'success', id: '123' };
      const usageData = { credits: 500, usage: 120 };
      
      registry.broadcastOutcome(outcomeData);
      registry.broadcastUsageUpdate(usageData);
      
      expect(mockOutcomeFunction).toHaveBeenCalledWith(outcomeData); // outcome function called with data
      expect(mockUsageFunction).toHaveBeenCalledWith(usageData); // usage function called with data
    });

    // verifies should validate function assignments
    test('should validate function assignments', () => {
      const registry = createSocketBroadcastRegistry();
      
      // Test invalid assignments
      expect(() => {
        registry.broadcastOutcome = 'not a function';
      }).toThrow('broadcastOutcome must be a function or null'); // string rejected
      
      expect(() => {
        registry.broadcastUsageUpdate = 123;
      }).toThrow('broadcastUsageUpdate must be a function or null'); // number rejected
      
      expect(() => {
        registry.broadcastOutcome = {};
      }).toThrow('broadcastOutcome must be a function or null'); // object rejected
      
      // Test valid assignments
      expect(() => {
        registry.broadcastOutcome = null;
        registry.broadcastUsageUpdate = null;
      }).not.toThrow(); // null allowed
      
      expect(() => {
        registry.broadcastOutcome = () => {};
        registry.broadcastUsageUpdate = function() {};
      }).not.toThrow(); // functions allowed
    });

    // verifies should track readiness state correctly
    test('should track readiness state correctly', () => {
      const registry = createSocketBroadcastRegistry();
      
      expect(registry.allFunctionsReady()).toBe(false); // initially not ready
      expect(registry.getMissingFunctions()).toEqual(['broadcastOutcome', 'broadcastUsageUpdate']); // both missing
      
      registry.broadcastOutcome = () => {};
      expect(registry.allFunctionsReady()).toBe(false); // still not ready with one function
      expect(registry.getMissingFunctions()).toEqual(['broadcastUsageUpdate']); // one missing
      
      registry.broadcastUsageUpdate = () => {};
      expect(registry.allFunctionsReady()).toBe(true); // ready with both functions
      expect(registry.getMissingFunctions()).toEqual([]); // none missing
    });

    // verifies should support function clearing
    test('should support function clearing', () => {
      const registry = createSocketBroadcastRegistry();
      
      registry.broadcastOutcome = () => {};
      registry.broadcastUsageUpdate = () => {};
      expect(registry.allFunctionsReady()).toBe(true); // functions assigned
      
      registry.clearAllFunctions();
      expect(registry.broadcastOutcome).toBeNull(); // outcome cleared
      expect(registry.broadcastUsageUpdate).toBeNull(); // usage cleared
      expect(registry.allFunctionsReady()).toBe(false); // not ready after clearing
    });

    // verifies should handle null assignments correctly
    test('should handle null assignments correctly', () => {
      const registry = createSocketBroadcastRegistry();
      const mockFunction = jest.fn();
      
      registry.broadcastOutcome = mockFunction;
      expect(registry.broadcastOutcome).toBe(mockFunction); // function assigned
      
      registry.broadcastOutcome = null;
      expect(registry.broadcastOutcome).toBeNull(); // null assignment accepted
      expect(registry.allFunctionsReady()).toBe(false); // not ready with null
    });

    // verifies should work with typical socket.io usage patterns
    test('should work with typical socket.io usage patterns', () => {
      const registry = createSocketBroadcastRegistry();
      
      // Simulate socket.io setup
      const mockIo = {
        emit: jest.fn()
      };
      
      registry.broadcastOutcome = (data) => mockIo.emit('payment:outcome', data);
      registry.broadcastUsageUpdate = (data) => mockIo.emit('usage:update', data);
      
      // Simulate service usage
      const paymentData = { status: 'success', amount: 100 };
      const usageData = { credits: 500, usage: 120 };
      
      if (registry.broadcastOutcome) {
        registry.broadcastOutcome(paymentData);
      }
      
      if (registry.broadcastUsageUpdate) {
        registry.broadcastUsageUpdate(usageData);
      }
      
      expect(mockIo.emit).toHaveBeenCalledWith('payment:outcome', paymentData); // payment event emitted
      expect(mockIo.emit).toHaveBeenCalledWith('usage:update', usageData); // usage event emitted
      expect(mockIo.emit).toHaveBeenCalledTimes(2); // both events emitted
    });

    // verifies should match expected interface exactly
    test('should match expected interface exactly', () => {
      const registry = createSocketBroadcastRegistry();
      
      // Check property names match specification
      expect(registry).toHaveProperty('broadcastOutcome`);
      expect(registry).toHaveProperty('broadcastUsageUpdate`);
      expect(registry).toHaveProperty('allFunctionsReady`);
      expect(registry).toHaveProperty('getMissingFunctions`);
      expect(registry).toHaveProperty('clearAllFunctions`);
      
      // Check property descriptors for getters/setters
      const outcomeDescriptor = Object.getOwnPropertyDescriptor(registry, 'broadcastOutcome`);
      const usageDescriptor = Object.getOwnPropertyDescriptor(registry, 'broadcastUsageUpdate`);
      
      expect(typeof outcomeDescriptor.get).toBe('function'); // getter defined
      expect(typeof outcomeDescriptor.set).toBe('function'); // setter defined
      expect(typeof usageDescriptor.get).toBe('function'); // getter defined
      expect(typeof usageDescriptor.set).toBe('function'); // setter defined
    });
  });

  describe('validateBroadcastData', () => { // broadcast data validation
    
    // verifies should validate simple valid data
    test('should validate simple valid data', () => {
      const data = { status: 'success', id: '123' };
      const result = validateBroadcastData(data);
      
      expect(result.isValid).toBe(true); // valid data passes
      expect(result.errors).toEqual([]); // no errors
    });

    // verifies should reject null and undefined data
    test('should reject null and undefined data', () => {
      const nullResult = validateBroadcastData(null);
      const undefinedResult = validateBroadcastData(undefined);
      
      expect(nullResult.isValid).toBe(false); // null rejected
      expect(nullResult.errors).toContain('Broadcast data cannot be null or undefined`);
      
      expect(undefinedResult.isValid).toBe(false); // undefined rejected
      expect(undefinedResult.errors).toContain('Broadcast data cannot be null or undefined`);
    });

    // verifies should reject circular references
    test('should reject circular references', () => {
      const data = { status: 'success' };
      data.self = data; // create circular reference
      
      const result = validateBroadcastData(data);
      
      expect(result.isValid).toBe(false); // circular reference rejected
      expect(result.errors).toContain('Data contains non-serializable content (circular references, functions)`);
    });

    // verifies should reject oversized data
    test('should reject oversized data', () => {
      const largeData = {
        content: 'x'.repeat(70000) // ~70KB of content
      };
      
      const result = validateBroadcastData(largeData, { maxSize: 65536 }); // 64KB limit
      
      expect(result.isValid).toBe(false); // oversized data rejected
      expect(result.errors.some(error => error.includes('Data size'))).toBe(true); // size error reported
    });

    // verifies should detect potentially sensitive data
    test('should detect potentially sensitive data', () => {
      const sensitiveData = {
        user: 'john',
        password: 'secret123',
        apiKey: 'abc-xyz-789'
      };
      
      const result = validateBroadcastData(sensitiveData);
      
      expect(result.isValid).toBe(false); // sensitive data rejected
      expect(result.errors).toContain('Data may contain sensitive information`);
    });

    // verifies should reject functions by default
    test('should reject functions by default', () => {
      const dataWithFunction = {
        status: 'success',
        callback: function() { return 'test'; }
      };
      
      const result = validateBroadcastData(dataWithFunction);
      
      expect(result.isValid).toBe(false); // functions rejected by default
      expect(result.errors.some(error => error.includes('Function found'))).toBe(true);
    });

    // verifies should allow functions when explicitly enabled
    test('should allow functions when explicitly enabled', () => {
      const dataWithFunction = {
        status: 'success',
        callback: function() { return 'test'; }
      };
      
      const result = validateBroadcastData(dataWithFunction, { allowFunctions: true });
      
      // Should still be invalid due to serialization issue, but no function-specific error
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Data contains non-serializable content (circular references, functions)`);
      expect(result.errors.some(error => error.includes('Function found'))).toBe(false); // no function error
    });

    // verifies should handle nested objects
    test('should handle nested objects', () => {
      const nestedData = {
        user: {
          id: '123',
          profile: {
            name: 'John',
            settings: {
              theme: 'dark',
              notifications: true
            }
          }
        },
        timestamp: new Date().toISOString()
      };
      
      const result = validateBroadcastData(nestedData);
      
      expect(result.isValid).toBe(true); // nested objects allowed
      expect(result.errors).toEqual([]); // no errors
    });

    // verifies should handle arrays
    test('should handle arrays', () => {
      const arrayData = {
        items: ['item1', 'item2', 'item3'],
        numbers: [1, 2, 3, 4, 5]
      };
      
      const result = validateBroadcastData(arrayData);
      
      expect(result.isValid).toBe(true); // arrays allowed
      expect(result.errors).toEqual([]); // no errors
    });

    // verifies should handle custom size limits
    test('should handle custom size limits', () => {
      const data = { content: 'x'.repeat(1000) }; // 1KB content
      
      const smallLimitResult = validateBroadcastData(data, { maxSize: 500 });
      const largeLimitResult = validateBroadcastData(data, { maxSize: 2000 });
      
      expect(smallLimitResult.isValid).toBe(false); // exceeds small limit
      expect(largeLimitResult.isValid).toBe(true); // within large limit
    });

    // verifies should handle validation errors gracefully
    test('should handle validation errors gracefully', () => {
      // Mock JSON.stringify to throw an error
      const originalStringify = JSON.stringify;
      JSON.stringify = jest.fn(() => {
        throw new Error('Mocked serialization error`);
      });
      
      const result = validateBroadcastData({ test: 'data' });
      
      // Restore original function
      JSON.stringify = originalStringify;
      
      expect(result.isValid).toBe(false); // error handled
      expect(result.errors).toContain('Validation error occurred'); // generic error message
    });
  });

  describe('Integration Scenarios', () => { // realistic usage patterns
    
    // verifies should support complete broadcast workflow
    test('should support complete broadcast workflow', () => {
      const registry = createPaymentBroadcastRegistry();
      const broadcastHistory = [];
      
      // Setup mock broadcast functions
      registry.broadcastOutcome = (data) => {
        const validation = validateBroadcastData(data);
        if (validation.isValid) {
          broadcastHistory.push({ type: 'outcome', data });
        } else {
          throw new Error(`Invalid broadcast data: ${validation.errors.join(', ')}`);
        }
      };
      
      registry.broadcastUsageUpdate = (data) => {
        const validation = validateBroadcastData(data);
        if (validation.isValid) {
          broadcastHistory.push({ type: 'usage', data });
        } else {
          throw new Error(`Invalid broadcast data: ${validation.errors.join(', ')}`);
        }
      };
      
      // Test valid broadcasts
      registry.broadcastOutcome({ status: 'success', amount: 100 });
      registry.broadcastUsageUpdate({ credits: 500, usage: 120 });
      
      expect(broadcastHistory).toHaveLength(2); // both broadcasts recorded
      expect(broadcastHistory[0]).toEqual({
        type: 'outcome',
        data: { status: 'success', amount: 100 }
      });
      expect(broadcastHistory[1]).toEqual({
        type: 'usage',
        data: { credits: 500, usage: 120 }
      });
      
      // Test invalid broadcast
      expect(() => {
        registry.broadcastOutcome({ password: 'secret123' }); // sensitive data
      }).toThrow('Invalid broadcast data`);
    });

    // verifies should handle service initialization timing
    test('should handle service initialization timing', () => {
      const registry = createPaymentBroadcastRegistry();
      
      // Service tries to broadcast before socket server initialization
      expect(registry.broadcastOutcome).toBeNull(); // not yet available
      expect(registry.allFunctionsReady()).toBe(false); // not ready
      
      // Simulate gradual initialization
      registry.broadcastOutcome = jest.fn();
      expect(registry.allFunctionsReady()).toBe(false); // partially ready
      
      registry.broadcastUsageUpdate = jest.fn();
      expect(registry.allFunctionsReady()).toBe(true); // fully ready
      
      // Now services can safely broadcast
      registry.broadcastOutcome({ status: 'ready' });
      expect(registry.broadcastOutcome).toHaveBeenCalledWith({ status: 'ready' });
    });

    // verifies should support testing with mock functions
    test('should support testing with mock functions', () => {
      const registry = createBroadcastRegistry({
        functions: ['testBroadcast']
      });
      
      const mockBroadcast = jest.fn();
      registry.testBroadcast = mockBroadcast;
      
      // Test service code
      const someService = {
        notifySuccess: (data) => {
          if (registry.testBroadcast) {
            registry.testBroadcast(data);
          }
        }
      };
      
      someService.notifySuccess({ result: 'success' });
      
      expect(mockBroadcast).toHaveBeenCalledWith({ result: 'success' }); // mock captured call
      
      // Clear for cleanup
      registry.clearAllFunctions();
      expect(registry.testBroadcast).toBeNull(); // cleaned up
    });
  });
});