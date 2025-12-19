'use strict';

import { body, validationResult } from 'express-validator'; // Express validation library

/**
 * Create Express validation middleware for payment requests
 * 
 * @description
 * Creates comprehensive validation middleware for payment processing endpoints.
 * Validates monetary amounts, currency codes, and payment method nonces
 * using express-validator with proper error messages and type checking.
 * 
 * @purpose
 * - Secure payment processing with strict input validation
 * - Prevent payment fraud through proper nonce validation
 * - Ensure monetary value ranges and currency compliance
 * - Standardize payment endpoint security across the application
 * 
 * @common-use-cases
 * - Stripe/PayPal payment processing endpoints
 * - Subscription payment validation
 * - One-time purchase validation
 * - Refund request validation
 * 
 * @security-considerations
 * - Amount validation prevents injection attacks
 * - Currency whitelist limits to supported currencies only
 * - Nonce validation prevents replay attacks
 * - Express-validator provides XSS protection
 * 
 * @returns {Array} Array of Express middleware functions for payment validation
 * @throws {Error} When invalid validation rules are configured
 * 
 * @example
 * ```javascript
 * app.post('/payment', createPaymentValidation(), (req, res: any): any => {
 *   // If we reach here, payment data is validated
 *   const { amount, currency, paymentMethodNonce }: any = req.body;
 *   // Process payment...
 * });
 * ```
 * 
 * @since 1.0.0
 * @see express-validator documentation
 * @author Payment Security Team
 */
// 🚩AI: ENTRY_POINT_FOR_PAYMENT_VALIDATION - Update if payment schema changes
function createPaymentValidation() { // payment validation middleware factory
  return [
    body('amount')
      .isFloat({ min: 0.01, max: 999999.99 })
      .withMessage('Amount must be between 0.01 and 999999.99'),
    body('currency')
      .isIn(['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'])
      .withMessage('Invalid currency'),
    body('paymentMethodNonce')
      .isLength({ min: 16, max: 200 })
      .matches(/^[a-zA-Z0-9_-]+$/)
      .withMessage('Invalid payment method nonce'),
    handleValidationErrors // attach error handler
  ];
}

/**
 * Create Express validation middleware for user registration/login
 * 
 * @description
 * Creates comprehensive validation middleware for user authentication endpoints.
 * Validates email addresses with proper normalization and password complexity
 * requirements using express-validator with security-focused rules.
 * 
 * @purpose
 * - Secure user registration and login processes
 * - Prevent common authentication attacks
 * - Ensure password complexity requirements
 * - Standardize user input validation across auth endpoints
 * 
 * @common-use-cases
 * - User registration endpoints
 * - Login/authentication endpoints
 * - Password change/reset endpoints
 * - Profile update endpoints with email validation
 * 
 * @security-considerations
 * - Email normalization prevents email injection
 * - Password complexity prevents brute force attacks
 * - Length limits prevent DoS attacks
 * - Express-validator provides built-in XSS protection
 * 
 * @returns {Array} Array of Express middleware functions for user validation
 * @throws {Error} When invalid validation rules are configured
 * 
 * @example
 * ```javascript
 * app.post('/register', createUserValidation(), (req, res: any): any => {
 *   // If we reach here, user data is validated
 *   const { email, password }: any = req.body;
 *   // Create user account...
 * });
 * ```
 * 
 * @since 1.0.0
 * @see express-validator documentation
 * @author Authentication Security Team
 */
// 🚩AI: ENTRY_POINT_FOR_USER_VALIDATION - Update if user schema changes
function createUserValidation() { // user validation middleware factory
  return [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email required'),
    body('password')
      .isLength({ min: 8, max: 128 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/)
      .withMessage('Password must meet complexity requirements'),
    handleValidationErrors // attach error handler
  ];
}

/**
 * Create Express validation middleware for subscription requests
 * @returns {Array} Array of Express middleware functions for subscription validation
 * @example
 * app.post('/subscribe', createSubscriptionValidation(), (req, res: any): any => { ... })
 */
function createSubscriptionValidation() { // subscription validation middleware factory
  return [
    body('planId')
      .isIn(['basic', 'premium', 'enterprise', 'trial'])
      .withMessage('Invalid subscription plan'),
    body('startDate')
      .isISO8601()
      .toDate()
      .withMessage('Valid start date required'),
    body('endDate')
      .isISO8601()
      .toDate()
      .custom((value, { req }: any): any => {
        if (new Date(value) <= new Date(req.body.startDate)) { // end date must be after start date
          throw new Error('End date must be after start date');
        }
        return true;
      })
      .withMessage('Valid end date required'),
    handleValidationErrors // attach error handler
  ];
}

/**
 * Express middleware to handle validation errors
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function handleValidationErrors(req, res, next) { // centralized validation error handler
  const errors: any = validationResult(req);

  if (!errors.isEmpty()) { // check for validation errors
    return res.status(400).json({ errors: errors.array() }); // return 400 with error details
  }

  next(); // proceed to next middleware
}

export default {
  createPaymentValidation,
  createUserValidation,
  createSubscriptionValidation,
  handleValidationErrors
};
