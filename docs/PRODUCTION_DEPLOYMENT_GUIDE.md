# qgenutils Production Deployment Guide

## Overview
This guide provides step-by-step instructions for deploying qgenutils v1.0.3 to production environments.

## Prerequisites

### System Requirements
- Node.js 18.x or higher
- Docker & Docker Compose (for containerized deployment)
- Kubernetes cluster (for K8s deployment)
- At least 2GB RAM
- 10GB disk space
- Load balancer (nginx/recommended)

### Environment Setup
```bash
# Clone repository
git clone <repository-url>
cd qgenutils

# Install dependencies
npm ci

# Build for production
npm run build:prod
```

## Deployment Methods

### 1. Direct Server Deployment

#### Security Audit
```bash
# Run comprehensive security audit
./scripts/security-audit.sh
```

#### Performance Baseline
```bash
# Establish performance baselines
./scripts/performance-baseline.sh
```

#### Deploy
```bash
# Automated deployment with rollback
sudo ./scripts/deploy-production.sh
```

### 2. Docker Deployment

#### Build Image
```bash
docker build -t qgenutils:1.0.3 .
```

#### Run with Docker Compose
```bash
cd deployment
docker-compose up -d
```

#### Health Check
```bash
curl -f http://localhost:3000/health
```

### 3. Kubernetes Deployment

#### Deploy Monitoring
```bash
# Set up monitoring first
./scripts/setup-monitoring.sh

# Deploy to Kubernetes
kubectl apply -f deployment/kubernetes-deployment.yaml
```

#### Verify Deployment
```bash
kubectl get pods -n production
kubectl get services -n production
```

## Configuration

### Environment Variables
```bash
NODE_ENV=production
PORT=3000
LOG_LEVEL=info
MAX_CONCURRENT_REQUESTS=1000
REQUEST_TIMEOUT=30000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Security Headers
- Content Security Policy enabled
- HSTS with preload
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff

## Monitoring

### Metrics Collection
- Prometheus: http://localhost:9090
- Grafana Dashboard: http://localhost:3001
- Default Grafana credentials: admin/admin123

### Key Metrics
- Request rate (requests/second)
- Response time (95th percentile)
- Error rate (%)
- Memory usage (MB)
- CPU usage (%)

### Alerting
- High error rate (>5%)
- High response time (>1s)
- Service downtime
- Resource exhaustion

## Performance Targets

### Response Time
- 50th percentile: <50ms
- 95th percentile: <100ms
- 99th percentile: <200ms

### Throughput
- Target: >1000 requests/second
- Tested up to: 5000 requests/second

### Resource Usage
- Memory: <512MB steady state
- CPU: <70% under normal load
- Disk: <1GB for logs and data

## Security Considerations

### Input Validation
- All user inputs are validated and sanitized
- SQL injection protection
- XSS prevention
- CSRF protection

### Authentication
- API key validation
- Rate limiting
- Request size limits

### Data Protection
- Sensitive data masking in logs
- Secure headers
- HTTPS enforcement

## Backup and Recovery

### Automated Backups
```bash
# Backup current deployment
sudo ./scripts/backup-deployment.sh
```

### Rollback Procedure
```bash
# Automatic rollback on deployment failure
# Manual rollback:
./scripts/rollback-to-version.sh <previous-version>
```

### Disaster Recovery
1. Verify backup integrity
2. Restore from latest working backup
3. Run health checks
4. Monitor performance metrics
5. Verify all systems operational

## Troubleshooting

### Common Issues

#### High Response Times
```bash
# Check system resources
top
free -h

# Check application logs
docker logs qgenutils-prod
```

#### Memory Leaks
```bash
# Monitor memory usage
watch -n 5 'ps aux | grep node'

# Restart service if needed
docker-compose restart qgenutils
```

#### Service Unavailable
```bash
# Check service status
systemctl status qgenutils

# Check network connectivity
curl -v http://localhost:3000/health
```

### Log Analysis
```bash
# Application logs
tail -f logs/application.log

# Error logs
grep ERROR logs/application.log | tail -20

# Performance logs
grep PERFORMANCE logs/application.log
```

## Maintenance

### Regular Tasks
1. Daily: Check error rates and response times
2. Weekly: Review security alerts
3. Monthly: Performance regression testing
4. Quarterly: Security audit and penetration testing

### Updates
```bash
# Update dependencies
npm update

# Security patches
npm audit fix

# Redeploy with updated dependencies
./scripts/deploy-production.sh
```

## Support

### Emergency Contacts
- DevOps Team: devops@company.com
- Security Team: security@company.com
- On-call Engineer: +1-555-0123

### Documentation
- API Documentation: /docs/api
- Architecture Guide: /docs/architecture
- Security Policy: /docs/security

## Compliance

### Standards Met
- OWASP Top 10 Compliance
- GDPR Data Protection
- SOC 2 Type II Ready
- ISO 27001 Aligned

### Audit Trail
- All requests logged with timestamps
- User actions tracked
- System events recorded
- Change logs maintained

---

## Deployment Checklist

### Pre-Deployment
- [ ] Security audit passed
- [ ] Performance baselines established
- [ ] All tests passing
- [ ] Documentation updated
- [ ] Rollback plan tested

### During Deployment
- [ ] Health checks passing
- [ ] Monitoring operational
- [ ] Alerts configured
- [ ] Backup created
- [ ] Load balancer updated

### Post-Deployment
- [ ] Performance metrics within targets
- [ ] Error rates <0.1%
- [ ] All services responding
- [ ] Monitoring alerts working
- [ ] Documentation completed

---

**Version**: 1.0.3  
**Last Updated**: $(date)  
**Next Review**: $(date -d "+1 month")