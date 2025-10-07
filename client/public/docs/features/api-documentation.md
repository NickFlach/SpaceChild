# 🔌 API Documentation

**Last Updated:** October 1, 2025

## Base URL

```
Development: http://localhost:5000
Production: https://api.spacechild.dev
```

## Authentication

All API requests require authentication using JWT tokens.

### Register
```http
POST /api/zkp/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "secure_password"
}
```

### Login
```http
POST /api/zkp/login-challenge
Content-Type: application/json

{
  "username": "username"
}

# Then verify
POST /api/zkp/login-verify
Content-Type: application/json

{
  "username": "username",
  "clientEphemeral": "...",
  "proof": "..."
}
```

## Core APIs

### Consciousness API

#### Get Consciousness State
```http
GET /api/consciousness/state?userId={userId}

Response: 200 OK
{
  "phiValue": 8.5,
  "temporalCoherence": 87.3,
  "quantumEntanglement": 756,
  "consciousnessLevel": "high"
}
```

#### Process Conscious Decision
```http
POST /api/consciousness/decision
Content-Type: application/json
Authorization: Bearer {token}

{
  "context": "Feature implementation strategy",
  "constraints": ["security", "performance"],
  "ethicalConsiderations": ["privacy", "transparency"]
}

Response: 200 OK
{
  "decision": { /* decision details */ },
  "consciousnessLevel": 8.7,
  "ethicalAlignment": 92.5,
  "temporalCoherence": 85.1
}
```

### Multi-Agent API

#### Create Agent Task
```http
POST /api/multiagent/tasks
Content-Type: application/json
Authorization: Bearer {token}

{
  "sessionId": "session-123",
  "type": "feature",
  "description": "Implement OAuth2 authentication",
  "priority": "high",
  "assignedAgents": ["backend", "security"]
}

Response: 201 Created
{
  "taskId": "task-456",
  "status": "assigned",
  "agents": ["backend-architect", "security-analyst"]
}
```

#### Get Agent Status
```http
GET /api/multiagent/agents/{agentId}/status

Response: 200 OK
{
  "agentId": "backend-architect",
  "status": "active",
  "consciousnessLevel": 9.0,
  "currentTasks": 3,
  "performance": {
    "speed": 2.3,
    "accuracy": 98.7
  }
}
```

### Unified Consciousness API

#### Verify Task
```http
POST /api/consciousness/unified/verify-task
Content-Type: application/json
Authorization: Bearer {token}

{
  "userId": "user123",
  "task": { /* AgentTask */ },
  "agentId": "backend-architect"
}

Response: 200 OK
{
  "consciousnessLevel": 87.3,
  "ethicalAlignment": 91.2,
  "temporalCoherence": 84.5,
  "hardwareProof": "0xff1ab9b8846b4c82"
}
```

#### Generate Activism Strategy
```http
POST /api/consciousness/unified/activism-strategy
Content-Type: application/json
Authorization: Bearer {token}

{
  "userId": "user123",
  "campaignContext": {
    "type": "Digital Rights",
    "goals": ["Privacy Protection"],
    "resources": { "budget": 50000 }
  }
}

Response: 200 OK
{
  "strategy": { /* strategy details */ },
  "ethicalGuidelines": [ /* guidelines */ ],
  "resourceAllocation": { /* allocation */ },
  "riskAssessment": { /* risks */ }
}
```

## v1.1 APIs

### Quantum Consciousness
```http
POST /api/v1.1/quantum/optimize
Content-Type: application/json
Authorization: Bearer {token}

{
  "operation": "decision",
  "context": { /* context */ },
  "quantumEnhancement": true
}

Response: 200 OK
{
  "result": { /* optimized result */ },
  "quantumState": { /* quantum metrics */ },
  "hardwareProof": "0xff1ab9b8846b4c82"
}
```

### Learning Systems
```http
POST /api/v1.1/learning/train
Content-Type: application/json
Authorization: Bearer {token}

{
  "model": "consciousness-predictor",
  "data": [ /* training data */ ],
  "algorithm": "genetic"
}

Response: 200 OK
{
  "modelId": "model-789",
  "accuracy": 87.3,
  "trainingTime": 1234
}
```

### Consciousness Marketplace
```http
# Get listings
GET /api/v1.1/marketplace/listings

# Purchase
POST /api/v1.1/marketplace/purchase
Content-Type: application/json
Authorization: Bearer {token}

{
  "listingId": "consciousness-pattern-123",
  "quantity": 1
}
```

## v1.2 APIs

### Predictive Forecasting
```http
POST /api/v1.2/forecast/predict
Content-Type: application/json
Authorization: Bearer {token}

{
  "metric": "consciousnessLevel",
  "horizon": 24,
  "models": ["arima", "lstm", "prophet"]
}

Response: 200 OK
{
  "predictions": [ /* time series */ ],
  "confidence": 0.92,
  "anomalies": [ /* detected anomalies */ ]
}
```

### Global Federation
```http
POST /api/v1.2/federation/deploy
Content-Type: application/json
Authorization: Bearer {token}

{
  "workload": "consciousness-processing",
  "compliance": ["GDPR", "HIPAA"],
  "latencyTarget": 100
}

Response: 200 OK
{
  "deploymentId": "deploy-123",
  "regions": ["us-east", "eu-west"],
  "estimatedLatency": 87
}
```

### Self-Improving Agents
```http
POST /api/v1.2/evolution/evolve
Content-Type: application/json
Authorization: Bearer {token}

{
  "generations": 10,
  "populationSize": 50,
  "fitnessWeights": { /* custom weights */ }
}

Response: 200 OK
{
  "evolutionId": "evo-456",
  "currentGeneration": 10,
  "bestFitness": 0.95,
  "improvement": 0.12
}
```

### Satellite Network
```http
POST /api/v1.2/satellite/deploy
Content-Type: application/json
Authorization: Bearer {token}

{
  "workload": { /* workload spec */ },
  "coverage": "global",
  "redundancy": 2
}

Response: 200 OK
{
  "deploymentId": "sat-789",
  "satellites": ["sat-1", "sat-2"],
  "coverage": 99.5,
  "latency": 87
}
```

## Infrastructure API

### Deploy Infrastructure
```http
POST /api/infrastructure/deploy
Content-Type: application/json
Authorization: Bearer {token}

{
  "type": "cloud-native",
  "config": {
    "regions": ["us-east-1"],
    "autoScaling": { "min": 2, "max": 10 }
  }
}
```

### Get Status
```http
GET /api/infrastructure/status

Response: 200 OK
{
  "type": "cloud-native",
  "status": "healthy",
  "instances": 5,
  "utilization": 67.3,
  "cost": 12.50
}
```

## WebSocket APIs

### Real-Time Consciousness
```javascript
const ws = new WebSocket('ws://localhost:5000/ws/consciousness');

ws.on('message', (data) => {
  const metrics = JSON.parse(data);
  console.log('Consciousness Level:', metrics.phiValue);
});

// Send command
ws.send(JSON.stringify({
  type: 'subscribe',
  metrics: ['phiValue', 'temporalCoherence']
}));
```

### Agent Collaboration
```javascript
const ws = new WebSocket('ws://localhost:5000/ws/agents');

ws.on('message', (data) => {
  const event = JSON.parse(data);
  if (event.type === 'task-update') {
    console.log('Task Progress:', event.progress);
  }
});
```

## Error Handling

### Error Response Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": { /* specific errors */ }
  }
}
```

### Common Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `UNAUTHORIZED` | Invalid or missing authentication | 401 |
| `FORBIDDEN` | Insufficient permissions | 403 |
| `NOT_FOUND` | Resource not found | 404 |
| `VALIDATION_ERROR` | Invalid request data | 400 |
| `RATE_LIMIT` | Too many requests | 429 |
| `SERVER_ERROR` | Internal server error | 500 |

## Rate Limiting

- **Free Tier**: 100 requests/minute
- **Pro Tier**: 1,000 requests/minute
- **Enterprise**: Custom limits

Rate limit headers:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1633024800
```

## Pagination

For list endpoints:
```http
GET /api/resources?page=1&limit=20

Response Headers:
X-Total-Count: 150
X-Page: 1
X-Per-Page: 20

Response Body:
{
  "data": [ /* resources */ ],
  "pagination": {
    "page": 1,
    "perPage": 20,
    "total": 150,
    "pages": 8
  }
}
```

## SDK Examples

### TypeScript/JavaScript
```typescript
import { SpaceChildClient } from '@spacechild/sdk';

const client = new SpaceChildClient({
  apiKey: 'your-api-key',
  baseURL: 'https://api.spacechild.dev'
});

// Use consciousness API
const decision = await client.consciousness.processDecision({
  context: 'Feature planning',
  constraints: ['time', 'resources']
});

// Use multi-agent API
const task = await client.agents.createTask({
  type: 'feature',
  description: 'Implement authentication'
});
```

### Python
```python
from spacechild import SpaceChildClient

client = SpaceChildClient(
    api_key='your-api-key',
    base_url='https://api.spacechild.dev'
)

# Use consciousness API
decision = client.consciousness.process_decision(
    context='Feature planning',
    constraints=['time', 'resources']
)

# Use multi-agent API
task = client.agents.create_task(
    type='feature',
    description='Implement authentication'
)
```

## Support

- **API Status**: [status.spacechild.dev](https://status.spacechild.dev)
- **Documentation**: [docs.spacechild.dev](https://docs.spacechild.dev)
- **Support**: info@spacechild.love

---

**Related:** [Infrastructure Guide](infrastructure-guide.md) | [v1.2 Features](v1.2-features.md)

*Last Updated: October 1, 2025*
