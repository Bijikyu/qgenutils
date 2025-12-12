# Validation Utilities

Input validation utilities with XSS prevention, sanitization, and Express middleware integration.

## Files

| File | Purpose |
|------|---------|
| `validateEmail.js` | RFC 5322 email validation using validator library |
| `validatePassword.js` | Password strength validation with complexity requirements |
| `validateAmount.js` | Monetary amount validation with business rules |
| `validateApiKey.js` | API key format and structure validation |
| `validateCurrency.js` | ISO 4217 currency code validation |
| `validatePaymentMethodNonce.js` | Braintree payment nonce validation |
| `validateDateRange.js` | Date range validation using date-fns |
| `validateSubscriptionPlan.js` | Subscription plan validation |
| `sanitizeInput.js` | XSS prevention with sanitize-html |
| `createValidationMiddleware.js` | Express middleware factories |
| `extractValidationErrors.js` | Express-validator error extraction |

## Dependencies

- `validator` - Email and string validation
- `date-fns` - Date manipulation
- `sanitize-html` - XSS prevention
- `express-validator` - Express middleware

## Data Flows

### Input → Validation → Result

1. Input received from user/API
2. Type checking and normalization
3. Business rule validation
4. Return boolean or detailed result object

### Request → Middleware → Response

1. Express request received
2. Validation middleware runs
3. If errors: 400 response with details
4. If valid: next() called

## Edge Cases

- All validators handle null/undefined/wrong types
- Email: Max 254 chars per RFC 5321
- Password: 8-128 chars, requires uppercase, lowercase, number, special
- Amount: Must be number (not string), max 2 decimals, max 999999.99
- Date range: Max 365 days, end date cannot be in future
- API key: 32-128 chars, alphanumeric only

## Security Notes

- `timingSafeCompare` should be used when comparing API keys in production
- `sanitizeInput` strips all HTML tags by default
- Password validation never logs the actual password value
