/**
 * Security Validation and Audit Utilities
 * 
 * Comprehensive security validation functions for input validation,
 * security audits, and vulnerability prevention.
 */

import { sanitizeInput, detectSqlInjection, detectCommandInjection } from './inputSanitization.js';
import { verifyPassword, isSecureInput } from './secureCrypto.js';

// Performance optimization: Cache validation results
const validationCache = new Map<string, SecurityValidationResult>();
const MAX_CACHE_SIZE = 500;

// Performance optimization: Pre-compiled regex patterns
const INJECTION_PATTERNS = {
  sql: /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
  command: /[;&|`$(){}[\]]/,
  xss: /<script|javascript:|on\w+\s*=/i
};

/**
 * Security validation result
 */
interface SecurityValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  sanitizedData?: any;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Comprehensive security validation for user input
 * @param data - Data to validate
 * @param validationOptions - Validation configuration
 * @returns Security validation result
 */
function validateSecurity(data: any, validationOptions: {
  type?: 'string' | 'number' | 'email' | 'url' | 'object' | 'array';
  required?: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: RegExp;
  sanitize?: boolean;
  checkInjections?: boolean;
} = {}): SecurityValidationResult {
  const {
    type,
    required = false,
    maxLength = 1000,
    minLength = 0,
    pattern,
    sanitize = true,
    checkInjections = true
  } = validationOptions;
  
  const result: SecurityValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    riskLevel: 'low'
  };
  
  // Check required fields
  if (required && (data === null || data === undefined || data === '')) {
    result.isValid = false;
    result.errors.push('Field is required');
    result.riskLevel = 'medium';
  }
  
  // Handle null/undefined for optional fields
  if (!required && (data === null || data === undefined)) {
    return result;
  }
  
  // Type validation
  if (type) {
    const validationResult = validateType(data, type);
    if (!validationResult.isValid) {
      result.isValid = false;
      result.errors.push(validationResult.error || 'Invalid type');
      result.riskLevel = 'high';
      return result;
    }
  }
  
  // Length validation for strings
  if (type === 'string') {
    const str = String(data);
    if (str.length > maxLength) {
      result.isValid = false;
      result.errors.push(`Input exceeds maximum length of ${maxLength}`);
      result.riskLevel = 'medium';
    }
    
    if (str.length < minLength) {
      result.isValid = false;
      result.errors.push(`Input is below minimum length of ${minLength}`);
      result.riskLevel = 'low';
    }
    
    // Pattern validation
    if (pattern && !pattern.test(str)) {
      result.isValid = false;
      result.errors.push('Input does not match required pattern');
      result.riskLevel = 'medium';
    }
    
    // Optimized injection detection with cached patterns
    if (checkInjections) {
      // Fast regex checks first
      if (INJECTION_PATTERNS.sql.test(str)) {
        result.isValid = false;
        result.errors.push('Potential SQL injection detected');
        result.riskLevel = 'critical';
      } else if (INJECTION_PATTERNS.command.test(str)) {
        result.isValid = false;
        result.errors.push('Potential command injection detected');
        result.riskLevel = 'critical';
      } else if (INJECTION_PATTERNS.xss.test(str)) {
        result.warnings.push('Input contains potentially dangerous content');
        result.riskLevel = 'medium';
      }
      
      // Only run expensive detection if fast patterns pass
      if (result.isValid && !detectSqlInjection(str)) {
        result.isValid = false;
        result.errors.push('Potential SQL injection detected');
        result.riskLevel = 'critical';
      } else if (result.isValid && !detectCommandInjection(str)) {
        result.isValid = false;
        result.errors.push('Potential command injection detected');
        result.riskLevel = 'critical';
      }
    }
    
    // Sanitization
    if (sanitize && result.isValid) {
      try {
        result.sanitizedData = sanitizeInput(str);
      } catch (error) {
        result.warnings.push('Sanitization failed');
        result.riskLevel = 'medium';
      }
    }
  }
  
  // Object validation for prototype pollution
  if (type === 'object' && typeof data === 'object' && data !== null) {
    if (hasPrototypePollution(data)) {
      result.isValid = false;
      result.errors.push('Object contains prototype pollution risk');
      result.riskLevel = 'critical';
    }
  }
  
  return result;
}

/**
 * Validates data type
 * @param data - Data to validate
 * @param type - Expected type
 * @returns Validation result
 */
function validateType(data: any, type: string): { isValid: boolean; error?: string } {
  switch (type) {
    case 'string':
      return { isValid: typeof data === 'string' };
    case 'number':
      return { isValid: typeof data === 'number' && !isNaN(data) };
    case 'email':
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      return { isValid: typeof data === 'string' && emailRegex.test(data) };
    case 'url':
      try {
        new URL(String(data));
        return { isValid: true };
      } catch {
        return { isValid: false, error: 'Invalid URL format' };
      }
    case 'object':
      return { isValid: typeof data === 'object' && data !== null && !Array.isArray(data) };
    case 'array':
      return { isValid: Array.isArray(data) };
    default:
      return { isValid: false, error: 'Unknown validation type' };
  }
}

/**
 * Checks for prototype pollution in objects
 * @param obj - Object to check
 * @returns True if prototype pollution is detected
 */
function hasPrototypePollution(obj: any): boolean {
  if (obj && typeof obj === 'object') {
    const dangerousKeys = ['__proto__', 'constructor', 'prototype'];
    
    for (const key of Object.keys(obj)) {
      if (dangerousKeys.includes(key)) {
        return true;
      }
      
      if (typeof obj[key] === 'object' && hasPrototypePollution(obj[key])) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Security audit for configuration objects
 * @param config - Configuration to audit
 * @returns Security audit result
 */
function auditConfiguration(config: Record<string, any>): SecurityValidationResult {
  const result: SecurityValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    riskLevel: 'low'
  };
  
  // Check for dangerous configuration values
  const dangerousPatterns = [
    /\$\{.*\}/, // Template injection
    /<script[^>]*>.*<\/script>/gi, // XSS
    /javascript:/gi, // JavaScript protocol
    /data:text\/html/gi // Data protocol HTML
  ];
  
  for (const [key, value] of Object.entries(config)) {
    if (typeof value === 'string') {
      for (const pattern of dangerousPatterns) {
        if (pattern.test(value)) {
          result.isValid = false;
          result.errors.push(`Dangerous pattern detected in configuration key: ${key}`);
          result.riskLevel = 'high';
        }
      }
    }
    
    // Check for hardcoded secrets
    if (typeof value === 'string' && isHardcodedSecret(key, value)) {
      result.warnings.push(`Potential hardcoded secret detected in: ${key}`);
      result.riskLevel = 'medium';
    }
  }
  
  return result;
}

/**
 * Checks for potential hardcoded secrets
 * @param key - Configuration key
 * @param value - Configuration value
 * @returns True if appears to be a hardcoded secret
 */
function isHardcodedSecret(key: string, value: string): boolean {
  const secretKeys = [
    'password', 'secret', 'key', 'token', 'api_key', 'private_key',
    'passphrase', 'credential', 'auth', 'certificate'
  ];
  
  const hasSecretKey = secretKeys.some(secretKey => 
    key.toLowerCase().includes(secretKey)
  );
  
  if (!hasSecretKey) {
    return false;
  }
  
  // Check for common secret patterns
  const secretPatterns = [
    /^[A-Za-z0-9+/]{40,}={0,2}$/, // Base64 encoded
    /^[a-f0-9]{32,}$/i, // Hex encoded
    /^[A-Za-z0-9_-]{20,}$/, // URL-safe base64
    /^sk-[a-zA-Z0-9]{48}$/, // Stripe-like
    /^ghp_[a-zA-Z0-9]{36}$/, // GitHub-like
  ];
  
  return secretPatterns.some(pattern => pattern.test(value));
}

/**
 * Validates file upload for security issues
 * @param file - File information
 * @param options - Validation options
 * @returns Security validation result
 */
function validateFileUpload(file: {
  name: string;
  size: number;
  type: string;
  content?: Buffer;
}, options: {
  maxSize?: number;
  allowedTypes?: string[];
  allowedExtensions?: string[];
  scanContent?: boolean;
} = {}): SecurityValidationResult {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB
    allowedTypes = [],
    allowedExtensions = [],
    scanContent = false
  } = options;
  
  const result: SecurityValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    riskLevel: 'low'
  };
  
  // Size validation
  if (file.size > maxSize) {
    result.isValid = false;
    result.errors.push(`File size exceeds maximum allowed size of ${maxSize} bytes`);
    result.riskLevel = 'medium';
  }
  
  // File type validation
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    result.isValid = false;
    result.errors.push(`File type ${file.type} is not allowed`);
    result.riskLevel = 'medium';
  }
  
  // Extension validation
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (allowedExtensions.length > 0 && (!extension || !allowedExtensions.includes(extension))) {
    result.isValid = false;
    result.errors.push(`File extension .${extension} is not allowed`);
    result.riskLevel = 'medium';
  }
  
  // Dangerous file extensions
  const dangerousExtensions = [
    'exe', 'bat', 'cmd', 'com', 'pif', 'scr', 'vbs', 'js', 'jar',
    'php', 'asp', 'aspx', 'jsp', 'cgi', 'sh', 'ps1', 'py', 'rb'
  ];
  
  if (extension && dangerousExtensions.includes(extension)) {
    result.isValid = false;
    result.errors.push(`Dangerous file extension: .${extension}`);
    result.riskLevel = 'high';
  }
  
  // Filename validation
  const dangerousNames = [
    '..', '.htaccess', 'web.config', '.env', 'config', 'password',
    'secret', 'key', 'private', 'admin', 'root'
  ];
  
  const lowerName = file.name.toLowerCase();
  if (dangerousNames.some(name => lowerName.includes(name))) {
    result.warnings.push('Filename contains potentially dangerous keywords');
    result.riskLevel = 'medium';
  }
  
  // Content scanning (basic)
  if (scanContent && file.content) {
    const contentStr = file.content.toString('utf8', 0, Math.min(1024, file.content.length));
    
    if (detectSqlInjection(contentStr) || detectCommandInjection(contentStr)) {
      result.isValid = false;
      result.errors.push('File content contains potentially malicious code');
      result.riskLevel = 'critical';
    }
  }
  
  return result;
}

/**
 * Generates a security report for the application
 * @param auditData - Data to audit
 * @returns Security report
 */
function generateSecurityReport(auditData: {
  configurations?: Record<string, any>[];
  inputs?: any[];
  files?: any[];
}): {
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  issues: Array<{
    type: 'error' | 'warning';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    location?: string;
  }>;
  recommendations: string[];
} {
  const report = {
    overallRisk: 'low' as 'low' | 'medium' | 'high' | 'critical',
    issues: [] as Array<{
      type: 'error' | 'warning';
      severity: 'low' | 'medium' | 'high' | 'critical';
      message: string;
      location?: string;
    }>,
    recommendations: [] as string[]
  };
  
  // Audit configurations
  if (auditData.configurations) {
    auditData.configurations.forEach((config, index) => {
      const audit = auditConfiguration(config);
      audit.errors.forEach(error => {
        report.issues.push({
          type: 'error',
          severity: audit.riskLevel,
          message: error,
          location: `configuration[${index}]`
        });
      });
      
      audit.warnings.forEach(warning => {
        report.issues.push({
          type: 'warning',
          severity: 'low',
          message: warning,
          location: `configuration[${index}]`
        });
      });
    });
  }
  
  // Calculate overall risk
  const criticalIssues = report.issues.filter(i => i.severity === 'critical').length;
  const highIssues = report.issues.filter(i => i.severity === 'high').length;
  const mediumIssues = report.issues.filter(i => i.severity === 'medium').length;
  
  if (criticalIssues > 0) {
    report.overallRisk = 'critical';
  } else if (highIssues > 0) {
    report.overallRisk = 'high';
  } else if (mediumIssues > 0) {
    report.overallRisk = 'medium';
  }
  
  // Generate recommendations
  if (criticalIssues > 0) {
    report.recommendations.push('CRITICAL: Address critical security vulnerabilities immediately');
  }
  
  if (highIssues > 0) {
    report.recommendations.push('HIGH: Review and fix high-severity security issues');
  }
  
  if (mediumIssues > 0) {
    report.recommendations.push('MEDIUM: Implement additional security measures for medium-risk issues');
  }
  
  if (report.issues.length === 0) {
    report.recommendations.push('No security issues detected. Continue following security best practices.');
  }
  
  return report;
}

export {
  SecurityValidationResult,
  validateSecurity,
  auditConfiguration,
  validateFileUpload,
  generateSecurityReport,
  hasPrototypePollution
};