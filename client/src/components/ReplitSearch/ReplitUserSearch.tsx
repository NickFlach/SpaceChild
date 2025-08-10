import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, ExternalLink, Search, User, Code, Globe, Calendar, Heart, Eye, GitFork, Filter, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReplitUser {
  username: string;
  displayName?: string;
  bio?: string;
  avatar?: string;
  url: string;
  followerCount?: number;
  followingCount?: number;
}

interface ReplitRepl {
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

interface ReplitDeployment {
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

interface ReplitSearchResult {
  user: ReplitUser;
  publicRepls: ReplitRepl[];
  deployments: ReplitDeployment[];
}

interface BrowseResult {
  repls: ReplitRepl[];
  deployments: ReplitDeployment[];
  totalCount: number;
  hasMore: boolean;
}

interface BrowseOptions {
  category?: 'trending' | 'new' | 'featured';
  language?: string;
  type?: 'repls' | 'deployments' | 'both';
  limit?: number;
  offset?: number;
}

export default function ReplitUserSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<ReplitSearchResult | null>(null);
  const [activeView, setActiveView] = useState<'search' | 'browse'>('search');
  const [browseFilters, setBrowseFilters] = useState<BrowseOptions>({
    category: 'trending',
    type: 'both',
    limit: 20,
    offset: 0
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch recent searches
  const { data: recentSearches = [] } = useQuery<any[]>({
    queryKey: ['/api/replit-users/recent'],
    enabled: !searchResult && activeView === 'search', // Only load when in search view and not showing results
  });

  // Fetch trending languages
  const { data: trendingLanguages = [] } = useQuery<{ languages: string[] }>({
    queryKey: ['/api/replit-users/trending-languages'],
    select: (data) => data.languages,
  });

  // Fetch browse content
  const { data: browseData, isLoading: isBrowseLoading, refetch: refetchBrowse } = useQuery<BrowseResult>({
    queryKey: ['/api/replit-users/browse', browseFilters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(browseFilters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
      
      const response = await fetch(`/api/replit-users/browse?${params}`);
      if (!response.ok) {
        throw new Error('Failed to browse content');
      }
      return response.json();
    },
    enabled: activeView === 'browse',
  });

  // Search mutation
  const searchMutation = useMutation({
    mutationFn: async (username: string) => {
      const response = await fetch(`/api/replit-users/search/${encodeURIComponent(username)}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to search user');
      }
      return response.json();
    },
    onSuccess: (data) => {
      setSearchResult(data);
      queryClient.invalidateQueries({ queryKey: ['/api/replit-users/recent'] });
      toast({
        title: "User found!",
        description: `Found ${data.user.username} with ${data.publicRepls.length} public repls`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Search failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const username = searchQuery.trim();
    if (!username) return;
    
    searchMutation.mutate(username);
  };

  const handleBackToSearch = () => {
    setSearchResult(null);
    setSearchQuery("");
    queryClient.invalidateQueries({ queryKey: ['/api/replit-users/recent'] });
  };

  const handleFilterChange = (key: keyof BrowseOptions, value: any) => {
    setBrowseFilters(prev => ({
      ...prev,
      [key]: value,
      offset: key !== 'offset' ? 0 : value, // Reset offset when other filters change
    }));
  };

  const loadMore = () => {
    if (browseData?.hasMore) {
      handleFilterChange('offset', (browseFilters.offset || 0) + (browseFilters.limit || 20));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'inactive': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (searchResult) {
    return (
      <div className="space-y-6">
        {/* Header with back button */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={handleBackToSearch}>
            ← Back to Search
          </Button>
          <Badge variant="outline">
            Found {searchResult.publicRepls.length + searchResult.deployments.length} items
          </Badge>
        </div>

        {/* User Profile Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={searchResult.user.avatar} alt={searchResult.user.username} />
                <AvatarFallback>
                  <User className="w-8 h-8" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-xl flex items-center gap-2">
                  {searchResult.user.displayName || searchResult.user.username}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 h-auto"
                    onClick={() => window.open(searchResult.user.url, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </CardTitle>
                <CardDescription className="text-base">
                  @{searchResult.user.username}
                </CardDescription>
                {searchResult.user.bio && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {searchResult.user.bio}
                  </p>
                )}
                {(searchResult.user.followerCount !== undefined || searchResult.user.followingCount !== undefined) && (
                  <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                    {searchResult.user.followerCount !== undefined && (
                      <span>{searchResult.user.followerCount} followers</span>
                    )}
                    {searchResult.user.followingCount !== undefined && (
                      <span>{searchResult.user.followingCount} following</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Content Tabs */}
        <Tabs defaultValue="repls" className="w-full">
          <TabsList>
            <TabsTrigger value="repls" className="flex items-center gap-2">
              <Code className="w-4 h-4" />
              Public Repls ({searchResult.publicRepls.length})
            </TabsTrigger>
            <TabsTrigger value="deployments" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Deployments ({searchResult.deployments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="repls" className="space-y-4">
            <ScrollArea className="h-[400px]">
              <div className="space-y-4 pr-4">
                {searchResult.publicRepls.length > 0 ? (
                  searchResult.publicRepls.map((repl) => (
                    <Card key={repl.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-base flex items-center gap-2">
                              <Code className="w-4 h-4" />
                              {repl.title}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="p-1 h-auto"
                                onClick={() => window.open(repl.url, '_blank')}
                              >
                                <ExternalLink className="w-3 h-3" />
                              </Button>
                            </CardTitle>
                            {repl.description && (
                              <CardDescription className="mt-1">
                                {repl.description}
                              </CardDescription>
                            )}
                          </div>
                          <Badge variant="secondary">{repl.language}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(repl.lastUpdated)}
                          </div>
                          {repl.forkCount !== undefined && (
                            <div className="flex items-center gap-1">
                              <GitFork className="w-3 h-3" />
                              {repl.forkCount}
                            </div>
                          )}
                          {repl.likeCount !== undefined && (
                            <div className="flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              {repl.likeCount}
                            </div>
                          )}
                          {repl.viewCount !== undefined && (
                            <div className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {repl.viewCount}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="flex items-center gap-2 p-6">
                      <AlertCircle className="w-5 h-5 text-muted-foreground" />
                      <span className="text-muted-foreground">No public repls found</span>
                    </CardContent>
                  </Card>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="deployments" className="space-y-4">
            <ScrollArea className="h-[400px]">
              <div className="space-y-4 pr-4">
                {searchResult.deployments.length > 0 ? (
                  searchResult.deployments.map((deployment) => (
                    <Card key={deployment.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-base flex items-center gap-2">
                              <Globe className="w-4 h-4" />
                              {deployment.title}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="p-1 h-auto"
                                onClick={() => window.open(deployment.url, '_blank')}
                              >
                                <ExternalLink className="w-3 h-3" />
                              </Button>
                            </CardTitle>
                            {deployment.description && (
                              <CardDescription className="mt-1">
                                {deployment.description}
                              </CardDescription>
                            )}
                          </div>
                          <Badge 
                            variant={deployment.status === 'active' ? 'default' : 'secondary'}
                            className={getStatusColor(deployment.status)}
                          >
                            {deployment.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Deployed {formatDate(deployment.lastDeployed)}
                          </div>
                          {deployment.domain && (
                            <div className="flex items-center gap-1">
                              <Globe className="w-3 h-3" />
                              {deployment.domain}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="flex items-center gap-2 p-6">
                      <AlertCircle className="w-5 h-5 text-muted-foreground" />
                      <span className="text-muted-foreground">No deployments found</span>
                    </CardContent>
                  </Card>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex space-x-1 p-1 bg-muted rounded-lg">
        <Button
          variant={activeView === 'search' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveView('search')}
          className="flex items-center gap-2"
        >
          <Search className="w-4 h-4" />
          Search Users
        </Button>
        <Button
          variant={activeView === 'browse' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveView('browse')}
          className="flex items-center gap-2"
        >
          <TrendingUp className="w-4 h-4" />
          Browse Public Content
        </Button>
      </div>

      {/* Search View */}
      {activeView === 'search' && (
        <>
          {/* Search Form */}
          <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search Replit Users
          </CardTitle>
          <CardDescription>
            Find Replit users by their username and explore their public repls and deployments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter Replit username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
                data-testid="input-replit-username"
              />
              <Button 
                type="submit" 
                disabled={searchMutation.isPending || !searchQuery.trim()}
                data-testid="button-search-user"
              >
                {searchMutation.isPending ? "Searching..." : "Search"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Enter a valid Replit username (letters, numbers, underscores, and hyphens only)
            </p>
          </form>
        </CardContent>
      </Card>

      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Searches</CardTitle>
            <CardDescription>
              Your recently searched Replit users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2 pr-4">
                {recentSearches.map((search: any) => (
                  <div
                    key={search.id}
                    className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-accent"
                    onClick={() => {
                      setSearchQuery(search.replitUsername);
                      searchMutation.mutate(search.replitUsername);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={search.userData?.avatar} alt={search.replitUsername} />
                        <AvatarFallback>
                          <User className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          {search.userData?.displayName || search.replitUsername}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          @{search.replitUsername}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(search.searchedAt)}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
        </>
      )}

      {/* Browse View */}
      {activeView === 'browse' && (
        <>
          {/* Browse Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Browse Public Repls & Deployments
              </CardTitle>
              <CardDescription>
                Discover trending and featured content from the Replit community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Category:</label>
                  <Select
                    value={browseFilters.category}
                    onValueChange={(value) => handleFilterChange('category', value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trending">Trending</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="featured">Featured</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Type:</label>
                  <Select
                    value={browseFilters.type}
                    onValueChange={(value) => handleFilterChange('type', value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="both">Both</SelectItem>
                      <SelectItem value="repls">Repls Only</SelectItem>
                      <SelectItem value="deployments">Deployments Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Language:</label>
                  <Select
                    value={browseFilters.language || 'all'}
                    onValueChange={(value) => handleFilterChange('language', value === 'all' ? undefined : value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Languages</SelectItem>
                      {trendingLanguages.map((lang) => (
                        <SelectItem key={lang} value={lang}>
                          {lang}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Browse Results */}
          {isBrowseLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center p-8">
                <div className="text-center space-y-2">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-muted-foreground">Loading content...</p>
                </div>
              </CardContent>
            </Card>
          ) : browseData ? (
            <Tabs defaultValue="repls" className="w-full">
              <TabsList>
                <TabsTrigger value="repls" className="flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  Repls ({browseData.repls.length})
                </TabsTrigger>
                <TabsTrigger value="deployments" className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Deployments ({browseData.deployments.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="repls" className="space-y-4">
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4 pr-4">
                    {browseData.repls.map((repl) => (
                      <Card key={repl.id} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-base flex items-center gap-2">
                                <Code className="w-4 h-4" />
                                {repl.title}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="p-1 h-auto"
                                  onClick={() => window.open(repl.url, '_blank')}
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </Button>
                              </CardTitle>
                              {repl.description && (
                                <CardDescription className="mt-1">
                                  {repl.description}
                                </CardDescription>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                <Avatar className="w-6 h-6">
                                  <AvatarFallback className="text-xs">
                                    {repl.owner[0].toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm text-muted-foreground">
                                  by @{repl.owner}
                                </span>
                              </div>
                            </div>
                            <Badge variant="secondary">{repl.language}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(repl.lastUpdated)}
                            </div>
                            {repl.forkCount !== undefined && (
                              <div className="flex items-center gap-1">
                                <GitFork className="w-3 h-3" />
                                {repl.forkCount}
                              </div>
                            )}
                            {repl.likeCount !== undefined && (
                              <div className="flex items-center gap-1">
                                <Heart className="w-3 h-3" />
                                {repl.likeCount}
                              </div>
                            )}
                            {repl.viewCount !== undefined && (
                              <div className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {repl.viewCount}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {browseData.hasMore && (
                      <div className="flex justify-center pt-4">
                        <Button onClick={loadMore} variant="outline">
                          Load More
                        </Button>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="deployments" className="space-y-4">
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4 pr-4">
                    {browseData.deployments.map((deployment) => (
                      <Card key={deployment.id} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-base flex items-center gap-2">
                                <Globe className="w-4 h-4" />
                                {deployment.title}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="p-1 h-auto"
                                  onClick={() => window.open(deployment.url, '_blank')}
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </Button>
                              </CardTitle>
                              {deployment.description && (
                                <CardDescription className="mt-1">
                                  {deployment.description}
                                </CardDescription>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                <Avatar className="w-6 h-6">
                                  <AvatarFallback className="text-xs">
                                    {deployment.owner[0].toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm text-muted-foreground">
                                  by @{deployment.owner}
                                </span>
                              </div>
                            </div>
                            <Badge 
                              variant={deployment.status === 'active' ? 'default' : 'secondary'}
                              className={getStatusColor(deployment.status)}
                            >
                              {deployment.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Deployed {formatDate(deployment.lastDeployed)}
                            </div>
                            {deployment.domain && (
                              <div className="flex items-center gap-1 max-w-48 truncate">
                                <Globe className="w-3 h-3" />
                                {deployment.domain}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {browseData.hasMore && (
                      <div className="flex justify-center pt-4">
                        <Button onClick={loadMore} variant="outline">
                          Load More
                        </Button>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="flex items-center gap-2 p-6">
                <AlertCircle className="w-5 h-5 text-muted-foreground" />
                <span className="text-muted-foreground">No content found</span>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}