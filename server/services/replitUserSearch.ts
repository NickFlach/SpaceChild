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
      // Try multiple variations of the username
      const variations = this.generateUsernameVariations(username);
      
      for (const variation of variations) {
        // Check cache first
        const cached = await this.getCachedResult(variation, searcherUserId);
        if (cached) {
          return {
            user: cached.userData as ReplitUser,
            publicRepls: cached.publicRepls as ReplitRepl[],
            deployments: cached.deployments as ReplitDeployment[],
          };
        }

        // Fetch fresh data
        const result = await this.fetchReplitUserData(variation);
        if (result) {
          // Cache the result using the original search term
          await this.cacheResult(username, searcherUserId, result);
          return result;
        }
      }

      return null;
    } catch (error) {
      console.error('Error searching Replit user:', error);
      return null;
    }
  }

  private generateUsernameVariations(username: string): string[] {
    const variations = [username]; // Start with original
    
    // Add lowercase version
    if (username !== username.toLowerCase()) {
      variations.push(username.toLowerCase());
    }
    
    // Add version without spaces
    const noSpaces = username.replace(/\s+/g, '');
    if (!variations.includes(noSpaces)) {
      variations.push(noSpaces);
    }
    
    // Add version with spaces replaced by hyphens
    const withHyphens = username.replace(/\s+/g, '-');
    if (!variations.includes(withHyphens)) {
      variations.push(withHyphens);
    }
    
    // Add version with spaces replaced by underscores
    const withUnderscores = username.replace(/\s+/g, '_');
    if (!variations.includes(withUnderscores)) {
      variations.push(withUnderscores);
    }
    
    // Add camelCase version if it contains spaces
    if (username.includes(' ')) {
      const camelCase = username.split(' ').map((word, index) => 
        index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join('');
      if (!variations.includes(camelCase)) {
        variations.push(camelCase);
      }
    }
    
    return variations;
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
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Cache-Control': 'no-cache',
        }
      });

      if (!response.ok) {
        console.log(`HTTP ${response.status} for user ${username}`);
        return null;
      }

      const html = await response.text();
      
      // Parse user data from HTML and extract repls/deployments from the same page
      const user = this.parseUserFromHTML(html, username);
      const { publicRepls, deployments } = this.parseProjectsFromHTML(html, username);

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

  private parseProjectsFromHTML(html: string, username: string): { publicRepls: ReplitRepl[], deployments: ReplitDeployment[] } {
    const publicRepls: ReplitRepl[] = [];
    const deployments: ReplitDeployment[] = [];

    try {
      // Method 1: Try to extract from Next.js __NEXT_DATA__
      const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>(.+?)<\/script>/);
      if (nextDataMatch) {
        try {
          const nextData = JSON.parse(nextDataMatch[1]);
          console.log(`Found Next.js data for ${username}`);
          console.log(`Next data structure:`, {
            hasProps: !!nextData.props,
            hasPageProps: !!nextData.props?.pageProps,
            hasApolloState: !!nextData.props?.pageProps?.apolloState,
            hasInitialApolloState: !!nextData.props?.pageProps?.initialApolloState,
            pagePropsKeys: nextData.props?.pageProps ? Object.keys(nextData.props.pageProps) : []
          });
          
          // Handle Replit's GraphQL Apollo state structure
          let apolloState = nextData.props?.pageProps?.apolloState || nextData.props?.pageProps?.initialApolloState;
          if (apolloState) {
            const keys = Object.keys(apolloState);
            console.log(`Processing Apollo state with ${keys.length} keys:`, keys.slice(0, 20));
            
            // Find the user object
            const userKey = Object.keys(apolloState).find(key => key.startsWith('User:'));
            if (userKey) {
              const user = apolloState[userKey];
              console.log(`Found user object: ${userKey}`);
              
              // Look for publicRepls in the user object
              const publicReplsKey = Object.keys(user).find(key => key.includes('publicRepls'));
              if (publicReplsKey && user[publicReplsKey]?.items) {
                console.log(`Found public repls field: ${publicReplsKey} with ${user[publicReplsKey].items.length} items`);
                
                // Follow the references to get actual repl data
                user[publicReplsKey].items.forEach((replRef: any) => {
                  if (replRef.__ref) {
                    const replData = apolloState[replRef.__ref];
                    if (replData) {
                      console.log(`Processing repl ${replRef.__ref}:`, {
                        id: replData.id,
                        hasTitle: !!replData.title,
                        hasSlug: !!replData.slug,
                        hasLanguage: !!replData.language,
                        isPublic: replData.isPublic,
                        keys: Object.keys(replData).slice(0, 15)
                      });

                      // Only add repls that have enough data to be useful
                      if (replData.id) {
                        publicRepls.push({
                          id: replData.id,
                          title: replData.title || replData.slug || replData.id,
                          description: replData.description || '',
                          language: replData.language?.displayName || replData.language?.key || 'Unknown',
                          url: replData.slug ? `https://replit.com/@${username}/${replData.slug}` : `https://replit.com/@${username}`,
                          isPublic: replData.isPublic !== false,
                          forkCount: replData.publicForkCount || replData.forkCount || 0,
                          likeCount: replData.likeCount || 0,
                          viewCount: replData.runCount || replData.viewCount || 0,
                          lastUpdated: replData.timeUpdated || replData.updatedAt || new Date().toISOString(),
                          owner: username,
                        });
                      }
                    }
                  }
                });
              }

              // Look for deployments in a similar way
              const deploymentsKey = Object.keys(user).find(key => key.includes('deployments') || key.includes('Deployments'));
              if (deploymentsKey && user[deploymentsKey]?.items) {
                user[deploymentsKey].items.forEach((deployRef: any) => {
                  if (deployRef.__ref) {
                    const deployData = apolloState[deployRef.__ref];
                    if (deployData && deployData.url) {
                      deployments.push({
                        id: deployData.id || deployRef.__ref.split(':')[1],
                        title: deployData.title || deployData.repl?.title || 'Deployed App',
                        description: deployData.description || deployData.repl?.description || '',
                        url: deployData.url,
                        status: deployData.state === 'SLEEPING' ? 'inactive' : (deployData.state === 'LIVE' ? 'active' : 'error'),
                        lastDeployed: deployData.timeCreated || deployData.createdAt || new Date().toISOString(),
                        replId: deployData.repl?.id || '',
                        owner: username,
                      });
                    }
                  }
                });
              }
            }

            // Also check root level for any direct Repl objects with full data
            Object.keys(apolloState).forEach(key => {
              if (key.startsWith('Repl:')) {
                const replData = apolloState[key];
                if (replData && replData.slug && replData.title && replData.isPublic) {
                  // Check if we already added this repl
                  const alreadyExists = publicRepls.some(r => r.id === replData.id);
                  if (!alreadyExists) {
                    publicRepls.push({
                      id: replData.id,
                      title: replData.title,
                      description: replData.description || '',
                      language: replData.language?.displayName || replData.language?.key || 'Unknown',
                      url: `https://replit.com/@${username}/${replData.slug}`,
                      isPublic: replData.isPublic,
                      forkCount: replData.publicForkCount || replData.forkCount || 0,
                      likeCount: replData.likeCount || 0,
                      viewCount: replData.runCount || replData.viewCount || 0,
                      lastUpdated: replData.timeUpdated || replData.updatedAt || new Date().toISOString(),
                      owner: username,
                    });
                  }
                }
              }
            });
          }
        } catch (jsonError) {
          console.log(`Could not parse Next.js data for ${username}:`, jsonError instanceof Error ? jsonError.message : 'Unknown error');
        }
      }

      // Method 2: Look for repl links in HTML if no Next.js data found
      if (publicRepls.length === 0) {
        console.log(`Trying HTML parsing for ${username}`);
        const replLinkRegex = new RegExp(`/@${username}/([^"\\s?]+)`, 'gi');
        let match;
        const seenSlugs = new Set();
        
        while ((match = replLinkRegex.exec(html)) !== null) {
          const slug = match[1];
          if (!seenSlugs.has(slug) && !slug.includes('?') && slug.length > 0) {
            seenSlugs.add(slug);
            
            // Try to find the title near this link
            const linkContext = html.substring(Math.max(0, match.index - 200), match.index + 200);
            const titleMatch = linkContext.match(/>([^<]+)</);
            const title = titleMatch?.[1]?.trim() || slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            
            publicRepls.push({
              id: slug,
              title: title,
              description: '',
              language: 'Unknown',
              url: `https://replit.com/@${username}/${slug}`,
              isPublic: true,
              forkCount: 0,
              likeCount: 0,
              viewCount: 0,
              lastUpdated: new Date().toISOString(),
              owner: username,
            });
          }
        }
      }

      // Method 3: Look for deployment URLs in HTML
      const deploymentRegex = /https?:\/\/([^.\s]+)\.replit\.app/gi;
      let deployMatch;
      const seenUrls = new Set();
      
      while ((deployMatch = deploymentRegex.exec(html)) !== null) {
        const [fullUrl, subdomain] = deployMatch;
        if (!seenUrls.has(fullUrl)) {
          seenUrls.add(fullUrl);
          
          deployments.push({
            id: subdomain,
            title: subdomain.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            description: 'Deployed application',
            url: fullUrl,
            status: 'active',
            lastDeployed: new Date().toISOString(),
            owner: username,
          });
        }
      }

      console.log(`Found ${publicRepls.length} repls and ${deployments.length} deployments for ${username}`);
      
    } catch (error) {
      console.error(`Error parsing projects for ${username}:`, error);
    }

    return { 
      publicRepls: publicRepls.slice(0, 10), 
      deployments: deployments.slice(0, 5) 
    };
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