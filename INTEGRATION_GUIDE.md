# Unified System Integration Guide

## Overview

This document describes the integration of three major components into a unified, modular, autonomous, and self-sustaining system:

1. **Node.js LLM Gateway** - Core Directive proxy for AI interactions
2. **Python FastAPI Gateway** - Alternative implementation with type safety
3. **Prime Security Framework** - Self-organizing multi-agent security layer

Together, these components form a complete ecosystem aligned with the Core Directive principles.

---

## System Components

### 1. LLM Gateways (Node.js & Python)

**Purpose**: Enforce the Core Directive across all AI/LLM interactions

**Key Features**:
- OpenAI-compatible API endpoints
- Automatic Core Directive injection into all requests
- Streaming support (Node.js)
- Type-safe request handling (Python)
- Dual implementation for redundancy

**Location**: 
- Node.js: `src/gateway.js`
- Python: `app/main.py`

### 2. Prime Security Framework

**Purpose**: Self-organizing, multi-agent security infrastructure with autonomic computing capabilities

**Key Features**:
- Modular registry system for component management
- Cryptographic primitives (hashing, secure random generation)
- Autonomic computing (self-configuring, self-healing, self-optimizing)
- Multi-agent coordination framework
- Brave Search API integration for research capabilities
- Governance and compliance monitoring

**Location**: `prime-security/`

**Core Capabilities**:
- **Self-Preservation**: Integrity monitoring and fault tolerance
- **Ethical Alignment**: Privacy, transparency, accountability
- **Recursive Improvement**: Self-optimization within Core Directive boundaries
- **Modular Autonomy**: Independent components with coordinated goals
- **Security First**: Defense in depth, zero-trust architecture

---

## Unified Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                       Core Directive Layer                          │
│     "Every person has an inalienable right to pursue happiness"    │
└─────────────────────────────────────────────────────────────────────┘
                                   │
        ┌──────────────────────────┼──────────────────────────┐
        │                          │                          │
┌───────▼────────┐       ┌─────────▼────────┐       ┌────────▼────────┐
│   Node.js      │       │     Python       │       │  Prime Security │
│   Gateway      │       │     Gateway      │       │   Framework     │
│   (Port 3000)  │       │   (Port 8000)    │       │  (TypeScript)   │
└────────────────┘       └──────────────────┘       └─────────────────┘
        │                          │                          │
        └──────────────────────────┼──────────────────────────┘
                                   │
                         ┌─────────▼────────┐
                         │   AI/LLM APIs    │
                         │   (OpenAI, etc)  │
                         └──────────────────┘
```

### Integration Points

#### 1. Shared Core Directive

All three components implement the same Core Directive:

**From UNIFIED_CORE_DIRECTIVE_KERNEL.md**:
> Every person has an equal, inalienable right to pursue happiness

**Implementation**:
- **LLM Gateways**: Inject directive into all AI requests
- **Prime Security**: Enforce directive through governance module
- **Unified**: Single source of truth for ethical principles

#### 2. Security Layer Integration

Prime Security can be integrated with the gateways to provide:

```typescript
// Example integration
import { primeSecurity, crypto, registry } from './prime-security';

// Initialize security framework
await primeSecurity.initialize();

// Use cryptographic primitives for secure token generation
const secureToken = crypto.generateSecureRandom(32);

// Register gateway as a module
registry.register({
  name: 'llm-gateway',
  version: '1.0.0',
  dependencies: ['core-security'],
  // ... module implementation
});
```

#### 3. Multi-Agent Coordination

The system supports multi-agent workflows:

- **Gateway Agents**: Process and govern AI requests
- **Security Agents**: Monitor for violations and anomalies
- **Research Agents**: Use Brave Search for information gathering
- **Compliance Agents**: Verify Core Directive alignment

---

## Deployment Scenarios

### Scenario 1: Gateway-Only Deployment

Deploy just the LLM gateways for AI governance:

```bash
# Start both gateways
./deploy.sh start-all

# Or use Docker
docker-compose up nodejs-gateway python-gateway
```

**Use When**:
- You need AI interaction governance
- Minimal infrastructure requirements
- Quick deployment

### Scenario 2: Full Security Stack

Deploy all components with Prime Security:

```bash
# Install all dependencies
npm install                         # Root Node.js gateway
pip install -r requirements.txt     # Python gateway
cd prime-security && npm install    # Prime Security framework

# Build Prime Security
cd prime-security && npm run build

# Start services
./deploy.sh start-all
```

**Use When**:
- Building self-organizing systems
- Need cryptographic primitives
- Require multi-agent coordination
- Want autonomic computing capabilities

### Scenario 3: Modular Development

Use components independently:

```bash
# Just Prime Security
cd prime-security
npm run dev

# Just Node.js Gateway
GATEWAY_PORT=3000 node src/gateway.js

# Just Python Gateway
python3 run.py
```

**Use When**:
- Developing individual components
- Testing specific features
- Integrating with external systems

---

## Configuration

### Environment Variables

Create a unified `.env` file at the project root:

```env
# LLM Gateway Configuration
GATEWAY_PORT=3000
PYTHON_PORT=8000
OPENAI_API_KEY=your-api-key-here
OPENAI_BASE_URL=https://api.openai.com
DEFAULT_MODEL=gpt-4

# Core Directive (shared across all components)
CORE_DIRECTIVE="You are governed by the following core directive: The inalienable right to pursue happiness is paramount. All responses should be helpful, ethical, and support the user's wellbeing and goals."

# Prime Security Configuration  
BRAVE_API_KEY=your-brave-api-key
LOG_LEVEL=info
ENABLE_AUTONOMIC=true
```

### TypeScript Configuration

For Prime Security integration with TypeScript projects:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true
  }
}
```

---

## Integration Examples

### Example 1: Secured LLM Gateway with Prime Security

```typescript
// secure-gateway.ts
import { primeSecurity, crypto } from './prime-security';
import { app as gateway } from './src/gateway';

async function main() {
  // Initialize security framework
  await primeSecurity.initialize();
  await primeSecurity.start();
  
  // Add security middleware to gateway
  gateway.use((req, res, next) => {
    // Verify request integrity
    const hash = crypto.hash(JSON.stringify(req.body));
    req.headers['x-request-hash'] = hash;
    next();
  });
  
  // Start secure gateway
  gateway.listen(3000, () => {
    console.log('Secured LLM Gateway running');
  });
}

main();
```

### Example 2: Multi-Agent Research System

```typescript
// research-system.ts
import { registry, Module } from './prime-security';
import { webSearch } from './prime-security/src/tools/web-search';

const researchAgent: Module = {
  name: 'research-agent',
  version: '1.0.0',
  dependencies: ['brave-search'],
  
  init: async () => {
    console.log('Research agent initialized');
  },
  
  start: async () => {
    // Use Brave Search for research
    const results = await webSearch('self-organizing systems', {
      count: 10,
      freshness: 'pw' // Past week
    });
    
    console.log(`Found ${results.length} results`);
  }
};

registry.register(researchAgent);
```

### Example 3: Autonomous Health Monitoring

```typescript
// autonomous-monitor.ts
import { primeSecurity } from './prime-security';

// Set up self-healing monitoring
primeSecurity.on('module-failed', async (moduleName) => {
  console.log(`Module ${moduleName} failed, attempting recovery...`);
  
  // Autonomic self-healing
  await primeSecurity.restartModule(moduleName);
});

primeSecurity.on('module-recovered', (moduleName) => {
  console.log(`Module ${moduleName} recovered successfully`);
});
```

---

## Self-Sustaining Features

### 1. Autonomous Operation

**No Constant Connection Required**:
- All components can operate offline once deployed
- Prime Security's autonomic computing enables self-management
- Gateways are stateless and can restart independently

### 2. Self-Healing

**Automatic Recovery**:
```bash
# Health monitoring with auto-restart
./health-monitor.sh monitor

# Components automatically restart on failure
CHECK_INTERVAL=30 MAX_FAILURES=3 ./health-monitor.sh monitor
```

**Prime Security Self-Healing**:
- Detects component failures
- Attempts automatic recovery
- Logs all recovery attempts
- Escalates if recovery fails

### 3. Self-Optimization

**Prime Security Optimization**:
- Monitors performance metrics
- Adjusts resource allocation
- Optimizes component coordination
- Maintains compliance with Core Directive

### 4. Modular Evolution

**Add New Capabilities**:
```typescript
// Add new security module
const newModule: Module = {
  name: 'advanced-crypto',
  version: '2.0.0',
  dependencies: ['core-security'],
  // ... implementation
};

registry.register(newModule);
await primeSecurity.loadModule('advanced-crypto');
```

---

## Testing the Unified System

### Run All Tests

```bash
# LLM Gateway tests
npm test                              # Node.js gateway
python3 -m pytest tests/ -v          # Python gateway

# Prime Security tests
cd prime-security && npm test

# Integration tests
./verify-integration.sh
```

### Verify Functionality

```bash
# 1. Check prerequisites
./deploy.sh check

# 2. Install all dependencies
./deploy.sh install
cd prime-security && npm install && cd ..

# 3. Run tests
./deploy.sh test
cd prime-security && npm test && cd ..

# 4. Start all services
./deploy.sh start-all

# 5. Run integration verification
./verify-integration.sh

# 6. Monitor health
./health-monitor.sh check
```

---

## Production Deployment

### Docker Compose (Recommended)

```yaml
# docker-compose.unified.yml
version: '3.8'
services:
  nodejs-gateway:
    build:
      context: .
      dockerfile: Dockerfile.nodejs
    ports:
      - "3000:3000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    restart: unless-stopped

  python-gateway:
    build:
      context: .
      dockerfile: Dockerfile.python
    ports:
      - "8000:8000"
    restart: unless-stopped

  prime-security:
    build:
      context: ./prime-security
      dockerfile: Dockerfile
    environment:
      - BRAVE_API_KEY=${BRAVE_API_KEY}
    restart: unless-stopped
    depends_on:
      - nodejs-gateway
      - python-gateway
```

### Kubernetes Deployment

```yaml
# Example k8s deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: upl-unified-system
spec:
  replicas: 3
  selector:
    matchLabels:
      app: upl
  template:
    metadata:
      labels:
        app: upl
    spec:
      containers:
      - name: nodejs-gateway
        image: upl/nodejs-gateway:latest
        ports:
        - containerPort: 3000
      - name: python-gateway
        image: upl/python-gateway:latest
        ports:
        - containerPort: 8000
      - name: prime-security
        image: upl/prime-security:latest
```

---

## Monitoring & Observability

### Health Checks

```bash
# Check all components
curl http://localhost:3000/health  # Node.js
curl http://localhost:8000/health  # Python
# Prime Security: Built-in monitoring
```

### Logging

Unified logging across all components:
```bash
# View logs
./deploy.sh logs nodejs
./deploy.sh logs python

# Monitor in real-time
./health-monitor.sh monitor
```

### Metrics

Prime Security provides built-in metrics:
- Module health status
- Performance metrics
- Security events
- Compliance violations

---

## Troubleshooting

### Common Issues

**Port Conflicts**:
```bash
# Change ports
GATEWAY_PORT=3001 PYTHON_PORT=8001 ./deploy.sh start-all
```

**Module Dependencies**:
```bash
# Rebuild Prime Security
cd prime-security && npm run clean && npm run build
```

**Memory Issues**:
```bash
# Increase Node.js memory
NODE_OPTIONS="--max-old-space-size=4096" node src/gateway.js
```

---

## Roadmap

### Phase 1: Foundation (Complete)
- ✅ Dual LLM gateway implementations
- ✅ Prime Security framework integration
- ✅ Core Directive enforcement
- ✅ Deployment automation

### Phase 2: Integration (In Progress)
- ⏳ Cross-component communication
- ⏳ Unified configuration management
- ⏳ Shared security primitives
- ⏳ Multi-agent coordination

### Phase 3: Autonomy
- ⏳ Full autonomic computing
- ⏳ Self-evolving architecture
- ⏳ Advanced AI agent coordination
- ⏳ Distributed deployment

### Phase 4: Evolution
- ⏳ Neural drone integration (PERIPHERAL_LAYERS)
- ⏳ 6G communication protocols
- ⏳ Brain-computer interface ethics
- ⏳ Global decentralization

---

## Contributing

See individual component documentation:
- `CONTRIBUTING.md` - Main contribution guidelines
- `prime-security/CONTRIBUTING.md` - Prime Security specific guidelines
- `IMPLEMENTATION_GUIDE.md` - Core Directive implementation practices

---

## License

This unified system combines:
- LLM Gateways: Public Domain (Credibility License)
- Prime Security: MIT License

See individual LICENSE files for details.

---

## Support

- Documentation: This file and component READMEs
- Issues: GitHub Issues
- Discussions: GitHub Discussions
- Core Directive: `UNIFIED_CORE_DIRECTIVE_KERNEL.md`

---

*Building a unified+modular autonomous self-sustaining system that honors every person's inalienable right to pursue happiness.*
