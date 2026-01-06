#!/bin/bash
# Production Monitoring and Alerting Setup
# This script sets up comprehensive monitoring for qgenutils production deployment

set -euo pipefail

# Configuration
NAMESPACE="production"
SERVICE_NAME="qgenutils"
MONITORING_DIR="./monitoring"
PROMETHEUS_NAMESPACE="monitoring"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

# Create monitoring directories
create_monitoring_structure() {
    log "Creating monitoring directory structure..."
    
    mkdir -p "$MONITORING_DIR"/{prometheus,grafana/{dashboards,datasources},alertmanager,rules}
    
    success "Monitoring directories created"
}

# Create Prometheus configuration
create_prometheus_config() {
    log "Creating Prometheus configuration..."
    
    cat > "$MONITORING_DIR/prometheus/prometheus.yml" << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "/etc/prometheus/rules/*.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  - job_name: 'qgenutils'
    static_configs:
      - targets: ['qgenutils-service:80']
    metrics_path: '/metrics'
    scrape_interval: 15s
    scrape_timeout: 10s

  - job_name: 'kubernetes-pods'
    kubernetes_sd_configs:
      - role: pod
        namespaces:
          names:
            - production
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
        action: replace
        target_label: __metrics_path__
        regex: (.+)
      - source_labels: [__address__, __meta_kubernetes_pod_annotation_prometheus_io_port]
        action: replace
        regex: ([^:]+)(?::\d+)?;(\d+)
        replacement: $1:$2
        target_label: __address__

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']
EOF
}

# Create alerting rules
create_alerting_rules() {
    log "Creating alerting rules..."
    
    cat > "$MONITORING_DIR/rules/qgenutils.yml" << 'EOF'
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

      - alert: HighMemoryUsage
        expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes > 0.9
        for: 5m
        labels:
          severity: warning
          service: qgenutils
        annotations:
          summary: "High memory usage detected"
          description: "Memory usage is {{ $value | humanizePercentage }}"

      - alert: HighCPUUsage
        expr: 100 - (avg by(instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
        for: 5m
        labels:
          severity: warning
          service: qgenutils
        annotations:
          summary: "High CPU usage detected"
          description: "CPU usage is {{ $value }}%"

      - alert: ServiceDown
        expr: up{job="qgenutils"} == 0
        for: 1m
        labels:
          severity: critical
          service: qgenutils
        annotations:
          summary: "Service is down"
          description: "qgenutils service has been down for more than 1 minute"

      - alert: PodRestartHigh
        expr: rate(kube_pod_container_status_restarts_total[15m]) > 0
        for: 5m
        labels:
          severity: warning
          service: qgenutils
        annotations:
          summary: "High pod restart rate"
          description: "Pod {{ $labels.pod }} is restarting frequently"

      - alert: DiskSpaceLow
        expr: (node_filesystem_avail_bytes / node_filesystem_size_bytes) * 100 < 10
        for: 5m
        labels:
          severity: critical
          service: qgenutils
        annotations:
          summary: "Low disk space"
          description: "Disk space is {{ $value }}% available"
EOF
}

# Create Alertmanager configuration
create_alertmanager_config() {
    log "Creating Alertmanager configuration..."
    
    cat > "$MONITORING_DIR/alertmanager/alertmanager.yml" << 'EOF'
global:
  smtp_smarthost: 'localhost:587'
  smtp_from: 'alerts@qgenutils.com'
  smtp_auth_username: 'alerts@qgenutils.com'
  smtp_auth_password: 'your-password'

route:
  group_by: ['alertname', 'service']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 12h
  receiver: 'web.hook'
  routes:
  - match:
      severity: critical
    receiver: 'critical-alerts'
  - match:
      severity: warning
    receiver: 'warning-alerts'

receivers:
- name: 'web.hook'
  webhook_configs:
  - url: 'http://localhost:5001/'

- name: 'critical-alerts'
  email_configs:
  - to: 'ops-team@qgenutils.com'
    subject: '[CRITICAL] qgenutils Alert: {{ .GroupLabels.alertname }}'
    body: |
      {{ range .Alerts }}
      Alert: {{ .Annotations.summary }}
      Description: {{ .Annotations.description }}
      Labels: {{ range .Labels.SortedPairs }}{{ .Name }}={{ .Value }} {{ end }}
      {{ end }}
  slack_configs:
  - api_url: 'YOUR_SLACK_WEBHOOK_URL'
    channel: '#alerts-critical'
    title: 'Critical Alert: {{ .GroupLabels.alertname }}'
    text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'

- name: 'warning-alerts'
  email_configs:
  - to: 'dev-team@qgenutils.com'
    subject: '[WARNING] qgenutils Alert: {{ .GroupLabels.alertname }}'
    body: |
      {{ range .Alerts }}
      Alert: {{ .Annotations.summary }}
      Description: {{ .Annotations.description }}
      Labels: {{ range .Labels.SortedPairs }}{{ .Name }}={{ .Value }} {{ end }}
      {{ end }}
  slack_configs:
  - api_url: 'YOUR_SLACK_WEBHOOK_URL'
    channel: '#alerts-warning'
    title: 'Warning Alert: {{ .GroupLabels.alertname }}'
    text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'

inhibit_rules:
- source_match:
    severity: 'critical'
  target_match:
    severity: 'warning'
  equal: ['alertname', 'instance']
EOF
}

# Create Grafana dashboards
create_grafana_dashboards() {
    log "Creating Grafana dashboards..."
    
    cat > "$MONITORING_DIR/grafana/dashboards/dashboard.yml" << 'EOF'
apiVersion: 1

providers:
  - name: 'default'
    orgId: 1
    folder: ''
    type: file
    disableDeletion: false
    updateIntervalSeconds: 10
    allowUiUpdates: true
    options:
      path: /etc/grafana/provisioning/dashboards
EOF

    cat > "$MONITORING_DIR/grafana/dashboards/qgenutils-dashboard.json" << 'EOF'
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
      },
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          },
          {
            "expr": "histogram_quantile(0.50, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "50th percentile"
          }
        ],
        "gridPos": {"h": 8, "w": 12, "x": 12, "y": 0}
      },
      {
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m]) / rate(http_requests_total[5m])",
            "legendFormat": "Error Rate"
          }
        ],
        "gridPos": {"h": 8, "w": 12, "x": 0, "y": 8}
      },
      {
        "title": "Memory Usage",
        "type": "graph",
        "targets": [
          {
            "expr": "process_resident_memory_bytes",
            "legendFormat": "Memory Usage"
          }
        ],
        "gridPos": {"h": 8, "w": 12, "x": 12, "y": 8}
      }
    ],
    "time": {"from": "now-1h", "to": "now"},
    "refresh": "5s"
  },
  "overwrite": true
}
EOF
}

# Create Grafana datasources
create_grafana_datasources() {
    log "Creating Grafana datasources..."
    
    cat > "$MONITORING_DIR/grafana/datasources/datasource.yml" << 'EOF'
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: true
EOF
}

# Create monitoring manifests for Kubernetes
create_kubernetes_monitoring() {
    log "Creating Kubernetes monitoring manifests..."
    
    cat > "$MONITORING_DIR/monitoring-namespace.yaml" << EOF
apiVersion: v1
kind: Namespace
metadata:
  name: $PROMETHEUS_NAMESPACE
  labels:
    name: $PROMETHEUS_NAMESPACE
EOF

    cat > "$MONITORING_DIR/prometheus-deployment.yaml" << EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: prometheus
  namespace: $PROMETHEUS_NAMESPACE
spec:
  replicas: 1
  selector:
    matchLabels:
      app: prometheus
  template:
    metadata:
      labels:
        app: prometheus
    spec:
      containers:
      - name: prometheus
        image: prom/prometheus:latest
        args:
          - '--config.file=/etc/prometheus/prometheus.yml'
          - '--storage.tsdb.path=/prometheus/'
          - '--web.console.libraries=/etc/prometheus/console_libraries'
          - '--web.console.templates=/etc/prometheus/consoles'
          - '--storage.tsdb.retention.time=200h'
          - '--web.enable-lifecycle'
        ports:
        - containerPort: 9090
        volumeMounts:
        - name: prometheus-config-volume
          mountPath: /etc/prometheus/
        - name: prometheus-storage-volume
          mountPath: /prometheus/
        - name: prometheus-rules-volume
          mountPath: /etc/prometheus/rules/
      volumes:
      - name: prometheus-config-volume
        configMap:
          name: prometheus-config
      - name: prometheus-storage-volume
        persistentVolumeClaim:
          claimName: prometheus-pvc
      - name: prometheus-rules-volume
        configMap:
          name: prometheus-rules
EOF
}

# Main function
main() {
    log "Setting up production monitoring for qgenutils..."
    
    create_monitoring_structure
    create_prometheus_config
    create_alerting_rules
    create_alertmanager_config
    create_grafana_dashboards
    create_grafana_datasources
    create_kubernetes_monitoring
    
    success "Production monitoring setup completed!"
    log "Configuration files created in $MONITORING_DIR"
    log "To deploy monitoring, run:"
    log "  kubectl apply -f $MONITORING_DIR/monitoring-namespace.yaml"
    log "  kubectl apply -f $MONITORING_DIR/"
}

# Run main function
main "$@"