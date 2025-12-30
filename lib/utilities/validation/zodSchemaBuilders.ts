'use strict';

import { z } from 'zod';
import zodStringValidators from './zodStringValidators.js';

/**
 * SCALABILITY FIX: Cached Zod schema builders for complex validation scenarios
 * Provides factory functions for creating reusable schemas with caching to prevent
 * repeated schema compilation overhead.
 * @module zodSchemaBuilders
 */

// Schema cache to prevent repeated compilation
const schemaCache = new Map<string, z.ZodSchema>();

// Maximum cache size to prevent memory leaks
const MAX_CACHE_SIZE = 1000;

/**
 * Generate cache key from schema parameters
 */
function generateCacheKey(type: string, params: any): string {
  return `${type}:${JSON.stringify(params)}`;
}

/**
 * Get or create cached schema
 */
function getCachedSchema<T extends z.ZodSchema>(
  key: string, 
  factory: () => T
): T {
  if (schemaCache.has(key)) {
    return schemaCache.get(key) as T;
  }

  // Implement LRU eviction if cache is full
  if (schemaCache.size >= MAX_CACHE_SIZE) {
    const firstKey = schemaCache.keys().next().value;
    if (firstKey !== undefined) {
      schemaCache.delete(firstKey);
    }
  }

  const schema = factory();
  schemaCache.set(key, schema);
  return schema;
}

/**
 * Clear schema cache (useful for testing or memory management)
 */
export function clearSchemaCache(): void {
  schemaCache.clear();
}

/**
 * Get schema cache statistics
 */
export function getSchemaCacheStats(): { size: number; maxSize: number } {
  return {
    size: schemaCache.size,
    maxSize: MAX_CACHE_SIZE
  };
}

const zodSchemaBuilders = {
  /**
   * Creates a standard data schema with string validation (CACHED)
   * @param {Object.<string, string>} fields - Field names mapped to descriptions
   * @returns {z.ZodObject} Zod object schema
   * @example
   * const schema: any = zodSchemaBuilders.dataWithStrings({ name: 'User name', email: 'Email address' });
   */
  dataWithStrings: (fields: any): any => {
    const cacheKey = generateCacheKey('dataWithStrings', fields);
    
    return getCachedSchema(cacheKey, () => {
      const schemaFields: any = {};
      Object.entries(fields).forEach(([fieldName, description]: any): any => {
        schemaFields[fieldName] = zodStringValidators.nonEmpty(fieldName, description);
      });
      return z.object(schemaFields);
    });
  },

  /**
   * Creates credential schema for API services (CACHED)
   * @param {string} serviceName - Name of the service
   * @param {string[]} fields - Array of field names
   * @returns {z.ZodObject} Zod object schema for credentials
   * @example
   * const schema: any = zodSchemaBuilders.credentials('Stripe', ['apiKey', 'webhookSecret']);
   */
  credentials: (serviceName: string, fields: any[]): any => {
    const cacheKey = generateCacheKey('credentials', { serviceName, fields });
    
    return getCachedSchema(cacheKey, () => {
      const schemaFields: any = {};
      fields.forEach(field => {
        schemaFields[field] = zodStringValidators.apiKey(`${serviceName} ${field}`);
      });
      return z.object(schemaFields);
    });
  },

  /**
   * Creates a schema with optional fields having defaults (CACHED)
   * @param {Object} config - Schema configuration
   * @param {Object} config.required - Required field schemas
   * @param {Object} config.optional - Optional field schemas with defaults
   * @returns {z.ZodObject} Zod object schema
   */
  withDefaults: (config: any): any => {
    const cacheKey = generateCacheKey('withDefaults', config);
    
    return getCachedSchema(cacheKey, () => {
      const { required = {}, optional = {} } = config;
      const schemaFields: any = { ...required };

      Object.entries(optional).forEach(([field, { schema, defaultValue }]: any): any => {
        schemaFields[field] = schema.default(defaultValue);
      });

      return z.object(schemaFields);
    });
  },

  /**
   * Creates a union schema from multiple schemas (CACHED)
   * @param {z.ZodSchema[]} schemas - Array of Zod schemas
   * @returns {z.ZodUnion} Zod union schema
   */
  union: (schemas: any[]): any => {
    const cacheKey = generateCacheKey('union', { schemaCount: schemas.length });
    
    return getCachedSchema(cacheKey, () => {
      if (schemas.length < 2) {
        throw new Error('Union requires at least 2 schemas');
      }
      return z.union([schemas[0], schemas[1], ...schemas.slice(2)]);
    });
  },

  /**
   * Creates pagination schema (CACHED)
   * @param {Object} [options] - Pagination options
   * @param {number} [options.defaultPage=1] - Default page number
   * @param {number} [options.defaultLimit=20] - Default page size
   * @param {number} [options.maxLimit=100] - Maximum page size
   * @returns {z.ZodObject} Zod pagination schema
   */
  pagination: (options: any = {}): any => {
    const cacheKey = generateCacheKey('pagination', options);
    
    return getCachedSchema(cacheKey, () => {
      const { defaultPage = 1, defaultLimit = 20, maxLimit = 100 }: any = options;
      return z.object({
        page: z.number().int().positive().default(defaultPage),
        limit: z.number().int().positive().max(maxLimit).default(defaultLimit)
      });
    });
  }
};

export default zodSchemaBuilders;