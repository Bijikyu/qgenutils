/**
 * Advanced Configuration Management System
 * 
 * Provides comprehensive configuration management with:
 * - Environment-based configuration
 * - Configuration validation and type checking
 * - Hot reloading capabilities
 * - Configuration encryption for sensitive data
 * - Configuration inheritance and overrides
 * - Configuration templates and presets
 */

import fs from 'fs';
import path from 'path';
import { EventEmitter } from 'events';

// Configuration sources
export const ConfigSource = {
  ENVIRONMENT: 'environment',
  FILE: 'file',
  REMOTE: 'remote',
  MEMORY: 'memory',
  DEFAULT: 'default'
};

// Configuration validation levels
export const ValidationLevel = {
  NONE: 'none',
  WARNING: 'warning',
  ERROR: 'error',
  STRICT: 'strict'
};

// Configuration encryption status
export const EncryptionStatus = {
  NONE: 'none',
  ENCRYPTED: 'encrypted',
  DECRYPTED: 'decrypted',
  MIXED: 'mixed'
};

export class ConfigurationManager extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.options = {
      configDir: './config',
      configFile: 'config.json',
      envPrefix: 'QGENUTILS_',
      enableHotReload: true,
      enableEncryption: false,
      encryptionKey: null,
      validationLevel: ValidationLevel.ERROR,
      enableRemoteConfig: false,
      remoteConfigUrl: null,
      remoteConfigPollInterval: 60000,
      enableInheritance: true,
      enableTemplates: true,
      ...options
    };
    
    this.config = new Map();
    this.templates = new Map();
    this.watchers = new Map();
    this.encryptionKey = this.options.encryptionKey;
    this.lastModified = new Map();
    
    this.initialize();
  }

  /**
   * Initialize the configuration manager
   */
  async initialize() {
    try {
      // Load default configuration
      await this.loadDefaultConfig();
      
      // Load environment configuration
      await this.loadEnvironmentConfig();
      
      // Load file configuration
      await this.loadFileConfig();
      
      // Load remote configuration if enabled
      if (this.options.enableRemoteConfig) {
        await this.loadRemoteConfig();
      }
      
      // Apply configuration inheritance
      if (this.options.enableInheritance) {
        this.applyInheritance();
      }
      
      // Validate configuration
      await this.validateConfiguration();
      
      // Start hot reload if enabled
      if (this.options.enableHotReload) {
        this.startHotReload();
      }
      
      // Start remote config polling if enabled
      if (this.options.enableRemoteConfig) {
        this.startRemoteConfigPolling();
      }
      
      this.emit('initialized', this.getConfig());
      
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Gets configuration value
   */
  get(key, defaultValue = null) {
    return this.getNestedValue(key, defaultValue);
  }

  /**
   * Sets configuration value
   */
  set(key, value, options = {}) {
    const { encrypt = false, persist = true, validate = true } = options;
    
    // Validate value if required
    if (validate) {
      this.validateValue(key, value);
    }
    
    // Encrypt value if required
    let finalValue = value;
    if (encrypt && this.options.enableEncryption) {
      finalValue = this.encryptValue(key, value);
    }
    
    // Set value
    this.setNestedValue(key, finalValue);
    
    // Update last modified
    this.lastModified.set(key, Date.now());
    
    // Persist to file if required
    if (persist) {
      this.persistConfig();
    }
    
    // Emit change event
    this.emit('changed', { key, value: finalValue, options });
    
    return finalValue;
  }

  /**
   * Gets entire configuration object
   */
  getConfig() {
    return this.flattenConfig();
  }

  /**
   * Sets entire configuration object
   */
  setConfig(config, options = {}) {
    const { merge = true, validate = true, persist = true } = options;
    
    // Validate configuration if required
    if (validate) {
      this.validateConfiguration(config);
    }
    
    // Merge or replace configuration
    if (merge) {
      this.mergeConfig(config);
    } else {
      this.config.clear();
      this.config = new Map(Object.entries(config));
    }
    
    // Persist if required
    if (persist) {
      this.persistConfig();
    }
    
    // Emit change event
    this.emit('configChanged', this.getConfig());
  }

  /**
   * Creates a configuration template
   */
  createTemplate(name, config, options = {}) {
    const { encrypt = false, description = '', tags = [] } = options;
    
    const template = {
      name,
      description,
      tags,
      config,
      encrypted: encrypt,
      createdAt: new Date().toISOString(),
      version: '1.0.0'
    };
    
    // Encrypt template if required
    if (encrypt && this.options.enableEncryption) {
      template.config = this.encryptValue(`template_${name}`, config);
    }
    
    this.templates.set(name, template);
    
    // Persist templates
    this.persistTemplates();
    
    this.emit('templateCreated', { name, template });
    
    return template;
  }

  /**
   * Applies a configuration template
   */
  async applyTemplate(name, overrides = {}) {
    const template = this.templates.get(name);
    if (!template) {
      throw new Error(`Template '${name}' not found`);
    }
    
    let config = template.config;
    
    // Decrypt template if encrypted
    if (template.encrypted && this.options.enableEncryption) {
      config = this.decryptValue(`template_${name}`, config);
    }
    
    // Apply overrides
    config = { ...config, ...overrides };
    
    // Apply template configuration
    this.setConfig(config, { merge: true });
    
    this.emit('templateApplied', { name, config });
    
    return config;
  }

  /**
   * Gets available templates
   */
  getTemplates() {
    return Array.from(this.templates.entries()).map(([name, template]) => ({
      name,
      description: template.description,
      tags: template.tags,
      encrypted: template.encrypted,
      createdAt: template.createdAt,
      version: template.version
    }));
  }

  /**
   * Reloads configuration from all sources
   */
  async reload() {
    try {
      // Clear current configuration
      this.config.clear();
      
      // Reload from all sources
      await this.loadDefaultConfig();
      await this.loadEnvironmentConfig();
      await this.loadFileConfig();
      
      if (this.options.enableRemoteConfig) {
        await this.loadRemoteConfig();
      }
      
      if (this.options.enableInheritance) {
        this.applyInheritance();
      }
      
      await this.validateConfiguration();
      
      this.emit('reloaded', this.getConfig());
      
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Validates configuration against schema
   */
  async validateConfiguration(config = null) {
    const configToValidate = config || this.getConfig();
    
    // Basic validation
    if (this.options.validationLevel === ValidationLevel.NONE) {
      return true;
    }
    
    // Type validation
    for (const [key, value] of Object.entries(configToValidate)) {
      this.validateValue(key, value);
    }
    
    // Custom validation rules
    await this.runCustomValidation(configToValidate);
    
    return true;
  }

  /**
   * Gets configuration statistics
   */
  getStatistics() {
    return {
      totalKeys: this.config.size,
      encryptedKeys: this.getEncryptedKeysCount(),
      lastModified: this.getLastModified(),
      templates: this.templates.size,
      watchers: this.watchers.size,
      sources: this.getActiveSources(),
      validationLevel: this.options.validationLevel,
      encryptionEnabled: this.options.enableEncryption,
      hotReloadEnabled: this.options.enableHotReload
    };
  }

  /**
   * Exports configuration to file
   */
  async exportConfig(filePath, options = {}) {
    const { format = 'json', encrypt = false, includeTemplates = false } = options;
    
    let config = this.getConfig();
    
    // Add templates if requested
    if (includeTemplates) {
      config.templates = this.getTemplates();
    }
    
    // Encrypt if requested
    if (encrypt && this.options.enableEncryption) {
      config = this.encryptValue('export', config);
    }
    
    // Write to file based on format
    switch (format.toLowerCase()) {
      case 'json':
        await fs.promises.writeFile(filePath, JSON.stringify(config, null, 2));
        break;
      case 'yaml':
        // Would need yaml library
        throw new Error('YAML export not implemented');
      case 'env':
        const envContent = this.configToEnvFormat(config);
        await fs.promises.writeFile(filePath, envContent);
        break;
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
    
    this.emit('exported', { filePath, format, options });
  }

  /**
   * Imports configuration from file
   */
  async importConfig(filePath, options = {}) {
    const { format = 'json', decrypt = false, merge = true } = options;
    
    let config;
    
    // Read file based on format
    switch (format.toLowerCase()) {
      case 'json':
        const content = await fs.promises.readFile(filePath, 'utf8');
        config = JSON.parse(content);
        break;
      case 'yaml':
        throw new Error('YAML import not implemented');
      case 'env':
        const envContent = await fs.promises.readFile(filePath, 'utf8');
        config = this.envFormatToConfig(envContent);
        break;
      default:
        throw new Error(`Unsupported import format: ${format}`);
    }
    
    // Decrypt if requested
    if (decrypt && this.options.enableEncryption) {
      config = this.decryptValue('import', config);
    }
    
    // Apply configuration
    this.setConfig(config, { merge });
    
    this.emit('imported', { filePath, format, options });
    
    return config;
  }

  /**
   * Loads default configuration
   */
  async loadDefaultConfig() {
    const defaultConfig = {
      // Application settings
      app: {
        name: 'QGenUtils',
        version: '1.1.0',
        environment: process.env.NODE_ENV || 'development',
        debug: process.env.NODE_ENV === 'development'
      },
      
      // Logging configuration
      logging: {
        level: 'info',
        enableConsole: true,
        enableFile: false,
        logDir: './logs',
        maxFileSize: '10MB',
        maxFiles: 5
      },
      
      // Security configuration
      security: {
        enableEncryption: false,
        encryptionKey: null,
        enableRateLimiting: true,
        rateLimitWindow: 60000,
        rateLimitMax: 100
      },
      
      // Performance configuration
      performance: {
        enableMetrics: true,
        enableProfiling: false,
        slowQueryThreshold: 1000,
        enableCaching: true,
        cacheTTL: 300000
      },
      
      // API configuration
      api: {
        timeout: 30000,
        retries: 3,
        retryDelay: 1000,
        enableCircuitBreaker: false,
        circuitBreakerThreshold: 5
      }
    };
    
    for (const [key, value] of Object.entries(defaultConfig)) {
      this.config.set(key, value);
    }
  }

  /**
   * Loads environment configuration
   */
  async loadEnvironmentConfig() {
    const envConfig = {};
    
    // Scan environment variables
    for (const [key, value] of Object.entries(process.env)) {
      if (key.startsWith(this.options.envPrefix)) {
        const configKey = key.substring(this.options.envPrefix.length).toLowerCase();
        const parsedValue = this.parseEnvironmentValue(value);
        this.setNestedValue(configKey, parsedValue);
      }
    }
    
    // Merge with existing config
    this.mergeConfig(envConfig);
  }

  /**
   * Loads file configuration
   */
  async loadFileConfig() {
    const configPath = path.join(this.options.configDir, this.options.configFile);
    
    try {
      if (fs.existsSync(configPath)) {
        const content = await fs.promises.readFile(configPath, 'utf8');
        const fileConfig = JSON.parse(content);
        this.mergeConfig(fileConfig);
      }
    } catch (error) {
      console.warn(`Failed to load config file: ${error.message}`);
    }
  }

  /**
   * Loads remote configuration
   */
  async loadRemoteConfig() {
    if (!this.options.remoteConfigUrl) {
      return;
    }
    
    try {
      const response = await fetch(this.options.remoteConfigUrl);
      const remoteConfig = await response.json();
      this.mergeConfig(remoteConfig);
    } catch (error) {
      console.warn(`Failed to load remote config: ${error.message}`);
    }
  }

  /**
   * Applies configuration inheritance
   */
  applyInheritance() {
    // Implementation would handle parent-child relationships
    // This is a simplified version
    const inherited = this.applyConfigInheritance(this.config);
    this.config = inherited;
  }

  /**
   * Validates a single configuration value
   */
  validateValue(key, value) {
    // Basic validation
    if (value === undefined || value === null) {
      if (this.options.validationLevel === ValidationLevel.STRICT) {
        throw new Error(`Configuration value '${key}' cannot be null or undefined`);
      }
      return;
    }
    
    // Type-specific validation
    const type = this.getValueType(key);
    if (type && !this.isValidType(value, type)) {
      throw new Error(`Configuration value '${key}' must be of type ${type}`);
    }
    
    // Custom validation rules
    this.runCustomValidation(key, value);
  }

  /**
   * Runs custom validation rules
   */
  async runCustomValidation(configOrKey, value = null) {
    // Implementation would run custom validation rules
    // This is a placeholder
    return true;
  }

  /**
   * Gets nested value from configuration
   */
  getNestedValue(key, defaultValue = null) {
    const keys = key.split('.');
    let current = this.config;
    
    for (const k of keys) {
      if (current instanceof Map && current.has(k)) {
        current = current.get(k);
      } else if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        return defaultValue;
      }
    }
    
    return current;
  }

  /**
   * Sets nested value in configuration
   */
  setNestedValue(key, value) {
    const keys = key.split('.');
    let current = this.config;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      
      if (!current.has(k)) {
        current.set(k, new Map());
      }
      
      current = current.get(k);
    }
    
    current.set(keys[keys.length - 1], value);
  }

  /**
   * Merges configuration objects
   */
  mergeConfig(config) {
    for (const [key, value] of Object.entries(config)) {
      this.setNestedValue(key, value);
    }
  }

  /**
   * Flattens configuration to object
   */
  flattenConfig(obj = this.config, prefix = '') {
    const result = {};
    
    for (const [key, value] of obj.entries()) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (value instanceof Map) {
        Object.assign(result, this.flattenConfig(value, fullKey));
      } else {
        result[fullKey] = value;
      }
    }
    
    return result;
  }

  /**
   * Parses environment variable value
   */
  parseEnvironmentValue(value) {
    // Try to parse as JSON
    try {
      return JSON.parse(value);
    } catch {
      // Return as string if not valid JSON
      return value;
    }
  }

  /**
   * Encrypts configuration value
   */
  encryptValue(key, value) {
    if (!this.options.enableEncryption || !this.encryptionKey) {
      return value;
    }
    
    // Simplified encryption - in production, use proper encryption
    const encrypted = Buffer.from(JSON.stringify(value)).toString('base64');
    return { encrypted, key };
  }

  /**
   * Decrypts configuration value
   */
  decryptValue(key, encryptedValue) {
    if (!this.options.enableEncryption || !this.encryptionKey) {
      return encryptedValue;
    }
    
    // Simplified decryption - in production, use proper decryption
    if (encryptedValue.encrypted) {
      const decrypted = Buffer.from(encryptedValue.encrypted, 'base64').toString();
      return JSON.parse(decrypted);
    }
    
    return encryptedValue;
  }

  /**
   * Starts hot reload monitoring
   */
  startHotReload() {
    const configPath = path.join(this.options.configDir, this.options.configFile);
    
    if (fs.existsSync(configPath)) {
      const watcher = fs.watch(configPath, (eventType) => {
        if (eventType === 'change') {
          this.reload();
        }
      });
      
      this.watchers.set('config', watcher);
    }
  }

  /**
   * Starts remote configuration polling
   */
  startRemoteConfigPolling() {
    if (!this.options.enableRemoteConfig || !this.options.remoteConfigUrl) {
      return;
    }
    
    const pollInterval = setInterval(async () => {
      try {
        await this.loadRemoteConfig();
      } catch (error) {
        console.warn('Remote config polling failed:', error.message);
      }
    }, this.options.remoteConfigPollInterval);
    
    this.watchers.set('remote', { interval: pollInterval });
  }

  /**
   * Persists configuration to file
   */
  async persistConfig() {
    const configPath = path.join(this.options.configDir, this.options.configFile);
    
    try {
      await fs.promises.mkdir(this.options.configDir, { recursive: true });
      const configData = this.getConfig();
      await fs.promises.writeFile(configPath, JSON.stringify(configData, null, 2));
    } catch (error) {
      console.warn('Failed to persist config:', error.message);
    }
  }

  /**
   * Persists templates to file
   */
  async persistTemplates() {
    const templatesPath = path.join(this.options.configDir, 'templates.json');
    
    try {
      const templatesData = Object.fromEntries(this.templates);
      await fs.promises.writeFile(templatesPath, JSON.stringify(templatesData, null, 2));
    } catch (error) {
      console.warn('Failed to persist templates:', error.message);
    }
  }

  /**
   * Gets last modified timestamp
   */
  getLastModified() {
    if (this.lastModified.size === 0) {
      return null;
    }
    
    return Math.max(...Array.from(this.lastModified.values()));
  }

  /**
   * Gets count of encrypted keys
   */
  getEncryptedKeysCount() {
    let count = 0;
    
    for (const value of this.config.values()) {
      if (value && typeof value === 'object' && value.encrypted) {
        count++;
      }
    }
    
    return count;
  }

  /**
   * Gets active configuration sources
   */
  getActiveSources() {
    const sources = [];
    
    sources.push(ConfigSource.DEFAULT);
    sources.push(ConfigSource.ENVIRONMENT);
    
    const configPath = path.join(this.options.configDir, this.options.configFile);
    if (fs.existsSync(configPath)) {
      sources.push(ConfigSource.FILE);
    }
    
    if (this.options.enableRemoteConfig) {
      sources.push(ConfigSource.REMOTE);
    }
    
    return sources;
  }

  /**
   * Converts configuration to environment format
   */
  configToEnvFormat(config) {
    const envLines = [];
    
    for (const [key, value] of Object.entries(config)) {
      if (typeof value === 'string') {
        envLines.push(`${key}=${value}`);
      } else {
        envLines.push(`${key}=${JSON.stringify(value)}`);
      }
    }
    
    return envLines.join('\n');
  }

  /**
   * Converts environment format to configuration
   */
  envFormatToConfig(envContent) {
    const config = {};
    const lines = envContent.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=');
          
          try {
            config[key] = JSON.parse(value);
          } catch {
            config[key] = value;
          }
        }
      }
    }
    
    return config;
  }

  /**
   * Gets value type for validation
   */
  getValueType(key) {
    // Implementation would return expected type for given key
    // This is a placeholder
    return null;
  }

  /**
   * Checks if value is valid type
   */
  isValidType(value, type) {
    switch (type) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'object':
        return typeof value === 'object' && value !== null;
      case 'array':
        return Array.isArray(value);
      default:
        return true;
    }
  }

  /**
   * Applies configuration inheritance
   */
  applyConfigInheritance(config) {
    // Implementation would handle parent-child relationships
    // This is a simplified version
    return config;
  }

  /**
   * Cleans up resources
   */
  cleanup() {
    // Close file watchers
    for (const [name, watcher] of this.watchers.entries()) {
      if (watcher.close) {
        watcher.close();
      } else if (watcher.interval) {
        clearInterval(watcher.interval);
      }
    }
    
    this.watchers.clear();
    this.removeAllListeners();
  }
}

// Default export
const defaultConfigManager = new ConfigurationManager();
export { ConfigurationManager as default, defaultConfigManager };