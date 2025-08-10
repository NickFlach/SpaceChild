import { Router } from 'express';
import { z } from 'zod';
import { replitUserSearchService } from '../services/replitUserSearch';
import { zkpAuthenticated } from '../services/zkpAuth';

const router = Router();

// Schema for search validation
const searchUserSchema = z.object({
  username: z.string().min(1).max(50).regex(/^[a-zA-Z0-9_\-\s\.]+$/, 'Invalid username format'),
});

// Schema for browse validation
const browseSchema = z.object({
  category: z.enum(['trending', 'new', 'featured']).optional(),
  language: z.string().max(50).optional(),
  type: z.enum(['repls', 'deployments', 'both']).optional(),
  limit: z.number().min(1).max(50).optional(),
  offset: z.number().min(0).optional(),
});

// Search for a Replit user
router.get('/search/:username', zkpAuthenticated, async (req, res) => {
  try {
    const { username } = searchUserSchema.parse({ username: req.params.username });
    
    if (!(req as any).user?.claims?.sub) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const result = await replitUserSearchService.searchUser(username, (req as any).user.claims.sub);
    
    if (!result) {
      return res.status(404).json({ 
        error: 'User not found', 
        message: `Replit user '${username}' could not be found or their profile is private` 
      });
    }

    res.json(result);
  } catch (error) {
    console.error('Error in user search:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Invalid input', 
        details: error.errors 
      });
    }

    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to search for user'
    });
  }
});

// Get recent searches by the current user
router.get('/recent', zkpAuthenticated, async (req, res) => {
  try {
    if (!(req as any).user?.claims?.sub) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
    const searches = await replitUserSearchService.getRecentSearches((req as any).user.claims.sub, limit);
    
    res.json(searches);
  } catch (error) {
    console.error('Error getting recent searches:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to get recent searches'
    });
  }
});

// Clear cache for a specific user search
router.delete('/cache/:username', zkpAuthenticated, async (req, res) => {
  try {
    const { username } = searchUserSchema.parse({ username: req.params.username });
    
    if (!(req as any).user?.claims?.sub) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    await replitUserSearchService.clearCache(username, (req as any).user.claims.sub);
    
    res.json({ success: true, message: `Cache cleared for user '${username}'` });
  } catch (error) {
    console.error('Error clearing cache:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Invalid input', 
        details: error.errors 
      });
    }

    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to clear cache'
    });
  }
});

// Browse public repls and deployments
router.get('/browse', zkpAuthenticated, async (req, res) => {
  try {
    const options = browseSchema.parse({
      category: req.query.category,
      language: req.query.language,
      type: req.query.type,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
    });

    const result = await replitUserSearchService.browsePublicContent(options);
    res.json(result);
  } catch (error) {
    console.error('Error browsing public content:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Invalid parameters', 
        details: error.errors 
      });
    }

    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to browse public content'
    });
  }
});

// Get trending languages
router.get('/trending-languages', zkpAuthenticated, async (req, res) => {
  try {
    const languages = await replitUserSearchService.getTrendingLanguages();
    res.json({ languages });
  } catch (error) {
    console.error('Error getting trending languages:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to get trending languages'
    });
  }
});

export default router;