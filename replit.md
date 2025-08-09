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
- **AI Integration Layer**: Supports Anthropic Claude, OpenAI GPT-4, GPT-OSS (120B/20B), SpaceAgent, MindSphere, and Terminal Jarvis. Includes a unified interface for different AI services, context-aware AI with memory and learning, and advanced code analysis/optimization.
- **GPT-OSS Integration (December 2025)**: OpenAI's open-weight models (gpt-oss-120b and gpt-oss-20b) via Together AI, featuring native tool calling, chain-of-thought reasoning, web search, and Python code execution capabilities. Configurable reasoning levels (low/medium/high) with full transparency into the model's thought process.
- **Terminal Jarvis Integration**: A multi-AI tool manager providing unified CLI access to various models (Claude, Gemini, Qwen, OpenCode) through natural language command parsing.
- **Chat and Code Assistance**: Real-time chat with AI providers, code generation, debugging assistance, context-aware suggestions, token usage tracking.
- **Consciousness Features**: Session-based context retention, learning from user patterns, memory system for insights, confidence scoring for AI suggestions.
- **Superintelligence Capabilities**: Architecture analysis, performance optimization, code refactoring automation, security auditing.
- **Deployment Intelligence**: Self-healing deployment, intelligent rollback, predictive scaling, environment-aware optimization, continuous learning from deployment patterns.
- **Pricing & Subscription System**: Credit-based usage tracking with three tiers (Explorer, Builder, Architect), billing integration, usage monitoring, credit-protected actions, and comprehensive subscription management.
- **UI/UX Decisions**: Cosmic branding with a cosmic cyan/aqua theme, glowing effects, animated stars, glass morphism cards, and a redesigned landing page and dashboard.

## External Dependencies

### Core Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting
- **Replit Platform**: Authentication and deployment environment
- **Anthropic API**: Claude AI model access
- **OpenAI API**: GPT-4 model access
- **Together AI API**: GPT-OSS models (120B and 20B) hosting with OpenAI-compatible endpoints
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

## Pricing System Architecture (January 2025)

### Overview
Implemented a comprehensive credit-based pricing system similar to Replit's model but streamlined for Space Child's specific needs. The system provides transparent usage tracking and clear upgrade paths.

### Pricing Tiers
1. **Explorer (Free)**: 100 monthly credits, basic AI providers, up to 3 projects
2. **Builder ($29/month)**: 1,000 monthly credits, all AI providers, unlimited projects
3. **Architect ($99/month)**: 5,000 monthly credits, premium AI providers, team features

### Credit System
- **Credit Actions**: AI queries (1-8 credits), code generation (2 credits), sandbox creation (5 credits)
- **Usage Tracking**: Real-time credit monitoring, monthly reset cycles, overage alerts
- **AI Provider Costs**: Basic providers (1x), advanced providers (1.5x), premium providers (2x)

### Technical Implementation
1. **Backend Services**:
   - `server/routes/subscriptions.ts`: Subscription and credit management API
   - `server/services/pricing.ts`: Credit calculation and usage tracking
   - Database schema extensions for subscription plans and usage tracking

2. **Frontend Components**:
   - `client/src/pages/pricing.tsx`: Comprehensive pricing page
   - `client/src/components/Pricing/PricingCard.tsx`: Interactive pricing cards
   - `client/src/components/Dashboard/CreditDisplay.tsx`: Real-time credit monitoring
   - `client/src/components/Pricing/CreditProtectedAction.tsx`: Usage enforcement

3. **User Experience**:
   - Real-time credit usage display in dashboard
   - Credit-protected actions with upgrade prompts
   - Transparent pricing with feature comparisons
   - Seamless upgrade flow integration

### Business Logic
- Monthly credit allowances with overage tracking
- Feature gating based on subscription tiers
- AI provider access control by plan level
- Usage analytics for optimization insights
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