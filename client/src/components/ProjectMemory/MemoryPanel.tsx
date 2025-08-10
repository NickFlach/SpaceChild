import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Sparkles, Code, Settings } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { isUnauthorizedError } from "@/lib/authUtils";

interface ProjectMemoryPanelProps {
  projectId: number;
}

export default function ProjectMemoryPanel({ projectId }: ProjectMemoryPanelProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fetch project memories
  const { data: memories, isLoading } = useQuery({
    queryKey: [`/api/projects/${projectId}/memories`],
    enabled: !!projectId,
  });
  
  // Fetch coding preferences
  const { data: preferences } = useQuery({
    queryKey: [`/api/projects/${projectId}/preferences`],
    enabled: !!projectId,
  });
  
  // Search memories
  const searchMutation = useMutation({
    mutationFn: async (query: string) => {
      const response = await apiRequest("GET", `/api/projects/${projectId}/memories/search?query=${encodeURIComponent(query)}`);
      return response.json();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to search memories",
        variant: "destructive",
      });
    }
  });
  
  // Save preference
  const savePreferenceMutation = useMutation({
    mutationFn: async ({ preference, preferenceType }: { preference: string; preferenceType: string }) => {
      await apiRequest("POST", `/api/projects/${projectId}/preferences`, {
        preference,
        preferenceType,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Preference saved successfully",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/preferences`] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to save preference",
        variant: "destructive",
      });
    }
  });
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchMutation.mutate(searchQuery);
    }
  };
  
  const formatMemoryType = (type: string) => {
    const typeMap: Record<string, { label: string; icon: React.ReactNode }> = {
      pattern: { label: "Code Pattern", icon: <Code className="h-4 w-4" /> },
      preference: { label: "Preference", icon: <Settings className="h-4 w-4" /> },
      solution: { label: "Solution", icon: <Sparkles className="h-4 w-4" /> },
      knowledge: { label: "Knowledge", icon: <Brain className="h-4 w-4" /> },
    };
    return typeMap[type] || { label: type, icon: null };
  };
  
  if (isLoading) {
    return <div>Loading project memory...</div>;
  }
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Project Memory
          </CardTitle>
          <CardDescription>
            Space Child learns from your interactions to provide better assistance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="memories" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="memories">Learned Patterns</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="search">Search</TabsTrigger>
            </TabsList>
            
            <TabsContent value="memories" className="space-y-4">
              {memories && Array.isArray(memories) && memories.length > 0 ? (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2 pr-4">
                    {memories.map((memory: any) => {
                      const typeInfo = formatMemoryType(memory.memoryType);
                      return (
                        <Card key={memory.id} className="p-3">
                          <div className="flex items-start gap-2">
                            {typeInfo.icon}
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{memory.title}</span>
                                <span className="text-xs text-muted-foreground">
                                  {typeInfo.label}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {memory.content}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <span>Used {memory.usageCount} times</span>
                                <span>Confidence: {(Number(memory.confidence) * 100).toFixed(0)}%</span>
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </ScrollArea>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No patterns learned yet. Keep using Space Child and it will learn from your interactions!
                </p>
              )}
            </TabsContent>
            
            <TabsContent value="preferences" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Current Preferences</h4>
                  {preferences && Object.keys(preferences).length > 0 ? (
                    <div className="space-y-2">
                      {Object.entries(preferences).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between p-2 border rounded">
                          <span className="text-sm font-medium">{key}:</span>
                          <span className="text-sm text-muted-foreground">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No preferences set yet</p>
                  )}
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-2">Add New Preference</h4>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const preferenceType = formData.get("preferenceType") as string;
                      const preference = formData.get("preference") as string;
                      
                      if (preferenceType && preference) {
                        savePreferenceMutation.mutate({ preference, preferenceType });
                        e.currentTarget.reset();
                      }
                    }}
                    className="space-y-3"
                  >
                    <div>
                      <Label htmlFor="preferenceType">Preference Type</Label>
                      <Input
                        id="preferenceType"
                        name="preferenceType"
                        placeholder="e.g., indentation, naming, imports"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="preference">Preference Value</Label>
                      <Input
                        id="preference"
                        name="preference"
                        placeholder="e.g., 2 spaces, camelCase, absolute imports"
                        required
                      />
                    </div>
                    <Button type="submit" disabled={savePreferenceMutation.isPending}>
                      Save Preference
                    </Button>
                  </form>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="search" className="space-y-4">
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                  placeholder="Search project memories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button type="submit" disabled={searchMutation.isPending}>
                  Search
                </Button>
              </form>
              
              {searchMutation.data && (
                <ScrollArea className="h-[350px] mt-4">
                  <div className="space-y-2 pr-4">
                    {searchMutation.data.length > 0 ? (
                      searchMutation.data.map((memory: any) => {
                        const typeInfo = formatMemoryType(memory.memoryType);
                        return (
                          <Card key={memory.id} className="p-3">
                            <div className="flex items-start gap-2">
                              {typeInfo.icon}
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">{memory.title}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {typeInfo.label}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {memory.content}
                                </p>
                              </div>
                            </div>
                          </Card>
                        );
                      })
                    ) : (
                      <p className="text-sm text-muted-foreground text-center">
                        No memories found for "{searchQuery}"
                      </p>
                    )}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}