/**
 * Structured audit logging for compliance and security monitoring.
 *
 * PURPOSE: Provides comprehensive audit logging for tracking security-relevant
 * events, data access, and system modifications in a structured, searchable format.
 * Includes automatic sensitive data sanitization.
 *
 * CATEGORIES: AUTHENTICATION, AUTHORIZATION, DATA_ACCESS, DATA_MODIFICATION,
 *             SECURITY_EVENT, PAYMENT_OPERATION
 * SEVERITY: LOW, MEDIUM, HIGH, CRITICAL
 * OUTCOME: SUCCESS, FAILURE, ATTEMPT
 */

const SENSITIVE_PATTERNS = [
  /api[_-]?key/i,
  /token/i,
  /password/i,
  /secret/i,
  /client[_-]?secret/i,
  /authorization/i,
  /bearer/i,
  /credit[_-]?card/i,
  /card[_-]?number/i,
  /ssn/i,
  /bank[_-]?account/i
];

function generateAuditId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `audit_${timestamp}_${random}`;
}

function sanitizeAuditDataRecursive(data, patterns) {
  if (Array.isArray(data)) {
    return data.map(item =>
      typeof item === 'object' && item !== null
        ? sanitizeAuditDataRecursive(item, patterns)
        : item
    );
  }

  if (typeof data === 'object' && data !== null) {
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
      if (patterns.some(pattern => pattern.test(key))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitizeAuditDataRecursive(value, patterns);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  return data;
}

function sanitizeAuditData(data) {
  if (!data || typeof data !== 'object') {
    return {};
  }
  return sanitizeAuditDataRecursive(data, SENSITIVE_PATTERNS);
}

const auditLogger = {
  log(event) {
    const auditEvent = {
      timestamp: new Date().toISOString(),
      auditId: generateAuditId(),
      severity: event.severity || 'LOW',
      category: event.category,
      action: event.action,
      userId: event.userId,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      resource: event.resource,
      outcome: event.outcome || 'SUCCESS',
      details: sanitizeAuditData(event.details || {})
    };

    console.log(JSON.stringify({
      type: 'AUDIT_EVENT',
      ...auditEvent
    }));

    return auditEvent;
  },

  logAuth(action, outcome, userId, details = {}) {
    return auditLogger.log({
      severity: outcome === 'FAILURE' ? 'HIGH' : 'MEDIUM',
      category: 'AUTHENTICATION',
      action,
      userId,
      outcome,
      details
    });
  },

  logDataAccess(resource, action, userId, details = {}) {
    return auditLogger.log({
      severity: 'LOW',
      category: 'DATA_ACCESS',
      action,
      userId,
      resource,
      outcome: 'SUCCESS',
      details
    });
  },

  logDataModification(resource, action, outcome, userId, details = {}) {
    return auditLogger.log({
      severity: outcome === 'SUCCESS' ? 'MEDIUM' : 'HIGH',
      category: 'DATA_MODIFICATION',
      action,
      userId,
      resource,
      outcome,
      details
    });
  },

  logSecurityEvent(action, severity, details = {}, userId) {
    return auditLogger.log({
      severity,
      category: 'SECURITY_EVENT',
      action,
      userId,
      outcome: 'ATTEMPT',
      details
    });
  },

  logPaymentOperation(action, outcome, userId, details = {}) {
    return auditLogger.log({
      severity: outcome === 'SUCCESS' ? 'MEDIUM' : 'HIGH',
      category: 'PAYMENT_OPERATION',
      action,
      userId,
      outcome,
      details
    });
  }
};

module.exports = auditLogger;
