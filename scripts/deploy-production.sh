#!/bin/bash
# Production Deployment Script for qgenutils
# Version: 1.0.3
# Description: Automated production deployment with health checks and rollback

set -euo pipefail

# Configuration
PROJECT_NAME="qgenutils"
VERSION="1.0.3"
DEPLOYMENT_ENV=${DEPLOYMENT_ENV:-production}
BACKUP_DIR="/opt/backups/${PROJECT_NAME}"
DEPLOYMENT_DIR="/opt/apps/${PROJECT_NAME}"
HEALTH_CHECK_TIMEOUT=300
ROLLBACK_ENABLED=true

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Pre-deployment checks
pre_deployment_checks() {
    log "Running pre-deployment checks..."
    
    # Check if running as root
    if [[ $EUID -ne 0 ]]; then
        error "This script must be run as root for deployment"
        exit 1
    fi
    
    # Check Node.js version
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed"
        exit 1
    fi
    
    local node_version=$(node --version | cut -d'v' -f2)
    log "Node.js version: $node_version"
    
    # Check if dist folder exists
    if [[ ! -d "dist" ]]; then
        error "Distribution folder 'dist' not found. Run 'npm run build' first."
        exit 1
    fi
    
    # Check package.json
    if [[ ! -f "package.json" ]]; then
        error "package.json not found"
        exit 1
    fi
    
    # Validate build
    if [[ ! -f "dist/index.js" ]] || [[ ! -f "dist/index.d.ts" ]]; then
        error "Build artifacts missing"
        exit 1
    fi
    
    success "Pre-deployment checks passed"
}

# Backup current deployment
backup_current() {
    log "Creating backup of current deployment..."
    
    if [[ -d "$DEPLOYMENT_DIR" ]]; then
        local backup_timestamp=$(date +%Y%m%d_%H%M%S)
        local backup_path="${BACKUP_DIR}/backup_${backup_timestamp}"
        
        mkdir -p "$BACKUP_DIR"
        cp -r "$DEPLOYMENT_DIR" "$backup_path"
        
        log "Backup created at: $backup_path"
        echo "$backup_path" > /tmp/last_backup_path
        
        success "Backup completed"
    else
        log "No existing deployment to backup"
    fi
}

# Deploy application
deploy_application() {
    log "Deploying ${PROJECT_NAME} v${VERSION} to ${DEPLOYMENT_ENV}..."
    
    # Create deployment directory
    mkdir -p "$DEPLOYMENT_DIR"
    
    # Copy application files
    cp -r dist/* "$DEPLOYMENT_DIR/"
    cp package.json "$DEPLOYMENT_DIR/"
    cp package-lock.json "$DEPLOYMENT_DIR/"
    
    # Install production dependencies
    cd "$DEPLOYMENT_DIR"
    npm ci --only=production
    
    # Set permissions
    chown -R node:node "$DEPLOYMENT_DIR"
    chmod -R 755 "$DEPLOYMENT_DIR"
    
    success "Application deployed successfully"
}

# Health check
health_check() {
    log "Running health checks..."
    
    local start_time=$(date +%s)
    local end_time=$((start_time + HEALTH_CHECK_TIMEOUT))
    
    while [[ $(date +%s) -lt $end_time ]]; do
        if node -e "require('./index.js')" 2>/dev/null; then
            success "Health check passed"
            return 0
        fi
        
        sleep 5
    done
    
    error "Health check failed after ${HEALTH_CHECK_TIMEOUT} seconds"
    return 1
}

# Rollback function
rollback() {
    if [[ "$ROLLBACK_ENABLED" == "true" ]] && [[ -f "/tmp/last_backup_path" ]]; then
        warn "Initiating rollback..."
        local backup_path=$(cat /tmp/last_backup_path)
        
        if [[ -d "$backup_path" ]]; then
            log "Rolling back to: $backup_path"
            rm -rf "$DEPLOYMENT_DIR"
            mv "$backup_path" "$DEPLOYMENT_DIR"
            success "Rollback completed"
            return 0
        fi
    fi
    
    error "Rollback failed - no backup available"
    return 1
}

# Main deployment flow
main() {
    log "Starting ${PROJECT_NAME} deployment to ${DEPLOYMENT_ENV}"
    
    # Run pre-deployment checks
    pre_deployment_checks
    
    # Backup current deployment
    backup_current
    
    # Deploy application
    deploy_application
    
    # Run health checks
    if ! health_check; then
        if rollback; then
            error "Deployment failed and rollback completed"
        else
            error "Deployment failed and rollback failed"
        fi
        exit 1
    fi
    
    # Post-deployment cleanup
    log "Cleaning up temporary files..."
    rm -f /tmp/last_backup_path
    
    success "Deployment completed successfully!"
    log "${PROJECT_NAME} v${VERSION} is now running in ${DEPLOYMENT_ENV}"
}

# Handle script interruption
trap 'error "Deployment interrupted"; rollback; exit 1' INT TERM

# Run main function
main "$@"