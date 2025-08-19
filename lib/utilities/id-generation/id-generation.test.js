// Unit tests for secure ID generation utilities. These tests ensure proper
// ID format, uniqueness guarantees, input validation, and error handling
// for execution tracking and data integrity across applications.
const { generateExecutionId, generateTaskId, generateSecureId, generateSimpleId } = require('../id-generation`);

describe('Secure ID Generation Utilities', () => { // validates ID generation functionality

  describe('generateExecutionId', () => { // validates execution ID generation
    
    // verifies should generate execution ID with correct format
    test('should generate execution ID with correct format', () => {
      const execId = generateExecutionId();
      
      expect(typeof execId).toBe('string'); // returns string
      expect(execId).toMatch(/^exec_\d+_[a-zA-Z0-9_-]{11}$/); // matches expected format
      expect(execId.startsWith('exec_')).toBe(true); // has execution prefix
      
      const parts = execId.split('_`);
      expect(parts).toHaveLength(3); // has three parts: prefix, timestamp, random
      expect(parts[0]).toBe('exec'); // correct prefix
      expect(parseInt(parts[1])).toBeGreaterThan(0); // valid timestamp
      expect(parts[2]).toHaveLength(11); // correct random suffix length
    });

    // verifies should generate unique IDs on multiple calls
    test('should generate unique IDs on multiple calls', () => {
      const ids = new Set();
      const numTests = 100;
      
      for (let i = 0; i < numTests; i++) {
        const id = generateExecutionId();
        expect(ids.has(id)).toBe(false); // no duplicates
        ids.add(id);
      }
      
      expect(ids.size).toBe(numTests); // all IDs unique
    });

    // verifies should generate IDs with recent timestamps
    test('should generate IDs with recent timestamps', () => {
      const before = Date.now();
      const execId = generateExecutionId();
      const after = Date.now();
      
      const parts = execId.split('_`);
      const timestamp = parseInt(parts[1]);
      
      expect(timestamp).toBeGreaterThanOrEqual(before); // timestamp not before call
      expect(timestamp).toBeLessThanOrEqual(after); // timestamp not after call
    });

    // verifies should maintain chronological ordering
    test('should maintain chronological ordering', () => {
      const id1 = generateExecutionId();
      // Small delay to ensure different timestamps
      const delay = new Promise(resolve => setTimeout(resolve, 1));
      
      return delay.then(() => {
        const id2 = generateExecutionId();
        
        expect(id1 < id2).toBe(true); // lexicographic ordering matches chronological
        
        const timestamp1 = parseInt(id1.split('_')[1]);
        const timestamp2 = parseInt(id2.split('_')[1]);
        expect(timestamp2).toBeGreaterThanOrEqual(timestamp1); // timestamps in order
      });
    });

    // verifies should handle rapid generation without collisions
    test('should handle rapid generation without collisions', () => {
      const ids = [];
      const numRapidTests = 50;
      
      // Generate many IDs rapidly
      for (let i = 0; i < numRapidTests; i++) {
        ids.push(generateExecutionId());
      }
      
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length); // no collisions despite rapid generation
    });
  });

  describe('generateTaskId', () => { // validates task ID generation
    
    // verifies should generate task ID with correct format
    test('should generate task ID with correct format', () => {
      const taskId = generateTaskId();
      
      expect(typeof taskId).toBe('string'); // returns string
      expect(taskId).toMatch(/^task_\d+_[a-zA-Z0-9_-]{11}$/); // matches expected format
      expect(taskId.startsWith('task_')).toBe(true); // has task prefix
      
      const parts = taskId.split('_`);
      expect(parts).toHaveLength(3); // has three parts: prefix, timestamp, random
      expect(parts[0]).toBe('task'); // correct prefix
      expect(parseInt(parts[1])).toBeGreaterThan(0); // valid timestamp
      expect(parts[2]).toHaveLength(11); // correct random suffix length
    });

    // verifies should generate unique task IDs
    test('should generate unique task IDs', () => {
      const ids = new Set();
      const numTests = 100;
      
      for (let i = 0; i < numTests; i++) {
        const id = generateTaskId();
        expect(ids.has(id)).toBe(false); // no duplicates
        ids.add(id);
      }
      
      expect(ids.size).toBe(numTests); // all IDs unique
    });

    // verifies should generate different types of IDs with different prefixes
    test('should generate different types of IDs with different prefixes', () => {
      const execId = generateExecutionId();
      const taskId = generateTaskId();
      
      expect(execId.startsWith('exec_')).toBe(true); // execution has exec prefix
      expect(taskId.startsWith('task_')).toBe(true); // task has task prefix
      expect(execId).not.toBe(taskId); // different IDs generated
    });

    // verifies should support workflow hierarchy tracking
    test('should support workflow hierarchy tracking', () => {
      const executionId = generateExecutionId();
      const taskId1 = generateTaskId();
      const taskId2 = generateTaskId();
      
      // Simulate workflow structure
      const workflow = {
        execution: executionId,
        tasks: [taskId1, taskId2]
      };
      
      expect(workflow.execution).toMatch(/^exec_/); // execution ID format
      expect(workflow.tasks[0]).toMatch(/^task_/); // task ID format
      expect(workflow.tasks[1]).toMatch(/^task_/); // task ID format
      expect(workflow.tasks[0]).not.toBe(workflow.tasks[1]); // unique task IDs
    });
  });

  describe('generateSecureId', () => { // validates core secure ID generation
    
    // verifies should generate ID with custom prefix
    test('should generate ID with custom prefix', () => {
      const customId = generateSecureId('custom`);
      
      expect(typeof customId).toBe('string'); // returns string
      expect(customId).toMatch(/^custom_\d+_[a-zA-Z0-9_-]{11}$/); // matches expected format
      expect(customId.startsWith('custom_')).toBe(true); // has custom prefix
      
      const parts = customId.split('_`);
      expect(parts).toHaveLength(3); // has three parts
      expect(parts[0]).toBe('custom'); // correct custom prefix
    });

    // verifies should validate prefix parameter
    test('should validate prefix parameter', () => {
      // Test invalid prefixes
      expect(() => generateSecureId()).toThrow('Prefix must be a non-empty string'); // undefined prefix
      expect(() => generateSecureId(null)).toThrow('Prefix must be a non-empty string'); // null prefix
      expect(() => generateSecureId('')).toThrow('Prefix cannot be empty or whitespace only'); // empty prefix
      expect(() => generateSecureId('   ')).toThrow('Prefix cannot be empty or whitespace only'); // whitespace prefix
      expect(() => generateSecureId(123)).toThrow('Prefix must be a non-empty string'); // number prefix
      expect(() => generateSecureId({})).toThrow('Prefix must be a non-empty string'); // object prefix
      
      // Test prefix too long
      const longPrefix = 'a'.repeat(21);
      expect(() => generateSecureId(longPrefix)).toThrow('Prefix length cannot exceed 20 characters`);
      
      // Test invalid characters
      expect(() => generateSecureId('invalid-prefix')).toThrow('Prefix must contain only alphanumeric characters and underscores'); // hyphen not allowed
      expect(() => generateSecureId('invalid.prefix')).toThrow('Prefix must contain only alphanumeric characters and underscores'); // dot not allowed
      expect(() => generateSecureId('invalid prefix')).toThrow('Prefix must contain only alphanumeric characters and underscores'); // space not allowed
    });

    // verifies should accept valid prefixes
    test('should accept valid prefixes', () => {
      const validPrefixes = ['test', 'Test123', 'valid_prefix', 'ABC_123', 'a', '1', '_test_'];
      
      validPrefixes.forEach(prefix => {
        expect(() => generateSecureId(prefix)).not.toThrow(); // valid prefix accepted
        const id = generateSecureId(prefix);
        expect(id.startsWith(prefix + '_')).toBe(true); // correct prefix used
      });
    });

    // verifies should generate IDs with different prefixes correctly
    test('should generate IDs with different prefixes correctly', () => {
      const sessionId = generateSecureId('session`);
      const requestId = generateSecureId('req`);
      const batchId = generateSecureId('batch`);
      
      expect(sessionId.startsWith('session_')).toBe(true); // session prefix
      expect(requestId.startsWith('req_')).toBe(true); // request prefix
      expect(batchId.startsWith('batch_')).toBe(true); // batch prefix
      
      expect(sessionId).not.toBe(requestId); // different IDs
      expect(requestId).not.toBe(batchId); // different IDs
      expect(sessionId).not.toBe(batchId); // different IDs
    });

    // verifies should maintain timestamp ordering across different prefixes
    test('should maintain timestamp ordering across different prefixes', () => {
      const id1 = generateSecureId('type1`);
      const delay = new Promise(resolve => setTimeout(resolve, 1));
      
      return delay.then(() => {
        const id2 = generateSecureId('type2`);
        
        const timestamp1 = parseInt(id1.split('_')[1]);
        const timestamp2 = parseInt(id2.split('_')[1]);
        expect(timestamp2).toBeGreaterThanOrEqual(timestamp1); // timestamps in order
      });
    });

    // verifies should handle edge case prefixes
    test('should handle edge case prefixes', () => {
      const singleChar = generateSecureId('a`);
      const numbers = generateSecureId('123`);
      const underscores = generateSecureId('_test_`);
      const maxLength = generateSecureId('a'.repeat(20));
      
      expect(singleChar).toMatch(/^a_\d+_[a-zA-Z0-9_-]{11}$/); // single character
      expect(numbers).toMatch(/^123_\d+_[a-zA-Z0-9_-]{11}$/); // numeric prefix
      expect(underscores).toMatch(/^_test__\d+_[a-zA-Z0-9_-]{11}$/); // underscore prefix
      expect(maxLength).toMatch(new RegExp(`^${'a'.repeat(20)}_\\d+_[a-zA-Z0-9_-]{11}$`)); // max length
    });
  });

  describe('generateSimpleId', () => { // validates simple ID generation
    
    // verifies should generate simple ID with default length
    test('should generate simple ID with default length', () => {
      const simpleId = generateSimpleId('user`);
      
      expect(typeof simpleId).toBe('string'); // returns string
      expect(simpleId).toMatch(/^user_[a-zA-Z0-9_-]{8}$/); // matches expected format with default length
      expect(simpleId.startsWith('user_')).toBe(true); // has user prefix
      
      const parts = simpleId.split('_`);
      expect(parts).toHaveLength(2); // has two parts: prefix and random
      expect(parts[0]).toBe('user'); // correct prefix
      expect(parts[1]).toHaveLength(8); // default random length
    });

    // verifies should generate simple ID with custom length
    test('should generate simple ID with custom length', () => {
      const shortId = generateSimpleId('key', 6);
      const longId = generateSimpleId('token', 16);
      
      expect(shortId).toMatch(/^key_[a-zA-Z0-9_-]{6}$/); // 6 character random
      expect(longId).toMatch(/^token_[a-zA-Z0-9_-]{16}$/); // 16 character random
      
      const shortParts = shortId.split('_`);
      const longParts = longId.split('_`);
      expect(shortParts[1]).toHaveLength(6); // correct short length
      expect(longParts[1]).toHaveLength(16); // correct long length
    });

    // verifies should validate length parameter
    test('should validate length parameter', () => {
      // Test invalid lengths
      expect(() => generateSimpleId('test', 0)).toThrow('Length must be a positive integer'); // zero length
      expect(() => generateSimpleId('test', -1)).toThrow('Length must be a positive integer'); // negative length
      expect(() => generateSimpleId('test', 1.5)).toThrow('Length must be a positive integer'); // decimal length
      expect(() => generateSimpleId('test', '8')).toThrow('Length must be a positive integer'); // string length
      expect(() => generateSimpleId('test', null)).toThrow('Length must be a positive integer'); // null length
      expect(() => generateSimpleId('test', undefined)).toThrow('Length must be a positive integer'); // undefined length
      
      // Test length too long
      expect(() => generateSimpleId('test', 51)).toThrow('Length cannot exceed 50 characters`);
    });

    // verifies should accept valid lengths
    test('should accept valid lengths', () => {
      const validLengths = [1, 8, 12, 20, 50];
      
      validLengths.forEach(length => {
        expect(() => generateSimpleId('test', length)).not.toThrow(); // valid length accepted
        const id = generateSimpleId('test', length);
        const randomPart = id.split('_')[1];
        expect(randomPart).toHaveLength(length); // correct length generated
      });
    });

    // verifies should validate prefix like generateSecureId
    test('should validate prefix like generateSecureId', () => {
      // Test invalid prefixes (same validation as generateSecureId)
      expect(() => generateSimpleId()).toThrow('Prefix must be a non-empty string'); // undefined prefix
      expect(() => generateSimpleId(null)).toThrow('Prefix must be a non-empty string'); // null prefix
      expect(() => generateSimpleId('')).toThrow('Prefix cannot be empty or whitespace only'); // empty prefix
      expect(() => generateSimpleId('invalid-prefix')).toThrow('Prefix must contain only alphanumeric characters and underscores'); // invalid characters
    });

    // verifies should generate unique simple IDs
    test('should generate unique simple IDs', () => {
      const ids = new Set();
      const numTests = 100;
      
      for (let i = 0; i < numTests; i++) {
        const id = generateSimpleId('test`);
        expect(ids.has(id)).toBe(false); // no duplicates
        ids.add(id);
      }
      
      expect(ids.size).toBe(numTests); // all IDs unique
    });

    // verifies should not include timestamp
    test('should not include timestamp', () => {
      const simpleId = generateSimpleId('user`);
      const parts = simpleId.split('_`);
      
      expect(parts).toHaveLength(2); // only prefix and random parts
      expect(isNaN(parseInt(parts[1]))).toBe(true); // random part is not a timestamp
    });

    // verifies should work with different use cases
    test('should work with different use cases', () => {
      const userId = generateSimpleId('user'); // default 8 chars
      const apiKey = generateSimpleId('key', 16); // longer for security
      const configId = generateSimpleId('cfg', 6); // shorter for brevity
      const sessionToken = generateSimpleId('sess', 12); // medium length
      
      expect(userId).toMatch(/^user_[a-zA-Z0-9_-]{8}$/); // user ID format
      expect(apiKey).toMatch(/^key_[a-zA-Z0-9_-]{16}$/); // API key format
      expect(configId).toMatch(/^cfg_[a-zA-Z0-9_-]{6}$/); // config ID format
      expect(sessionToken).toMatch(/^sess_[a-zA-Z0-9_-]{12}$/); // session token format
    });
  });

  describe('ID Format and Security', () => { // validates ID format consistency and security

    // verifies should use nanoid character set
    test('should use nanoid character set', () => {
      const ids = [
        generateExecutionId(),
        generateTaskId(),
        generateSecureId('test'),
        generateSimpleId('simple')
      ];
      
      ids.forEach(id => {
        const randomPart = id.split('_').pop(); // get last part (random component)
        expect(randomPart).toMatch(/^[a-zA-Z0-9_-]+$/); // nanoid character set
      });
    });

    // verifies should generate IDs safe for URLs and databases
    test('should generate IDs safe for URLs and databases', () => {
      const ids = [
        generateExecutionId(),
        generateTaskId(),
        generateSecureId('test'),
        generateSimpleId('simple')
      ];
      
      ids.forEach(id => {
        expect(id).not.toMatch(/[^a-zA-Z0-9_-]/); // no special characters except underscore and hyphen
        expect(id).not.toContain(' '); // no spaces
        expect(id).not.toContain('.'); // no dots
        expect(id).not.toContain('/'); // no slashes
      });
    });

    // verifies should provide collision resistance
    test('should provide collision resistance', () => {
      const largeSet = new Set();
      const numTests = 1000;
      
      // Generate mix of different ID types
      for (let i = 0; i < numTests; i++) {
        largeSet.add(generateExecutionId());
        largeSet.add(generateTaskId());
        largeSet.add(generateSecureId('test'));
        largeSet.add(generateSimpleId('simple'));
      }
      
      expect(largeSet.size).toBe(numTests * 4); // no collisions across all types
    });

    // verifies should handle concurrent generation
    test('should handle concurrent generation', () => {
      const promises = [];
      const numConcurrent = 50;
      
      // Generate IDs concurrently
      for (let i = 0; i < numConcurrent; i++) {
        promises.push(Promise.resolve(generateExecutionId()));
        promises.push(Promise.resolve(generateTaskId()));
        promises.push(Promise.resolve(generateSecureId('concurrent')));
        promises.push(Promise.resolve(generateSimpleId('simple')));
      }
      
      return Promise.all(promises).then(ids => {
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(ids.length); // no collisions in concurrent generation
      });
    });

    // verifies should maintain performance under load
    test('should maintain performance under load', () => {
      const startTime = Date.now();
      const numIterations = 1000;
      
      for (let i = 0; i < numIterations; i++) {
        generateExecutionId();
        generateTaskId();
        generateSecureId('perf`);
        generateSimpleId('simple`);
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should generate 4000 IDs in reasonable time (adjust threshold as needed)
      expect(duration).toBeLessThan(5000); // less than 5 seconds for 4000 IDs
    });
  });

  describe('Error Handling', () => { // validates error handling and edge cases

    // verifies should handle nanoid generation errors gracefully
    test('should handle errors gracefully', () => {
      // Test with valid inputs to ensure no unexpected errors
      expect(() => generateExecutionId()).not.toThrow(); // execution ID generation
      expect(() => generateTaskId()).not.toThrow(); // task ID generation
      expect(() => generateSecureId('valid')).not.toThrow(); // secure ID generation
      expect(() => generateSimpleId('valid')).not.toThrow(); // simple ID generation
    });

    // verifies should provide descriptive error messages
    test('should provide descriptive error messages', () => {
      try {
        generateSecureId('invalid-prefix`);
        fail('Should have thrown an error`);
      } catch (error) {
        expect(error.message).toContain('alphanumeric characters and underscores'); // descriptive message
      }
      
      try {
        generateSimpleId('test', -1);
        fail('Should have thrown an error`);
      } catch (error) {
        expect(error.message).toContain('positive integer'); // descriptive message
      }
    });

    // verifies should validate all edge cases consistently
    test('should validate all edge cases consistently', () => {
      const invalidPrefixes = [null, undefined, '', '   ', 123, {}, 'invalid-chars'];
      
      invalidPrefixes.forEach(prefix => {
        expect(() => generateSecureId(prefix)).toThrow(); // secure ID validation
        expect(() => generateSimpleId(prefix)).toThrow(); // simple ID validation
      });
    });

    // verifies should handle boundary values correctly
    test('should handle boundary values correctly', () => {
      // Test boundary lengths for simple IDs
      expect(() => generateSimpleId('test', 1)).not.toThrow(); // minimum length
      expect(() => generateSimpleId('test', 50)).not.toThrow(); // maximum length
      
      // Test boundary prefix lengths
      expect(() => generateSecureId('a')).not.toThrow(); // minimum prefix
      expect(() => generateSecureId('a'.repeat(20))).not.toThrow(); // maximum prefix
    });
  });
});