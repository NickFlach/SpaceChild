import { db } from '../db';
import { replitUserSearches } from '@shared/schema';
import { eq, and, gt } from 'drizzle-orm';

export interface ReplitUser {
  username: string;
  displayName?: string;
  bio?: string;
  avatar?: string;
  url: string;
  followerCount?: number;
  followingCount?: number;
}

export interface ReplitRepl {
  id: string;
  title: string;
  description?: string;
  language: string;
  url: string;
  isPublic: boolean;
  forkCount?: number;
  likeCount?: number;
  viewCount?: number;
  lastUpdated: string;
  owner: string;
}

export interface ReplitDeployment {
  id: string;
  title: string;
  description?: string;
  url: string;
  domain?: string;
  status: 'active' | 'inactive' | 'error';
  lastDeployed: string;
  owner: string;
  replId?: string;
}

export interface ReplitSearchResult {
  user: ReplitUser;
  publicRepls: ReplitRepl[];
  deployments: ReplitDeployment[];
}

export interface BrowseOptions {
  category?: 'trending' | 'new' | 'featured';
  language?: string;
  type?: 'repls' | 'deployments' | 'both';
  limit?: number;
  offset?: number;
}

export interface BrowseResult {
  repls: ReplitRepl[];
  deployments: ReplitDeployment[];
  totalCount: number;
  hasMore: boolean;
}

class ReplitUserSearchService {
  private readonly CACHE_DURATION_HOURS = 2; // Cache results for 2 hours

  /**
   * Search for a Replit user and their public content
   * Note: This uses web scraping since Replit doesn't have a public API
   */
  async searchUser(username: string, searcherUserId: string): Promise<ReplitSearchResult | null> {
    try {
      // Check cache first
      const cached = await this.getCachedResult(username, searcherUserId);
      if (cached) {
        return {
          user: cached.userData as ReplitUser,
          publicRepls: cached.publicRepls as ReplitRepl[],
          deployments: cached.deployments as ReplitDeployment[],
        };
      }

      // Fetch fresh data
      const result = await this.fetchReplitUserData(username);
      
      if (result) {
        // Cache the result
        await this.cacheResult(username, searcherUserId, result);
      }

      return result;
    } catch (error) {
      console.error('Error searching Replit user:', error);
      return null;
    }
  }

  private async getCachedResult(username: string, searcherUserId: string) {
    const now = new Date();
    const cached = await db
      .select()
      .from(replitUserSearches)
      .where(
        and(
          eq(replitUserSearches.replitUsername, username),
          eq(replitUserSearches.searchedUserId, searcherUserId),
          gt(replitUserSearches.cacheExpiry, now)
        )
      )
      .limit(1);

    return cached[0] || null;
  }

  private async cacheResult(username: string, searcherUserId: string, result: ReplitSearchResult) {
    const now = new Date();
    const expiry = new Date(now.getTime() + this.CACHE_DURATION_HOURS * 60 * 60 * 1000);

    await db
      .insert(replitUserSearches)
      .values({
        searchedUserId: searcherUserId,
        replitUsername: username,
        userData: result.user,
        publicRepls: result.publicRepls,
        deployments: result.deployments,
        cacheExpiry: expiry,
      })
      .onConflictDoUpdate({
        target: [replitUserSearches.replitUsername, replitUserSearches.searchedUserId],
        set: {
          userData: result.user,
          publicRepls: result.publicRepls,
          deployments: result.deployments,
          searchedAt: now,
          cacheExpiry: expiry,
        },
      });
  }

  private async fetchReplitUserData(username: string): Promise<ReplitSearchResult | null> {
    try {
      const baseUrl = 'https://replit.com';
      const userUrl = `${baseUrl}/@${username}`;
      
      // Fetch user profile page
      const response = await fetch(userUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        }
      });

      if (!response.ok) {
        return null;
      }

      const html = await response.text();
      
      // Parse user data from HTML (this would need to be adapted based on Replit's actual HTML structure)
      const user = this.parseUserFromHTML(html, username);
      const publicRepls = await this.fetchUserRepls(username);
      const deployments = await this.fetchUserDeployments(username);

      return {
        user,
        publicRepls,
        deployments,
      };
    } catch (error) {
      console.error(`Error fetching data for user ${username}:`, error);
      return null;
    }
  }

  private parseUserFromHTML(html: string, username: string): ReplitUser {
    // Basic parsing - in a real implementation, you'd use a proper HTML parser
    // This is a simplified version that extracts basic info
    const user: ReplitUser = {
      username,
      url: `https://replit.com/@${username}`,
      displayName: username, // Default to username if no display name found
    };

    // Try to extract display name from title tag
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    if (titleMatch) {
      const title = titleMatch[1].trim();
      if (title && !title.includes('Replit')) {
        user.displayName = title;
      }
    }

    // Try to extract bio from meta description
    const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
    if (descMatch) {
      user.bio = descMatch[1];
    }

    // Try to extract avatar (this would need to be adapted to Replit's structure)
    const avatarMatch = html.match(/profile.*?image.*?src="([^"]+)"/i);
    if (avatarMatch) {
      user.avatar = avatarMatch[1];
    }

    return user;
  }

  private async fetchUserRepls(username: string): Promise<ReplitRepl[]> {
    try {
      // In a real implementation, you'd scrape the user's repls page or use GraphQL if available
      // For now, return mock structure to demonstrate the format
      return [
        {
          id: 'demo-repl-1',
          title: `${username}'s Project`,
          description: 'A public project by this user',
          language: 'JavaScript',
          url: `https://replit.com/@${username}/demo-project`,
          isPublic: true,
          forkCount: 0,
          likeCount: 0,
          viewCount: 0,
          lastUpdated: new Date().toISOString(),
          owner: username,
        }
      ];
    } catch (error) {
      console.error(`Error fetching repls for ${username}:`, error);
      return [];
    }
  }

  private async fetchUserDeployments(username: string): Promise<ReplitDeployment[]> {
    try {
      // In a real implementation, you'd need to find deployments
      // This is challenging as deployments might not be easily discoverable
      return [];
    } catch (error) {
      console.error(`Error fetching deployments for ${username}:`, error);
      return [];
    }
  }

  /**
   * Get recent searches by a user
   */
  async getRecentSearches(userId: string, limit: number = 10) {
    return await db
      .select()
      .from(replitUserSearches)
      .where(eq(replitUserSearches.searchedUserId, userId))
      .orderBy(replitUserSearches.searchedAt)
      .limit(limit);
  }

  /**
   * Clear cache for a specific user search
   */
  async clearCache(username: string, userId: string) {
    await db
      .delete(replitUserSearches)
      .where(
        and(
          eq(replitUserSearches.replitUsername, username),
          eq(replitUserSearches.searchedUserId, userId)
        )
      );
  }

  /**
   * Browse public repls and deployments
   */
  async browsePublicContent(options: BrowseOptions = {}): Promise<BrowseResult> {
    try {
      const {
        category = 'trending',
        language,
        type = 'both',
        limit = 20,
        offset = 0
      } = options;

      // In a real implementation, this would make API calls to Replit's endpoints
      // For now, we'll simulate browsing with sample data structure
      const mockRepls: ReplitRepl[] = this.generateMockRepls(language, limit);
      const mockDeployments: ReplitDeployment[] = this.generateMockDeployments(limit);

      let repls: ReplitRepl[] = [];
      let deployments: ReplitDeployment[] = [];

      if (type === 'repls' || type === 'both') {
        repls = mockRepls.slice(offset, offset + limit);
      }

      if (type === 'deployments' || type === 'both') {
        deployments = mockDeployments.slice(offset, offset + limit);
      }

      return {
        repls,
        deployments,
        totalCount: mockRepls.length + mockDeployments.length,
        hasMore: offset + limit < (mockRepls.length + mockDeployments.length),
      };
    } catch (error) {
      console.error('Error browsing public content:', error);
      return {
        repls: [],
        deployments: [],
        totalCount: 0,
        hasMore: false,
      };
    }
  }

  private generateMockRepls(language?: string, count: number = 20): ReplitRepl[] {
    const languages = ['JavaScript', 'Python', 'Java', 'C++', 'React', 'Node.js', 'HTML/CSS', 'TypeScript'];
    const projects = [
      'Web Portfolio', 'API Server', 'Discord Bot', 'Game Engine', 'Chat App',
      'Weather App', 'Todo List', 'Calculator', 'Music Player', 'Social Media Dashboard',
      'E-commerce Site', 'Blog Platform', 'Task Manager', 'Image Editor', 'Code Editor',
      'Data Visualization', 'Machine Learning Model', 'Cryptocurrency Tracker', 'Recipe App', 'Fitness Tracker'
    ];

    return Array.from({ length: count }, (_, i) => {
      const selectedLanguage = language || languages[Math.floor(Math.random() * languages.length)];
      const projectName = projects[Math.floor(Math.random() * projects.length)];
      const username = `user${Math.floor(Math.random() * 1000)}`;
      
      return {
        id: `repl-${Date.now()}-${i}`,
        title: `${projectName} - ${selectedLanguage}`,
        description: `A ${selectedLanguage} project showcasing ${projectName.toLowerCase()} functionality with modern best practices.`,
        language: selectedLanguage,
        url: `https://replit.com/@${username}/${projectName.replace(/\s+/g, '-').toLowerCase()}`,
        isPublic: true,
        forkCount: Math.floor(Math.random() * 50),
        likeCount: Math.floor(Math.random() * 100),
        viewCount: Math.floor(Math.random() * 500),
        lastUpdated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        owner: username,
      };
    });
  }

  private generateMockDeployments(count: number = 10): ReplitDeployment[] {
    const deploymentTypes = [
      'Portfolio Website', 'API Service', 'Web Dashboard', 'Landing Page', 'Documentation Site',
      'Blog', 'E-commerce Store', 'Chat Application', 'Game Server', 'Analytics Dashboard'
    ];

    return Array.from({ length: count }, (_, i) => {
      const deploymentType = deploymentTypes[Math.floor(Math.random() * deploymentTypes.length)];
      const username = `user${Math.floor(Math.random() * 1000)}`;
      const subdomain = `${deploymentType.replace(/\s+/g, '-').toLowerCase()}-${username}`;
      
      return {
        id: `deployment-${Date.now()}-${i}`,
        title: deploymentType,
        description: `Live ${deploymentType.toLowerCase()} deployed on Replit with custom domain support.`,
        url: `https://${subdomain}.${username}.repl.co`,
        domain: `${subdomain}.${username}.repl.co`,
        status: ['active', 'inactive'][Math.floor(Math.random() * 2)] as 'active' | 'inactive',
        lastDeployed: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        owner: username,
        replId: `repl-${Date.now()}-${i}`,
      };
    });
  }

  /**
   * Get trending languages
   */
  async getTrendingLanguages(): Promise<string[]> {
    // In a real implementation, this would analyze recent repls
    return ['JavaScript', 'Python', 'Java', 'TypeScript', 'React', 'Node.js', 'C++', 'HTML/CSS'];
  }
}

export const replitUserSearchService = new ReplitUserSearchService();