const auditLogger = require('./auditLogger');

describe('auditLogger', () => {
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('log', () => {
    it('should log audit event with required fields', () => {
      const event = auditLogger.log({
        category: 'DATA_ACCESS',
        action: 'read_user',
        outcome: 'SUCCESS',
        details: {}
      });

      expect(event.auditId).toMatch(/^audit_/);
      expect(event.timestamp).toBeDefined();
      expect(event.category).toBe('DATA_ACCESS');
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should sanitize sensitive data in details', () => {
      const event = auditLogger.log({
        category: 'AUTHENTICATION',
        action: 'login',
        outcome: 'SUCCESS',
        details: {
          username: 'test@example.com',
          password: 'secret123',
          api_key: 'sk_test_xxx'
        }
      });

      expect(event.details.username).toBe('test@example.com');
      expect(event.details.password).toBe('[REDACTED]');
      expect(event.details.api_key).toBe('[REDACTED]');
    });

    it('should sanitize nested sensitive data', () => {
      const event = auditLogger.log({
        category: 'PAYMENT_OPERATION',
        action: 'charge',
        outcome: 'SUCCESS',
        details: {
          payment: {
            card_number: '4242424242424242',
            amount: 100
          }
        }
      });

      expect(event.details.payment.card_number).toBe('[REDACTED]');
      expect(event.details.payment.amount).toBe(100);
    });
  });

  describe('logAuth', () => {
    it('should log authentication event', () => {
      const event = auditLogger.logAuth('login', 'SUCCESS', 'user123');
      
      expect(event.category).toBe('AUTHENTICATION');
      expect(event.action).toBe('login');
      expect(event.userId).toBe('user123');
      expect(event.severity).toBe('MEDIUM');
    });

    it('should set HIGH severity for failures', () => {
      const event = auditLogger.logAuth('login', 'FAILURE', 'user123');
      expect(event.severity).toBe('HIGH');
    });
  });

  describe('logDataAccess', () => {
    it('should log data access event', () => {
      const event = auditLogger.logDataAccess('users', 'list', 'user123');
      
      expect(event.category).toBe('DATA_ACCESS');
      expect(event.resource).toBe('users');
      expect(event.severity).toBe('LOW');
    });
  });

  describe('logDataModification', () => {
    it('should log data modification event', () => {
      const event = auditLogger.logDataModification('users', 'update', 'SUCCESS', 'user123');
      
      expect(event.category).toBe('DATA_MODIFICATION');
      expect(event.outcome).toBe('SUCCESS');
    });
  });

  describe('logSecurityEvent', () => {
    it('should log security event', () => {
      const event = auditLogger.logSecurityEvent('suspicious_activity', 'CRITICAL', { ip: '1.2.3.4' });
      
      expect(event.category).toBe('SECURITY_EVENT');
      expect(event.severity).toBe('CRITICAL');
      expect(event.outcome).toBe('ATTEMPT');
    });
  });

  describe('logPaymentOperation', () => {
    it('should log payment operation', () => {
      const event = auditLogger.logPaymentOperation('charge', 'SUCCESS', 'user123', { amount: 100 });
      
      expect(event.category).toBe('PAYMENT_OPERATION');
      expect(event.details.amount).toBe(100);
    });
  });
});
