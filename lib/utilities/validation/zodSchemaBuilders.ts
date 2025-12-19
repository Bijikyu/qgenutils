'use strict';

import { z } from 'zod';
const zodStringValidators: any = require('./zodStringValidators');

/**
 * Common Zod schema builders for complex validation scenarios
 * Provides factory functions for creating reusable schemas
 * @module zodSchemaBuilders
 */
const zodSchemaBuilders = {
  /**
   * Creates a standard data schema with string validation
   * @param {Object.<string, string>} fields - Field names mapped to descriptions
   * @returns {z.ZodObject} Zod object schema
   * @example
   * const schema: any = zodSchemaBuilders.dataWithStrings({ name: 'User name', email: 'Email address' });
   */
  dataWithStrings: (fields: any): any => { // build schema from field descriptions
    const schemaFields: any = {};
    Object.entries(fields).forEach(([fieldName, description]: any): any => {
      schemaFields[fieldName] = zodStringValidators.nonEmpty(fieldName, description);
    });
    return z.object(schemaFields);
  },

  /**
   * Creates credential schema for API services
   * @param {string} serviceName - Name of the service
   * @param {string[]} fields - Array of field names
   * @returns {z.ZodObject} Zod object schema for credentials
   * @example
   * const schema: any = zodSchemaBuilders.credentials('Stripe', ['apiKey', 'webhookSecret']);
   */
  credentials: (serviceName, fields: any): any => { // build API credentials schema
    const schemaFields: any = {};
    fields.forEach(field => {
      schemaFields[field] = zodStringValidators.apiKey(`${serviceName} ${field}`);
    });
    return z.object(schemaFields);
  },

  /**
   * Creates a schema with optional fields having defaults
   * @param {Object} config - Schema configuration
   * @param {Object} config.required - Required field schemas
   * @param {Object} config.optional - Optional field schemas with defaults
   * @returns {z.ZodObject} Zod object schema
   */
  withDefaults: (config: any): any => { // build schema with optional defaults
    const { required = {}, optional = {} } = config;
    const schemaFields: any = { ...required };

    Object.entries(optional).forEach(([field, { schema, defaultValue }]: any): any => {
      schemaFields[field] = schema.default(defaultValue);
    });

    return z.object(schemaFields);
  },

  /**
   * Creates a union schema from multiple schemas
   * @param {z.ZodSchema[]} schemas - Array of Zod schemas
   * @returns {z.ZodUnion} Zod union schema
   */
  union: (schemas: any): any => { // build union schema
    if (schemas.length < 2) {
      throw new Error('Union requires at least 2 schemas');
    }
    return z.union(schemas);
  },

  /**
   * Creates pagination schema
   * @param {Object} [options] - Pagination options
   * @param {number} [options.defaultPage=1] - Default page number
   * @param {number} [options.defaultLimit=20] - Default page size
   * @param {number} [options.maxLimit=100] - Maximum page size
   * @returns {z.ZodObject} Zod pagination schema
   */
  pagination: (options: any = {}): any => { // build pagination schema
    const { defaultPage = 1, defaultLimit = 20, maxLimit = 100 }: any = options;
    return z.object({
      page: z.number().int().positive().default(defaultPage),
      limit: z.number().int().positive().max(maxLimit).default(defaultLimit)
    });
  }
};

export default zodSchemaBuilders;
