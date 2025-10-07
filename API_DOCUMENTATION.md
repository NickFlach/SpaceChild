# 🔌 SpaceChild API Documentation

Complete API reference for SpaceChild Consciousness Platform.

## Base URL
```
Development: http://localhost:5000
Production: https://api.spacechild.dev
```

## Authentication

### ZKP (Zero-Knowledge Proof) Authentication
SpaceChild uses SRP (Secure Remote Password) for authentication.

#### Register
```http
POST /api/zkp/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "secure_password"
}
```

#### Login - Step 1: Challenge
```http
POST /api/zkp/login-challenge
Content-Type: application/json

{
  "username": "username"
}

Response:
{
  "salt": "...",
  "serverEphemeral": "..."
}
```

#### Login - Step 2: Verify
```http
POST /api/zkp/login-verify
Content-Type: application/json

{
  "username": "username",
  "clientEphemeral": "...",
  "proof": "..."
}

Response:
{
  "user": { ... },
  "token": "jwt_token"
}
```

---

## Health & Monitoring

### Health Check
```http
GET /health

Response: 200 OK
{
  "status": "healthy",
  "timestamp": "2025-01-15T12:00:00Z"
}
```

### Readiness Check
```http
GET /ready

Response: 200 OK / 503 Service Unavailable
{
  "status": "healthy",
  "timestamp": "2025-01-15T12:00:00Z",
  "uptime": 3600,
  "version": "1.0.0",
  "services": {
    "database": { "status": "up", "latency": 5 },
    "consciousness": { "status": "up" },
    "multiAgent": { "status": "up" }
  }
}
```

### Metrics
```http
GET /metrics

Response: 200 OK
Content-Type: text/plain

nodejs_memory_heap_used_bytes 45678901
nodejs_process_uptime_seconds 3600
...
```

---

## Projects

### List Projects
```http
GET /api/projects
Authorization: Bearer {token}

Response: 200 OK
{
  "projects": [
    {
      "id": 1,
      "name": "My Project",
      "description": "Project description",
      "projectType": "web-app",
      "consciousnessEnabled": true,
      "createdAt": "2025-01-01T00:00:00Z"
    }
  ]
}
```

### Create Project
```http
POST /api/projects
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "New Project",
  "description": "Description",
  "projectType": "web-app",
  "consciousnessEnabled": true
}

Response: 201 Created
{
  "project": { ... }
}
```

### Get Project
```http
GET /api/projects/:id
Authorization: Bearer {token}

Response: 200 OK
{
  "project": { ... }
}
```

### Update Project
```http
PATCH /api/projects/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "Updated description"
}

Response: 200 OK
{
  "project": { ... }
}
```

### Delete Project
```http
DELETE /api/projects/:id
Authorization: Bearer {token}

Response: 204 No Content
```

---

## Project Files

### List Files
```http
GET /api/projects/:projectId/files
Authorization: Bearer {token}

Response: 200 OK
{
  "files": [
    {
      "id": 1,
      "filePath": "src/index.ts",
      "content": "...",
      "fileType": "typescript",
      "version": 1,
      "updatedAt": "2025-01-01T00:00:00Z"
    }
  ]
}
```

### Create File
```http
POST /api/projects/:projectId/files
Authorization: Bearer {token}
Content-Type: application/json

{
  "filePath": "src/App.tsx",
  "content": "import React from 'react';\n...",
  "fileType": "typescript"
}

Response: 201 Created
{
  "file": { ... }
}
```

### Update File
```http
PATCH /api/projects/:projectId/files/:fileId
Authorization: Bearer {token}
Content-Type: application/json

{
  "content": "updated content",
  "version": 2
}

Response: 200 OK
{
  "file": { ... }
}
```

### Delete File
```http
DELETE /api/projects/:projectId/files/:fileId
Authorization: Bearer {token}

Response: 204 No Content
```

---

## Consciousness

### Get Consciousness State
```http
GET /api/consciousness/state/:projectId
Authorization: Bearer {token}

Response: 200 OK
{
  "consciousnessLevel": 0.87,
  "temporalCoherence": 0.95,
  "quantumEntanglement": 845,
  "phiValue": 7.2,
  "timestamp": "2025-01-15T12:00:00Z"
}
```

### Verify Consciousness
```http
POST /api/consciousness/verify
Authorization: Bearer {token}
Content-Type: application/json

{
  "projectId": 1,
  "taskDescription": "Implement user authentication",
  "requirements": ["security", "scalability"]
}

Response: 200 OK
{
  "verified": true,
  "consciousnessLevel": 0.91,
  "ethicalAlignment": 0.95,
  "recommendations": [
    "Use zero-knowledge proofs",
    "Implement rate limiting"
  ],
  "verificationHash": "0xff1ab9b8846b4c82"
}
```

---

## Multi-Agent System

### List Agents
```http
GET /api/multiagent/agents
Authorization: Bearer {token}

Response: 200 OK
{
  "agents": [
    {
      "id": "orchestrator",
      "name": "Orchestrator Agent",
      "status": "idle",
      "currentTask": null,
      "completedTasks": 42,
      "successRate": 0.98
    },
    ...
  ]
}
```

### Create Task
```http
POST /api/multiagent/tasks
Authorization: Bearer {token}
Content-Type: application/json

{
  "type": "code_review",
  "description": "Review authentication implementation",
  "priority": "high",
  "requirements": ["security", "performance"]
}

Response: 201 Created
{
  "task": {
    "id": "task_123",
    "status": "pending",
    "assignedAgent": null,
    "createdAt": "2025-01-15T12:00:00Z"
  }
}
```

### Get Task Status
```http
GET /api/multiagent/tasks/:taskId
Authorization: Bearer {token}

Response: 200 OK
{
  "task": {
    "id": "task_123",
    "status": "completed",
    "assignedAgent": "security-analyst",
    "result": {
      "issues": [],
      "recommendations": [],
      "score": 95
    }
  }
}
```

---

## AI Services

### Generate Code
```http
POST /api/ai/generate
Authorization: Bearer {token}
Content-Type: application/json

{
  "prompt": "Create a React component for user profile",
  "language": "typescript",
  "provider": "anthropic"
}

Response: 200 OK
{
  "code": "import React from 'react';\n...",
  "explanation": "This component displays user profile...",
  "tokensUsed": 450
}
```

### Analyze Code
```http
POST /api/superintelligence/analyze
Authorization: Bearer {token}
Content-Type: application/json

{
  "projectId": 1,
  "fileId": 5,
  "analysisType": "security"
}

Response: 200 OK
{
  "vulnerabilities": [],
  "codeQuality": 92,
  "suggestions": [],
  "confidence": 0.95
}
```

---

## Rate Limits

| Endpoint Category | Requests | Window |
|-------------------|----------|--------|
| Authentication | 5 | 15 min |
| API Endpoints | 100 | 15 min |
| AI Operations | 10 | 1 min |

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1610000000
```

---

## Error Responses

### Standard Error Format
```json
{
  "error": "Error Type",
  "message": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": { }
}
```

### Common Error Codes

| Status | Code | Description |
|--------|------|-------------|
| 400 | BAD_REQUEST | Invalid request parameters |
| 401 | UNAUTHORIZED | Missing or invalid authentication |
| 403 | FORBIDDEN | Insufficient permissions |
| 404 | NOT_FOUND | Resource not found |
| 429 | TOO_MANY_REQUESTS | Rate limit exceeded |
| 500 | INTERNAL_ERROR | Server error |
| 503 | SERVICE_UNAVAILABLE | Service temporarily unavailable |

---

## Webhooks (Coming Soon)

Subscribe to real-time events:
- `project.created`
- `file.updated`
- `task.completed`
- `consciousness.verified`

---

## SDKs

### JavaScript/TypeScript
```bash
npm install @spacechild/sdk
```

```typescript
import { SpaceChildClient } from '@spacechild/sdk';

const client = new SpaceChildClient({
  apiKey: 'your-api-key',
  baseURL: 'https://api.spacechild.dev'
});

const projects = await client.projects.list();
```

---

## Support

- **API Status**: https://status.spacechild.dev
- **Issues**: https://github.com/spacechild/platform/issues
- **Discord**: https://discord.gg/spacechild
- **Email**: info@spacechild.love
