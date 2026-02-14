# Deployment Guide

## Overview

This repository contains a dual-implementation LLM gateway system that enforces the Core Directive across all AI interactions. Both implementations are production-ready and fully functional.

## Architecture

The system consists of two independent but compatible implementations:

### 1. Node.js Gateway (`src/gateway.js`)
- **Port**: 3000 (configurable via `GATEWAY_PORT`)
- **Technology**: Express.js
- **Use Case**: Production deployments requiring high performance and streaming support
- **Features**:
  - OpenAI-compatible API endpoints
  - Streaming response support
  - Core Directive injection for all requests
  - Minimal dependencies

### 2. Python FastAPI Gateway (`app/main.py`)
- **Port**: 8000 (configurable)
- **Technology**: FastAPI + Uvicorn
- **Use Case**: Python-centric environments, development, and testing
- **Features**:
  - OpenAI-compatible API endpoints
  - Automatic API documentation (Swagger UI at `/docs`)
  - Core Directive injection for all requests
  - Type-safe request/response handling

## Verified Functionality

### Testing Results
✅ **Node.js Gateway**: All 7 tests passing
- Health check endpoint
- Models listing endpoint
- Core Directive injection (with and without existing system messages)
- Chat completions and completions endpoints

✅ **Python FastAPI Gateway**: All 7 tests passing
- Root endpoint with API information
- Health check endpoint
- Core Directive wrapping logic
- Chat completions endpoint with proper response structure

### Manual Verification
Both implementations have been manually tested and verified:
- Server startup and health checks
- API endpoint responses
- Core Directive injection functionality
- Proper JSON response formatting

## Deployment Options

### Option 1: Node.js Gateway (Recommended for Production)

#### Prerequisites
- Node.js v18.x, v20.x, or v22.x
- npm or yarn

#### Setup
```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your OPENAI_API_KEY and other settings

# Start the server
npm start
```

#### Docker Deployment (Node.js)
```dockerfile
FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY src ./src
COPY .env ./
EXPOSE 3000
CMD ["node", "src/gateway.js"]
```

### Option 2: Python FastAPI Gateway

#### Prerequisites
- Python 3.10+
- pip

#### Setup
```bash
# Install dependencies
pip install -r requirements.txt

# Start the server
python3 run.py
# Or with uvicorn directly:
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

#### Docker Deployment (Python)
```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY app ./app
COPY run.py ./
EXPOSE 8000
CMD ["python3", "run.py"]
```

### Option 3: Dual Deployment (Both Implementations)

Run both implementations simultaneously for redundancy and flexibility:

```bash
# Terminal 1: Start Node.js gateway on port 3000
npm start

# Terminal 2: Start Python gateway on port 8000
python3 run.py
```

## Environment Configuration

Both implementations share similar configuration options:

### Node.js (.env)
```env
GATEWAY_PORT=3000
OPENAI_API_KEY=your-api-key-here
OPENAI_BASE_URL=https://api.openai.com
DEFAULT_MODEL=gpt-4
CORE_DIRECTIVE="Your Core Directive text here"
```

### Python
- Uses the same environment variables
- Core Directive is defined in `app/core_directive.py`
- Server configuration in `run.py`

## API Endpoints

Both implementations expose identical endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/` | GET | API information (Python only) |
| `/v1/models` | GET | List available models |
| `/v1/chat/completions` | POST | Chat completions with Core Directive |
| `/v1/completions` | POST | Text completions with Core Directive (Node.js only) |

## Integration with Tools

### GitHub Copilot
1. Start the gateway (either implementation)
2. Configure Copilot to use your gateway URL
3. All Copilot requests will be governed by the Core Directive

### Other OpenAI-Compatible Clients
Any client that supports OpenAI's API format can connect to either gateway:
```python
from openai import OpenAI

# Connect to Node.js gateway
client = OpenAI(
    base_url="http://localhost:3000/v1",
    api_key="not-needed-for-local"
)

# Or connect to Python gateway
client = OpenAI(
    base_url="http://localhost:8000/v1",
    api_key="not-needed-for-local"
)
```

## Self-Sustaining Features

This deployment is designed for autonomous operation:

### 1. Modularity
- Independent Node.js and Python implementations
- Clear separation of concerns
- No cross-dependencies

### 2. Self-Healing
- Stateless design enables easy restart
- No database dependencies
- Simple health check endpoints for monitoring

### 3. Offline Capability
- Can operate without internet once deployed
- No external dependencies required at runtime (except for LLM API calls)
- All Core Directive logic is self-contained

### 4. Adaptability
- Core Directive can be updated via environment variables
- No code changes required for directive updates
- Works with any OpenAI-compatible backend

## Monitoring and Health Checks

### Health Check Endpoints
```bash
# Node.js
curl http://localhost:3000/health

# Python
curl http://localhost:8000/health
```

### Suggested Monitoring Setup
1. Use a simple cron job or systemd timer to check health endpoints
2. Restart service if health check fails
3. Log all health check results for auditing

Example health check script:
```bash
#!/bin/bash
# healthcheck.sh

check_service() {
    local url=$1
    local name=$2
    
    if curl -sf "$url/health" > /dev/null; then
        echo "✅ $name is healthy"
        return 0
    else
        echo "❌ $name is unhealthy"
        return 1
    fi
}

check_service "http://localhost:3000" "Node.js Gateway"
check_service "http://localhost:8000" "Python Gateway"
```

## Production Recommendations

### For Maximum Reliability
1. **Deploy both implementations** behind a load balancer
2. Use different ports and configure failover
3. Set up health monitoring on both
4. Keep Core Directive synchronized across both

### For Resource Efficiency
1. **Choose one implementation** based on your stack:
   - Node.js: Better for streaming, lower memory footprint
   - Python: Better for Python ecosystem integration, easier debugging

### Security Considerations
1. **Never commit `.env` files** with real API keys
2. Use environment variables or secrets management
3. Consider adding authentication middleware
4. Use HTTPS in production (reverse proxy recommended)

## Scaling Strategy

### Horizontal Scaling
Both implementations are stateless and can be scaled horizontally:
```bash
# Run multiple instances with different ports
GATEWAY_PORT=3001 node src/gateway.js &
GATEWAY_PORT=3002 node src/gateway.js &
GATEWAY_PORT=3003 node src/gateway.js &
```

### Load Balancing
Use nginx, HAProxy, or cloud load balancers to distribute traffic.

## Unified Vision

This dual implementation strategy supports the project's goal of a **unified+modular autonomous self-sustaining system**:

- ✅ **Unified**: Both implementations enforce the same Core Directive
- ✅ **Modular**: Can use either or both implementations independently
- ✅ **Autonomous**: No required external dependencies for core functionality
- ✅ **Self-Sustaining**: Stateless design, easy to restart and maintain
- ✅ **No Constant Connection**: Works offline once deployed (except for LLM calls)

## Next Steps

1. Choose your deployment strategy (Node.js, Python, or both)
2. Configure environment variables
3. Test locally using the provided test suites
4. Deploy to your target environment
5. Set up monitoring and health checks
6. Document any customizations for your specific use case

## Support and Documentation

- See `README.md` for detailed feature documentation
- See `UNIFIED_CORE_DIRECTIVE_KERNEL.md` for the philosophical foundation
- See `IMPLEMENTATION_GUIDE.md` for practical application guidelines
- Run tests: `npm test` (Node.js) or `pytest tests/` (Python)
