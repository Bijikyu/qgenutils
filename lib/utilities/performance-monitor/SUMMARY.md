# Performance Monitor Utilities

Real-time performance monitoring with alerting and automatic optimization for Node.js applications.

## Files

| File | Purpose |
|------|---------|
| `collectPerformanceMetrics.js` | Collect CPU, memory, heap, handles metrics from Node.js process |
| `measureEventLoopLag.js` | Async measurement of event loop blocking |
| `analyzePerformanceMetrics.js` | Analyze metrics against thresholds, generate alerts |
| `getPerformanceHealthStatus.js` | Compute overall health status with recommendations |
| `createPerformanceMonitor.js` | Factory for complete monitoring system with auto-optimization |

## Usage

```javascript
const { createPerformanceMonitor } = require('./index');

// Create monitor with custom thresholds
const monitor = createPerformanceMonitor({
  maxEventLoopLag: 25,  // ms
  maxCpuUsage: 80,       // percent
  maxMemoryUsage: 85,    // percent heap
  maxResponseTime: 2000, // ms
  minThroughput: 10,     // req/min
  intervalMs: 5000,      // monitoring interval
  onAlert: (alert) => console.log('Alert:', alert)
});

// Start monitoring
monitor.start();

// Record request response times
monitor.recordRequest(150); // 150ms response

// Get health status
const health = monitor.getHealthStatus();
// { status: 'healthy', metrics: {...}, alerts: [], recommendations: [...] }

// Cleanup on shutdown
monitor.cleanup();
```

## Metrics Collected

- **Event Loop Lag**: Time between scheduling and execution of setImmediate
- **CPU Usage**: Process CPU time as percentage
- **Memory Usage**: Heap used vs total, RSS
- **Active Handles/Requests**: Open I/O handles and pending requests
- **Response Time**: Moving average of last 100 requests
- **Throughput**: Requests per minute

## Alert Types

| Type | Severity | Default Threshold |
|------|----------|-------------------|
| event_loop | critical | 25ms |
| cpu | critical | 80% |
| memory | critical | 85% |
| response_time | warning | 2000ms |
| throughput | warning | 10 req/min |

## Auto-Optimization

When critical memory alerts trigger, the monitor will attempt to force garbage collection if available (`--expose-gc` flag required).

## Edge Cases

- Throughput alerts only fire when requestCount > 0
- Event loop measurement is async (callback-based)
- Internal process APIs may not be available in all environments
