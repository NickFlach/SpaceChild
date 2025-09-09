import axios, { AxiosResponse } from 'axios';

export interface TavilySearchOptions {
  query: string;
  search_depth?: 'basic' | 'advanced';
  include_answer?: boolean;
  include_raw_content?: boolean;
  max_results?: number;
  include_domains?: string[];
  exclude_domains?: string[];
  include_images?: boolean;
  include_image_descriptions?: boolean;
}

export interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  raw_content?: string;
  score: number;
  published_date?: string;
}

export interface TavilySearchResponse {
  query: string;
  follow_up_questions?: string[];
  answer?: string;
  images?: Array<{
    url: string;
    description: string;
  }>;
  results: TavilySearchResult[];
  response_time: number;
}

export interface TavilyExtractOptions {
  urls: string[];
  include_raw_content?: boolean;
}

export interface TavilyExtractResult {
  url: string;
  content: string;
  raw_content?: string;
  status_code: number;
}

class TavilyService {
  private apiKey: string;
  private baseUrl = 'https://api.tavily.com';

  constructor() {
    this.apiKey = process.env.TAVILY_API_KEY || '';
    if (!this.apiKey) {
      console.warn('TAVILY_API_KEY not found in environment variables');
    }
  }

  /**
   * Search the web using Tavily's AI-optimized search
   */
  async search(options: TavilySearchOptions): Promise<TavilySearchResponse> {
    if (!this.apiKey) {
      throw new Error('Tavily API key not configured');
    }

    try {
      const response: AxiosResponse<TavilySearchResponse> = await axios.post(
        `${this.baseUrl}/search`,
        {
          api_key: this.apiKey,
          query: options.query,
          search_depth: options.search_depth || 'basic',
          include_answer: options.include_answer ?? true,
          include_raw_content: options.include_raw_content ?? false,
          max_results: options.max_results || 5,
          include_domains: options.include_domains,
          exclude_domains: options.exclude_domains,
          include_images: options.include_images ?? false,
          include_image_descriptions: options.include_image_descriptions ?? false,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30 second timeout
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Tavily search error:', error.response?.data || error.message);
        throw new Error(`Tavily search failed: ${error.response?.data?.error || error.message}`);
      }
      throw error;
    }
  }

  /**
   * Extract content from specific URLs
   */
  async extract(options: TavilyExtractOptions): Promise<TavilyExtractResult[]> {
    if (!this.apiKey) {
      throw new Error('Tavily API key not configured');
    }

    try {
      const response: AxiosResponse<{ results: TavilyExtractResult[] }> = await axios.post(
        `${this.baseUrl}/extract`,
        {
          api_key: this.apiKey,
          urls: options.urls,
          include_raw_content: options.include_raw_content ?? false,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 45000, // 45 second timeout for extraction
        }
      );

      return response.data.results;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Tavily extract error:', error.response?.data || error.message);
        throw new Error(`Tavily extract failed: ${error.response?.data?.error || error.message}`);
      }
      throw error;
    }
  }

  /**
   * Search and extract in one operation - useful for research workflows
   */
  async searchAndExtract(
    query: string,
    options: Partial<TavilySearchOptions> = {}
  ): Promise<{
    searchResults: TavilySearchResponse;
    extractedContent: TavilyExtractResult[];
  }> {
    // First search
    const searchResults = await this.search({
      query,
      search_depth: 'advanced',
      include_answer: true,
      max_results: 3,
      ...options,
    });

    // Extract content from top results
    const topUrls = searchResults.results.slice(0, 3).map(result => result.url);
    const extractedContent = await this.extract({
      urls: topUrls,
      include_raw_content: false,
    });

    return {
      searchResults,
      extractedContent,
    };
  }

  /**
   * Quick search for simple queries - optimized for chat interface
   */
  async quickSearch(query: string): Promise<{
    answer?: string;
    summary: string;
    sources: Array<{ title: string; url: string; snippet: string }>;
  }> {
    const results = await this.search({
      query,
      search_depth: 'basic',
      include_answer: true,
      max_results: 3,
      include_raw_content: false,
    });

    // Create a summary from results
    const summary = results.answer || 
      results.results.slice(0, 2)
        .map(r => r.content.substring(0, 200) + '...')
        .join(' ');

    const sources = results.results.map(result => ({
      title: result.title,
      url: result.url,
      snippet: result.content.substring(0, 150) + '...',
    }));

    return {
      answer: results.answer,
      summary,
      sources,
    };
  }

  /**
   * Research a topic comprehensively - for complex planning tasks
   */
  async researchTopic(
    topic: string,
    aspects: string[] = []
  ): Promise<{
    overview: string;
    detailedFindings: Array<{
      aspect: string;
      findings: string;
      sources: Array<{ title: string; url: string }>;
    }>;
    followUpQuestions: string[];
  }> {
    // Main search for overview
    const overviewSearch = await this.search({
      query: topic,
      search_depth: 'advanced',
      include_answer: true,
      max_results: 5,
    });

    // Search for specific aspects if provided
    const detailedFindings = [];
    for (const aspect of aspects) {
      const aspectSearch = await this.search({
        query: `${topic} ${aspect}`,
        search_depth: 'basic',
        max_results: 3,
      });

      detailedFindings.push({
        aspect,
        findings: aspectSearch.results
          .map(r => r.content.substring(0, 300))
          .join(' '),
        sources: aspectSearch.results.map(r => ({
          title: r.title,
          url: r.url,
        })),
      });
    }

    return {
      overview: overviewSearch.answer || 
        overviewSearch.results
          .slice(0, 3)
          .map(r => r.content.substring(0, 200))
          .join(' '),
      detailedFindings,
      followUpQuestions: overviewSearch.follow_up_questions || [],
    };
  }

  /**
   * Check if Tavily service is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.search({
        query: 'test',
        max_results: 1,
      });
      return true;
    } catch (error) {
      console.error('Tavily health check failed:', error);
      return false;
    }
  }

  /**
   * Get usage statistics (mock for now - Tavily doesn't provide usage API)
   */
  getUsageInfo(): { available: boolean; hasApiKey: boolean } {
    return {
      available: !!this.apiKey,
      hasApiKey: !!this.apiKey,
    };
  }
}

export const tavilyService = new TavilyService();