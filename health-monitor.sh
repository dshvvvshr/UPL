#!/bin/bash
# Health Monitoring Script for UPL Gateway System
# This script provides continuous monitoring and automated recovery

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
NODE_PORT="${GATEWAY_PORT:-3000}"
PYTHON_PORT="${PYTHON_PORT:-8000}"
CHECK_INTERVAL="${CHECK_INTERVAL:-60}"  # seconds
MAX_FAILURES="${MAX_FAILURES:-3}"
ALERT_EMAIL="${ALERT_EMAIL:-}"
LOG_FILE="${LOG_FILE:-./logs/health-monitor.log}"

# Create log directory
mkdir -p "$(dirname "$LOG_FILE")"

# Counters
NODE_FAILURES=0
PYTHON_FAILURES=0

# Logging function
log() {
    local level=$1
    shift
    local message="$@"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$level] $message" | tee -a "$LOG_FILE"
}

# Print functions
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
    log "INFO" "$1"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
    log "ERROR" "$1"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    log "WARN" "$1"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
    log "INFO" "$1"
}

# Send alert (extensible)
send_alert() {
    local subject="$1"
    local body="$2"
    
    log "ALERT" "$subject - $body"
    
    # Email notification (if configured)
    if [ -n "$ALERT_EMAIL" ]; then
        echo "$body" | mail -s "$subject" "$ALERT_EMAIL" 2>/dev/null || true
    fi
    
    # Can add more notification methods here:
    # - Slack webhook
    # - PagerDuty
    # - SMS via Twilio
    # etc.
}

# Check service health
check_health() {
    local url=$1
    local service_name=$2
    
    local response=$(curl -sf "$url/health" 2>&1)
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        print_success "$service_name is healthy"
        return 0
    else
        print_error "$service_name health check failed"
        return 1
    fi
}

# Advanced health check with response validation
check_health_advanced() {
    local url=$1
    local service_name=$2
    
    # Check if service responds
    local response=$(curl -sf "$url/health" 2>&1)
    local exit_code=$?
    
    if [ $exit_code -ne 0 ]; then
        print_error "$service_name is not responding"
        return 1
    fi
    
    # Check response content
    if echo "$response" | grep -q "ok\|healthy"; then
        # Additional checks
        local models_response=$(curl -sf "$url/v1/models" 2>&1)
        if [ $? -eq 0 ]; then
            print_success "$service_name is fully operational"
            return 0
        else
            print_warning "$service_name health OK but models endpoint failed"
            return 1
        fi
    else
        print_error "$service_name returned unexpected health response: $response"
        return 1
    fi
}

# Restart service
restart_service() {
    local service=$1
    
    print_warning "Attempting to restart $service..."
    
    if [ "$service" == "nodejs" ]; then
        # Try to restart Node.js gateway
        cd "$(dirname "$0")"
        ./deploy.sh stop
        sleep 2
        ./deploy.sh start-node
    elif [ "$service" == "python" ]; then
        # Try to restart Python gateway
        cd "$(dirname "$0")"
        ./deploy.sh stop
        sleep 2
        ./deploy.sh start-python
    fi
    
    # Wait for service to start
    sleep 5
    
    # Verify restart
    if [ "$service" == "nodejs" ]; then
        if check_health "http://localhost:$NODE_PORT" "Node.js Gateway"; then
            print_success "$service restarted successfully"
            send_alert "Service Recovered" "$service has been restarted and is now healthy"
            return 0
        fi
    elif [ "$service" == "python" ]; then
        if check_health "http://localhost:$PYTHON_PORT" "Python Gateway"; then
            print_success "$service restarted successfully"
            send_alert "Service Recovered" "$service has been restarted and is now healthy"
            return 0
        fi
    fi
    
    print_error "Failed to restart $service"
    return 1
}

# Monitor loop
monitor() {
    print_info "Starting health monitoring..."
    print_info "Check interval: ${CHECK_INTERVAL}s"
    print_info "Max failures before restart: $MAX_FAILURES"
    print_info "Node.js port: $NODE_PORT"
    print_info "Python port: $PYTHON_PORT"
    echo ""
    
    while true; do
        local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
        echo -e "\n${BLUE}═══ Health Check: $timestamp ═══${NC}\n"
        
        # Check Node.js Gateway
        if check_health_advanced "http://localhost:$NODE_PORT" "Node.js Gateway"; then
            NODE_FAILURES=0
        else
            NODE_FAILURES=$((NODE_FAILURES + 1))
            print_warning "Node.js failures: $NODE_FAILURES/$MAX_FAILURES"
            
            if [ $NODE_FAILURES -ge $MAX_FAILURES ]; then
                send_alert "Service Down" "Node.js Gateway has failed $NODE_FAILURES consecutive health checks"
                restart_service "nodejs"
                NODE_FAILURES=0
            fi
        fi
        
        # Check Python Gateway
        if check_health_advanced "http://localhost:$PYTHON_PORT" "Python Gateway"; then
            PYTHON_FAILURES=0
        else
            PYTHON_FAILURES=$((PYTHON_FAILURES + 1))
            print_warning "Python failures: $PYTHON_FAILURES/$MAX_FAILURES"
            
            if [ $PYTHON_FAILURES -ge $MAX_FAILURES ]; then
                send_alert "Service Down" "Python Gateway has failed $PYTHON_FAILURES consecutive health checks"
                restart_service "python"
                PYTHON_FAILURES=0
            fi
        fi
        
        # Wait before next check
        sleep $CHECK_INTERVAL
    done
}

# Single check mode
check_once() {
    echo -e "${BLUE}═══ Health Status Check ═══${NC}\n"
    
    local all_healthy=true
    
    # Check Node.js
    if ! check_health_advanced "http://localhost:$NODE_PORT" "Node.js Gateway"; then
        all_healthy=false
    fi
    
    # Check Python
    if ! check_health_advanced "http://localhost:$PYTHON_PORT" "Python Gateway"; then
        all_healthy=false
    fi
    
    echo ""
    
    if $all_healthy; then
        print_success "All services are healthy"
        return 0
    else
        print_error "Some services are unhealthy"
        return 1
    fi
}

# Status report
status_report() {
    echo -e "${BLUE}═══ System Status Report ═══${NC}\n"
    
    # Node.js Gateway
    echo "Node.js Gateway (Port $NODE_PORT):"
    if curl -sf "http://localhost:$NODE_PORT/health" > /dev/null; then
        echo -e "  Status: ${GREEN}Running${NC}"
        local models=$(curl -sf "http://localhost:$NODE_PORT/v1/models" | jq -r '.data[].id' 2>/dev/null || echo "N/A")
        echo "  Models: $models"
    else
        echo -e "  Status: ${RED}Down${NC}"
    fi
    echo ""
    
    # Python Gateway
    echo "Python Gateway (Port $PYTHON_PORT):"
    if curl -sf "http://localhost:$PYTHON_PORT/health" > /dev/null; then
        echo -e "  Status: ${GREEN}Running${NC}"
        local info=$(curl -sf "http://localhost:$PYTHON_PORT/" | jq -r '.version' 2>/dev/null || echo "N/A")
        echo "  Version: $info"
    else
        echo -e "  Status: ${RED}Down${NC}"
    fi
    echo ""
    
    # Recent log entries
    echo "Recent Log Entries (last 5):"
    if [ -f "$LOG_FILE" ]; then
        tail -5 "$LOG_FILE"
    else
        echo "  No log file found"
    fi
    echo ""
}

# Show usage
show_usage() {
    cat << EOF
UPL Gateway Health Monitoring Script

Usage: $0 [command]

Commands:
    monitor         Start continuous monitoring (default)
    check           Perform single health check
    status          Show detailed status report
    help            Show this help message

Environment Variables:
    GATEWAY_PORT        Node.js gateway port (default: 3000)
    PYTHON_PORT         Python gateway port (default: 8000)
    CHECK_INTERVAL      Seconds between checks (default: 60)
    MAX_FAILURES        Failures before restart (default: 3)
    ALERT_EMAIL         Email for alerts (optional)
    LOG_FILE            Log file path (default: ./logs/health-monitor.log)

Examples:
    # Start continuous monitoring
    $0 monitor

    # Single health check
    $0 check

    # Custom check interval (30 seconds)
    CHECK_INTERVAL=30 $0 monitor

    # With email alerts
    ALERT_EMAIL=admin@example.com $0 monitor

EOF
}

# Main function
main() {
    case "${1:-monitor}" in
        monitor)
            monitor
            ;;
        check)
            check_once
            ;;
        status)
            status_report
            ;;
        help|--help|-h)
            show_usage
            ;;
        *)
            echo "Unknown command: $1"
            show_usage
            exit 1
            ;;
    esac
}

# Run main
main "$@"
