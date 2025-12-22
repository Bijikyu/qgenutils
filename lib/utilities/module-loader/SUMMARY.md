# Module Loader Utilities

Dynamic module loading with CJS/ESM interop normalization, caching, and lifecycle management.

## Files

| File | Purpose |
|------|---------|
| `loadAndFlattenModule.ts` | Dynamic import with CJS/ESM normalization |
| `createCachedLoader.ts` | Factory for cached async module loaders |
| `createSimpleLoader.ts` | Factory for non-cached loaders |
| `createDirectLoader.ts` | Factory for direct loaders without flattening |
| `DynamicImportCache.ts` | Advanced cache manager with LRU eviction, stats, pre-caching |
| `index.ts` | Barrel exports for all module loader utilities |

## DynamicImportCache (Advanced)

Full-featured cache manager for dynamic imports with:

- **LRU Eviction**: Least recently used modules evicted when cache is full
- **Timeout Expiry**: Modules expire after configurable timeout (default: 5 minutes)
- **Hit/Miss Statistics**: Track cache performance with getStats()
- **Pre-caching**: Warm up cache at startup with common modules
- **Database Mapping**: Maps database types to npm package names
- **Lifecycle Management**: Proper shutdown with cleanup interval disposal

```javascript
import { 
  DynamicImportCache, 
  getDynamicModule, 
  getDatabaseModule,
  preCacheDynamicModules,
  getDynamicImportCacheStats,
  shutdownDynamicImportCache
} from './module-loader';

// Use singleton convenience functions
await preCacheDynamicModules(); // Pre-cache common modules at startup
const fs = await getDynamicModule('fs');
const pg = await getDatabaseModule('postgresql'); // Maps to 'pg' package
console.log(getDynamicImportCacheStats()); // { size, hitRate, hitCount, missCount }

// Or create custom cache instances
const cache = new DynamicImportCache({
  maxCacheSize: 50,
  cacheTimeoutMs: 10 * 60 * 1000, // 10 minutes
  cleanupIntervalMs: 60 * 1000,    // Cleanup every minute
  flattenModules: true             // Apply CJS/ESM normalization
});

const module = await cache.getModule('some-module');
cache.shutdown(); // Clean up on application exit
```

## Basic Loaders

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
- **Simple Caching**: createCachedLoader for basic caching needs
- **Advanced Caching**: DynamicImportCache for LRU, expiry, stats, pre-caching
- **Concurrent Load Protection**: Pending promise reuse prevents duplicate loads
- **Graceful Fallback**: Returns null or custom fallback when module unavailable
- **Database Module Mapping**: Translates db types (postgresql, mysql, etc.) to npm packages
