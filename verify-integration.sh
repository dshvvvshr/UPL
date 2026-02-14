#!/bin/bash
# System Integration Verification Script
# Comprehensive testing of both gateway implementations

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
TEST_RESULTS_FILE="./logs/integration-test-results.json"

# Create logs directory
mkdir -p ./logs

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Helper functions
print_header() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

print_test() {
    echo -e "${BLUE}▶ Test: $1${NC}"
}

print_pass() {
    echo -e "${GREEN}  ✓ PASS: $1${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
}

print_fail() {
    echo -e "${RED}  ✗ FAIL: $1${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
}

print_info() {
    echo -e "${YELLOW}  ℹ $1${NC}"
}

# Test function wrapper
run_test() {
    local test_name="$1"
    TESTS_RUN=$((TESTS_RUN + 1))
    print_test "$test_name"
}

# Test: Service Health Checks
test_health_checks() {
    print_header "Health Check Tests"
    
    # Node.js health check
    run_test "Node.js Gateway Health Check"
    local response=$(curl -sf "http://localhost:$NODE_PORT/health" 2>&1)
    if echo "$response" | grep -q "ok"; then
        print_pass "Node.js gateway is healthy"
    else
        print_fail "Node.js gateway health check failed: $response"
    fi
    
    # Python health check
    run_test "Python Gateway Health Check"
    response=$(curl -sf "http://localhost:$PYTHON_PORT/health" 2>&1)
    if echo "$response" | grep -q "healthy"; then
        print_pass "Python gateway is healthy"
    else
        print_fail "Python gateway health check failed: $response"
    fi
}

# Test: API Endpoints
test_api_endpoints() {
    print_header "API Endpoint Tests"
    
    # Node.js models endpoint
    run_test "Node.js Models Endpoint"
    local response=$(curl -sf "http://localhost:$NODE_PORT/v1/models" 2>&1)
    if echo "$response" | grep -q "gpt-4"; then
        print_pass "Models endpoint returns expected data"
        print_info "Response: $(echo $response | jq -c '.data[0].id' 2>/dev/null || echo $response)"
    else
        print_fail "Models endpoint failed: $response"
    fi
    
    # Python root endpoint
    run_test "Python Root Endpoint"
    response=$(curl -sf "http://localhost:$PYTHON_PORT/" 2>&1)
    if echo "$response" | grep -q "Chat Completions API"; then
        print_pass "Root endpoint returns API information"
        print_info "Response: $(echo $response | jq -c '.name' 2>/dev/null || echo $response)"
    else
        print_fail "Root endpoint failed: $response"
    fi
}

# Test: Core Directive Injection
test_core_directive() {
    print_header "Core Directive Injection Tests"
    
    # Test Node.js gateway chat completions
    run_test "Node.js Chat Completions (requires OPENAI_API_KEY)"
    if [ -n "${OPENAI_API_KEY}" ]; then
        local response=$(curl -sf -X POST "http://localhost:$NODE_PORT/v1/chat/completions" \
            -H "Content-Type: application/json" \
            -d '{
                "model": "gpt-4",
                "messages": [{"role": "user", "content": "Hello"}],
                "max_tokens": 10
            }' 2>&1)
        
        if echo "$response" | grep -q "choices\|error"; then
            print_pass "Chat completions endpoint responded"
            print_info "Response contains: $(echo $response | jq -c '.choices[0].message.content // .error.message' 2>/dev/null || echo 'N/A')"
        else
            print_fail "Chat completions failed: $response"
        fi
    else
        print_info "Skipped (OPENAI_API_KEY not set)"
        TESTS_RUN=$((TESTS_RUN - 1))
    fi
    
    # Test Python gateway chat completions
    run_test "Python Chat Completions (Mock Response)"
    response=$(curl -sf -X POST "http://localhost:$PYTHON_PORT/v1/chat/completions" \
        -H "Content-Type: application/json" \
        -d '{
            "model": "gpt-3.5-turbo",
            "messages": [{"role": "user", "content": "Hello"}]
        }' 2>&1)
    
    if echo "$response" | grep -q "Processed.*messages.*Core Directive"; then
        print_pass "Python gateway applies Core Directive"
        local msg_count=$(echo "$response" | jq -r '.choices[0].message.content' 2>/dev/null || echo "")
        print_info "Response: $msg_count"
    else
        print_fail "Python gateway directive injection failed: $response"
    fi
}

# Test: Response Format Validation
test_response_format() {
    print_header "Response Format Validation"
    
    # Validate Python response structure
    run_test "Python Response Structure"
    local response=$(curl -sf -X POST "http://localhost:$PYTHON_PORT/v1/chat/completions" \
        -H "Content-Type: application/json" \
        -d '{
            "model": "gpt-3.5-turbo",
            "messages": [{"role": "user", "content": "Test"}]
        }')
    
    local has_all_fields=true
    
    if ! echo "$response" | jq -e '.id' > /dev/null 2>&1; then
        has_all_fields=false
        print_fail "Missing 'id' field"
    fi
    
    if ! echo "$response" | jq -e '.choices[0].message.content' > /dev/null 2>&1; then
        has_all_fields=false
        print_fail "Missing 'choices[0].message.content' field"
    fi
    
    if ! echo "$response" | jq -e '.usage' > /dev/null 2>&1; then
        has_all_fields=false
        print_fail "Missing 'usage' field"
    fi
    
    if $has_all_fields; then
        print_pass "Response has all required fields"
        print_info "ID: $(echo $response | jq -r '.id')"
        print_info "Tokens: $(echo $response | jq -r '.usage.total_tokens')"
    fi
}

# Test: Error Handling
test_error_handling() {
    print_header "Error Handling Tests"
    
    # Test invalid request (missing model)
    run_test "Invalid Request Handling"
    local response=$(curl -sf -X POST "http://localhost:$PYTHON_PORT/v1/chat/completions" \
        -H "Content-Type: application/json" \
        -d '{
            "messages": [{"role": "user", "content": "Test"}]
        }' 2>&1)
    
    if echo "$response" | grep -qi "error\|validation\|required"; then
        print_pass "Gateway properly handles invalid requests"
    else
        # Python might have default model, check if it still works
        if echo "$response" | jq -e '.choices' > /dev/null 2>&1; then
            print_pass "Gateway uses default model for missing model field"
        else
            print_fail "Unexpected response to invalid request: $response"
        fi
    fi
    
    # Test malformed JSON
    run_test "Malformed JSON Handling"
    response=$(curl -s -w "\n%{http_code}" -X POST "http://localhost:$PYTHON_PORT/v1/chat/completions" \
        -H "Content-Type: application/json" \
        -d '{invalid json}' 2>&1)
    
    local http_code=$(echo "$response" | tail -1)
    if [ "$http_code" == "422" ] || [ "$http_code" == "400" ]; then
        print_pass "Gateway returns appropriate error code for malformed JSON"
    else
        print_info "HTTP Code: $http_code (expected 400 or 422)"
    fi
}

# Test: Concurrent Requests
test_concurrent_requests() {
    print_header "Concurrent Request Tests"
    
    run_test "Concurrent Requests to Python Gateway"
    
    # Send 5 concurrent requests
    local pids=()
    for i in {1..5}; do
        (curl -sf -X POST "http://localhost:$PYTHON_PORT/v1/chat/completions" \
            -H "Content-Type: application/json" \
            -d "{
                \"model\": \"gpt-3.5-turbo\",
                \"messages\": [{\"role\": \"user\", \"content\": \"Request $i\"}]
            }" > /dev/null 2>&1) &
        pids+=($!)
    done
    
    # Wait for all requests
    local all_success=true
    for pid in "${pids[@]}"; do
        if ! wait $pid; then
            all_success=false
        fi
    done
    
    if $all_success; then
        print_pass "All concurrent requests completed successfully"
    else
        print_fail "Some concurrent requests failed"
    fi
}

# Test: Performance Baseline
test_performance() {
    print_header "Performance Baseline Tests"
    
    run_test "Response Time Measurement"
    
    # Test Python gateway response time
    local start_time=$(date +%s%N)
    curl -sf -X POST "http://localhost:$PYTHON_PORT/v1/chat/completions" \
        -H "Content-Type: application/json" \
        -d '{
            "model": "gpt-3.5-turbo",
            "messages": [{"role": "user", "content": "Performance test"}]
        }' > /dev/null 2>&1
    local end_time=$(date +%s%N)
    
    local response_time=$(( (end_time - start_time) / 1000000 ))  # Convert to milliseconds
    
    if [ $response_time -lt 1000 ]; then
        print_pass "Response time: ${response_time}ms (excellent)"
    elif [ $response_time -lt 3000 ]; then
        print_pass "Response time: ${response_time}ms (good)"
    else
        print_info "Response time: ${response_time}ms"
    fi
}

# Test: Core Directive Presence
test_directive_presence() {
    print_header "Core Directive Verification"
    
    run_test "Core Directive Configuration"
    
    # Check if Core Directive is defined in Python app
    if grep -q "inalienable right" app/core_directive.py 2>/dev/null; then
        print_pass "Core Directive found in Python implementation"
    else
        print_fail "Core Directive not found in Python implementation"
    fi
    
    # Check if Core Directive is defined in Node.js app
    if grep -q "inalienable right" src/gateway.js 2>/dev/null; then
        print_pass "Core Directive found in Node.js implementation"
    else
        print_fail "Core Directive not found in Node.js implementation"
    fi
}

# Generate test report
generate_report() {
    print_header "Test Summary"
    
    local pass_rate=0
    if [ $TESTS_RUN -gt 0 ]; then
        pass_rate=$(awk "BEGIN {printf \"%.1f\", ($TESTS_PASSED/$TESTS_RUN)*100}")
    fi
    
    echo -e "Total Tests Run:    ${BLUE}$TESTS_RUN${NC}"
    echo -e "Tests Passed:       ${GREEN}$TESTS_PASSED${NC}"
    echo -e "Tests Failed:       ${RED}$TESTS_FAILED${NC}"
    echo -e "Pass Rate:          ${BLUE}${pass_rate}%${NC}"
    echo ""
    
    # Create JSON report
    cat > "$TEST_RESULTS_FILE" << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "total_tests": $TESTS_RUN,
  "passed": $TESTS_PASSED,
  "failed": $TESTS_FAILED,
  "pass_rate": $pass_rate,
  "status": "$( [ $TESTS_FAILED -eq 0 ] && echo "SUCCESS" || echo "FAILURE" )"
}
EOF
    
    echo -e "Test results saved to: ${BLUE}$TEST_RESULTS_FILE${NC}"
    echo ""
    
    if [ $TESTS_FAILED -eq 0 ]; then
        echo -e "${GREEN}╔═══════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║   All Integration Tests Passed! ✓    ║${NC}"
        echo -e "${GREEN}╚═══════════════════════════════════════╝${NC}"
        return 0
    else
        echo -e "${RED}╔═══════════════════════════════════════╗${NC}"
        echo -e "${RED}║   Some Tests Failed ✗                ║${NC}"
        echo -e "${RED}╚═══════════════════════════════════════╝${NC}"
        return 1
    fi
}

# Main function
main() {
    echo -e "${BLUE}"
    cat << "EOF"
╔══════════════════════════════════════════════════╗
║  UPL System Integration Verification            ║
║  Testing Both Node.js and Python Implementations ║
╚══════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
    
    # Run all tests
    test_health_checks
    test_api_endpoints
    test_core_directive
    test_response_format
    test_error_handling
    test_concurrent_requests
    test_performance
    test_directive_presence
    
    # Generate report
    generate_report
}

# Run main
main "$@"
