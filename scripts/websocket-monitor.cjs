#!/usr/bin/env node

/**
 * WebSocket Server for Real-time QGenUtils Monitoring
 * 
 * Provides real-time updates for:
 * - Server performance metrics
 * - Security events and alerts
 * - Rate limiting activities
 * - Cache performance statistics
 * - Live request monitoring
 */

const WebSocket = require('ws');
const http = require('http');
const { performance } = require('perf_hooks');

class RealTimeMonitor {
  constructor(port = 3001) {
    this.port = port;
    this.clients = new Set();
    this.metricsInterval = null;
    this.broadcastQueue = [];
    this.isProcessingBroadcast = false;
    
    this.stats = {
      connectedClients: 0,
      totalConnections: 0,
      messagesSent: 0,
      errors: 0,
      startTime: Date.now()
    };
  }

  start() {
    // Create WebSocket server
    this.wss = new WebSocket.Server({ 
      port: this.port,
      perMessageDeflate: false // Disable compression for performance
    });

    this.wss.on('connection', (ws, req) => {
      this.handleConnection(ws, req);
    });

    this.wss.on('error', (error) => {
      console.error('WebSocket Server Error:', error);
      this.stats.errors++;
    });

    // Start metrics broadcasting
    this.startMetricsBroadcast();

    console.log(`🔌 WebSocket Monitor listening on ws://localhost:${this.port}`);
    console.log('📊 Real-time monitoring enabled');
  }

  handleConnection(ws, req) {
    this.stats.connectedClients++;
    this.stats.totalConnections++;

    const clientId = this.generateClientId();
    const clientInfo = {
      id: clientId,
      ws,
      ip: req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
      connectedAt: Date.now(),
      lastPing: Date.now()
    };

    ws.clientId = clientId;
    ws.clientInfo = clientInfo;
    this.clients.add(clientInfo);

    console.log(`📡 Client connected: ${clientId} from ${clientInfo.ip}`);

    // Send initial connection message
    this.sendToClient(clientInfo, {
      type: 'connection',
      data: {
        clientId,
        message: 'Connected to QGenUtils Real-time Monitor',
        serverTime: new Date().toISOString(),
        connectedClients: this.clients.size
      }
    });

    // Setup event handlers
    ws.on('message', (message) => {
      this.handleMessage(clientInfo, message);
    });

    ws.on('close', (code, reason) => {
      this.handleDisconnection(clientInfo, code, reason);
    });

    ws.on('error', (error) => {
      console.error(`Client ${clientId} error:`, error);
      this.stats.errors++;
    });

    ws.on('pong', () => {
      clientInfo.lastPing = Date.now();
    });

    // Start heartbeat for this client
    this.startClientHeartbeat(clientInfo);
  }

  handleMessage(clientInfo, message) {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'ping':
          this.sendToClient(clientInfo, {
            type: 'pong',
            data: { timestamp: Date.now() }
          });
          break;
          
        case 'subscribe':
          this.handleSubscription(clientInfo, data.channels || []);
          break;
          
        case 'request_stats':
          this.sendCurrentStats(clientInfo);
          break;
          
        default:
          console.log(`Unknown message type from ${clientInfo.id}:`, data.type);
      }
    } catch (error) {
      console.error(`Invalid message from ${clientInfo.id}:`, error);
      this.stats.errors++;
    }
  }

  handleDisconnection(clientInfo, code, reason) {
    this.clients.delete(clientInfo);
    this.stats.connectedClients--;
    
    console.log(`📡 Client disconnected: ${clientInfo.id} (${code}: ${reason})`);
    
    // Broadcast disconnection event
    this.broadcast({
      type: 'client_disconnected',
      data: {
        clientId: clientInfo.id,
        connectedClients: this.clients.size,
        reason: reason
      }
    }, clientInfo.id); // Don't send back to disconnected client
  }

  handleSubscription(clientInfo, channels) {
    clientInfo.subscriptions = new Set(channels);
    
    this.sendToClient(clientInfo, {
      type: 'subscription_confirmed',
      data: {
        channels: Array.from(channels),
        message: 'Subscribed to specified channels'
      }
    });

    console.log(`📡 Client ${clientInfo.id} subscribed to: ${channels.join(', ')}`);
  }

  startClientHeartbeat(clientInfo) {
    clientInfo.heartbeatInterval = setInterval(() => {
      if (Date.now() - clientInfo.lastPing > 30000) { // 30 seconds
        console.log(`📡 Client ${clientInfo.id} timeout - disconnecting`);
        clientInfo.ws.terminate();
      } else {
        clientInfo.ws.ping();
      }
    }, 15000); // Every 15 seconds
  }

  startMetricsBroadcast() {
    // Broadcast metrics every 2 seconds
    this.metricsInterval = setInterval(() => {
      this.broadcastMetrics();
    }, 2000);
  }

  async broadcastMetrics() {
    try {
      const metrics = await this.collectMetrics();
      
      this.broadcast({
        type: 'metrics_update',
        data: metrics,
        timestamp: Date.now()
      });
      
    } catch (error) {
      console.error('Error broadcasting metrics:', error);
      this.stats.errors++;
    }
  }

  async collectMetrics() {
    try {
      // Get server stats from demo server
      const statsResponse = await fetch('http://localhost:3000/api/stats');
      const serverStats = await statsResponse.json();
      
      return {
        server: {
          requestCount: serverStats.requestCount || 0,
          avgResponseTime: serverStats.avgResponseTime || 0,
          errorRate: serverStats.errorRate || 0,
          uptime: serverStats.system?.uptime || 0
        },
        rateLimiting: {
          activeClients: serverStats.rateLimiting?.activeClients || 0,
          blockedRequests: serverStats.rateLimiting?.blockedRequests || 0,
          rateLimitedRequests: serverStats.rateLimiting?.rateLimitedRequests || 0
        },
        caching: {
          hitRate: serverStats.caching?.hitRate || 0,
          cacheSize: serverStats.caching?.cacheSize || 0,
          evictions: serverStats.caching?.evictions || 0
        },
        system: {
          memoryUsage: serverStats.system?.memory || {},
          cpuUsage: serverStats.system?.cpu || {},
          platform: serverStats.system?.platform || 'unknown'
        },
        websocket: {
          connectedClients: this.clients.size,
          totalConnections: this.stats.totalConnections,
          messagesSent: this.stats.messagesSent,
          errors: this.stats.errors,
          uptime: Date.now() - this.stats.startTime
        }
      };
    } catch (error) {
      console.error('Error collecting metrics:', error);
      return {
        error: error.message,
        timestamp: Date.now()
      };
    }
  }

  sendCurrentStats(clientInfo) {
    this.collectMetrics().then(metrics => {
      this.sendToClient(clientInfo, {
        type: 'current_stats',
        data: metrics
      });
    });
  }

  sendToClient(clientInfo, message) {
    if (clientInfo.ws.readyState === WebSocket.OPEN) {
      const messageString = JSON.stringify(message);
      clientInfo.ws.send(messageString);
      this.stats.messagesSent++;
    }
  }

  broadcast(message, excludeClientId = null) {
    const messageString = JSON.stringify(message);
    
    this.clients.forEach(clientInfo => {
      if (clientInfo.id !== excludeClientId && 
          clientInfo.ws.readyState === WebSocket.OPEN) {
        
        // Check channel subscriptions
        if (message.type && clientInfo.subscriptions) {
          const channel = this.getChannelForMessageType(message.type);
          if (!clientInfo.subscriptions.has(channel)) {
            return;
          }
        }
        
        clientInfo.ws.send(messageString);
        this.stats.messagesSent++;
      }
    });
  }

  getChannelForMessageType(messageType) {
    const channelMap = {
      'metrics_update': 'metrics',
      'security_event': 'security',
      'rate_limit_event': 'security',
      'cache_event': 'cache',
      'client_connected': 'connections',
      'client_disconnected': 'connections',
      'error_event': 'errors'
    };
    
    return channelMap[messageType] || 'general';
  }

  generateClientId() {
    return 'client_' + Math.random().toString(36).substr(2, 9);
  }

  // Public methods for external use
  broadcastSecurityEvent(event) {
    this.broadcast({
      type: 'security_event',
      data: {
        ...event,
        timestamp: new Date().toISOString(),
        severity: event.severity || 'medium'
      }
    });
  }

  broadcastRateLimitEvent(event) {
    this.broadcast({
      type: 'rate_limit_event',
      data: {
        ...event,
        timestamp: new Date().toISOString()
      }
    });
  }

  broadcastCacheEvent(event) {
    this.broadcast({
      type: 'cache_event',
      data: {
        ...event,
        timestamp: new Date().toISOString()
      }
    });
  }

  broadcastError(error) {
    this.broadcast({
      type: 'error_event',
      data: {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      }
    });
  }

  getStats() {
    return {
      ...this.stats,
      uptime: Date.now() - this.stats.startTime,
      connectedClients: this.clients.size,
      memoryUsage: process.memoryUsage()
    };
  }

  stop() {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }
    
    // Close all client connections
    this.clients.forEach(clientInfo => {
      clientInfo.ws.close(1001, 'Server shutting down');
    });
    
    if (this.wss) {
      this.wss.close();
    }
    
    console.log('🔌 WebSocket Monitor stopped');
  }
}

// Global instance for external access
let monitorInstance = null;

// Start monitor if run directly
if (require.main === module) {
  monitorInstance = new RealTimeMonitor(process.env.WS_PORT || 3001);
  monitorInstance.start();
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down WebSocket monitor...');
    monitorInstance.stop();
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down WebSocket monitor...');
    monitorInstance.stop();
    process.exit(0);
  });
}

module.exports = RealTimeMonitor;