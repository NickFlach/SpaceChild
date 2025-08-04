# Space Child - AI-Powered App Builder

## Overview
Space Child is a next-generation AI-powered app builder that extends beyond traditional coding tools by integrating consciousness and superintelligence capabilities. It is a comprehensive full-stack web application with a React frontend and an Express.js backend. The platform aims to provide advanced features like context-aware assistance, intelligent optimization, and a multi-project workspace, combining various AI providers to streamline app development. The business vision is to revolutionize app building by making it more intuitive, efficient, and intelligent through advanced AI integration.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: Radix UI components with shadcn/ui
- **Styling**: Tailwind CSS with custom design tokens and dark/light theme support
- **State Management**: TanStack Query for server state, React hooks for local state
- **Routing**: Wouter

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: PostgreSQL-backed sessions with `connect-pg-simple`
- **API Design**: RESTful endpoints with WebSocket support for real-time features

### Data Layer
- **Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM
- **Schema Management**: Drizzle Kit for migrations
- **Connection**: Connection pooling with `@neondatabase/serverless`

### Key Components & Features
- **Project Management System**: Multi-project workspace, file organization, real-time file editing, auto-save, file explorer, multi-file/folder upload, zip file extraction.
- **AI Integration Layer**: Supports Anthropic Claude, OpenAI GPT-4, SpaceAgent, MindSphere, and Terminal Jarvis. Includes a unified interface for different AI services, context-aware AI with memory and learning, and advanced code analysis/optimization.
- **Terminal Jarvis Integration**: A multi-AI tool manager providing unified CLI access to various models (Claude, Gemini, Qwen, OpenCode) through natural language command parsing.
- **Chat and Code Assistance**: Real-time chat with AI providers, code generation, debugging assistance, context-aware suggestions, token usage tracking.
- **Consciousness Features**: Session-based context retention, learning from user patterns, memory system for insights, confidence scoring for AI suggestions.
- **Superintelligence Capabilities**: Architecture analysis, performance optimization, code refactoring automation, security auditing.
- **Deployment Intelligence**: Self-healing deployment, intelligent rollback, predictive scaling, environment-aware optimization, continuous learning from deployment patterns.
- **UI/UX Decisions**: Cosmic branding with a cosmic cyan/aqua theme, glowing effects, animated stars, glass morphism cards, and a redesigned landing page and dashboard.

## External Dependencies

### Core Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting
- **Replit Platform**: Authentication and deployment environment
- **Anthropic API**: Claude AI model access
- **OpenAI API**: GPT-4 model access

### Development Tools
- **Vite**: Frontend build tool
- **Drizzle Kit**: Database schema management
- **TypeScript**: Language
- **Tailwind CSS**: Styling framework

### Third-Party Services
- **WebSocket**: Real-time communication
- **Redis**: Planned for advanced caching and session management
- **Custom AI Services**: SpaceAgent and MindSphere integration (in development)