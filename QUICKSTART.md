# Quick Start Guide - UPL Unified System

Get the complete unified+modular autonomous self-sustaining system running in minutes.

---

## Option 1: Automated Full Deployment (Recommended)

**One command to deploy everything:**

```bash
./deploy.sh full-deploy
```

This will:
1. ✅ Check all prerequisites (Node.js, Python, npm, pip)
2. ✅ Install all dependencies (Node.js, Python, TypeScript)
3. ✅ Run all tests (14 tests total)
4. ✅ Start both gateways (Node.js on 3000, Python on 8000)
5. ✅ Verify system health

**Time**: ~2-3 minutes on a typical system

---

## Option 2: Docker Deployment

**For containerized environments:**

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Prerequisites**: Docker and Docker Compose installed

---

## Option 3: Manual Step-by-Step

### Step 1: Install Dependencies

```bash
# Node.js Gateway
npm install

# Python Gateway
pip install -r requirements.txt

# Prime Security (optional)
cd prime-security && npm install && cd ..
```

### Step 2: Configure

```bash
cp .env.example .env
# Edit .env with your API keys (OPENAI_API_KEY, BRAVE_API_KEY)
```

### Step 3: Start Services

```bash
# Start both gateways
./deploy.sh start-all

# Or start individually:
npm start                 # Node.js on port 3000
python3 run.py           # Python on port 8000
```

### Step 4: Verify

```bash
# Quick health check
curl http://localhost:3000/health
curl http://localhost:8000/health

# Full integration test
./verify-integration.sh
```

---

## Testing the System

### Quick Test (30 seconds)

```bash
# Node.js Gateway
curl http://localhost:3000/health
curl http://localhost:3000/v1/models

# Python Gateway
curl http://localhost:8000/health
curl http://localhost:8000/
```

### Full Integration Test (2 minutes)

```bash
./verify-integration.sh
```

This runs 15+ tests covering:
- Health checks
- API endpoints
- Core Directive injection
- Response format validation
- Error handling
- Concurrent requests
- Performance baseline

### Monitor System Health

```bash
# Single health check
./health-monitor.sh check

# Continuous monitoring (auto-restart on failure)
./health-monitor.sh monitor
```

---

## Using the Gateways

### With curl

```bash
# Chat completion (requires OPENAI_API_KEY for Node.js)
curl -X POST http://localhost:3000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'

# Python gateway (mock response, no API key needed)
curl -X POST http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

### With OpenAI Python Client

```python
from openai import OpenAI

# Connect to Node.js gateway
client = OpenAI(
    base_url="http://localhost:3000/v1",
    api_key="your-openai-key"
)

response = client.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": "Hello!"}]
)

print(response.choices[0].message.content)
# Core Directive is automatically applied to all requests!
```

### With GitHub Copilot

1. Start the gateway: `npm start`
2. Configure VS Code to use `http://localhost:3000` as custom model provider
3. All Copilot requests now governed by Core Directive!

---

## Management Commands

### Deployment Script

```bash
./deploy.sh check           # Check prerequisites
./deploy.sh install         # Install dependencies
./deploy.sh test            # Run tests
./deploy.sh start-node      # Start Node.js gateway only
./deploy.sh start-python    # Start Python gateway only
./deploy.sh start-all       # Start both gateways
./deploy.sh stop            # Stop all services
./deploy.sh restart         # Restart all services
./deploy.sh status          # Check service status
./deploy.sh logs nodejs     # View Node.js logs
./deploy.sh logs python     # View Python logs
./deploy.sh full-deploy     # Complete deployment
```

### Health Monitor

```bash
./health-monitor.sh check         # Single health check
./health-monitor.sh monitor       # Continuous monitoring
./health-monitor.sh status        # Detailed status report

# With custom settings:
CHECK_INTERVAL=30 MAX_FAILURES=3 ./health-monitor.sh monitor
```

### Integration Tests

```bash
./verify-integration.sh     # Run full integration test suite
```

---

## Common Scenarios

### Scenario: Development Testing

```bash
# Start services
./deploy.sh start-all

# Make changes to code
# ...

# Restart to apply changes
./deploy.sh restart

# Verify changes
./verify-integration.sh
```

### Scenario: Production Deployment

```bash
# Use Docker for production
docker-compose up -d

# Enable health monitoring
./health-monitor.sh monitor &

# Monitor logs
docker-compose logs -f
```

### Scenario: Troubleshooting

```bash
# Check detailed status
./deploy.sh status

# View logs
./deploy.sh logs nodejs
./deploy.sh logs python

# Restart services
./deploy.sh restart

# Run diagnostics
./verify-integration.sh
```

---

## Configuration

### Environment Variables

Key variables in `.env`:

```env
# LLM Gateway Ports
GATEWAY_PORT=3000          # Node.js gateway
PYTHON_PORT=8000           # Python gateway

# API Keys
OPENAI_API_KEY=sk-...      # For actual LLM calls
BRAVE_API_KEY=...          # For Prime Security search

# Core Directive
CORE_DIRECTIVE="Your governance text here"

# Monitoring
CHECK_INTERVAL=60          # Health check interval (seconds)
MAX_FAILURES=3             # Failures before auto-restart
```

### Ports

- **3000**: Node.js LLM Gateway
- **8000**: Python FastAPI Gateway

To change ports:
```bash
GATEWAY_PORT=3001 PYTHON_PORT=8001 ./deploy.sh start-all
```

---

## System Architecture

```
┌─────────────────────────────────────────────┐
│         Core Directive Layer                │
│  "Inalienable right to pursue happiness"   │
└─────────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
    ┌───▼───┐   ┌───▼───┐   ┌──▼──────┐
    │Node.js│   │Python │   │Prime    │
    │Gateway│   │Gateway│   │Security │
    │:3000  │   │:8000  │   │Framework│
    └───────┘   └───────┘   └─────────┘
```

---

## Next Steps

1. ✅ **Deploy the system** using this guide
2. 📖 **Read the docs**:
   - [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Detailed deployment options
   - [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) - Component integration
   - [ARCHITECTURE.md](ARCHITECTURE.md) - System design
3. 🧪 **Experiment**:
   - Try different configurations
   - Test with your own use cases
   - Integrate with your tools
4. 🔧 **Customize**:
   - Modify the Core Directive
   - Add custom modules
   - Extend functionality

---

## Getting Help

- **Documentation**: See `README.md` and other guide files
- **Troubleshooting**: See `DEPLOYMENT_GUIDE.md` troubleshooting section
- **Verification**: Run `./verify-integration.sh` for diagnostics
- **Logs**: Check `./logs/` directory for detailed logs

---

## Success Indicators

You'll know the system is working when:

✅ `./deploy.sh status` shows both gateways running  
✅ Health checks return "ok" and "healthy"  
✅ `./verify-integration.sh` shows all tests passing  
✅ API requests return responses with Core Directive applied  

---

**Welcome to the unified+modular autonomous self-sustaining system!** 🚀
