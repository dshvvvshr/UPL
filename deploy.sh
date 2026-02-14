#!/bin/bash
# Unified Deployment Script for UPL Gateway System
# This script helps deploy and manage both Node.js and Python implementations

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NODE_PORT="${GATEWAY_PORT:-3000}"
PYTHON_PORT="${PYTHON_PORT:-8000}"
LOG_DIR="${LOG_DIR:-$SCRIPT_DIR/logs}"

# Create log directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Helper functions
print_header() {
    echo -e "${BLUE}================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"
    
    local has_error=0
    
    # Check Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js found: $NODE_VERSION"
    else
        print_error "Node.js not found"
        has_error=1
    fi
    
    # Check npm
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_success "npm found: $NPM_VERSION"
    else
        print_error "npm not found"
        has_error=1
    fi
    
    # Check Python
    if command -v python3 &> /dev/null; then
        PYTHON_VERSION=$(python3 --version)
        print_success "Python found: $PYTHON_VERSION"
    else
        print_error "Python3 not found"
        has_error=1
    fi
    
    # Check pip
    if command -v pip &> /dev/null || command -v pip3 &> /dev/null; then
        print_success "pip found"
    else
        print_error "pip not found"
        has_error=1
    fi
    
    # Check for .env file
    if [ -f "$SCRIPT_DIR/.env" ]; then
        print_success ".env file found"
    else
        print_warning ".env file not found - using defaults"
    fi
    
    echo ""
    
    if [ $has_error -eq 1 ]; then
        print_error "Prerequisites check failed. Please install missing components."
        exit 1
    fi
    
    print_success "All prerequisites satisfied"
    echo ""
}

# Install dependencies
install_dependencies() {
    print_header "Installing Dependencies"
    
    # Install Node.js dependencies
    print_info "Installing Node.js dependencies..."
    cd "$SCRIPT_DIR"
    npm install
    print_success "Node.js dependencies installed"
    
    # Install Python dependencies
    print_info "Installing Python dependencies..."
    pip install -r requirements.txt
    print_success "Python dependencies installed"
    
    echo ""
}

# Run tests
run_tests() {
    print_header "Running Tests"
    
    # Node.js tests
    print_info "Running Node.js tests..."
    cd "$SCRIPT_DIR"
    npm test
    print_success "Node.js tests passed"
    
    # Python tests
    print_info "Running Python tests..."
    python3 -m pytest tests/test_main.py -v
    print_success "Python tests passed"
    
    echo ""
}

# Start Node.js gateway
start_nodejs() {
    print_header "Starting Node.js Gateway"
    
    cd "$SCRIPT_DIR"
    
    # Check if already running
    if lsof -Pi :$NODE_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_warning "Port $NODE_PORT is already in use"
        return 1
    fi
    
    print_info "Starting Node.js gateway on port $NODE_PORT..."
    nohup node src/gateway.js > "$LOG_DIR/nodejs-gateway.log" 2>&1 &
    local PID=$!
    echo $PID > "$LOG_DIR/nodejs-gateway.pid"
    
    # Wait a moment and check if it's running
    sleep 2
    if ps -p $PID > /dev/null; then
        print_success "Node.js gateway started (PID: $PID)"
        
        # Test health endpoint
        if curl -sf http://localhost:$NODE_PORT/health > /dev/null; then
            print_success "Health check passed"
        else
            print_warning "Health check failed"
        fi
    else
        print_error "Failed to start Node.js gateway"
        return 1
    fi
    
    echo ""
}

# Start Python gateway
start_python() {
    print_header "Starting Python Gateway"
    
    cd "$SCRIPT_DIR"
    
    # Check if already running
    if lsof -Pi :$PYTHON_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_warning "Port $PYTHON_PORT is already in use"
        return 1
    fi
    
    print_info "Starting Python gateway on port $PYTHON_PORT..."
    nohup python3 -m uvicorn app.main:app --host 0.0.0.0 --port $PYTHON_PORT > "$LOG_DIR/python-gateway.log" 2>&1 &
    local PID=$!
    echo $PID > "$LOG_DIR/python-gateway.pid"
    
    # Wait a moment and check if it's running
    sleep 3
    if ps -p $PID > /dev/null; then
        print_success "Python gateway started (PID: $PID)"
        
        # Test health endpoint
        if curl -sf http://localhost:$PYTHON_PORT/health > /dev/null; then
            print_success "Health check passed"
        else
            print_warning "Health check failed"
        fi
    else
        print_error "Failed to start Python gateway"
        return 1
    fi
    
    echo ""
}

# Stop services
stop_services() {
    print_header "Stopping Services"
    
    # Stop Node.js gateway
    if [ -f "$LOG_DIR/nodejs-gateway.pid" ]; then
        local PID=$(cat "$LOG_DIR/nodejs-gateway.pid")
        if ps -p $PID > /dev/null 2>&1; then
            kill $PID
            print_success "Stopped Node.js gateway (PID: $PID)"
            rm "$LOG_DIR/nodejs-gateway.pid"
        else
            print_warning "Node.js gateway not running"
            rm "$LOG_DIR/nodejs-gateway.pid"
        fi
    else
        print_info "No Node.js gateway PID file found"
    fi
    
    # Stop Python gateway
    if [ -f "$LOG_DIR/python-gateway.pid" ]; then
        local PID=$(cat "$LOG_DIR/python-gateway.pid")
        if ps -p $PID > /dev/null 2>&1; then
            kill $PID
            print_success "Stopped Python gateway (PID: $PID)"
            rm "$LOG_DIR/python-gateway.pid"
        else
            print_warning "Python gateway not running"
            rm "$LOG_DIR/python-gateway.pid"
        fi
    else
        print_info "No Python gateway PID file found"
    fi
    
    echo ""
}

# Check status
check_status() {
    print_header "Service Status"
    
    # Check Node.js gateway
    if [ -f "$LOG_DIR/nodejs-gateway.pid" ]; then
        local PID=$(cat "$LOG_DIR/nodejs-gateway.pid")
        if ps -p $PID > /dev/null 2>&1; then
            print_success "Node.js gateway is running (PID: $PID, Port: $NODE_PORT)"
            if curl -sf http://localhost:$NODE_PORT/health > /dev/null; then
                print_success "  Health check: OK"
            else
                print_error "  Health check: FAILED"
            fi
        else
            print_error "Node.js gateway is not running (stale PID file)"
        fi
    else
        print_info "Node.js gateway is not running"
    fi
    
    # Check Python gateway
    if [ -f "$LOG_DIR/python-gateway.pid" ]; then
        local PID=$(cat "$LOG_DIR/python-gateway.pid")
        if ps -p $PID > /dev/null 2>&1; then
            print_success "Python gateway is running (PID: $PID, Port: $PYTHON_PORT)"
            if curl -sf http://localhost:$PYTHON_PORT/health > /dev/null; then
                print_success "  Health check: OK"
            else
                print_error "  Health check: FAILED"
            fi
        else
            print_error "Python gateway is not running (stale PID file)"
        fi
    else
        print_info "Python gateway is not running"
    fi
    
    echo ""
}

# Show logs
show_logs() {
    local service=$1
    
    if [ "$service" == "nodejs" ]; then
        if [ -f "$LOG_DIR/nodejs-gateway.log" ]; then
            tail -f "$LOG_DIR/nodejs-gateway.log"
        else
            print_error "No Node.js gateway logs found"
        fi
    elif [ "$service" == "python" ]; then
        if [ -f "$LOG_DIR/python-gateway.log" ]; then
            tail -f "$LOG_DIR/python-gateway.log"
        else
            print_error "No Python gateway logs found"
        fi
    else
        print_error "Unknown service. Use 'nodejs' or 'python'"
    fi
}

# Main menu
show_usage() {
    cat << EOF
UPL Gateway Deployment Script

Usage: $0 [command] [options]

Commands:
    check           Check prerequisites
    install         Install all dependencies
    test            Run all tests
    start-node      Start Node.js gateway
    start-python    Start Python gateway
    start-all       Start both gateways
    stop            Stop all services
    restart         Restart all services
    status          Check service status
    logs [service]  Show logs (service: nodejs|python)
    full-deploy     Full deployment (install, test, start all)

Environment Variables:
    GATEWAY_PORT    Node.js gateway port (default: 3000)
    PYTHON_PORT     Python gateway port (default: 8000)
    LOG_DIR         Log directory (default: ./logs)

Examples:
    $0 full-deploy              # Complete deployment
    $0 start-all                # Start both gateways
    $0 status                   # Check status
    $0 logs nodejs              # View Node.js logs
    GATEWAY_PORT=3001 $0 start-node  # Start Node.js on custom port

EOF
}

# Main script logic
main() {
    case "${1:-}" in
        check)
            check_prerequisites
            ;;
        install)
            check_prerequisites
            install_dependencies
            ;;
        test)
            run_tests
            ;;
        start-node)
            start_nodejs
            ;;
        start-python)
            start_python
            ;;
        start-all)
            start_nodejs
            start_python
            check_status
            ;;
        stop)
            stop_services
            ;;
        restart)
            stop_services
            start_nodejs
            start_python
            check_status
            ;;
        status)
            check_status
            ;;
        logs)
            show_logs "${2:-}"
            ;;
        full-deploy)
            check_prerequisites
            install_dependencies
            run_tests
            stop_services
            start_nodejs
            start_python
            check_status
            print_success "Full deployment complete!"
            ;;
        *)
            show_usage
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
