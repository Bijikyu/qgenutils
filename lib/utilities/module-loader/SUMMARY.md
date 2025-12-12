# Module Loader Utilities

Dynamic module loading with CJS/ESM interop normalization and caching.

## Files

| File | Purpose |
|------|---------|
| `loadAndFlattenModule.js` | Dynamic import with CJS/ESM normalization |
| `createCachedLoader.js` | Factory for cached async module loaders |
| `createSimpleLoader.js` | Factory for non-cached loaders |
| `createDirectLoader.js` | Factory for direct loaders without flattening |

## Usage

```javascript
const { loadAndFlattenModule, createCachedLoader } = require('./index');

// Direct load with CJS/ESM normalization
const qerrors = await loadAndFlattenModule('qerrors');

// Create cached loader for repeated use
const loadQerrors = createCachedLoader({ 
  moduleName: 'qerrors',
  fallbackValue: { log: () => {} }
});
const qerrors = await loadQerrors(); // cached on subsequent calls
```

## Key Features

- **CJS/ESM Interop**: Flattens default exports with named exports for consistent interface
- **Caching**: Optional module caching to avoid repeated dynamic imports
- **Concurrent Load Protection**: Pending promise reuse prevents duplicate loads
- **Graceful Fallback**: Returns null or custom fallback when module unavailable
