#!/bin/bash
# Rollback and Recovery Script for qgenutils Production Deployment
# Provides automated rollback capabilities and disaster recovery procedures

set -euo pipefail

# Configuration
PROJECT_NAME="qgenutils"
VERSION="1.0.3"
DEPLOYMENT_DIR="/opt/apps/${PROJECT_NAME}"
BACKUP_DIR="/opt/backups/${PROJECT_NAME}"
LOG_DIR="/var/log/${PROJECT_NAME}"
HEALTH_CHECK_TIMEOUT=60
ROLLBACK_RETRIES=3

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

# List available backups
list_backups() {
    log "Available backups:"
    if [[ -d "$BACKUP_DIR" ]]; then
        local backups=($(ls -t "$BACKUP_DIR" | grep "^backup_" | head -10))
        if [[ ${#backups[@]} -eq 0 ]]; then
            warn "No backups found"
            return 1
        fi
        
        for i in "${!backups[@]}"; do
            local backup="${backups[$i]}"
            local backup_path="$BACKUP_DIR/$backup"
            local backup_date=$(stat -c %y "$backup_path" 2>/dev/null || echo "Unknown")
            echo "  $((i+1)). $backup ($backup_date)"
        done
        return 0
    else
        warn "Backup directory does not exist"
        return 1
    fi
}

# Get latest backup
get_latest_backup() {
    if [[ -d "$BACKUP_DIR" ]]; then
        local latest_backup=$(ls -t "$BACKUP_DIR" | grep "^backup_" | head -1)
        if [[ -n "$latest_backup" ]]; then
            echo "$BACKUP_DIR/$latest_backup"
            return 0
        fi
    fi
    return 1
}

# Validate backup integrity
validate_backup() {
    local backup_path="$1"
    
    log "Validating backup integrity: $backup_path"
    
    # Check if backup directory exists
    if [[ ! -d "$backup_path" ]]; then
        error "Backup directory does not exist: $backup_path"
        return 1
    fi
    
    # Check for critical files
    local required_files=("package.json" "dist/index.js" "dist/index.d.ts")
    for file in "${required_files[@]}"; do
        if [[ ! -f "$backup_path/$file" ]]; then
            error "Required backup file missing: $file"
            return 1
        fi
    done
    
    # Check node_modules exists or can be restored
    if [[ ! -d "$backup_path/node_modules" ]]; then
        warn "node_modules not in backup - will need to reinstall"
    fi
    
    success "Backup validation passed"
    return 0
}

# Perform rollback to specified backup
perform_rollback() {
    local backup_path="$1"
    local force=${2:-false}
    
    log "Starting rollback to: $backup_path"
    
    # Create current deployment backup before rollback
    if [[ -d "$DEPLOYMENT_DIR" ]] && [[ "$force" != "true" ]]; then
        local emergency_backup="$BACKUP_DIR/emergency_backup_$(date +%Y%m%d_%H%M%S)"
        log "Creating emergency backup: $emergency_backup"
        cp -r "$DEPLOYMENT_DIR" "$emergency_backup"
    fi
    
    # Stop current service
    log "Stopping current service..."
    if systemctl is-active --quiet "$PROJECT_NAME" 2>/dev/null; then
        systemctl stop "$PROJECT_NAME"
    fi
    
    # Kill any remaining node processes
    pkill -f "node.*$PROJECT_NAME" || true
    sleep 5
    
    # Remove current deployment
    if [[ -d "$DEPLOYMENT_DIR" ]]; then
        log "Removing current deployment..."
        rm -rf "$DEPLOYMENT_DIR"
    fi
    
    # Restore from backup
    log "Restoring from backup..."
    cp -r "$backup_path" "$DEPLOYMENT_DIR"
    
    # Reinstall dependencies if needed
    if [[ ! -d "$DEPLOYMENT_DIR/node_modules" ]]; then
        log "Installing dependencies..."
        cd "$DEPLOYMENT_DIR"
        npm ci --only=production
    fi
    
    # Set permissions
    chown -R node:node "$DEPLOYMENT_DIR"
    chmod -R 755 "$DEPLOYMENT_DIR"
    
    # Start service
    log "Starting restored service..."
    systemctl start "$PROJECT_NAME"
    
    # Health check
    if health_check; then
        success "Rollback completed successfully"
        log "Service is now running from backup: $backup_path"
        return 0
    else
        error "Rollback failed - service not healthy"
        return 1
    fi
}

# Health check after rollback
health_check() {
    log "Performing health check..."
    
    local start_time=$(date +%s)
    local end_time=$((start_time + HEALTH_CHECK_TIMEOUT))
    
    # Wait for service to be active
    while [[ $(date +%s) -lt $end_time ]]; do
        if systemctl is-active --quiet "$PROJECT_NAME"; then
            sleep 5
            # Test application health
            if curl -f -s http://localhost:3000/health > /dev/null 2>&1; then
                success "Health check passed"
                return 0
            fi
        fi
        sleep 2
    done
    
    error "Health check failed after $HEALTH_CHECK_TIMEOUT seconds"
    return 1
}

# Automated rollback with retry
auto_rollback() {
    local max_attempts=$1
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        log "Rollback attempt $attempt/$max_attempts"
        
        local latest_backup
        if latest_backup=$(get_latest_backup); then
            if validate_backup "$latest_backup"; then
                if perform_rollback "$latest_backup"; then
                    success "Automated rollback successful on attempt $attempt"
                    return 0
                fi
            fi
        fi
        
        if [[ $attempt -eq $max_attempts ]]; then
            error "Automated rollback failed after $max_attempts attempts"
            return 1
        fi
        
        warn "Rollback attempt $attempt failed, retrying..."
        attempt=$((attempt + 1))
        sleep 10
    done
    
    return 1
}

# Create disaster recovery package
create_disaster_recovery_package() {
    local recovery_dir="$BACKUP_DIR/disaster_recovery_$(date +%Y%m%d_%H%M%S)"
    
    log "Creating disaster recovery package: $recovery_dir"
    mkdir -p "$recovery_dir"
    
    # Copy latest working backup
    local latest_backup
    if latest_backup=$(get_latest_backup); then
        cp -r "$latest_backup" "$recovery_dir/latest_backup"
    fi
    
    # Copy configuration files
    mkdir -p "$recovery_dir/config"
    cp -r /etc/nginx/sites-available/* "$recovery_dir/config/" 2>/dev/null || true
    cp -r /etc/systemd/system/* "$recovery_dir/config/" 2>/dev/null || true
    
    # Copy logs
    mkdir -p "$recovery_dir/logs"
    cp -r "$LOG_DIR"/* "$recovery_dir/logs/" 2>/dev/null || true
    
    # Create recovery script
    cat > "$recovery_dir/disaster_recovery.sh" << 'EOF'
#!/bin/bash
# Disaster Recovery Script

set -euo pipefail

PROJECT_NAME="qgenutils"
DEPLOYMENT_DIR="/opt/apps/${PROJECT_NAME}"

echo "Starting disaster recovery..."

# Stop any running services
systemctl stop "$PROJECT_NAME" || true
pkill -f "node.*$PROJECT_NAME" || true

# Remove broken deployment
rm -rf "$DEPLOYMENT_DIR"

# Restore from backup
if [[ -d "latest_backup" ]]; then
    echo "Restoring from latest backup..."
    cp -r latest_backup "$DEPLOYMENT_DIR"
    
    # Install dependencies
    cd "$DEPLOYMENT_DIR"
    npm ci --only=production
    
    # Set permissions
    chown -R node:node "$DEPLOYMENT_DIR"
    chmod -R 755 "$DEPLOYMENT_DIR"
    
    # Start service
    systemctl start "$PROJECT_NAME"
    
    echo "Disaster recovery completed"
else
    echo "No backup found in recovery package"
    exit 1
fi
EOF
    
    chmod +x "$recovery_dir/disaster_recovery.sh"
    
    # Create archive
    local archive_path="${recovery_dir}.tar.gz"
    tar -czf "$archive_path" -C "$BACKUP_DIR" "$(basename "$recovery_dir")"
    
    success "Disaster recovery package created: $archive_path"
    log "To recover: tar -xzf $archive_path && cd $(basename "$recovery_dir") && ./disaster_recovery.sh"
}

# Main rollback menu
rollback_menu() {
    echo "=== qgenutils Rollback Menu ==="
    echo "1. List available backups"
    echo "2. Rollback to latest backup"
    echo "3. Rollback to specific backup"
    echo "4. Create disaster recovery package"
    echo "5. Automated rollback (emergency)"
    echo "6. Exit"
    echo ""
    
    read -p "Select option (1-6): " choice
    
    case $choice in
        1)
            list_backups
            ;;
        2)
            local latest_backup
            if latest_backup=$(get_latest_backup); then
                if validate_backup "$latest_backup"; then
                    perform_rollback "$latest_backup"
                fi
            else
                error "No backups available"
            fi
            ;;
        3)
            list_backups
            echo ""
            read -p "Enter backup number or full path: " backup_input
            
            if [[ "$backup_input" =~ ^[0-9]+$ ]]; then
                local backups=($(ls -t "$BACKUP_DIR" | grep "^backup_"))
                local backup_index=$((backup_input - 1))
                if [[ $backup_index -ge 0 ]] && [[ $backup_index -lt ${#backups[@]} ]]; then
                    local backup_path="$BACKUP_DIR/${backups[$backup_index]}"
                    if validate_backup "$backup_path"; then
                        perform_rollback "$backup_path"
                    fi
                else
                    error "Invalid backup number"
                fi
            else
                if validate_backup "$backup_input"; then
                    perform_rollback "$backup_input"
                fi
            fi
            ;;
        4)
            create_disaster_recovery_package
            ;;
        5)
            auto_rollback $ROLLBACK_RETRIES
            ;;
        6)
            exit 0
            ;;
        *)
            error "Invalid option"
            ;;
    esac
}

# Main function
main() {
    # Check if running as root
    if [[ $EUID -ne 0 ]]; then
        error "This script must be run as root"
        exit 1
    fi
    
    log "qgenutils Rollback and Recovery Tool v1.0.3"
    
    # Handle command line arguments
    if [[ $# -gt 0 ]]; then
        case "$1" in
            --latest)
                local latest_backup
                if latest_backup=$(get_latest_backup); then
                    perform_rollback "$latest_backup"
                else
                    error "No backups available"
                    exit 1
                fi
                ;;
            --auto)
                auto_rollback $ROLLBACK_RETRIES
                ;;
            --package)
                create_disaster_recovery_package
                ;;
            --help)
                echo "Usage: $0 [option]"
                echo "Options:"
                echo "  --latest     Rollback to latest backup"
                echo "  --auto       Automated rollback with retry"
                echo "  --package    Create disaster recovery package"
                echo "  --help       Show this help message"
                echo ""
                echo "No arguments: Show interactive menu"
                exit 0
                ;;
            *)
                error "Unknown option: $1"
                echo "Use --help for usage information"
                exit 1
                ;;
        esac
    else
        # Interactive mode
        while true; do
            rollback_menu
            echo ""
            read -p "Press Enter to continue or 'q' to quit: " continue_choice
            if [[ "$continue_choice" =~ ^[Qq]$ ]]; then
                break
            fi
        done
    fi
    
    success "Rollback and recovery operations completed"
}

# Run main function
main "$@"