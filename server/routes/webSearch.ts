import express from 'express';
import { zkpAuthenticated } from '../services/zkpAuth';
import { tavilyService } from '../services/tavily';
import { storage } from '../storage';

const router = express.Router();

// Basic web search endpoint
router.post('/search', zkpAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const {
      query,
      search_depth = 'basic',
      max_results = 5,
      include_answer = true,
      include_domains,
      exclude_domains
    } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ 
        error: 'Search query is required and must be a string' 
      });
    }

    const results = await tavilyService.search({
      query,
      search_depth,
      max_results,
      include_answer,
      include_domains,
      exclude_domains
    });

    // Track usage for billing
    await storage.createAiProviderUsage({
      userId,
      provider: 'tavily',
      serviceType: 'web_search',
      tokensUsed: Math.ceil(query.length / 4), // Approximate token count
      costUsd: '0.001' // Approximate cost per search
    });

    res.json({
      success: true,
      results
    });

  } catch (error) {
    console.error('Web search error:', error);
    res.status(500).json({ 
      error: 'Failed to perform web search',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Quick search for chat interface
router.post('/quick-search', zkpAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { query } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ 
        error: 'Search query is required' 
      });
    }

    const results = await tavilyService.quickSearch(query);

    // Track usage
    await storage.createAiProviderUsage({
      userId,
      provider: 'tavily',
      serviceType: 'quick_search',
      tokensUsed: Math.ceil(query.length / 4),
      costUsd: '0.001'
    });

    res.json({
      success: true,
      ...results
    });

  } catch (error) {
    console.error('Quick search error:', error);
    res.status(500).json({ 
      error: 'Failed to perform quick search',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Content extraction endpoint
router.post('/extract', zkpAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { urls, include_raw_content = false } = req.body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ 
        error: 'URLs array is required and must not be empty' 
      });
    }

    if (urls.length > 10) {
      return res.status(400).json({ 
        error: 'Maximum 10 URLs allowed per request' 
      });
    }

    const results = await tavilyService.extract({
      urls,
      include_raw_content
    });

    // Track usage
    await storage.createAiProviderUsage({
      userId,
      provider: 'tavily',
      serviceType: 'content_extraction',
      tokensUsed: urls.length * 10, // Approximate token count per URL
      costUsd: (urls.length * 0.002).toFixed(3) // Approximate cost per extraction
    });

    res.json({
      success: true,
      results
    });

  } catch (error) {
    console.error('Content extraction error:', error);
    res.status(500).json({ 
      error: 'Failed to extract content',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Research topic comprehensively
router.post('/research', zkpAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { topic, aspects = [] } = req.body;

    if (!topic || typeof topic !== 'string') {
      return res.status(400).json({ 
        error: 'Research topic is required' 
      });
    }

    const results = await tavilyService.researchTopic(topic, aspects);

    // Track usage (research is more expensive)
    await storage.createAiProviderUsage({
      userId,
      provider: 'tavily',
      serviceType: 'topic_research',
      tokensUsed: Math.ceil(topic.length / 4) * (1 + aspects.length),
      costUsd: (0.005 * (1 + aspects.length)).toFixed(3)
    });

    res.json({
      success: true,
      ...results
    });

  } catch (error) {
    console.error('Topic research error:', error);
    res.status(500).json({ 
      error: 'Failed to research topic',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Search and extract combined workflow
router.post('/search-and-extract', zkpAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { query, search_options = {} } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ 
        error: 'Search query is required' 
      });
    }

    const results = await tavilyService.searchAndExtract(query, search_options);

    // Track usage for combined operation
    await storage.createAiProviderUsage({
      userId,
      provider: 'tavily',
      serviceType: 'search_and_extract',
      tokensUsed: Math.ceil(query.length / 4) * 2, // Search + extract
      costUsd: '0.003'
    });

    res.json({
      success: true,
      ...results
    });

  } catch (error) {
    console.error('Search and extract error:', error);
    res.status(500).json({ 
      error: 'Failed to search and extract',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Health check endpoint
router.get('/health', zkpAuthenticated, async (req: any, res) => {
  try {
    const isHealthy = await tavilyService.healthCheck();
    const usageInfo = tavilyService.getUsageInfo();

    res.json({
      success: true,
      healthy: isHealthy,
      ...usageInfo
    });

  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ 
      error: 'Health check failed',
      healthy: false
    });
  }
});

export default router;