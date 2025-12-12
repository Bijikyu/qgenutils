'use strict';

const { body, validationResult } = require('express-validator'); // Express validation library

/**
 * Create Express validation middleware for payment requests
 * @returns {Array} Array of Express middleware functions for payment validation
 * @example
 * app.post('/payment', createPaymentValidation(), (req, res) => { ... })
 */
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
 * @returns {Array} Array of Express middleware functions for user validation
 * @example
 * app.post('/register', createUserValidation(), (req, res) => { ... })
 */
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
 * app.post('/subscribe', createSubscriptionValidation(), (req, res) => { ... })
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
      .custom((value, { req }) => {
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
  const errors = validationResult(req);

  if (!errors.isEmpty()) { // check for validation errors
    return res.status(400).json({ errors: errors.array() }); // return 400 with error details
  }

  next(); // proceed to next middleware
}

module.exports = {
  createPaymentValidation,
  createUserValidation,
  createSubscriptionValidation,
  handleValidationErrors
};
