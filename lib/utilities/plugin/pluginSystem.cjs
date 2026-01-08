/**
 * Plugin System for QGenUtils
 * 
 * Provides extensible architecture with:
 * - Plugin registration and discovery
 * - Plugin lifecycle management
 * - Plugin configuration and dependencies
 * - Plugin communication and events
 * - Plugin validation and security
 */

import { EventEmitter } from 'events';

// Plugin status
export const PluginStatus = {
  REGISTERED: 'registered',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ERROR: 'error',
  DISABLED: 'disabled'
};

// Plugin types
export const PluginType = {
  VALIDATOR: 'validator',
  MIDDLEWARE: 'middleware',
  UTILITY: 'utility',
  LOGGER: 'logger',
  CONFIGURATION: 'configuration',
  SECURITY: 'security',
  PERFORMANCE: 'performance',
  EXTENSION: 'extension'
};

// Plugin interface
export class Plugin {
  constructor(options = {}) {
    this.name = options.name || 'unknown';
    this.version = options.version || '1.0.0';
    this.description = options.description || '';
    this.author = options.author || 'unknown';
    this.type = options.type || PluginType.UTILITY;
    this.dependencies = options.dependencies || [];
    this.config = options.config || {};
    this.status = PluginStatus.REGISTERED;
    this.instance = null;
    this.hooks = options.hooks || {};
    this.metadata = options.metadata || {};
  }

  // Plugin lifecycle methods
  async initialize(config = {}) {
    this.config = { ...this.config, ...config };
    this.status = PluginStatus.ACTIVE;
    return true;
  }

  async activate() {
    if (this.status === PluginStatus.DISABLED) {
      return false;
    }
    this.status = PluginStatus.ACTIVE;
    return true;
  }

  async deactivate() {
    this.status = PluginStatus.INACTIVE;
    return true;
  }

  async destroy() {
    this.status = PluginStatus.DISABLED;
    this.instance = null;
    return true;
  }

  // Plugin methods
  async execute(...args) {
    throw new Error(`Plugin ${this.name} does not implement execute method`);
  }

  // Plugin hooks
  async onHook(hookName, ...args) {
    if (this.hooks[hookName]) {
      return await this.hooks[hookName](...args);
    }
  }

  // Plugin validation
  validate() {
    const errors = [];
    
    if (!this.name) {
      errors.push('Plugin name is required');
    }
    
    if (!this.version) {
      errors.push('Plugin version is required');
    }
    
    if (!Object.values(PluginType).includes(this.type)) {
      errors.push(`Invalid plugin type: ${this.type}`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Plugin information
  getInfo() {
    return {
      name: this.name,
      version: this.version,
      description: this.description,
      author: this.author,
      type: this.type,
      status: this.status,
      dependencies: this.dependencies,
      config: this.config,
      metadata: this.metadata,
      hooks: Object.keys(this.hooks)
    };
  }
}

export class PluginManager extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.options = {
      enableValidation: true,
      enableSecurity: true,
      maxPlugins: 100,
      enableHotReload: false,
      pluginDirs: ['./plugins'],
      ...options
    };
    
    this.plugins = new Map();
    this.pluginOrder = [];
    this.hooks = new Map();
    this.config = options.config || {};
    
    this.initialize();
  }

  /**
   * Initialize the plugin manager
   */
  async initialize() {
    try {
      // Load built-in plugins
      await this.loadBuiltinPlugins();
      
      // Load external plugins
      await this.loadExternalPlugins();
      
      // Initialize hooks
      this.initializeHooks();
      
      // Activate all plugins
      await this.activateAllPlugins();
      
      this.emit('initialized', {
        pluginCount: this.plugins.size,
        plugins: Array.from(this.plugins.values()).map(p => p.getInfo())
      });
      
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Registers a plugin
   */
  async registerPlugin(plugin, options = {}) {
    const { autoActivate = true, config = {} } = options;
    
    try {
      // Validate plugin
      if (this.options.enableValidation) {
        const validation = plugin.validate();
        if (!validation.isValid) {
          throw new Error(`Plugin validation failed: ${validation.errors.join(', ')}`);
        }
      }
      
      // Check dependencies
      await this.checkDependencies(plugin);
      
      // Check plugin limit
      if (this.plugins.size >= this.options.maxPlugins) {
        throw new Error(`Maximum plugin limit reached (${this.options.maxPlugins})`);
      }
      
      // Register plugin
      this.plugins.set(plugin.name, plugin);
      
      // Initialize plugin
      await plugin.initialize({ ...this.config, ...config });
      
      // Activate plugin if requested
      if (autoActivate) {
        await this.activatePlugin(plugin.name);
      }
      
      // Update plugin order
      this.updatePluginOrder();
      
      this.emit('pluginRegistered', { plugin: plugin.getInfo() });
      
      return plugin;
      
    } catch (error) {
      this.emit('pluginError', { plugin: plugin.name, error });
      throw error;
    }
  }

  /**
   * Unregisters a plugin
   */
  async unregisterPlugin(pluginName) {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      throw new Error(`Plugin '${pluginName}' not found`);
    }
    
    try {
      // Deactivate plugin
      await this.deactivatePlugin(pluginName);
      
      // Destroy plugin
      await plugin.destroy();
      
      // Remove plugin
      this.plugins.delete(pluginName);
      
      // Update plugin order
      this.updatePluginOrder();
      
      this.emit('pluginUnregistered', { pluginName });
      
      return true;
      
    } catch (error) {
      this.emit('pluginError', { pluginName, error });
      throw error;
    }
  }

  /**
   * Activates a plugin
   */
  async activatePlugin(pluginName) {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      throw new Error(`Plugin '${pluginName}' not found`);
    }
    
    try {
      await plugin.activate();
      this.emit('pluginActivated', { pluginName });
      return true;
    } catch (error) {
      plugin.status = PluginStatus.ERROR;
      this.emit('pluginError', { pluginName, error });
      throw error;
    }
  }

  /**
   * Deactivates a plugin
   */
  async deactivatePlugin(pluginName) {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      throw new Error(`Plugin '${pluginName}' not found`);
    }
    
    try {
      await plugin.deactivate();
      this.emit('pluginDeactivated', { pluginName });
      return true;
    } catch (error) {
      plugin.status = PluginStatus.ERROR;
      this.emit('pluginError', { pluginName, error });
      throw error;
    }
  }

  /**
   * Executes a plugin
   */
  async executePlugin(pluginName, ...args) {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      throw new Error(`Plugin '${pluginName}' not found`);
    }
    
    if (plugin.status !== PluginStatus.ACTIVE) {
      throw new Error(`Plugin '${pluginName}' is not active (status: ${plugin.status})`);
    }
    
    try {
      return await plugin.execute(...args);
    } catch (error) {
      this.emit('pluginError', { pluginName, error });
      throw error;
    }
  }

  /**
   * Executes all active plugins of a specific type
   */
  async executePluginsByType(pluginType, ...args) {
    const results = [];
    
    for (const plugin of this.plugins.values()) {
      if (plugin.type === pluginType && plugin.status === PluginStatus.ACTIVE) {
        try {
          const result = await plugin.execute(...args);
          results.push({ plugin: plugin.name, result });
        } catch (error) {
          results.push({ plugin: plugin.name, error });
        }
      }
    }
    
    return results;
  }

  /**
   * Triggers a hook across all plugins
   */
  async triggerHook(hookName, ...args) {
    const results = [];
    
    for (const plugin of this.plugins.values()) {
      if (plugin.status === PluginStatus.ACTIVE) {
        try {
          const result = await plugin.onHook(hookName, ...args);
          results.push({ plugin: plugin.name, result });
        } catch (error) {
          results.push({ plugin: plugin.name, error });
        }
      }
    }
    
    return results;
  }

  /**
   * Gets plugin information
   */
  getPluginInfo(pluginName) {
    const plugin = this.plugins.get(pluginName);
    return plugin ? plugin.getInfo() : null;
  }

  /**
   * Gets all plugins
   */
  getAllPlugins() {
    return Array.from(this.plugins.values()).map(plugin => plugin.getInfo());
  }

  /**
   * Gets plugins by type
   */
  getPluginsByType(pluginType) {
    return Array.from(this.plugins.values())
      .filter(plugin => plugin.type === pluginType)
      .map(plugin => plugin.getInfo());
  }

  /**
   * Gets active plugins
   */
  getActivePlugins() {
    return Array.from(this.plugins.values())
      .filter(plugin => plugin.status === PluginStatus.ACTIVE)
      .map(plugin => plugin.getInfo());
  }

  /**
   * Gets plugin statistics
   */
  getStatistics() {
    const stats = {
      total: this.plugins.size,
      active: 0,
      inactive: 0,
      error: 0,
      disabled: 0,
      byType: {},
      byStatus: {}
    };
    
    for (const plugin of this.plugins.values()) {
      stats[plugin.status]++;
      
      stats.byType[plugin.type] = (stats.byType[plugin.type] || 0) + 1;
    }
    
    return stats;
  }

  /**
   * Loads built-in plugins
   */
  async loadBuiltinPlugins() {
    // Built-in plugins would be loaded here
    // For demo purposes, we'll create a simple validator plugin
    
    const emailValidatorPlugin = new Plugin({
      name: 'emailValidator',
      version: '1.0.0',
      description: 'Enhanced email validation plugin',
      author: 'QGenUtils',
      type: PluginType.VALIDATOR,
      config: {
        enableStrictValidation: true,
        allowDisposableEmails: false
      },
      hooks: {
        validate: async (email) => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          const isValid = emailRegex.test(email) && email.length <= 254;
          
          return {
            isValid,
            email,
            suggestions: isValid ? [] : ['Email must contain @ and domain', 'Email cannot be longer than 254 characters']
          };
        }
      }
    });
    
    await this.registerPlugin(emailValidatorPlugin);
  }

  /**
   * Loads external plugins
   */
  async loadExternalPlugins() {
    // External plugins would be loaded from plugin directories
    // For demo purposes, we'll create a simple logger plugin
    
    const loggerPlugin = new Plugin({
      name: 'enhancedLogger',
      version: '1.0.0',
      description: 'Enhanced logging plugin with structured output',
      author: 'QGenUtils',
      type: PluginType.LOGGER,
      config: {
        enableConsole: true,
        enableFile: false,
        logLevel: 'info'
      },
      hooks: {
        log: async (level, message, metadata = {}) => {
          const timestamp = new Date().toISOString();
          const logEntry = {
            timestamp,
            level,
            message,
            metadata,
            plugin: 'enhancedLogger'
          };
          
          console.log(`[${level.toUpperCase()}] ${message}`, logEntry);
          return logEntry;
        }
      }
    });
    
    await this.registerPlugin(loggerPlugin);
  }

  /**
   * Initializes hooks
   */
  initializeHooks() {
    // Initialize hook system
    this.hooks.set('beforeValidation', []);
    this.hooks.set('afterValidation', []);
    this.hooks.set('beforeExecution', []);
    this.hooks.set('afterExecution', []);
  }

  /**
   * Checks plugin dependencies
   */
  async checkDependencies(plugin) {
    for (const dependency of plugin.dependencies) {
      if (!this.plugins.has(dependency)) {
        throw new Error(`Plugin '${plugin.name}' requires dependency '${dependency}' which is not registered`);
      }
      
      const depPlugin = this.plugins.get(dependency);
      if (depPlugin.status !== PluginStatus.ACTIVE) {
        throw new Error(`Plugin '${plugin.name}' requires dependency '${dependency}' which is not active`);
      }
    }
  }

  /**
   * Updates plugin order
   */
  updatePluginOrder() {
    this.pluginOrder = Array.from(this.plugins.keys());
  }

  /**
   * Activates all plugins
   */
  async activateAllPlugins() {
    for (const plugin of this.plugins.values()) {
      if (plugin.status === PluginStatus.REGISTERED) {
        try {
          await plugin.activate();
        } catch (error) {
          console.warn(`Failed to activate plugin '${plugin.name}':`, error.message);
        }
      }
    }
  }

  /**
   * Deactivates all plugins
   */
  async deactivateAllPlugins() {
    for (const plugin of this.plugins.values()) {
      if (plugin.status === PluginStatus.ACTIVE) {
        try {
          await plugin.deactivate();
        } catch (error) {
          console.warn(`Failed to deactivate plugin '${plugin.name}':`, error.message);
        }
      }
    }
  }

  /**
   * Reloads all plugins
   */
  async reload() {
    try {
      await this.deactivateAllPlugins();
      this.plugins.clear();
      await this.initialize();
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Cleans up resources
   */
  cleanup() {
    this.deactivateAllPlugins();
    this.plugins.clear();
    this.hooks.clear();
    this.removeAllListeners();
  }
}

// Plugin factory for creating common plugin types
export class PluginFactory {
  static createValidator(name, validatorFn, options = {}) {
    return new Plugin({
      name,
      type: PluginType.VALIDATOR,
      description: `Validator plugin for ${name}`,
      hooks: {
        validate: validatorFn
      },
      ...options
    });
  }

  static createMiddleware(name, middlewareFn, options = {}) {
    return new Plugin({
      name,
      type: PluginType.MIDDLEWARE,
      description: `Middleware plugin for ${name}`,
      hooks: {
        middleware: middlewareFn
      },
      ...options
    });
  }

  static createUtility(name, utilityFn, options = {}) {
    return new Plugin({
      name,
      type: PluginType.UTILITY,
      description: `Utility plugin for ${name}`,
      hooks: {
        execute: utilityFn
      },
      ...options
    });
  }

  static createLogger(name, loggerFn, options = {}) {
    return new Plugin({
      name,
      type: PluginType.LOGGER,
      description: `Logger plugin for ${name}`,
      hooks: {
        log: loggerFn
      },
      ...options
    });
  }
}

// Default export
const defaultPluginManager = new PluginManager();
export { PluginManager as default, defaultPluginManager };