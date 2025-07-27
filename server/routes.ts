import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertProjectSchema, insertProjectFileSchema } from "@shared/schema";
import { consciousnessService } from "./services/consciousness";
import { superintelligenceService } from "./services/superintelligence";
import { aiProviderService } from "./services/aiProviders";

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
      
      const result = await aiProviderService.chat(message, provider, projectId);
      
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
      const { projectId } = req.body;
      const userId = req.user.claims.sub;
      
      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const job = await superintelligenceService.analyzeArchitecture(projectId);
      res.json(job);
    } catch (error) {
      console.error("Error starting architecture analysis:", error);
      res.status(500).json({ message: "Failed to start architecture analysis" });
    }
  });

  app.post('/api/superintelligence/optimize', isAuthenticated, async (req: any, res) => {
    try {
      const { projectId, code } = req.body;
      const userId = req.user.claims.sub;
      
      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const job = await superintelligenceService.optimizePerformance(projectId, code);
      res.json(job);
    } catch (error) {
      console.error("Error starting performance optimization:", error);
      res.status(500).json({ message: "Failed to start performance optimization" });
    }
  });

  app.get('/api/superintelligence/jobs/:id', isAuthenticated, async (req: any, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const job = await storage.getSuperintelligenceJob(jobId);
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      // Verify user has access to this job's project
      const project = await storage.getProject(job.projectId);
      if (!project || project.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(job);
    } catch (error) {
      console.error("Error fetching job:", error);
      res.status(500).json({ message: "Failed to fetch job" });
    }
  });

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
