# Password Utilities

Secure password hashing, verification, and generation using bcrypt.

## Files

| File | Purpose |
|------|---------|
| `hashPassword.js` | bcrypt hashing with 12 salt rounds |
| `verifyPassword.js` | Constant-time password comparison |
| `generateSecurePassword.js` | Cryptographically secure password generation |

## Usage

```javascript
const { hashPassword, verifyPassword, generateSecurePassword } = require('./index');

// Hash a password
const hash = await hashPassword('MySecurePass123');

// Verify password
const isValid = await verifyPassword('MySecurePass123', hash);

// Generate secure random password
const newPassword = generateSecurePassword(16, { includeSpecial: true });
```

## Security Features

- bcrypt with 12 salt rounds (OWASP recommended minimum)
- Constant-time comparison prevents timing attacks
- Cryptographically secure random generation (crypto.randomBytes)
- Input validation without information leakage
- Password length limits (8-128 characters)
