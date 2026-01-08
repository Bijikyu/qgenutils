/**
 * Example Web Application - Authentication System
 * 
 * Demonstrates QGenUtils usage in a real-world web application
 * Features: User registration, login, session management, API protection
 */

import express from 'express';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

// Handle both ESM and CommonJS
const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import QGenUtils utilities
let QGenUtils;
try {
  QGenUtils = require('../dist/index-core.js');
} catch (error) {
  console.log('QGenUtils not found, using demo implementations');
  QGenUtils = {
    validateEmail: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    hashPassword: async (password) => {
      // Simple hash for demo
      const crypto = require('crypto');
      return crypto.createHash('sha256').update(password).digest('hex');
    },
    verifyPassword: async (password, hash) => {
      const crypto = require('crypto');
      const computedHash = crypto.createHash('sha256').update(password).digest('hex');
      return computedHash === hash;
    },
    generateSecurePassword: (options = {}) => {
      const length = options.length || 16;
      const charset = options.includeSymbols 
        ? 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
        : 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let password = '';
      for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
      }
      return password;
    },
    maskApiKey: (apiKey) => {
      if (!apiKey || apiKey.length <= 8) return { original: apiKey, masked: '****' };
      return {
        original: apiKey,
        masked: apiKey.substring(0, 4) + '****' + apiKey.substring(apiKey.length - 4)
      };
    },
    createApiKeyValidator: (options) => {
      const { apiKey, headerName = 'x-api-key' } = options;
      return (req, res, next) => {
        const providedKey = req.headers[headerName.toLowerCase()];
        if (!providedKey) {
          return res.status(401).json({
            error: 'API key required',
            message: 'Please provide API key in ' + headerName + ' header'
          });
        }
        if (providedKey !== apiKey) {
          return res.status(403).json({
            error: 'Invalid API key',
            message: 'API key is invalid'
          });
        }
        req.validatedApiKey = providedKey;
        next();
      };
    },
    createRateLimiter: (options) => {
      const { windowMs = 60000, maxRequests = 100 } = options;
      const requests = new Map();
      
      return (req, res, next) => {
        const clientKey = req.ip || req.connection.remoteAddress || 'unknown';
        const now = Date.now();
        const windowStart = now - windowMs;
        
        if (!requests.has(clientKey)) {
          requests.set(clientKey, []);
        }
        
        const clientRequests = requests.get(clientKey);
        const validRequests = clientRequests.filter(timestamp => timestamp > windowStart);
        
        if (validRequests.length >= maxRequests) {
          return res.status(429).json({
            error: 'Rate limit exceeded',
            message: `Too many requests. Maximum ${maxRequests} requests per ${windowMs/1000} seconds.`,
            retryAfter: Math.ceil(windowMs / 1000)
          });
        }
        
        validRequests.push(now);
        requests.set(clientKey, validRequests);
        next();
      };
    },
    memoize: (fn) => {
      const cache = new Map();
      return (...args) => {
        const key = JSON.stringify(args);
        if (cache.has(key)) {
          return cache.get(key);
        }
        const result = fn(...args);
        cache.set(key, result);
        return result;
      };
    },
    formatDateTime: (date, options = {}) => {
      const targetDate = date instanceof Date ? date : new Date(date);
      const format = options.format || 'default';
      const formats = {
        default: targetDate.toLocaleDateString() + ' ' + targetDate.toLocaleTimeString(),
        date: targetDate.toLocaleDateString(),
        time: targetDate.toLocaleTimeString(),
        iso: targetDate.toISOString()
      };
      return {
        original: date,
        formatted: formats[format] || formats.default,
        timestamp: targetDate.getTime()
      };
    }
  };
}

// In-memory user database (for demo purposes)
const users = new Map();
const sessions = new Map();

class AuthApp {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3001;
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    // Basic middleware
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    
    // CORS
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      next();
    });
    
    // Request logging
    this.app.use((req, res, next) => {
      console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
      next();
    });
  }

  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        uptime: process.uptime()
      });
    });

    // User registration
    this.app.post('/api/register', async (req, res) => {
      try {
        const { email, password, name } = req.body;
        
        // Validate input
        if (!email || !password || !name) {
          return res.status(400).json({
            error: 'Missing required fields',
            message: 'Email, password, and name are required'
          });
        }
        
        // Validate email
        if (!QGenUtils.validateEmail(email)) {
          return res.status(400).json({
            error: 'Invalid email',
            message: 'Please provide a valid email address'
          });
        }
        
        // Check if user already exists
        if (users.has(email)) {
          return res.status(409).json({
            error: 'User already exists',
            message: 'An account with this email already exists'
          });
        }
        
        // Hash password
        const hashedPassword = await QGenUtils.hashPassword(password);
        
        // Create user
        const user = {
          id: this.generateId(),
          email,
          name,
          password: hashedPassword,
          createdAt: new Date().toISOString(),
          lastLogin: null,
          isActive: true
        };
        
        users.set(email, user);
        
        console.log(`User registered: ${email}`);
        
        res.status(201).json({
          message: 'User registered successfully',
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            createdAt: user.createdAt
          }
        });
        
      } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
          error: 'Registration failed',
          message: 'An error occurred during registration'
        });
      }
    });

    // User login
    this.app.post('/api/login', async (req, res) => {
      try {
        const { email, password } = req.body;
        
        if (!email || !password) {
          return res.status(400).json({
            error: 'Missing credentials',
            message: 'Email and password are required'
          });
        }
        
        // Find user
        const user = users.get(email);
        if (!user) {
          return res.status(401).json({
            error: 'Invalid credentials',
            message: 'Email or password is incorrect'
          });
        }
        
        // Verify password
        const isValid = await QGenUtils.verifyPassword(password, user.password);
        if (!isValid) {
          return res.status(401).json({
            error: 'Invalid credentials',
            message: 'Email or password is incorrect'
          });
        }
        
        // Create session
        const sessionId = this.generateId();
        const session = {
          sessionId,
          userId: user.id,
          email: user.email,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
        };
        
        sessions.set(sessionId, session);
        
        // Update user last login
        user.lastLogin = new Date().toISOString();
        users.set(email, user);
        
        console.log(`User logged in: ${email}`);
        
        res.json({
          message: 'Login successful',
          session: {
            sessionId: session.sessionId,
            userId: session.userId,
            expiresAt: session.expiresAt
          },
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            lastLogin: user.lastLogin
          }
        });
        
      } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
          error: 'Login failed',
          message: 'An error occurred during login'
        });
      }
    });

    // User logout
    this.app.post('/api/logout', (req, res) => {
      const { sessionId } = req.body;
      
      if (!sessionId) {
        return res.status(400).json({
          error: 'Missing session ID',
          message: 'Session ID is required'
        });
      }
      
      const session = sessions.get(sessionId);
      if (!session) {
        return res.status(401).json({
          error: 'Invalid session',
          message: 'Session is invalid or expired'
        });
      }
      
      sessions.delete(sessionId);
      
      console.log(`User logged out: ${session.email}`);
      
      res.json({
        message: 'Logout successful'
      });
    });

    // Get current user
    this.app.get('/api/me', (req, res) => {
      const sessionId = req.headers.authorization?.replace('Bearer ', '');
      
      if (!sessionId) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Session token is required'
        });
      }
      
      const session = sessions.get(sessionId);
      if (!session) {
        return res.status(401).json({
          error: 'Invalid session',
          message: 'Session is invalid or expired'
        });
      }
      
      // Check if session is expired
      if (new Date(session.expiresAt) < new Date()) {
        sessions.delete(sessionId);
        return res.status(401).json({
          error: 'Session expired',
          message: 'Session has expired, please login again'
        });
      }
      
      const user = users.get(session.email);
      if (!user) {
        return res.status(404).json({
          error: 'User not found',
          message: 'User account not found'
        });
      }
      
      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin
        },
        session: {
          sessionId: session.sessionId,
          expiresAt: session.expiresAt
        }
      });
    });

    // Password generator
    this.app.get('/api/generate-password', (req, res) => {
      const { length = 16, includeSymbols = true } = req.query;
      
      const password = QGenUtils.generateSecurePassword({
        length: parseInt(length) || 16,
        includeSymbols: includeSymbols === 'true'
      });
      
      res.json({
        password,
        length: password.length,
        hasSymbols: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        hasUppercase: /[A-Z]/.test(password),
        hasLowercase: /[a-z]/.test(password),
        hasNumbers: /\d/.test(password)
      });
    });

    // API key masking demo
    this.app.post('/api/mask-api-key', (req, res) => {
      const { apiKey } = req.body;
      
      if (!apiKey) {
        return res.status(400).json({
          error: 'Missing API key',
          message: 'API key is required'
        });
      }
      
      const masked = QGenUtils.maskApiKey(apiKey);
      
      res.json({
        original: masked.original,
        masked: masked.masked,
        length: masked.original.length
      });
    });

    // Protected API endpoint with API key validation
    const apiKeyValidator = QGenUtils.createApiKeyValidator({
      apiKey: process.env.API_KEY || 'demo-api-key-12345',
      headerName: 'x-api-key'
    });

    const rateLimiter = QGenUtils.createRateLimiter({
      windowMs: 60000, // 1 minute
      maxRequests: 10 // 10 requests per minute
    });

    this.app.use('/api/protected', rateLimiter, apiKeyValidator);

    this.app.get('/api/protected/data', (req, res) => {
      res.json({
        message: 'This is protected data',
        timestamp: new Date().toISOString(),
        apiKey: req.validatedApiKey,
        rateLimitInfo: {
          windowMs: 60000,
          maxRequests: 10,
          remainingRequests: 'You have 10 requests per minute'
        }
      });
    });

    // Performance demo with memoization
    const expensiveOperation = QGenUtils.memoize((input) => {
      // Simulate expensive computation
      const start = Date.now();
      let result = 0;
      for (let i = 0; i < 1000000; i++) {
        result += Math.sqrt(i);
      }
      const duration = Date.now() - start;
      return { input, result, duration, computedAt: new Date().toISOString() };
    });

    this.app.get('/api/performance-demo/:input', (req, res) => {
      const { input } = req.params;
      const num = parseInt(input) || 42;
      
      console.log(`Processing input: ${num}`);
      const result = expensiveOperation(num);
      
      res.json({
        input: num,
        result,
        memoized: true,
        timestamp: new Date().toISOString()
      });
    });

    // DateTime formatting demo
    this.app.get('/api/datetime/:date?', (req, res) => {
      const { date = 'now', format = 'default' } = req.query;
      
      let targetDate;
      if (date === 'now') {
        targetDate = new Date();
      } else {
        targetDate = new Date(date);
      }
      
      const formatted = QGenUtils.formatDateTime(targetDate, { format });
      
      res.json({
        original: date,
        formatted: formatted.formatted,
        format,
        timestamp: formatted.timestamp
      });
    });

    // Serve static files
    this.app.use(express.static(path.join(__dirname, 'public')));
  }

  generateId() {
    return Math.random().toString(36).substr(2, 9);
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`🚀 Auth App listening on http://localhost:${this.port}`);
      console.log('\n📋 Available Endpoints:');
      console.log('  🏥 Health Check: GET /health');
      console.log('  📝 Register: POST /api/register');
      console.log('  🔑 Login: POST /api/login');
      console.log('  🚪 Logout: POST /api/logout');
      console.log('  👤 Current User: GET /api/me');
      console.log('  🔐 Generate Password: GET /api/generate-password');
      console.log('  🎭 Mask API Key: POST /api/mask-api-key');
      console.log('  🛡️ Protected Data: GET /api/protected/data');
      console.log('  ⚡ Performance Demo: GET /api/performance-demo/:input');
      console.log('  📅 DateTime Demo: GET /api/datetime/:date');
      console.log('\n🔐 API Key Required for Protected Endpoints:');
      console.log('  Header: x-api-key: demo-api-key-12345');
      console.log('\n📊 Rate Limiting on Protected Endpoints:');
      console.log('  10 requests per minute per IP');
      console.log('\n🌐 Open http://localhost:3001 to try the app!');
    });
  }

  stop() {
    console.log('🛑 Shutting down Auth App...');
    process.exit(0);
  }
}

// Create and start the application
const app = new AuthApp();

// Handle graceful shutdown
process.on('SIGINT', () => {
  app.stop();
});

process.on('SIGTERM', () => {
  app.stop();
});

// Start the app
if (require.main === module) {
  app.start();
}

export default AuthApp;