import FirecrawlApp from '@mendable/firecrawl-js';
import { db } from '../db';
import { scrapedData } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

export interface ScrapeOptions {
  projectId?: number;
  userId: string;
  url: string;
  scrapeType?: 'single' | 'crawl' | 'extract';
  extractionSchema?: z.ZodSchema<any>;
  maxPages?: number;
  waitForSelector?: string;
}

export interface ScrapeResult {
  success: boolean;
  data?: any;
  markdown?: string;
  extractedData?: any;
  metadata?: Record<string, any>;
  error?: string;
}

export interface WebsiteCloneOptions {
  url: string;
  userId: string;
  projectId: number;
  depth?: number;
  includeAssets?: boolean;
}

class FirecrawlService {
  private app: FirecrawlApp | null = null;
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.FIRECRAWL_API_KEY;
    if (this.apiKey) {
      this.app = new FirecrawlApp({ apiKey: this.apiKey });
    }
  }

  private validateApiKey(): void {
    if (!this.apiKey || !this.app) {
      throw new Error('FIRECRAWL_API_KEY is not configured. Please add it to your environment variables.');
    }
  }

  async scrapeUrl(options: ScrapeOptions): Promise<ScrapeResult> {
    this.validateApiKey();

    try {
      // Check cache first
      const cached = await this.getCachedData(options.url, options.userId);
      if (cached && this.isCacheValid(cached)) {
        return {
          success: true,
          data: cached.data,
          markdown: cached.markdown || undefined,
          extractedData: cached.extractedData,
          metadata: cached.metadata as Record<string, any>,
        };
      }

      let result: any;
      
      if (options.scrapeType === 'crawl') {
        // Crawl multiple pages
        result = await this.app!.crawlUrl(options.url, {
          limit: options.maxPages || 10,
        });
      } else if (options.scrapeType === 'extract' && options.extractionSchema) {
        // Extract structured data with schema
        const scrapeResult = await this.app!.scrapeUrl(options.url, {
          waitFor: options.waitForSelector ? 5000 : undefined, // Wait 5 seconds if selector provided
        });
        
        // Handle extraction separately if needed
        result = {
          ...scrapeResult,
          extractedData: options.extractionSchema ? this.extractDataWithSchema(scrapeResult, options.extractionSchema) : undefined,
        };
      } else {
        // Single page scrape
        result = await this.app!.scrapeUrl(options.url, {
          waitFor: options.waitForSelector ? 5000 : undefined, // Wait 5 seconds if selector provided
        });
      }

      // Handle response based on whether it's an error or success
      if ('success' in result && !result.success) {
        throw new Error(result.error || 'Scraping failed');
      }

      // Save to database
      const savedData = await this.saveScrapedData({
        projectId: options.projectId,
        userId: options.userId,
        url: options.url,
        scrapeType: options.scrapeType || 'single',
        data: result.data || result,
        markdown: result.markdown || result.content || '',
        extractedData: result.extractedData,
        metadata: {
          scrapeDate: new Date().toISOString(),
          scrapeType: options.scrapeType,
          pagesScraped: Array.isArray(result.data) ? result.data.length : 1,
        },
      });

      return {
        success: true,
        data: result.data || result,
        markdown: result.markdown || result.content || '',
        extractedData: result.extractedData,
        metadata: savedData.metadata as Record<string, any>,
      };
    } catch (error) {
      console.error('Error scraping URL:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async cloneWebsite(options: WebsiteCloneOptions): Promise<ScrapeResult> {
    this.validateApiKey();

    try {
      // Crawl the website to get all pages
      const crawlResult = await this.app!.crawlUrl(options.url, {
        limit: options.depth ? options.depth * 10 : 50,
      });

      // Check for error response
      if ('success' in crawlResult && !crawlResult.success) {
        throw new Error(crawlResult.error || 'Crawling failed');
      }

      // Process and structure the crawled data
      const structuredData = this.structureWebsiteData(crawlResult);

      // Save to database
      const savedData = await this.saveScrapedData({
        projectId: options.projectId,
        userId: options.userId,
        url: options.url,
        scrapeType: 'crawl',
        data: structuredData,
        markdown: this.generateSiteMarkdown(structuredData),
        extractedData: {
          pages: Array.isArray(crawlResult.data) ? crawlResult.data.length : 0,
          structure: structuredData.siteMap,
        },
        metadata: {
          cloneDate: new Date().toISOString(),
          depth: options.depth,
          includeAssets: options.includeAssets,
        },
      });

      return {
        success: true,
        data: structuredData,
        markdown: savedData.markdown || undefined,
        extractedData: savedData.extractedData,
        metadata: savedData.metadata as Record<string, any>,
      };
    } catch (error) {
      console.error('Error cloning website:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async extractStructuredData<T>(
    url: string,
    schema: z.ZodSchema<T>,
    userId: string,
    projectId?: number
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    this.validateApiKey();

    try {
      // Scrape the URL first
      const result = await this.app!.scrapeUrl(url);

      // Check for error response
      if ('success' in result && !result.success) {
        throw new Error(result.error || 'Scraping failed');
      }

      // Extract data using the schema
      const extractedData = this.extractDataWithSchema(result, schema);

      if (extractedData) {
        // Save to database
        await this.saveScrapedData({
          projectId,
          userId,
          url,
          scrapeType: 'extract',
          data: result,
          extractedData: extractedData,
          metadata: {
            extractionDate: new Date().toISOString(),
            schemaUsed: 'custom',
          },
        });

        return {
          success: true,
          data: extractedData as T,
        };
      }

      return {
        success: false,
        error: 'No data could be extracted',
      };
    } catch (error) {
      console.error('Error extracting structured data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  private extractDataWithSchema<T>(scrapeResult: any, schema: z.ZodSchema<T>): T | null {
    try {
      // Try to parse the scraped content with the provided schema
      // This is a simplified version - you might want to use LLM extraction here
      const content = scrapeResult.markdown || scrapeResult.content || scrapeResult.data;
      
      // For now, we'll just try to parse if data is already structured
      if (typeof scrapeResult.data === 'object') {
        return schema.parse(scrapeResult.data);
      }
      
      // Otherwise, return null (in production, you'd use LLM to extract structured data)
      return null;
    } catch (error) {
      console.error('Error extracting data with schema:', error);
      return null;
    }
  }

  async searchWebsite(
    url: string,
    query: string,
    userId: string
  ): Promise<ScrapeResult> {
    this.validateApiKey();

    try {
      const result = await this.app!.search(url, {
        query,
        limit: 10,
      });

      return {
        success: true,
        data: result,
        metadata: {
          query,
          resultsCount: result.data?.length || 0,
        },
      };
    } catch (error) {
      console.error('Error searching website:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  private async saveScrapedData(data: {
    projectId?: number;
    userId: string;
    url: string;
    scrapeType: string;
    data: any;
    markdown?: string;
    extractedData?: any;
    metadata?: any;
  }) {
    const result = await db.insert(scrapedData).values({
      projectId: data.projectId,
      userId: data.userId,
      url: data.url,
      scrapeType: data.scrapeType,
      data: data.data,
      markdown: data.markdown,
      extractedData: data.extractedData,
      metadata: data.metadata || {},
      cacheExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours cache
    }).returning();

    return result[0];
  }

  private async getCachedData(url: string, userId: string) {
    const results = await db.select()
      .from(scrapedData)
      .where(and(
        eq(scrapedData.url, url),
        eq(scrapedData.userId, userId)
      ))
      .limit(1);

    return results[0];
  }

  private isCacheValid(data: any): boolean {
    if (!data.cacheExpiry) return false;
    return new Date(data.cacheExpiry) > new Date();
  }

  private structureWebsiteData(crawlResult: any): any {
    const pages = crawlResult.data || [];
    const siteMap: Record<string, any> = {};

    for (const page of pages) {
      const url = new URL(page.url || page.sourceUrl);
      const path = url.pathname;
      
      siteMap[path] = {
        title: page.title || '',
        content: page.content || page.markdown || '',
        links: page.links || [],
        metadata: page.metadata || {},
      };
    }

    return {
      baseUrl: crawlResult.data?.[0]?.sourceUrl || '',
      pages: pages.length,
      siteMap,
      crawledAt: new Date().toISOString(),
    };
  }

  private generateSiteMarkdown(structuredData: any): string {
    let markdown = `# Website Clone\n\n`;
    markdown += `**Base URL:** ${structuredData.baseUrl}\n`;
    markdown += `**Pages:** ${structuredData.pages}\n`;
    markdown += `**Crawled:** ${structuredData.crawledAt}\n\n`;
    
    markdown += `## Site Structure\n\n`;
    
    for (const [path, page] of Object.entries(structuredData.siteMap)) {
      markdown += `### ${path}\n`;
      markdown += `**Title:** ${(page as any).title}\n\n`;
      markdown += `${(page as any).content.substring(0, 500)}...\n\n`;
    }

    return markdown;
  }

  async clearCache(userId: string, projectId?: number): Promise<void> {
    const conditions = projectId
      ? and(eq(scrapedData.userId, userId), eq(scrapedData.projectId, projectId))
      : eq(scrapedData.userId, userId);

    await db.delete(scrapedData).where(conditions);
  }
}

export const firecrawlService = new FirecrawlService();