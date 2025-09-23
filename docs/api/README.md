# API Reference (Stub)

This document lists the primary backend API endpoints exposed by the SpaceChild server. Replace stubbed sections as you evolve the API.

## Authentication
- GET /api/session — returns current session/user
- POST /api/login — starts an auth flow or local login
- POST /api/logout — clears session

## Projects
- GET /api/projects — list projects for current user
- POST /api/projects — create project
- GET /api/projects/:id — get one project
- PUT /api/projects/:id — update project
- DELETE /api/projects/:id — delete project

## Files
- GET /api/projects/:id/files — list project files
- POST /api/projects/:id/files — create file
- PUT /api/files/:fileId — update file contents/metadata
- DELETE /api/files/:fileId — delete file

## Multi-Agent
- POST /api/agents/session — start multi-agent session
- GET /api/agents/status?projectId= — get current agent status
- POST /api/agents/message — send message to an agent or orchestrator

## GitHub Integration
- GET /api/github/repos — list repos (if connected)
- GET /api/github/branches?repo= — list branches
- GET /api/github/file?repo=&path= — get file content
- POST /api/github/commit — commit/update file
- POST /api/github/pr — create pull request

## Conventions
- All endpoints return JSON
- Errors return { error: string, details?: any }
- Use standard HTTP status codes

Update this file as you add or change endpoints.
