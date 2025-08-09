import { Router } from 'express';
import { firecrawlService } from '../services/firecrawl';
import { z } from 'zod';

const router = Router();

// Scrape a single URL
router.post('/url', async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { url, projectId, waitForSelector } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const result = await firecrawlService.scrapeUrl({
      projectId,
      userId,
      url,
      scrapeType: 'single',
      waitForSelector,
    });

    res.json(result);
  } catch (error) {
    console.error('Error scraping URL:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to scrape URL' 
    });
  }
});

// Clone a website
router.post('/clone', async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { url, projectId, depth, includeAssets } = req.body;
    
    if (!url || !projectId) {
      return res.status(400).json({ error: 'URL and project ID are required' });
    }

    const result = await firecrawlService.cloneWebsite({
      url,
      userId,
      projectId,
      depth: depth || 2,
      includeAssets: includeAssets || false,
    });

    res.json(result);
  } catch (error) {
    console.error('Error cloning website:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to clone website' 
    });
  }
});

// Crawl multiple pages
router.post('/crawl', async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { url, projectId, maxPages } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const result = await firecrawlService.scrapeUrl({
      projectId,
      userId,
      url,
      scrapeType: 'crawl',
      maxPages: maxPages || 10,
    });

    res.json(result);
  } catch (error) {
    console.error('Error crawling website:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to crawl website' 
    });
  }
});

// Extract structured data with schema
router.post('/extract', async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { url, projectId, schema } = req.body;
    
    if (!url || !schema) {
      return res.status(400).json({ error: 'URL and schema are required' });
    }

    // Create Zod schema from the provided schema definition
    const zodSchema = createZodSchemaFromJson(schema);
    
    const result = await firecrawlService.extractStructuredData(
      url,
      zodSchema,
      userId,
      projectId
    );

    res.json(result);
  } catch (error) {
    console.error('Error extracting structured data:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to extract structured data' 
    });
  }
});

// Search within a website
router.post('/search', async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { url, query } = req.body;
    
    if (!url || !query) {
      return res.status(400).json({ error: 'URL and query are required' });
    }

    const result = await firecrawlService.searchWebsite(url, query, userId);

    res.json(result);
  } catch (error) {
    console.error('Error searching website:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to search website' 
    });
  }
});

// Clear cache for user
router.delete('/cache', async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { projectId } = req.query;
    
    await firecrawlService.clearCache(
      userId,
      projectId ? parseInt(String(projectId)) : undefined
    );

    res.json({ success: true, message: 'Cache cleared successfully' });
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to clear cache' 
    });
  }
});

// Helper function to create Zod schema from JSON definition
function createZodSchemaFromJson(schemaDefinition: any): z.ZodSchema<any> {
  // This is a simplified version - you might want to make this more robust
  const schemaFields: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(schemaDefinition)) {
    if (typeof value === 'string') {
      switch (value) {
        case 'string':
          schemaFields[key] = z.string();
          break;
        case 'number':
          schemaFields[key] = z.number();
          break;
        case 'boolean':
          schemaFields[key] = z.boolean();
          break;
        case 'array':
          schemaFields[key] = z.array(z.any());
          break;
        default:
          schemaFields[key] = z.any();
      }
    } else if (typeof value === 'object' && value !== null) {
      // Type guard to safely access object properties
      const objectValue = value as Record<string, any>;
      if (objectValue.type === 'array' && objectValue.items) {
        schemaFields[key] = z.array(createZodSchemaFromJson(objectValue.items));
      } else {
        schemaFields[key] = createZodSchemaFromJson(value);
      }
    } else {
      schemaFields[key] = z.any();
    }
  }
  
  return z.object(schemaFields);
}

export default router;