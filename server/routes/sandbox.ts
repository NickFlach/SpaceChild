import { Router } from 'express';
import { e2bService } from '../services/e2b';
import { insertSandboxSessionSchema } from '@shared/schema';
import { z } from 'zod';

const router = Router();

// Create a new sandbox
router.post('/create', async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { projectId, environment, timeout } = req.body;
    
    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }

    const result = await e2bService.createSandbox({
      projectId,
      userId,
      environment: environment || 'nodejs',
      timeout: timeout || 300000, // 5 minutes default
    });

    res.json(result);
  } catch (error) {
    console.error('Error creating sandbox:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to create sandbox' 
    });
  }
});

// Execute code in sandbox
router.post('/execute', async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { sandboxId, code, language } = req.body;
    
    if (!sandboxId || !code) {
      return res.status(400).json({ error: 'Sandbox ID and code are required' });
    }

    const result = await e2bService.executeCode(sandboxId, code, language || 'javascript');
    res.json(result);
  } catch (error) {
    console.error('Error executing code:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to execute code' 
    });
  }
});

// Upload file to sandbox
router.post('/upload', async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { sandboxId, path, content } = req.body;
    
    if (!sandboxId || !path || content === undefined) {
      return res.status(400).json({ error: 'Sandbox ID, path, and content are required' });
    }

    await e2bService.uploadFile(sandboxId, path, content);
    res.json({ success: true });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to upload file' 
    });
  }
});

// Read file from sandbox
router.get('/file', async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { sandboxId, path } = req.query;
    
    if (!sandboxId || !path) {
      return res.status(400).json({ error: 'Sandbox ID and path are required' });
    }

    const content = await e2bService.readFile(String(sandboxId), String(path));
    res.json({ content });
  } catch (error) {
    console.error('Error reading file:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to read file' 
    });
  }
});

// List files in sandbox directory
router.get('/files', async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { sandboxId, directory } = req.query;
    
    if (!sandboxId) {
      return res.status(400).json({ error: 'Sandbox ID is required' });
    }

    const files = await e2bService.listFiles(String(sandboxId), String(directory || '/'));
    res.json({ files });
  } catch (error) {
    console.error('Error listing files:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to list files' 
    });
  }
});

// Terminate sandbox
router.post('/terminate', async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { sandboxId } = req.body;
    
    if (!sandboxId) {
      return res.status(400).json({ error: 'Sandbox ID is required' });
    }

    await e2bService.terminateSandbox(sandboxId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error terminating sandbox:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to terminate sandbox' 
    });
  }
});

// Get active sandboxes for user
router.get('/active', async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { projectId } = req.query;
    
    const sandboxes = await e2bService.getActiveSandboxes(
      userId, 
      projectId ? parseInt(String(projectId)) : undefined
    );
    res.json({ sandboxes });
  } catch (error) {
    console.error('Error getting active sandboxes:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to get active sandboxes' 
    });
  }
});

export default router;