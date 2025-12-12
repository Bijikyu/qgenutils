# Secure Config Utilities

Secure configuration management with validation and credential protection.

## Files

| File | Purpose |
|------|---------|
| `maskSensitiveValue.js` | Mask credentials for safe logging |
| `validateConfigValue.js` | Validate config values against schema |
| `buildSecureConfig.js` | Build validated config using convict |

## Usage

```javascript
const { maskSensitiveValue, validateConfigValue, buildSecureConfig } = require('./index');

// Mask sensitive values for logging
const masked = maskSensitiveValue('sk_live_abc123xyz', 'API_KEY');
// 'sk**********yz'

// Validate a config value
const result = validateConfigValue(8080, { type: 'number', min: 1, max: 65535 });

// Build validated config from env
const config = buildSecureConfig({
  PORT: { format: 'port', default: 5000 },
  NODE_ENV: { format: ['development', 'production'], default: 'development' }
});
```

## Security Features

- Credential masking for safe logging (shows first/last 2 chars)
- Type validation with min/max/enum constraints
- Convict-based strict validation
- Secure defaults enforcement
