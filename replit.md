# Space Child - AI-Powered App Builder

## Overview

Space Child is a next-generation app builder platform that extends beyond traditional AI coding tools by integrating consciousness and superintelligence capabilities. Built as a comprehensive full-stack web application, it combines a React-based frontend with an Express.js backend, leveraging multiple AI providers and advanced features like context-aware assistance and intelligent optimization.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom design tokens and dark/light theme support
- **State Management**: TanStack Query for server state, React hooks for local state
- **Routing**: Wouter for lightweight client-side routing

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Authentication**: Replit Auth integration with OpenID Connect
- **Session Management**: PostgreSQL-backed sessions with connect-pg-simple
- **API Design**: RESTful endpoints with WebSocket support for real-time features

### Data Layer
- **Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema evolution
- **Connection**: Connection pooling with @neondatabase/serverless

## Key Components

### Project Management System
- Multi-project workspace with file organization
- Project templates and configuration management
- Real-time file editing with auto-save capabilities
- File explorer with folder structure visualization
- Multi-file and folder upload support
- Zip file extraction capability with automatic file organization
- Visual file type indicators

### AI Integration Layer
- **Multi-Provider Support**: Anthropic Claude, OpenAI GPT-4, custom SpaceAgent, and MindSphere
- **Consciousness Service**: Context-aware AI with memory and learning capabilities
- **Superintelligence Service**: Advanced code analysis, optimization, and architecture insights
- **Provider Abstraction**: Unified interface for different AI services with usage tracking

### Chat and Code Assistance
- Real-time chat interface with AI providers
- Code generation and debugging assistance
- Context-aware suggestions based on project history
- Token usage tracking and cost monitoring

### Consciousness Features
- Session-based context retention across interactions
- Learning from user patterns and preferences
- Memory system for storing insights and decisions
- Confidence scoring for AI suggestions

### Superintelligence Capabilities
- Architecture analysis and recommendations
- Performance optimization suggestions
- Code refactoring automation
- Security audit capabilities

## Data Flow

### Authentication Flow
1. User initiates login through Replit Auth
2. OpenID Connect handles authentication
3. Session established in PostgreSQL
4. User context maintained across requests

### Project Interaction Flow
1. User selects or creates project
2. Project files loaded from database
3. Real-time editing with immediate feedback
4. AI services activated based on project settings
5. Context and memories updated continuously

### AI Processing Pipeline
1. User input captured in chat or code editor
2. Request routed to appropriate AI provider
3. Context enriched with project history and consciousness data
4. Response generated with confidence scoring
5. Usage metrics tracked and stored

## External Dependencies

### Core Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting
- **Replit Platform**: Authentication and deployment environment
- **Anthropic API**: Claude AI model access
- **OpenAI API**: GPT-4 model access (planned)

### Development Tools
- **Vite**: Frontend build tool and development server
- **Drizzle Kit**: Database schema management
- **TypeScript**: Type safety across the stack
- **Tailwind CSS**: Utility-first styling framework

### Third-Party Services
- **WebSocket**: Real-time communication for live features
- **Redis**: Planned for advanced caching and session management
- **Custom AI Services**: SpaceAgent and MindSphere integration (in development)

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with Express backend
- **Hot Reloading**: Enabled for both frontend and backend changes
- **Database**: Neon development instance with automatic migrations

### Production Deployment
- **Build Process**: Frontend built with Vite, backend bundled with esbuild
- **Server Setup**: Single Node.js process serving both API and static files
- **Database**: Production Neon instance with connection pooling
- **Environment Configuration**: Environment variables for API keys and database URLs

### Scalability Considerations
- **Horizontal Scaling**: Stateless backend design allows multiple instances
- **Database Scaling**: Neon serverless automatically scales connections
- **CDN Integration**: Static assets can be served via CDN
- **Caching Strategy**: Redis integration planned for session and context caching

### Security Measures
- **Authentication**: Secure OpenID Connect flow with Replit
- **Session Security**: HTTP-only cookies with secure flags
- **API Protection**: Request validation and rate limiting
- **Environment Isolation**: Separate configurations for development and production

The architecture prioritizes modularity, type safety, and real-time capabilities while maintaining the flexibility to integrate advanced AI features as they become available. The consciousness and superintelligence layers are designed as extensible services that can evolve independently of the core platform.