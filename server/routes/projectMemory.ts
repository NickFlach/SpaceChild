import { Router } from "express";
import { zkpAuthenticated } from "../services/zkpAuth";
import { storage } from "../storage";
import { projectMemoryService } from "../services/projectMemory";

const router = Router();

// Get project memories
router.get('/api/projects/:projectId/memories', zkpAuthenticated, async (req: any, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const { type } = req.query;
    const userId = req.user.claims.sub;
    
    // Verify project ownership
    const project = await storage.getProject(projectId);
    if (!project || project.userId !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    const memories = await storage.getProjectMemories(projectId, type);
    res.json(memories);
  } catch (error) {
    console.error("Error fetching project memories:", error);
    res.status(500).json({ message: "Failed to fetch project memories" });
  }
});

// Search project memories
router.get('/api/projects/:projectId/memories/search', zkpAuthenticated, async (req: any, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const { query } = req.query;
    const userId = req.user.claims.sub;
    
    if (!query) {
      return res.status(400).json({ message: "Query parameter is required" });
    }
    
    // Verify project ownership
    const project = await storage.getProject(projectId);
    if (!project || project.userId !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    const memories = await storage.searchProjectMemories(projectId, query);
    res.json(memories);
  } catch (error) {
    console.error("Error searching project memories:", error);
    res.status(500).json({ message: "Failed to search project memories" });
  }
});

// Get coding preferences
router.get('/api/projects/:projectId/preferences', zkpAuthenticated, async (req: any, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const userId = req.user.claims.sub;
    
    // Verify project ownership
    const project = await storage.getProject(projectId);
    if (!project || project.userId !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    const preferences = await projectMemoryService.getCodingPreferences(projectId);
    res.json(preferences);
  } catch (error) {
    console.error("Error fetching coding preferences:", error);
    res.status(500).json({ message: "Failed to fetch coding preferences" });
  }
});

// Save a user preference
router.post('/api/projects/:projectId/preferences', zkpAuthenticated, async (req: any, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const { preference, preferenceType } = req.body;
    const userId = req.user.claims.sub;
    
    // Verify project ownership
    const project = await storage.getProject(projectId);
    if (!project || project.userId !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    await projectMemoryService.learnFromInteraction(
      projectId,
      'user_preference',
      preference,
      { preferenceType, setByUser: true }
    );
    
    res.json({ message: "Preference saved successfully" });
  } catch (error) {
    console.error("Error saving preference:", error);
    res.status(500).json({ message: "Failed to save preference" });
  }
});

export default router;