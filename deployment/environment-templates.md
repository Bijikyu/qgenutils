# Production Environment Configuration Templates

## Environment Variables

### Production (.env.production)
```bash
# Application Configuration
NODE_ENV=production
PORT=3000
APP_NAME=qgenutils
APP_VERSION=1.0.3

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
LOG_FILE=/var/log/qgenutils/application.log

# Security
ENABLE_SECURITY_HEADERS=true
ENABLE_RATE_LIMITING=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ENABLE_CORS=true

# Performance
MAX_CONCURRENT_REQUESTS=1000
REQUEST_TIMEOUT=30000
KEEP_ALIVE_TIMEOUT=5000

# Monitoring
ENABLE_METRICS=true
METRICS_PORT=9090
HEALTH_CHECK_INTERVAL=30

# Database (if applicable)
DATABASE_URL=postgresql://user:password@localhost:5432/qgenutils_prod
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10

# Cache (if applicable)
REDIS_URL=redis://localhost:6379
CACHE_TTL=3600

# External Services
API_TIMEOUT=10000
RETRY_ATTEMPTS=3
RETRY_DELAY=1000

# Feature Flags
ENABLE_DEBUG_MODE=false
ENABLE_PERFORMANCE_LOGGING=true
ENABLE_DETAILED_ERRORS=false
```

### Staging (.env.staging)
```bash
# Application Configuration
NODE_ENV=staging
PORT=3001
APP_NAME=qgenutils-staging
APP_VERSION=1.0.3

# Logging
LOG_LEVEL=debug
LOG_FORMAT=dev
LOG_FILE=/var/log/qgenutils/staging.log

# Security
ENABLE_SECURITY_HEADERS=true
ENABLE_RATE_LIMITING=true
RATE_LIMIT_WINDOW_MS=300000
RATE_LIMIT_MAX_REQUESTS=200
ENABLE_CORS=true

# Performance
MAX_CONCURRENT_REQUESTS=500
REQUEST_TIMEOUT=15000

# Monitoring
ENABLE_METRICS=true
METRICS_PORT=9091
HEALTH_CHECK_INTERVAL=15

# Feature Flags
ENABLE_DEBUG_MODE=true
ENABLE_PERFORMANCE_LOGGING=true
ENABLE_DETAILED_ERRORS=true
```

## Kubernetes Configuration

### Namespace
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: qgenutils-production
  labels:
    name: qgenutils-production
    environment: production
```

### ConfigMap
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: qgenutils-config
  namespace: qgenutils-production
data:
  NODE_ENV: "production"
  LOG_LEVEL: "info"
  PORT: "3000"
  MAX_CONCURRENT_REQUESTS: "1000"
  REQUEST_TIMEOUT: "30000"
  RATE_LIMIT_WINDOW_MS: "900000"
  RATE_LIMIT_MAX_REQUESTS: "100"
  ENABLE_SECURITY_HEADERS: "true"
  ENABLE_RATE_LIMITING: "true"
  ENABLE_CORS: "true"
  ENABLE_METRICS: "true"
  METRICS_PORT: "9090"
```

### Secret
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: qgenutils-secrets
  namespace: qgenutils-production
type: Opaque
data:
  DATABASE_URL: <base64-encoded-database-url>
  API_KEY: <base64-encoded-api-key>
  JWT_SECRET: <base64-encoded-jwt-secret>
  REDIS_PASSWORD: <base64-encoded-redis-password>
```

## Docker Configuration

### Production Dockerfile
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build:prod

FROM node:18-alpine AS production

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "dist/index.js"]
```

### Docker Compose Override
```yaml
version: '3.8'

services:
  qgenutils:
    extends:
      file: docker-compose.yml
      service: qgenutils
    environment:
      - NODE_ENV=production
      - LOG_LEVEL=info
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
        window: 120s
```

## Nginx Configuration

### Production Configuration
```nginx
upstream qgenutils_backend {
    least_conn;
    server qgenutils1:3000 max_fails=3 fail_timeout=30s;
    server qgenutils2:3000 max_fails=3 fail_timeout=30s;
    server qgenutils3:3000 max_fails=3 fail_timeout=30s;
}

server {
    listen 80;
    server_name qgenutils.example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name qgenutils.example.com;

    ssl_certificate /etc/ssl/certs/qgenutils.crt;
    ssl_certificate_key /etc/ssl/private/qgenutils.key;
    
    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;

    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;

    location / {
        proxy_pass http://qgenutils_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
        
        # Buffer settings
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
    }

    location /health {
        proxy_pass http://qgenutils_backend/health;
        access_log off;
    }

    location /metrics {
        proxy_pass http://qgenutils_backend/metrics;
        allow 10.0.0.0/8;
        allow 172.16.0.0/12;
        allow 192.168.0.0/16;
        deny all;
    }
}
```

## Systemd Service

### Production Service
```ini
[Unit]
Description=qgenutils Application
After=network.target
Wants=network.target

[Service]
Type=simple
User=nodejs
Group=nodejs
WorkingDirectory=/opt/apps/qgenutils
Environment=NODE_ENV=production
Environment=PORT=3000
ExecStart=/usr/bin/node dist/index.js
ExecReload=/bin/kill -USR1 $MAINPID
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=qgenutils

# Security
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/var/log/qgenutils /tmp
RemoveIPC=true

# Resource Limits
LimitNOFILE=65536
LimitNPROC=4096

[Install]
WantedBy=multi-user.target
```

## Monitoring Configuration

### Prometheus Rules
```yaml
groups:
- name: qgenutils.rules
  rules:
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.05
    for: 5m
    labels:
      severity: critical
      service: qgenutils
    annotations:
      summary: "High error rate detected"
      description: "Error rate is {{ $value | humanizePercentage }} for the last 5 minutes"

  - alert: HighResponseTime
    expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
    for: 5m
    labels:
      severity: warning
      service: qgenutils
    annotations:
      summary: "High response time detected"
      description: "95th percentile response time is {{ $value }}s"
```

### Grafana Dashboard
```json
{
  "dashboard": {
    "id": null,
    "title": "qgenutils Production Dashboard",
    "tags": ["qgenutils", "production"],
    "timezone": "browser",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{status}}"
          }
        ],
        "gridPos": {"h": 8, "w": 12, "x": 0, "y": 0}
      }
    ]
  }
}
```

## Logging Configuration

### Logrotate Configuration
```
/var/log/qgenutils/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 nodejs nodejs
    postrotate
        systemctl reload qgenutils
    endscript
}
```

### Rsyslog Configuration
```
# qgenutils application logs
if $programname == 'qgenutils' then /var/log/qgenutils/application.log
& stop

# Separate error logs
if $programname == 'qgenutils' and $syslogseverity-text == 'error' then /var/log/qgenutils/error.log
& stop
```

## Network Configuration

### Firewall Rules
```bash
# Allow HTTP/HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Allow application port from internal network
ufw allow from 10.0.0.0/8 to any port 3000
ufw allow from 172.16.0.0/12 to any port 3000
ufw allow from 192.168.0.0/16 to any port 3000

# Allow metrics port from monitoring network
ufw allow from 10.0.0.0/8 to any port 9090
```

### HAProxy Configuration
```
frontend qgenutils_frontend
    bind *:80
    bind *:443 ssl crt /etc/ssl/certs/qgenutils.pem
    redirect scheme https if !{ ssl_fc }
    default_backend qgenutils_backend

backend qgenutils_backend
    balance roundrobin
    option httpchk GET /health
    server qgenutils1 10.0.1.10:3000 check
    server qgenutils2 10.0.1.11:3000 check
    server qgenutils3 10.0.1.12:3000 check
```

---

These templates provide comprehensive configuration options for deploying qgenutils in production environments. Customize values according to your specific infrastructure and security requirements.