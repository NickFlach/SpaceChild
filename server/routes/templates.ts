import { Router } from "express";
import { isAuthenticated } from "../replitAuth";
import { projectTemplateService } from "../services/projectTemplates";
import { smartTemplateService } from "../services/smartTemplates";

const router = Router();

// Get all templates
router.get('/api/templates', isAuthenticated, async (req, res) => {
  try {
    const { category } = req.query;
    const templates = await projectTemplateService.getTemplates(category as string);
    res.json(templates);
  } catch (error) {
    console.error("Error fetching templates:", error);
    res.status(500).json({ message: "Failed to fetch templates" });
  }
});

// Get popular templates
router.get('/api/templates/popular', isAuthenticated, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const templates = await projectTemplateService.getPopularTemplates(limit);
    res.json(templates);
  } catch (error) {
    console.error("Error fetching popular templates:", error);
    res.status(500).json({ message: "Failed to fetch popular templates" });
  }
});

// Search templates
router.get('/api/templates/search', isAuthenticated, async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: "Query parameter is required" });
    }
    
    const templates = await projectTemplateService.searchTemplates(query as string);
    res.json(templates);
  } catch (error) {
    console.error("Error searching templates:", error);
    res.status(500).json({ message: "Failed to search templates" });
  }
});

// Get templates by tech stack
router.get('/api/templates/by-tech/:tech', isAuthenticated, async (req, res) => {
  try {
    const { tech } = req.params;
    const templates = await projectTemplateService.getTemplatesByTechStack(tech);
    res.json(templates);
  } catch (error) {
    console.error("Error fetching templates by tech:", error);
    res.status(500).json({ message: "Failed to fetch templates by tech stack" });
  }
});

// Get specific template
router.get('/api/templates/:id', isAuthenticated, async (req, res) => {
  try {
    const templateId = parseInt(req.params.id);
    const template = await projectTemplateService.getTemplate(templateId);
    
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }
    
    res.json(template);
  } catch (error) {
    console.error("Error fetching template:", error);
    res.status(500).json({ message: "Failed to fetch template" });
  }
});

// Create project from template
router.post('/api/templates/:id/create-project', isAuthenticated, async (req: any, res) => {
  try {
    const templateId = parseInt(req.params.id);
    const { name, ...customSettings } = req.body;
    const userId = req.user.claims.sub;
    
    if (!name) {
      return res.status(400).json({ message: "Project name is required" });
    }
    
    const result = await projectTemplateService.createProjectFromTemplate(
      templateId,
      userId,
      name,
      customSettings
    );
    
    res.json(result);
  } catch (error) {
    console.error("Error creating project from template:", error);
    res.status(500).json({ message: "Failed to create project from template" });
  }
});

// Smart Template Routes
router.post('/api/templates/smart/analyze', isAuthenticated, async (req: any, res) => {
  try {
    const { config } = req.body;
    const userId = req.user.claims.sub;
    
    if (!config || !config.projectDescription) {
      return res.status(400).json({ message: "Project description is required" });
    }
    
    const analysis = await smartTemplateService.analyzeProjectRequirements(config, userId);
    res.json(analysis);
  } catch (error) {
    console.error("Error analyzing smart template requirements:", error);
    res.status(500).json({ message: "Failed to analyze requirements" });
  }
});

router.post('/api/templates/smart/create', isAuthenticated, async (req: any, res) => {
  try {
    const { projectName, config } = req.body;
    const userId = req.user.claims.sub;
    
    if (!projectName || !config) {
      return res.status(400).json({ message: "Project name and configuration are required" });
    }
    
    const project = await smartTemplateService.createSmartProject(
      userId,
      projectName,
      config
    );
    
    res.json(project);
  } catch (error) {
    console.error("Error creating smart template project:", error);
    res.status(500).json({ message: "Failed to create smart template project" });
  }
});

export default router;