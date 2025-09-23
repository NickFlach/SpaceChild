import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GitHubIntegrationPanel } from '@/components/GitHub/GitHubIntegrationPanel';
import { GitHubSettings } from '@/components/GitHub/GitHubSettings';
import { Button } from '@/components/ui/button';
import { Settings, GitBranch, Code2 } from 'lucide-react';
import { useGitHub } from '@/contexts/GitHubContext';

export default function GitHubPage() {
  const { isAuthenticated } = useGitHub();
  const [activeTab, setActiveTab] = useState('integration');

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">GitHub Integration</h1>
          <p className="text-muted-foreground">
            Connect to GitHub to manage your repositories and collaborate on code.
          </p>
        </div>
        {isAuthenticated && (
          <Button variant="outline" onClick={() => setActiveTab('settings')}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        )}
      </div>

      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 max-w-md mb-6">
          <TabsTrigger value="integration" className="flex items-center space-x-2">
            <Code2 className="h-4 w-4" />
            <span>Code Browser</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="integration" className="mt-0">
          <GitHubIntegrationPanel className="h-[calc(100vh-250px)] border rounded-lg" />
        </TabsContent>

        <TabsContent value="settings" className="mt-0">
          <GitHubSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
