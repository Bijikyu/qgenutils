#!/bin/bash
# Production Security Audit Script for qgenutils
# Performs comprehensive security analysis before deployment

set -euo pipefail

# Configuration
PROJECT_NAME="qgenutils"
VERSION="1.0.3"
SCAN_DIR="$(pwd)"
REPORT_DIR="./security-reports"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

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

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

# Create report directory
setup_reports() {
    log "Setting up security report directory..."
    mkdir -p "$REPORT_DIR"
}

# Dependency vulnerability scan
dependency_scan() {
    log "Running dependency vulnerability scan..."
    
    local report_file="$REPORT_DIR/dependency-scan-$TIMESTAMP.txt"
    
    echo "Dependency Security Scan Report" > "$report_file"
    echo "===============================" >> "$report_file"
    echo "Project: $PROJECT_NAME v$VERSION" >> "$report_file"
    echo "Date: $(date)" >> "$report_file"
    echo "" >> "$report_file"
    
    if command -v npm &> /dev/null; then
        echo "=== NPM Audit Results ===" >> "$report_file"
        npm audit --json 2>/dev/null | npm audit --parseable || echo "npm audit failed" >> "$report_file"
        echo "" >> "$report_file"
        
        echo "=== Outdated Dependencies ===" >> "$report_file"
        npm outdated || echo "No outdated packages or check failed" >> "$report_file"
        echo "" >> "$report_file"
    fi
    
    # Check for known vulnerable packages
    if command -v snyk &> /dev/null; then
        echo "=== Snyk Scan Results ===" >> "$report_file"
        snyk test --json >> "$report_file" 2>&1 || echo "Snyk scan failed or not configured" >> "$report_file"
        echo "" >> "$report_file"
    fi
    
    success "Dependency scan completed: $report_file"
}

# Code security analysis
code_security_scan() {
    log "Running code security analysis..."
    
    local report_file="$REPORT_DIR/code-security-$TIMESTAMP.txt"
    
    echo "Code Security Analysis Report" > "$report_file"
    echo "==============================" >> "$report_file"
    echo "Project: $PROJECT_NAME v$VERSION" >> "$report_file"
    echo "Date: $(date)" >> "$report_file"
    echo "" >> "$report_file"
    
    # Check for hardcoded secrets
    echo "=== Secret Detection ===" >> "$report_file"
    echo "Checking for potential hardcoded secrets..." >> "$report_file"
    
    # Common secret patterns
    local secret_patterns=(
        "password\s*=\s*['\"][^'\"]{8,}['\"]"
        "secret\s*=\s*['\"][^'\"]{8,}['\"]"
        "api_key\s*=\s*['\"][^'\"]{8,}['\"]"
        "token\s*=\s*['\"][^'\"]{8,}['\"]"
        "private_key\s*=\s*['\"][^'\"]{8,}['\"]"
        "aws_access_key\s*=\s*['\"][^'\"]{8,}['\"]"
        "aws_secret_key\s*=\s*['\"][^'\"]{8,}['\"]"
    )
    
    for pattern in "${secret_patterns[@]}"; do
        echo "Pattern: $pattern" >> "$report_file"
        if grep -r -i -n -E "$pattern" --include="*.js" --include="*.ts" --include="*.json" --include="*.yml" --include="*.yaml" --exclude-dir=node_modules --exclude-dir=.git . 2>/dev/null; then
            echo "MATCHES FOUND!" >> "$report_file"
        else
            echo "No matches found" >> "$report_file"
        fi
        echo "" >> "$report_file"
    done
    
    # Check for dangerous functions
    echo "=== Dangerous Function Usage ===" >> "$report_file"
    local dangerous_functions=(
        "eval\s*\("
        "Function\s*\("
        "setTimeout\s*\([^,]*,[^0-9]"
        "setInterval\s*\([^,]*,[^0-9]"
        "exec\s*\("
        "spawn\s*\("
        "child_process"
    )
    
    for func in "${dangerous_functions[@]}"; do
        echo "Function: $func" >> "$report_file"
        if grep -r -n -E "$func" --include="*.js" --include="*.ts" --exclude-dir=node_modules --exclude-dir=.git . 2>/dev/null; then
            echo "USAGE FOUND!" >> "$report_file"
        else
            echo "No usage found" >> "$report_file"
        fi
        echo "" >> "$report_file"
    done
    
    # Check for SQL injection patterns
    echo "=== SQL Injection Patterns ===" >> "$report_file"
    if grep -r -i -n -E "(SELECT|INSERT|UPDATE|DELETE).*\+.*WHERE" --include="*.js" --include="*.ts" --exclude-dir=node_modules . 2>/dev/null; then
        echo "POTENTIAL SQL INJECTION!" >> "$report_file"
    else
        echo "No obvious SQL injection patterns found" >> "$report_file"
    fi
    echo "" >> "$report_file"
    
    success "Code security scan completed: $report_file"
}

# File permissions check
file_permissions_check() {
    log "Checking file permissions..."
    
    local report_file="$REPORT_DIR/file-permissions-$TIMESTAMP.txt"
    
    echo "File Permissions Report" > "$report_file"
    echo "=======================" >> "$report_file"
    echo "Project: $PROJECT_NAME v$VERSION" >> "$report_file"
    echo "Date: $(date)" >> "$report_file"
    echo "" >> "$report_file"
    
    echo "=== Executable Files ===" >> "$report_file"
    find . -type f -executable -not -path "./node_modules/*" -not -path "./.git/*" -ls >> "$report_file" 2>/dev/null
    echo "" >> "$report_file"
    
    echo "=== World-Writable Files ===" >> "$report_file"
    if find . -type f -perm -o+w -not -path "./node_modules/*" -not -path "./.git/*" -ls 2>/dev/null; then
        echo "WARNING: World-writable files found!" >> "$report_file"
    else
        echo "No world-writable files found" >> "$report_file"
    fi
    echo "" >> "$report_file"
    
    echo "=== Sensitive File Permissions ===" >> "$report_file"
    for file in package.json package-lock.json .env .env.* *.key *.pem *.crt; do
        if [[ -f "$file" ]]; then
            echo "$file: $(ls -la "$file")" >> "$report_file"
        fi
    done
    
    success "File permissions check completed: $report_file"
}

# Network security scan
network_security_scan() {
    log "Running network security analysis..."
    
    local report_file="$REPORT_DIR/network-security-$TIMESTAMP.txt"
    
    echo "Network Security Analysis" > "$report_file"
    echo "=========================" >> "$report_file"
    echo "Project: $PROJECT_NAME v$VERSION" >> "$report_file"
    echo "Date: $(date)" >> "$report_file"
    echo "" >> "$report_file"
    
    # Check for HTTP-only endpoints (no HTTPS)
    echo "=== HTTP vs HTTPS Usage ===" >> "$report_file"
    grep -r -i -n "http://" --include="*.js" --include="*.ts" --include="*.json" --exclude-dir=node_modules . 2>/dev/null | head -1000 >> "$report_file" || echo "No HTTP URLs found" >> "$report_file"
    echo "" >> "$report_file"
    
    # Check for open ports in configuration
    echo "=== Port Configuration ===" >> "$report_file"
    grep -r -i -n "port" --include="*.js" --include="*.ts" --include="*.json" --include="*.yml" --include="*.yaml" --exclude-dir=node_modules . 2>/dev/null | grep -E "[0-9]{4,5}" | head -1000 >> "$report_file" || echo "No explicit port configurations found" >> "$report_file"
    echo "" >> "$report_file"
    
    # Check for CORS configuration
    echo "=== CORS Configuration ===" >> "$report_file"
    grep -r -i -n "cors" --include="*.js" --include="*.ts" --exclude-dir=node_modules . 2>/dev/null | head -1000 >> "$report_file" || echo "No CORS configuration found" >> "$report_file"
    echo "" >> "$report_file"
    
    success "Network security scan completed: $report_file"
}

# Configuration security check
config_security_check() {
    log "Checking configuration security..."
    
    local report_file="$REPORT_DIR/config-security-$TIMESTAMP.txt"
    
    echo "Configuration Security Report" > "$report_file"
    echo "=============================" >> "$report_file"
    echo "Project: $PROJECT_NAME v$VERSION" >> "$report_file"
    echo "Date: $(date)" >> "$report_file"
    echo "" >> "$report_file"
    
    # Check for environment variables
    echo "=== Environment Variable Usage ===" >> "$report_file"
    grep -r -n "process\.env\." --include="*.js" --include="*.ts" --exclude-dir=node_modules . 2>/dev/null | head -1000 >> "$report_file" || echo "No environment variables found" >> "$report_file"
    echo "" >> "$report_file"
    
    # Check for development/production flags
    echo "=== Environment Configuration ===" >> "$report_file"
    grep -r -i -n "node_env\|development\|production" --include="*.js" --include="*.ts" --include="*.json" --exclude-dir=node_modules . 2>/dev/null | head -1000 >> "$report_file" || echo "No environment configurations found" >> "$report_file"
    echo "" >> "$report_file"
    
    # Check for debugging enabled
    echo "=== Debug Configuration ===" >> "$report_file"
    grep -r -i -n "debug.*true\|console\.(log|warn|error)" --include="*.js" --include="*.ts" --exclude-dir=node_modules . 2>/dev/null | head -1000 >> "$report_file" || echo "No debug configurations found" >> "$report_file"
    echo "" >> "$report_file"
    
    success "Configuration security check completed: $report_file"
}

# Generate summary report
generate_summary() {
    log "Generating security audit summary..."
    
    local summary_file="$REPORT_DIR/security-summary-$TIMESTAMP.txt"
    
    echo "Security Audit Summary Report" > "$summary_file"
    echo "============================" >> "$summary_file"
    echo "Project: $PROJECT_NAME v$VERSION" >> "$summary_file"
    echo "Date: $(date)" >> "$summary_file"
    echo "" >> "$summary_file"
    
    echo "Generated Reports:" >> "$summary_file"
    echo "- Dependency Scan: dependency-scan-$TIMESTAMP.txt" >> "$summary_file"
    echo "- Code Security: code-security-$TIMESTAMP.txt" >> "$summary_file"
    echo "- File Permissions: file-permissions-$TIMESTAMP.txt" >> "$summary_file"
    echo "- Network Security: network-security-$TIMESTAMP.txt" >> "$summary_file"
    echo "- Configuration Security: config-security-$TIMESTAMP.txt" >> "$summary_file"
    echo "" >> "$summary_file"
    
    # Count issues
    local total_issues=0
    
    for report in "$REPORT_DIR"/*-$TIMESTAMP.txt; do
        if [[ "$report" != "$summary_file" ]]; then
            local issues=$(grep -c -i -E "(found|vulnerable|warning|error|failed)" "$report" 2>/dev/null || echo "0")
            total_issues=$((total_issues + issues))
            echo "Issues in $(basename "$report"): $issues" >> "$summary_file"
        fi
    done
    
    echo "" >> "$summary_file"
    echo "Total Issues Found: $total_issues" >> "$summary_file"
    
    if [[ $total_issues -gt 0 ]]; then
        echo "SECURITY STATUS: ATTENTION REQUIRED" >> "$summary_file"
        warn "Security audit completed with $total_issues issues found"
    else
        echo "SECURITY STATUS: PASSED" >> "$summary_file"
        success "Security audit passed with no critical issues"
    fi
    
    success "Summary report generated: $summary_file"
}

# Main function
main() {
    log "Starting comprehensive security audit for $PROJECT_NAME v$VERSION..."
    
    setup_reports
    dependency_scan
    code_security_scan
    file_permissions_check
    network_security_scan
    config_security_check
    generate_summary
    
    success "Security audit completed!"
    log "All reports are available in: $REPORT_DIR"
    log "Review the reports before proceeding with deployment."
}

# Run main function
main "$@"