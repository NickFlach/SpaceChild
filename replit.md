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
- **Groq API**: Fast inference for Kimi K2 and other models (planned)
- **E2B API**: Secure code execution sandboxes (planned)
- **Firecrawl API**: Web scraping and site cloning capabilities (planned)

### Development Tools
- **Vite**: Frontend build tool
- **Drizzle Kit**: Database schema management
- **TypeScript**: Language
- **Tailwind CSS**: Styling framework

### Third-Party Services
- **WebSocket**: Real-time communication
- **Redis**: Planned for advanced caching and session management
- **Custom AI Services**: SpaceAgent and MindSphere integration (in development)

## Open-Lovable Integration (January 2025)

### Overview
Integrating key features from the open-lovable project to enhance Space Child's capabilities:
- **E2B Sandboxes**: Secure code execution in isolated cloud environments
- **Firecrawl**: Convert websites to LLM-ready data for cloning and analysis
- **Groq AI**: Fast inference for real-time AI interactions
- **Enhanced Chat-to-Code**: Improved code generation from natural language

### Integration Components
1. **E2B Service** (`server/services/e2b.ts`): Manages sandbox creation, code execution, and file operations
2. **Firecrawl Service** (`server/services/firecrawl.ts`): Handles web scraping, site analysis, and conversion to structured data
3. **Groq Provider** (`server/services/aiProviders/groq.ts`): Adds Groq as an AI provider for fast inference
4. **Enhanced Code Generator** (`server/services/codeGenerator.ts`): Improved natural language to code conversion

### API Endpoints
- `/api/sandbox/execute`: Execute code in secure E2B sandbox
- `/api/sandbox/create`: Create persistent sandbox session
- `/api/scrape/url`: Scrape and analyze a website
- `/api/scrape/clone`: Clone website structure and content
- `/api/generate/app`: Generate complete app from description

### Database Schema Updates
- Added `sandboxSessions` table for E2B session management
- Added `scrapedData` table for caching Firecrawl results
- Extended `projects` table with sandbox and scraping metadata