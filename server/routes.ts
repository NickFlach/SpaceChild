import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { zkpAuthenticated } from "./services/zkpAuth";
import zkpAuthRoutes from "./routes/zkpAuth";
import { insertProjectSchema, insertProjectFileSchema } from "@shared/schema";
import { consciousnessService } from "./services/consciousness";
import { superintelligenceService } from "./services/superintelligence";
import { aiProviderService } from "./services/aiProviders";
import { projectMemoryService } from "./services/projectMemory";
import { agenticOrchestrationService } from "./services/agentic/orchestrationService";
import { collaborationService } from "./services/collaborationService";
import projectMemoryRoutes from "./routes/projectMemory";
import templateRoutes from "./routes/templates";
import sandboxRoutes from "./routes/sandbox";
import scrapeRoutes from "./routes/scrape";
import subscriptionRoutes from "./routes/subscriptions";
import replitUserSearchRoutes from "./routes/replitUserSearch";
import consciousnessRoutes from "./routes/consciousness.js";
import agenticRoutes from "./routes/agentic";
import multiagentRoutes from "./routes/multiagent";
import webSearchRoutes from "./routes/webSearch";
import consciousnessInfrastructureRoutes from "./routes/consciousness-infrastructure";
import realConsciousnessRoutes from "./routes/real-consciousness";
import intelligenceRoutes from "./routes/intelligence";
import v11Routes from "./routes/v1.1";
import v12Routes from "./routes/v1.2";
import unifiedEnhancedRoutes from "./routes/unified-enhanced";
import unifiedGatewayRoutes from "./routes/unified-gateway";
import activismIntegrationRoutes from "./routes/activism-integration";
import syncRoutes from "./routes/sync";
import { WebSocketMessage, createRoomId } from "@shared/collaboration";
import { OperationalTransform } from "@shared/operationalTransform";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware - Comment out Replit auth for now
  // await setupAuth(app);
  
  // ZKP Auth routes
  app.use('/api/zkp', zkpAuthRoutes);

  // Auth routes - Use ZKP authentication
  app.get('/api/auth/user', zkpAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Folder Management Routes
  // Create a folder by placing a marker file so empty folders can be represented
  app.post('/api/projects/:id/folders', zkpAuthenticated, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const { path } = req.body || {};
      const project = await storage.getProject(projectId);
      if (!project || project.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: 'Access denied' });
      }
      if (!path || typeof path !== 'string') {
        return res.status(400).json({ message: 'path is required' });
      }
      const normalized = path.replace(/\\/g, '/').replace(/\/$/, '');
      const markerPath = `${normalized}/.folder`;
      const existing = await storage.getProjectFile(projectId, markerPath);
      if (existing) {
        return res.json({ success: true, created: false });
      }
      const marker = await storage.createProjectFile({
        projectId,
        filePath: markerPath,
        fileType: 'txt',
        content: '',
        version: 1,
      } as any);
      res.json({ success: true, created: true, marker });
    } catch (error) {
      console.error('Error creating folder:', error);
      res.status(500).json({ message: 'Failed to create folder' });
    }
  });

  // Delete folder (recursively delete all files with prefix)
  app.delete('/api/projects/:id/folders/*', zkpAuthenticated, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const folderPath = (req.params[0] as string).replace(/\\/g, '/').replace(/\/$/, '');
      const project = await storage.getProject(projectId);
      if (!project || project.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: 'Access denied' });
      }
      const all = await storage.getProjectFiles(projectId);
      const toDelete = all.filter(f => f.filePath === folderPath || f.filePath.startsWith(folderPath + '/'));
      for (const f of toDelete) {
        await storage.deleteProjectFile(f.id);
      }
      res.json({ success: true, deleted: toDelete.length });
    } catch (error) {
      console.error('Error deleting folder:', error);
      res.status(500).json({ message: 'Failed to delete folder' });
    }
  });

  // Rename/Move folder (update prefix for all matching files)
  app.post('/api/projects/:id/folders/rename', zkpAuthenticated, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const { fromPath, toPath } = req.body || {};
      const project = await storage.getProject(projectId);
      if (!project || project.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: 'Access denied' });
      }
      if (!fromPath || !toPath) {
        return res.status(400).json({ message: 'fromPath and toPath are required' });
      }
      const fromNorm = (fromPath as string).replace(/\\/g, '/').replace(/\/$/, '');
      const toNorm = (toPath as string).replace(/\\/g, '/').replace(/\/$/, '');
      if (fromNorm === toNorm) return res.json({ success: true, moved: 0 });
      const all = await storage.getProjectFiles(projectId);
      // Prevent conflicts: ensure no target path already exists for any file
      const conflicts = all.some(f => f.filePath.startsWith(fromNorm + '/') && all.find(x => x.filePath === f.filePath.replace(fromNorm + '/', toNorm + '/')));
      if (conflicts) {
        return res.status(409).json({ message: 'Destination already contains conflicting files' });
      }
      let moved = 0;
      for (const f of all) {
        if (f.filePath === fromNorm) {
          await storage.updateProjectFile(f.id, { filePath: toNorm });
          moved++;
        } else if (f.filePath.startsWith(fromNorm + '/')) {
          const newPath = f.filePath.replace(fromNorm + '/', toNorm + '/');
          await storage.updateProjectFile(f.id, { filePath: newPath });
          moved++;
        }
      }
      res.json({ success: true, moved });
    } catch (error) {
      console.error('Error renaming/moving folder:', error);
      res.status(500).json({ message: 'Failed to rename/move folder' });
    }
  });

  // Delete a file by path
  app.delete('/api/projects/:id/files/*', zkpAuthenticated, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const filePath = req.params[0];
      const project = await storage.getProject(projectId);

      if (!project || project.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Access denied" });
      }

      const file = await storage.getProjectFile(projectId, filePath);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }

      await storage.deleteProjectFile(file.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting file:", error);
      res.status(500).json({ message: "Failed to delete file" });
    }
  });

  // Rename/Move a file: body { fromPath: string, toPath: string }
  app.post('/api/projects/:id/files/rename', zkpAuthenticated, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const { fromPath, toPath } = req.body || {};
      const project = await storage.getProject(projectId);

      if (!project || project.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Access denied" });
      }

      if (!fromPath || !toPath) {
        return res.status(400).json({ message: 'fromPath and toPath are required' });
      }

      const src = await storage.getProjectFile(projectId, fromPath);
      if (!src) {
        return res.status(404).json({ message: "Source file not found" });
      }

      // Prevent overwriting existing file
      const existing = await storage.getProjectFile(projectId, toPath);
      if (existing) {
        return res.status(409).json({ message: "Destination already exists" });
      }

      const updated = await storage.updateProjectFile(src.id, { filePath: toPath });
      res.json(updated);
    } catch (error) {
      console.error("Error renaming/moving file:", error);
      res.status(500).json({ message: "Failed to rename/move file" });
    }
  });

  // Legacy logout route for compatibility
  app.get('/api/logout', (req, res) => {
    // Clear any cookies if they exist
    res.clearCookie('token');
    res.clearCookie('session');
    res.json({ success: true, message: 'Logged out successfully' });
  });

  // Profile management routes
  app.get('/api/profile', zkpAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return profile data without sensitive info
      const profile = {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt,
        plan: user.subscriptionTier || 'explorer',
        monthlyCredits: user.monthlyCredits,
        usedCredits: user.usedCredits,
        creditResetDate: user.creditResetDate
      };
      
      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.put('/api/profile', zkpAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { firstName, lastName } = req.body;
      
      // Get the user first
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update user profile using db directly
      const { db } = await import("./db");
      const { users } = await import("@shared/schema");
      const { eq } = await import("drizzle-orm");
      
      const [updatedUser] = await db.update(users)
        .set({ 
          firstName,
          lastName,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId))
        .returning();
      
      res.json({
        success: true,
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          username: updatedUser.username,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName
        }
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.delete('/api/profile', zkpAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Delete all user's projects first
      const projects = await storage.getProjectsByUserId(userId);
      for (const project of projects) {
        await storage.deleteProject(project.id);
      }
      
      // Delete user account using db directly
      const { db } = await import("./db");
      const { users } = await import("@shared/schema");
      const { eq } = await import("drizzle-orm");
      
      await db.delete(users).where(eq(users.id, userId));
      
      res.json({ success: true, message: 'Account deleted successfully' });
    } catch (error) {
      console.error("Error deleting account:", error);
      res.status(500).json({ message: "Failed to delete account" });
    }
  });

  // Project Management Routes
  app.get('/api/projects', zkpAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const projects = await storage.getProjectsByUserId(userId);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.post('/api/projects', zkpAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const projectData = insertProjectSchema.parse({ ...req.body, userId });
      const project = await storage.createProject(projectData);
      res.json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.get('/api/projects/:id', zkpAuthenticated, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Check if user owns the project
      if (project.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.put('/api/projects/:id', zkpAuthenticated, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      if (project.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const updatedProject = await storage.updateProject(projectId, req.body);
      res.json(updatedProject);
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  app.delete('/api/projects/:id', zkpAuthenticated, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      if (project.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      await storage.deleteProject(projectId);
      res.json({ message: "Project deleted successfully" });
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // File Management Routes
  app.get('/api/projects/:id/files', zkpAuthenticated, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project || project.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const files = await storage.getProjectFiles(projectId);
      res.json(files);
    } catch (error) {
      console.error("Error fetching files:", error);
      res.status(500).json({ message: "Failed to fetch files" });
    }
  });

  app.post('/api/projects/:id/files', zkpAuthenticated, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project || project.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const fileData = insertProjectFileSchema.parse({ ...req.body, projectId });
      const file = await storage.createProjectFile(fileData);
      res.json(file);
    } catch (error) {
      console.error("Error creating file:", error);
      res.status(500).json({ message: "Failed to create file" });
    }
  });

  app.get('/api/projects/:id/files/*', zkpAuthenticated, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const filePath = req.params[0];
      const project = await storage.getProject(projectId);
      
      if (!project || project.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const file = await storage.getProjectFile(projectId, filePath);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
      
      res.json(file);
    } catch (error) {
      console.error("Error fetching file:", error);
      res.status(500).json({ message: "Failed to fetch file" });
    }
  });

  app.put('/api/projects/:id/files/*', zkpAuthenticated, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const filePath = req.params[0];
      const project = await storage.getProject(projectId);
      
      if (!project || project.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const file = await storage.getProjectFile(projectId, filePath);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
      
      const updatedFile = await storage.updateProjectFile(file.id, req.body);
      res.json(updatedFile);
    } catch (error) {
      console.error("Error updating file:", error);
      res.status(500).json({ message: "Failed to update file" });
    }
  });

  // AI Provider Routes
  app.post('/api/ai/generate', zkpAuthenticated, async (req: any, res) => {
    try {
      const { prompt, provider = 'anthropic', projectId } = req.body;
      const userId = req.user.claims.sub;
      
      const result = await aiProviderService.generateCode(prompt, provider, projectId);
      
      // Track usage
      await storage.createAiProviderUsage({
        userId,
        provider,
        serviceType: 'basic_coding',
        tokensUsed: result.tokensUsed,
        costUsd: result.cost,
      });
      
      res.json(result);
    } catch (error) {
      console.error("Error generating code:", error);
      res.status(500).json({ message: "Failed to generate code" });
    }
  });

  // GPT-OSS test endpoint (only enabled in development)
  if (process.env.NODE_ENV === 'development') {
    app.post('/api/test/gptoss', async (req, res) => {
      try {
        const { prompt, model = 'gpt-oss-20b' } = req.body;
        const result = await aiProviderService.generateCode(prompt, model);
        res.json(result);
      } catch (error: any) {
        console.error("GPT-OSS test error:", error);
        res.status(500).json({ message: error.message });
      }
    });
  }

  app.post('/api/ai/chat', zkpAuthenticated, async (req: any, res) => {
    try {
      const { message, provider = 'anthropic', projectId, enableWebSearch = false } = req.body;
      const userId = req.user.claims.sub;
      
      // Get relevant memories if projectId is provided
      let contextualHints: string[] = [];
      if (projectId) {
        contextualHints = await projectMemoryService.applyLearnedPatterns(projectId, message);
      }
      
      // Add contextual hints to the message
      let enhancedMessage = contextualHints.length > 0 
        ? `${message}\n\nContext from previous interactions:\n${contextualHints.join('\n')}`
        : message;
      
      // Check if web search is enabled and if the query needs real-time information
      if (enableWebSearch) {
        try {
          // Use orchestration service to determine if web search is needed
          const orchestrationRequest = {
            userId,
            projectId,
            request: enhancedMessage,
            context: {
              domain: 'web_research',
              complexity: 'moderate' as const,
              capabilities: ['web_search', 'real_time_info']
            }
          };
          
          const orchestrationResult = await agenticOrchestrationService.processRequest(orchestrationRequest);
          
          if (orchestrationResult.strategy === 'agentic' && orchestrationResult.webSearchResults) {
            // Add web search results to the enhanced message
            enhancedMessage = `${enhancedMessage}\n\nCurrent web information:\n${JSON.stringify(orchestrationResult.webSearchResults, null, 2)}`;
          }
        } catch (webSearchError) {
          console.warn('Web search failed, continuing with regular chat:', webSearchError);
        }
      }
      
      const result = await aiProviderService.chat(enhancedMessage, provider, projectId);
      
      // Learn from the interaction if projectId is provided
      if (projectId && result.response) {
        await projectMemoryService.learnFromInteraction(
          projectId,
          'code_generation',
          result.response,
          { 
            userMessage: message,
            provider,
            timestamp: new Date().toISOString()
          }
        );
      }
      
      // Track usage
      await storage.createAiProviderUsage({
        userId,
        provider,
        serviceType: 'basic_coding',
        tokensUsed: result.tokensUsed,
        costUsd: result.cost,
      });
      
      res.json(result);
    } catch (error) {
      console.error("Error processing chat:", error);
      res.status(500).json({ message: "Failed to process chat message" });
    }
  });

  // Unified AI Chat - Enhanced endpoint with mode awareness
  app.post('/api/ai/unified-chat', zkpAuthenticated, async (req: any, res) => {
    try {
      const { 
        message, 
        mode = 'normal',
        projectId, 
        enableWebSearch = false,
        fileContext,
        consciousnessState,
        autoMemory = true
      } = req.body;
      const userId = req.user.claims.sub;
      
      // Build enhanced context based on mode
      let modePrompt = '';
      switch (mode) {
        case 'jarvis':
          modePrompt = 'You are Jarvis, a proactive AI assistant that anticipates user needs. Be helpful, sophisticated, and slightly formal. ';
          break;
        case 'developer':
          modePrompt = 'You are a code-focused development assistant. Focus on best practices, debugging, and code quality. Be precise and technical. ';
          break;
        case 'architect':
          modePrompt = 'You are a system architecture expert. Focus on design patterns, scalability, and system-level thinking. ';
          break;
        case 'security':
          modePrompt = 'You are a security analyst. Focus on vulnerabilities, security best practices, and threat detection. ';
          break;
        case 'ops':
          modePrompt = 'You are a DevOps specialist. Focus on deployment, infrastructure, CI/CD, and operational excellence. ';
          break;
      }
      
      // Get relevant memories if projectId is provided and autoMemory is enabled
      let contextualHints: string[] = [];
      if (projectId && autoMemory) {
        contextualHints = await projectMemoryService.applyLearnedPatterns(projectId, message);
      }
      
      // Build enhanced message with all context
      let enhancedMessage = modePrompt + message;
      
      if (fileContext) {
        enhancedMessage += `\n\nCurrent file context:\n- File: ${fileContext.filePath}\n- Language: ${fileContext.language}\n- Line ${fileContext.lineNumber}: ${fileContext.currentLine}`;
      }
      
      if (contextualHints.length > 0) {
        enhancedMessage += `\n\nRelevant context from memory:\n${contextualHints.join('\n')}`;
      }
      
      if (consciousnessState && consciousnessState.phi) {
        enhancedMessage += `\n\nConsciousness state: Φ=${consciousnessState.phi.toFixed(2)}`;
      }
      
      // Handle web search if enabled
      if (enableWebSearch) {
        try {
          const orchestrationRequest = {
            userId,
            projectId,
            request: enhancedMessage,
            context: {
              domain: 'web_research',
              complexity: 'moderate' as const,
              capabilities: ['web_search', 'real_time_info']
            }
          };
          
          const orchestrationResult = await agenticOrchestrationService.processRequest(orchestrationRequest);
          
          if (orchestrationResult.strategy === 'agentic' && orchestrationResult.webSearchResults) {
            enhancedMessage += `\n\nCurrent web information:\n${JSON.stringify(orchestrationResult.webSearchResults, null, 2)}`;
          }
        } catch (webSearchError) {
          console.warn('Web search failed, continuing with regular chat:', webSearchError);
        }
      }
      
      // Use appropriate provider based on mode
      const provider = mode === 'jarvis' ? 'anthropic' : 'anthropic'; // Can customize per mode
      const result = await aiProviderService.chat(enhancedMessage, provider, projectId);
      
      // Learn from the interaction if autoMemory is enabled
      if (projectId && autoMemory && result.response) {
        await projectMemoryService.learnFromInteraction(
          projectId,
          mode === 'security' ? 'security_analysis' : 'code_generation',
          result.response,
          { 
            userMessage: message,
            mode,
            provider,
            fileContext,
            timestamp: new Date().toISOString()
          }
        );
      }
      
      // Track usage
      await storage.createAiProviderUsage({
        userId,
        provider,
        serviceType: mode === 'security' ? 'security_scan' : 'basic_coding',
        tokensUsed: result.tokensUsed,
        costUsd: result.cost,
      });
      
      res.json({
        ...result,
        contextType: mode,
      });
    } catch (error) {
      console.error("Error processing unified chat:", error);
      res.status(500).json({ message: "Failed to process chat message" });
    }
  });

  // Auto-save memory context (background process)
  app.post('/api/memory/auto-save', zkpAuthenticated, async (req: any, res) => {
    try {
      const { projectId, context } = req.body;
      const userId = req.user.claims.sub;
      
      // Verify project access
      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Save context to memory (lightweight operation)
      await projectMemoryService.learnFromInteraction(
        projectId,
        'auto_context',
        JSON.stringify(context),
        {
          file: context.file,
          language: context.language,
          mode: context.mode,
          messageCount: context.recentMessages?.length || 0,
          timestamp: new Date().toISOString(),
          automatic: true
        }
      );
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error auto-saving memory:", error);
      // Fail silently for background operations
      res.status(200).json({ success: false });
    }
  });

  // Quick Deploy Command
  app.post('/api/deployment/quick-deploy', zkpAuthenticated, async (req: any, res) => {
    try {
      const { projectId, args } = req.body;
      const userId = req.user.claims.sub;
      
      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Parse deployment arguments
      const deploymentType = args?.trim() || 'default';
      
      res.json({
        response: `Initiating deployment for ${project.name} (${deploymentType})...\n\nDeployment configuration:\n- Environment: production\n- Type: ${deploymentType}\n- Status: Starting\n\nI'll handle the deployment process. Check the Deploy tab for detailed progress.`,
        provider: 'system',
        contextType: 'deployment'
      });
    } catch (error) {
      console.error("Error in quick deploy:", error);
      res.status(500).json({ 
        response: "Deployment failed. Please check your project configuration and try again.",
        provider: 'system'
      });
    }
  });

  // Terminal Execute Command
  app.post('/api/terminal/execute', zkpAuthenticated, async (req: any, res) => {
    try {
      const { projectId, command } = req.body;
      const userId = req.user.claims.sub;
      
      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      if (!command || command.trim().length === 0) {
        return res.json({
          response: 'Please specify a command to execute. Example: /terminal npm install',
          provider: 'system',
          contextType: 'terminal'
        });
      }
      
      // Security: Don't actually execute arbitrary commands - just provide feedback
      res.json({
        response: `Command queued: \`${command}\`\n\nFor security, terminal commands are sandboxed. Check the Terminal tab to execute commands interactively.`,
        provider: 'system',
        contextType: 'terminal'
      });
    } catch (error) {
      console.error("Error in terminal execute:", error);
      res.status(500).json({ 
        response: "Failed to execute terminal command.",
        provider: 'system'
      });
    }
  });

  // Replit Search Command
  app.get('/api/replit/search', zkpAuthenticated, async (req: any, res) => {
    try {
      const query = req.query.q as string;
      
      if (!query || query.trim().length === 0) {
        return res.json({
          response: 'Please specify a search query. Example: /search react hooks',
          provider: 'system',
          contextType: 'search'
        });
      }
      
      res.json({
        response: `Searching Replit for: "${query}"\n\nCheck the Replit Search tab for detailed results and to explore templates.`,
        provider: 'system',
        contextType: 'search'
      });
    } catch (error) {
      console.error("Error in replit search:", error);
      res.status(500).json({ 
        response: "Search failed. Please try again.",
        provider: 'system'
      });
    }
  });

  // Consciousness Layer Routes
  app.post('/api/consciousness/activate', zkpAuthenticated, async (req: any, res) => {
    try {
      const { projectId } = req.body;
      const userId = req.user.claims.sub;
      
      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const session = await consciousnessService.activate(userId, projectId);
      
      // Update project to enable consciousness
      await storage.updateProject(projectId, { consciousnessEnabled: true });
      
      res.json(session);
    } catch (error) {
      console.error("Error activating consciousness:", error);
      res.status(500).json({ message: "Failed to activate consciousness" });
    }
  });

  app.post('/api/consciousness/query', zkpAuthenticated, async (req: any, res) => {
    try {
      const { sessionId, query, projectId } = req.body;
      const userId = req.user.claims.sub;
      
      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const result = await consciousnessService.query(sessionId, query, projectId);
      
      // Track usage
      await storage.createAiProviderUsage({
        userId,
        provider: 'spaceagent',
        serviceType: 'consciousness',
        tokensUsed: result.tokensUsed || 0,
        costUsd: result.cost || '0',
      });
      
      res.json(result);
    } catch (error) {
      console.error("Error processing consciousness query:", error);
      res.status(500).json({ message: "Failed to process consciousness query" });
    }
  });

  app.get('/api/consciousness/context/:projectId', zkpAuthenticated, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const userId = req.user.claims.sub;
      
      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const context = await storage.getConsciousnessContext(projectId);
      res.json(context);
    } catch (error) {
      console.error("Error fetching consciousness context:", error);
      res.status(500).json({ message: "Failed to fetch consciousness context" });
    }
  });

  // Superintelligence Layer Routes
  app.post('/api/superintelligence/analyze', zkpAuthenticated, async (req: any, res) => {
    try {
      const { projectId, fileId, code, language } = req.body;
      const userId = req.user.claims.sub;
      
      if (!projectId || !code) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      const project = await storage.getProject(parseInt(projectId));
      if (!project || project.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const analysis = await superintelligenceService.analyzeCode(
        parseInt(projectId),
        fileId || '',
        code,
        language
      );
      
      res.json({ analysis });
    } catch (error) {
      console.error("Code analysis error:", error);
      res.status(500).json({ error: "Failed to analyze code" });
    }
  });

  app.post('/api/superintelligence/optimize', zkpAuthenticated, async (req: any, res) => {
    try {
      const { projectId, analysis } = req.body;
      const userId = req.user.claims.sub;
      
      if (!projectId || !analysis) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      const project = await storage.getProject(parseInt(projectId));
      if (!project || project.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const optimizations = await superintelligenceService.optimizePerformance(
        parseInt(projectId),
        analysis
      );
      
      res.json({ optimizations });
    } catch (error) {
      console.error("Optimization error:", error);
      res.status(500).json({ error: "Failed to generate optimizations" });
    }
  });

  app.post('/api/superintelligence/recommend', zkpAuthenticated, async (req: any, res) => {
    try {
      const { projectId, projectType, currentStructure } = req.body;
      const userId = req.user.claims.sub;
      
      if (!projectId || !projectType) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      const project = await storage.getProject(parseInt(projectId));
      if (!project || project.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const recommendations = await superintelligenceService.recommendArchitecture(
        parseInt(projectId),
        projectType,
        currentStructure || {}
      );
      
      res.json({ recommendations });
    } catch (error) {
      console.error("Recommendation error:", error);
      res.status(500).json({ error: "Failed to generate recommendations" });
    }
  });

  app.post('/api/superintelligence/predict-bugs', zkpAuthenticated, async (req: any, res) => {
    try {
      const { projectId, code } = req.body;
      const userId = req.user.claims.sub;
      
      if (!projectId || !code) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      const project = await storage.getProject(parseInt(projectId));
      if (!project || project.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const predictions = await superintelligenceService.predictBugs(
        parseInt(projectId),
        code
      );
      
      res.json({ predictions });
    } catch (error) {
      console.error("Bug prediction error:", error);
      res.status(500).json({ error: "Failed to predict bugs" });
    }
  });

  app.get('/api/superintelligence/analyses/:projectId', zkpAuthenticated, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const userId = req.user.claims.sub;
      
      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const analyses = await superintelligenceService.getProjectAnalyses(projectId);
      res.json({ analyses });
    } catch (error) {
      console.error("Error fetching analyses:", error);
      res.status(500).json({ error: "Failed to fetch analyses" });
    }
  });

  app.get('/api/superintelligence/optimizations/:projectId', zkpAuthenticated, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const userId = req.user.claims.sub;
      
      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const optimizations = await superintelligenceService.getProjectOptimizations(projectId);
      res.json({ optimizations });
    } catch (error) {
      console.error("Error fetching optimizations:", error);
      res.status(500).json({ error: "Failed to fetch optimizations" });
    }
  });

  app.get('/api/superintelligence/recommendations/:projectId', zkpAuthenticated, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const userId = req.user.claims.sub;
      
      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const recommendations = await superintelligenceService.getProjectRecommendations(projectId);
      res.json({ recommendations });
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      res.status(500).json({ error: "Failed to fetch recommendations" });
    }
  });

  // Multi-Agent System Routes
  app.post('/api/multiagent/start', zkpAuthenticated, async (req: any, res) => {
    try {
      const { projectId, goal } = req.body;
      const userId = req.user.claims.sub;
      
      if (!projectId || !goal) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      const project = await storage.getProject(parseInt(projectId));
      if (!project || project.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const { multiAgentService } = await import("./services/multiAgent");
      await multiAgentService.startSession(parseInt(projectId), userId, goal);
      
      res.json({ success: true, message: "Multi-agent collaboration started" });
    } catch (error) {
      console.error("Multi-agent start error:", error);
      res.status(500).json({ error: "Failed to start multi-agent collaboration" });
    }
  });

  app.get('/api/multiagent/status', zkpAuthenticated, async (req: any, res) => {
    try {
      const { multiAgentService } = await import("./services/multiAgent");
      const status = multiAgentService.getSessionStatus();
      const agentStatuses = multiAgentService.getAllAgentStatuses();
      
      res.json({ status, agentStatuses });
    } catch (error) {
      console.error("Multi-agent status error:", error);
      res.status(500).json({ error: "Failed to get multi-agent status" });
    }
  });

  // Deployment Intelligence Routes
  app.post('/api/deployments/deploy', zkpAuthenticated, async (req: any, res) => {
    try {
      const { projectId, environment, version, features } = req.body;
      const userId = req.user.claims.sub;
      
      if (!projectId || !environment || !version) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      const project = await storage.getProject(parseInt(projectId));
      if (!project || project.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const { deploymentService } = await import("./services/deployment");
      const deployment = await deploymentService.deployWithIntelligence({
        projectId: parseInt(projectId),
        environment,
        version,
        features: features || []
      }, userId);
      
      res.json({ deployment });
    } catch (error) {
      console.error("Deployment error:", error);
      res.status(500).json({ error: "Failed to deploy" });
    }
  });

  app.get('/api/deployments/:projectId/analytics', zkpAuthenticated, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const userId = req.user.claims.sub;
      
      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const { deploymentService } = await import("./services/deployment");
      const analytics = await deploymentService.getDeploymentAnalytics(projectId);
      
      res.json(analytics);
    } catch (error) {
      console.error("Analytics error:", error);
      res.status(500).json({ error: "Failed to fetch deployment analytics" });
    }
  });

  app.post('/api/deployments/rollback', zkpAuthenticated, async (req: any, res) => {
    try {
      const { deploymentId } = req.body;
      const userId = req.user.claims.sub;
      
      if (!deploymentId) {
        return res.status(400).json({ error: "Missing deployment ID" });
      }
      
      // Verify deployment ownership
      const { deploymentService } = await import("./services/deployment");
      const { db } = await import("./db");
      const { deployments } = await import("@shared/schema");
      const { eq } = await import("drizzle-orm");
      
      const [deployment] = await db.select()
        .from(deployments)
        .where(eq(deployments.id, deploymentId));
      
      if (!deployment) {
        return res.status(404).json({ error: "Deployment not found" });
      }
      
      const project = await storage.getProject(deployment.projectId);
      if (!project || project.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      await deploymentService.performRollback(deployment);
      
      res.json({ success: true, message: "Rollback initiated" });
    } catch (error) {
      console.error("Rollback error:", error);
      res.status(500).json({ error: "Failed to rollback" });
    }
  });

  // Register project memory routes
  app.use(projectMemoryRoutes);
  
  // Register template routes
  app.use('/api', templateRoutes);

  // Register subscription routes
  app.use('/api/subscriptions', subscriptionRoutes);
  
  // Register Replit user search routes
  app.use('/api/replit-users', replitUserSearchRoutes);
  
  // Register consciousness routes
  app.use('/api/consciousness', consciousnessRoutes);
  
  // Register agentic system routes
  app.use('/api/agentic', agenticRoutes);
  
  // Register multi-agent system routes
  app.use('/api/multiagent', multiagentRoutes);
  
  // Register web search routes
  app.use('/api/web-search', webSearchRoutes);
  
  // Register consciousness infrastructure routes
  app.use('/api/consciousness-infrastructure', consciousnessInfrastructureRoutes);
  
  // Register REAL consciousness routes
  app.use('/api/real-consciousness', realConsciousnessRoutes);
  
  // Register Unified Intelligence System routes
  app.use('/api/intelligence', intelligenceRoutes);
  
  // Register v1.1 Enhanced Intelligence routes
  app.use('/api/v1.1', v11Routes);
  
  // Register v1.2 Predictive Intelligence routes
  app.use('/api/v1.2', v12Routes);
  
  // Register Enhanced Unified Platform routes
  app.use('/api/unified-enhanced', unifiedEnhancedRoutes);
  
  // Register Unified Gateway (SpaceChild + Pitchfork)
  app.use('/api/unified', unifiedGatewayRoutes);
  
  // Register Activism Integration (Pitchfork features in SpaceChild)
  app.use('/api/activism', activismIntegrationRoutes);
  
  // Register Bidirectional Sync
  app.use('/api/sync', syncRoutes);

  // Create HTTP server
  const httpServer = createServer(app);

  // Enhanced WebSocket server for real-time collaboration
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  interface ExtendedWebSocket extends WebSocket {
    userId?: string;
    roomId?: string;
  }

  wss.on('connection', async (ws: ExtendedWebSocket, req) => {
    console.log('WebSocket connection attempt');

    // Parse authorization from query params or headers
    const url = new URL(req.url!, `http://${req.headers.host}`);
    const token = url.searchParams.get('token') || req.headers.authorization?.replace('Bearer ', '');
    
    let userId: string | undefined;
    if (token) {
      try {
        // SECURITY FIX: Use proper JWT verification instead of payload extraction
        const { ZKPAuthService } = await import('./services/zkpAuth');
        const decoded = ZKPAuthService.verifyToken(token);
        userId = decoded.sub;
        ws.userId = userId;
        console.log(`WebSocket authenticated for user: ${userId}`);
      } catch (error) {
        console.warn('Invalid token provided for WebSocket connection:', error instanceof Error ? error.message : 'Unknown error');
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Authentication failed. Please login again.',
          code: 'AUTH_FAILED'
        }));
        ws.close(1008, 'Authentication failed');
        return;
      }
    } else {
      console.warn('No authentication token provided for WebSocket connection');
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Authentication token required for collaboration features.',
        code: 'AUTH_REQUIRED'
      }));
      ws.close(1008, 'Authentication required');
      return;
    }

    // Initialize collaboration service for this connection
    await collaborationService.handleConnection(ws, userId);

    ws.on('message', async (data) => {
      try {
        const message: WebSocketMessage = JSON.parse(data.toString());
        
        // Handle collaboration-specific message types
        switch (message.type) {
          case 'join':
            if (!userId) {
              ws.send(JSON.stringify({
                type: 'error',
                message: 'Authentication required to join collaboration room'
              }));
              return;
            }
            
            try {
              const { projectId, fileId } = message.data;
              const room = await collaborationService.joinRoom(userId, projectId, fileId);
              ws.roomId = room.roomId;
              
              ws.send(JSON.stringify({
                type: 'joined',
                data: {
                  roomId: room.roomId,
                  users: Array.from(room.users.values()),
                  revision: room.documentRevision
                }
              }));
            } catch (error) {
              ws.send(JSON.stringify({
                type: 'error',
                message: error instanceof Error ? error.message : 'Failed to join room'
              }));
            }
            break;

          case 'leave':
            if (userId && ws.roomId) {
              await collaborationService.leaveRoom(userId, ws.roomId);
              ws.roomId = undefined;
            }
            break;

          case 'operation':
            if (!userId || !ws.roomId) {
              ws.send(JSON.stringify({
                type: 'error',
                message: 'Must be in a room to send operations'
              }));
              return;
            }
            
            try {
              const { operation } = message.data;
              const transformedOp = await collaborationService.processOperation(
                userId, 
                operation, 
                ws.roomId
              );
              
              // Send acknowledgment back to sender
              ws.send(JSON.stringify({
                type: 'operation_ack',
                data: {
                  originalId: operation.id,
                  transformedOperation: transformedOp
                }
              }));
            } catch (error) {
              ws.send(JSON.stringify({
                type: 'error',
                message: error instanceof Error ? error.message : 'Failed to process operation'
              }));
            }
            break;

          case 'cursor':
            if (!userId || !ws.roomId) return;
            
            const { cursorPosition, selection, isTyping } = message.data;
            await collaborationService.updateCursor(
              userId, 
              ws.roomId, 
              cursorPosition, 
              selection, 
              isTyping
            );
            break;

          case 'presence':
            if (!userId || !ws.roomId) return;
            
            const { user, action } = message.data;
            if (action === 'update') {
              collaborationService.updateUserPresence(ws.roomId, userId, user);
            }
            break;

          // Legacy message types for backward compatibility
          case 'consciousness_update':
            wss.clients.forEach((client) => {
              if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                  type: 'consciousness_update',
                  data: message.data
                }));
              }
            });
            break;
          
          case 'file_change':
            // Handle legacy file change messages
            if (ws.roomId) {
              const room = collaborationService.getRoom(ws.roomId);
              if (room) {
                // Broadcast to room users
                wss.clients.forEach((client: ExtendedWebSocket) => {
                  if (client !== ws && 
                      client.readyState === WebSocket.OPEN && 
                      client.roomId === ws.roomId) {
                    client.send(JSON.stringify({
                      type: 'file_change',
                      data: message.data
                    }));
                  }
                });
              }
            } else {
              // Fallback to broadcast to all clients
              wss.clients.forEach((client) => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                  client.send(JSON.stringify({
                    type: 'file_change',
                    data: message.data
                  }));
                }
              });
            }
            break;
          
          default:
            console.log('Unknown message type:', message.type);
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Failed to process message'
        }));
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
      // collaborationService.handleDisconnection is called automatically
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    // Send welcome message
    ws.send(JSON.stringify({
      type: 'welcome',
      message: 'Connected to Space Child WebSocket',
      userId,
      timestamp: Date.now()
    }));
  });

  return httpServer;
}
