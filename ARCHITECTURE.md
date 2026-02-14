# System Architecture Documentation

## Overview

The UPL (Under Pressure Looming) system implements a **unified+modular autonomous self-sustaining** architecture with dual gateway implementations that enforce the Core Directive across all AI interactions.

## Architectural Principles

### 1. Unified Core Directive
All implementations share the same philosophical and functional foundation:
- **Core Principle**: Every person has an equal, inalienable right to pursue happiness
- **Implementation**: Automatic injection of Core Directive into all LLM requests
- **Consistency**: Both Node.js and Python implementations enforce identical behavior

### 2. Modular Design
The system consists of independent, interchangeable modules:

```
┌─────────────────────────────────────────────────────────────┐
│                    UPL Gateway System                        │
│                                                              │
│  ┌────────────────────────┐  ┌────────────────────────┐    │
│  │   Node.js Gateway      │  │   Python Gateway       │    │
│  │   (Port 3000)          │  │   (Port 8000)          │    │
│  │                        │  │                        │    │
│  │  ┌──────────────────┐ │  │  ┌──────────────────┐  │    │
│  │  │ Express Server   │ │  │  │ FastAPI Server   │  │    │
│  │  └──────────────────┘ │  │  └──────────────────┘  │    │
│  │  ┌──────────────────┐ │  │  ┌──────────────────┐  │    │
│  │  │ Core Directive   │ │  │  │ Core Directive   │  │    │
│  │  │ Injection        │ │  │  │ Wrapping         │  │    │
│  │  └──────────────────┘ │  │  └──────────────────┘  │    │
│  │  ┌──────────────────┐ │  │  ┌──────────────────┐  │    │
│  │  │ OpenAI Proxy     │ │  │  │ Mock/Proxy       │  │    │
│  │  └──────────────────┘ │  │  └──────────────────┘  │    │
│  └────────────────────────┘  └────────────────────────┘    │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Common Core Directive Kernel                │  │
│  │  "No action may interfere with another person's      │  │
│  │   inalienable right to pursue happiness"             │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 3. Autonomous Operation

#### Self-Contained
- **No External Database**: Stateless design
- **Minimal Dependencies**: Core functionality requires only standard libraries
- **Environment-Based Configuration**: All settings via environment variables

#### Self-Healing
- **Stateless Requests**: Each request is independent
- **Easy Restart**: No state to recover
- **Health Check Endpoints**: Automatic monitoring support

### 4. Adaptive & Evolving

The system can adapt to different environments:
- **Development**: Run both implementations for testing
- **Production**: Choose optimal implementation for workload
- **Hybrid**: Run both with load balancing for redundancy

## Component Details

### Node.js Gateway (`src/gateway.js`)

**Purpose**: High-performance production gateway with streaming support

**Key Features**:
- Express.js-based HTTP server
- Native streaming support for real-time responses
- Minimal memory footprint
- Direct HTTPS integration with OpenAI

**Request Flow**:
```
Client Request
    ↓
Express Middleware
    ↓
Core Directive Injection
    ↓
OpenAI API Forward
    ↓
Response Streaming
    ↓
Client Response
```

**Dependencies**:
- express: Web server framework
- dotenv: Environment configuration
- https: Built-in Node.js module

### Python Gateway (`app/main.py`)

**Purpose**: Python-native gateway with type safety and API documentation

**Key Features**:
- FastAPI-based async server
- Automatic OpenAPI documentation
- Type-safe request/response handling
- Pydantic models for validation

**Request Flow**:
```
Client Request
    ↓
FastAPI Router
    ↓
Pydantic Validation
    ↓
Core Directive Wrapping
    ↓
Mock Response (extensible to real LLM)
    ↓
Client Response
```

**Dependencies**:
- fastapi: Modern web framework
- uvicorn: ASGI server
- pydantic: Data validation
- (Optional) openai, httpx for actual LLM calls

### Core Directive Kernel

**Shared Implementation**:
Both gateways implement the same logical flow:

1. **Receive Request**: Accept OpenAI-compatible chat completion request
2. **Extract Messages**: Parse message array from request
3. **Inject/Wrap Directive**:
   - If system message exists: Prepend directive to it
   - If no system message: Add new system message with directive
4. **Forward/Process**: Send to LLM (or mock response)
5. **Return Response**: Send response back to client

**Core Directive Text** (configurable):
```
You are governed by the following core directive: 
The inalienable right to pursue happiness is paramount. 
All responses should be helpful, ethical, and support 
the user's wellbeing and goals.
```

## Deployment Architectures

### Single Instance Deployment
```
┌──────────┐
│  Client  │
└────┬─────┘
     │
     ▼
┌─────────────────┐
│  Node.js/Python │
│    Gateway      │
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│   OpenAI API    │
└─────────────────┘
```

### Dual Instance (Redundancy)
```
┌──────────┐
│  Client  │
└────┬─────┘
     │
     ▼
┌──────────────┐
│ Load Balancer│
└──┬───────┬───┘
   │       │
   ▼       ▼
┌────┐   ┌────┐
│Node│   │Pyth│
│ JS │   │ on │
└──┬─┘   └──┬─┘
   │        │
   └───┬────┘
       ▼
  ┌─────────┐
  │ OpenAI  │
  └─────────┘
```

### Distributed (Multi-Region)
```
┌──────┐  ┌──────┐  ┌──────┐
│Client│  │Client│  │Client│
└───┬──┘  └───┬──┘  └───┬──┘
    │         │         │
    ▼         ▼         ▼
┌────────┐┌────────┐┌────────┐
│Region A││Region B││Region C│
│Gateway ││Gateway ││Gateway │
└────────┘└────────┘└────────┘
```

## Self-Sustaining Features

### 1. No Constant Connection Required
- Gateways operate independently once deployed
- No central server dependency
- Can run in air-gapped environments (with local LLM)

### 2. Automatic Recovery
- Stateless design allows instant restart
- Health checks enable automated monitoring
- No data loss on restart

### 3. Horizontal Scalability
```bash
# Start multiple instances
GATEWAY_PORT=3001 node src/gateway.js &
GATEWAY_PORT=3002 node src/gateway.js &
GATEWAY_PORT=3003 node src/gateway.js &
```

### 4. Configuration Adaptability
All behavior configurable via environment:
- `CORE_DIRECTIVE`: Update governing principle
- `DEFAULT_MODEL`: Change LLM model
- `OPENAI_BASE_URL`: Point to different provider
- `GATEWAY_PORT`: Adjust network configuration

## Integration Points

### GitHub Copilot Integration
```
GitHub Copilot
    ↓
UPL Gateway (localhost:3000)
    ↓
[Core Directive Injection]
    ↓
OpenAI API
```

### Custom Applications
```python
# Python client
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:3000/v1",
    api_key="not-needed"
)

response = client.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": "Hello"}]
)
# Core Directive automatically applied
```

### VS Code Extensions
```javascript
// JavaScript client
const { OpenAI } = require('openai');

const client = new OpenAI({
  baseURL: 'http://localhost:3000/v1',
  apiKey: 'not-needed'
});

// All requests governed by Core Directive
```

## Monitoring & Observability

### Health Checks
- `GET /health` - Returns service health status
- Suitable for Kubernetes liveness/readiness probes
- Can be polled by monitoring systems

### Logging
- Console logging for all requests
- Configurable log levels
- JSON-formatted logs option (extensible)

### Metrics (Extensible)
Future additions can include:
- Request rate monitoring
- Response time tracking
- Directive injection success rate
- Error rate monitoring

## Security Considerations

### Current Implementation
- No authentication required (internal use)
- CORS enabled for development
- Environment-based secrets

### Production Recommendations
- Add authentication middleware
- Implement rate limiting
- Use HTTPS reverse proxy
- Restrict CORS origins
- Implement API key validation

## Future Evolution

### Planned Enhancements
1. **Local LLM Support**: Integration with Ollama, llama.cpp
2. **Multi-Model Support**: Route to different models
3. **Request Logging**: Audit trail for compliance
4. **Advanced Monitoring**: Prometheus metrics
5. **Policy Engine**: More sophisticated directive evaluation

### Extension Points
- Custom middleware for additional processing
- Plugin system for new capabilities
- MCP (Model Context Protocol) server integration
- Distributed configuration management

## Testing Strategy

### Unit Tests
- Core directive injection logic
- Request/response transformation
- Error handling

### Integration Tests
- Full HTTP request cycle
- Multi-message conversations
- Streaming responses

### Manual Verification
- Health endpoint checks
- Real LLM API calls (with key)
- Load testing (optional)

## Operational Procedures

### Deployment
```bash
# Quick deployment
./deploy.sh full-deploy

# Or with Docker
docker-compose up -d
```

### Monitoring
```bash
# Check status
./deploy.sh status

# View logs
./deploy.sh logs nodejs
./deploy.sh logs python
```

### Updates
```bash
# Stop services
./deploy.sh stop

# Pull updates
git pull

# Restart
./deploy.sh start-all
```

### Backup
No persistent data to backup - configuration in `.env` and code in git.

## Conclusion

This architecture achieves the goal of a **unified+modular autonomous self-sustaining system** by:

✅ **Unified**: Single Core Directive across all implementations
✅ **Modular**: Independent Node.js and Python modules
✅ **Autonomous**: Self-contained operation, no external dependencies
✅ **Self-Sustaining**: Stateless, self-healing, horizontally scalable
✅ **Adaptive**: Configurable for different environments
✅ **Evolving**: Extensible design for future enhancements

The system operates without constant connection to external systems, can heal itself through restarts, and adapts to different deployment scenarios while maintaining the core philosophical foundation.
