import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertProjectSchema, insertProjectFileSchema } from "@shared/schema";
import { consciousnessService } from "./services/consciousness";
import { superintelligenceService } from "./services/superintelligence";
import { aiProviderService } from "./services/aiProviders";
import { projectMemoryService } from "./services/projectMemory";
import projectMemoryRoutes from "./routes/projectMemory";
import templateRoutes from "./routes/templates";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Project Management Routes
  app.get('/api/projects', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const projects = await storage.getProjectsByUserId(userId);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.post('/api/projects', isAuthenticated, async (req: any, res) => {
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

  app.get('/api/projects/:id', isAuthenticated, async (req: any, res) => {
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

  app.put('/api/projects/:id', isAuthenticated, async (req: any, res) => {
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

  app.delete('/api/projects/:id', isAuthenticated, async (req: any, res) => {
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
  app.get('/api/projects/:id/files', isAuthenticated, async (req: any, res) => {
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

  app.post('/api/projects/:id/files', isAuthenticated, async (req: any, res) => {
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

  app.get('/api/projects/:id/files/*', isAuthenticated, async (req: any, res) => {
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

  app.put('/api/projects/:id/files/*', isAuthenticated, async (req: any, res) => {
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
  app.post('/api/ai/generate', isAuthenticated, async (req: any, res) => {
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

  app.post('/api/ai/chat', isAuthenticated, async (req: any, res) => {
    try {
      const { message, provider = 'anthropic', projectId } = req.body;
      const userId = req.user.claims.sub;
      
      // Get relevant memories if projectId is provided
      let contextualHints: string[] = [];
      if (projectId) {
        contextualHints = await projectMemoryService.applyLearnedPatterns(projectId, message);
      }
      
      // Add contextual hints to the message
      const enhancedMessage = contextualHints.length > 0 
        ? `${message}\n\nContext from previous interactions:\n${contextualHints.join('\n')}`
        : message;
      
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

  // Consciousness Layer Routes
  app.post('/api/consciousness/activate', isAuthenticated, async (req: any, res) => {
    try {
      const { projectId } = req.body;
      const userId = req.user.claims.sub;
      
      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const session = await consciousnessService.activate(projectId);
      
      // Update project to enable consciousness
      await storage.updateProject(projectId, { consciousnessEnabled: true });
      
      res.json(session);
    } catch (error) {
      console.error("Error activating consciousness:", error);
      res.status(500).json({ message: "Failed to activate consciousness" });
    }
  });

  app.post('/api/consciousness/query', isAuthenticated, async (req: any, res) => {
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

  app.get('/api/consciousness/context/:projectId', isAuthenticated, async (req: any, res) => {
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
  app.post('/api/superintelligence/analyze', isAuthenticated, async (req: any, res) => {
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

  app.post('/api/superintelligence/optimize', isAuthenticated, async (req: any, res) => {
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

  app.post('/api/superintelligence/recommend', isAuthenticated, async (req: any, res) => {
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

  app.post('/api/superintelligence/predict-bugs', isAuthenticated, async (req: any, res) => {
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

  app.get('/api/superintelligence/analyses/:projectId', isAuthenticated, async (req: any, res) => {
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

  app.get('/api/superintelligence/optimizations/:projectId', isAuthenticated, async (req: any, res) => {
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

  app.get('/api/superintelligence/recommendations/:projectId', isAuthenticated, async (req: any, res) => {
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
  app.post('/api/multiagent/start', isAuthenticated, async (req: any, res) => {
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
      await multiAgentService.startCollaboration(parseInt(projectId), userId, goal);
      
      res.json({ success: true, message: "Multi-agent collaboration started" });
    } catch (error) {
      console.error("Multi-agent start error:", error);
      res.status(500).json({ error: "Failed to start multi-agent collaboration" });
    }
  });

  app.get('/api/multiagent/status', isAuthenticated, async (req: any, res) => {
    try {
      const { multiAgentService } = await import("./services/multiAgent");
      const status = await multiAgentService.getStatus();
      const agentStatuses = multiAgentService.getAgentStatuses();
      
      res.json({ status, agentStatuses });
    } catch (error) {
      console.error("Multi-agent status error:", error);
      res.status(500).json({ error: "Failed to get multi-agent status" });
    }
  });

  // Deployment Intelligence Routes
  app.post('/api/deployments/deploy', isAuthenticated, async (req: any, res) => {
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

  app.get('/api/deployments/:projectId/analytics', isAuthenticated, async (req: any, res) => {
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

  app.post('/api/deployments/rollback', isAuthenticated, async (req: any, res) => {
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
  app.use(templateRoutes);

  // Create HTTP server
  const httpServer = createServer(app);

  // WebSocket server for real-time features
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket, req) => {
    console.log('WebSocket connection established');

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        // Handle different message types
        switch (message.type) {
          case 'consciousness_update':
            // Broadcast consciousness updates to relevant clients
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
            // Broadcast file changes for real-time collaboration
            wss.clients.forEach((client) => {
              if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                  type: 'file_change',
                  data: message.data
                }));
              }
            });
            break;
          
          default:
            console.log('Unknown message type:', message.type);
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });

    // Send welcome message
    ws.send(JSON.stringify({
      type: 'welcome',
      message: 'Connected to Space Child WebSocket'
    }));
  });

  return httpServer;
}
