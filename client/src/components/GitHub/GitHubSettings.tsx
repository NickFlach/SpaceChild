import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GitHubLoginButton } from './GitHubLoginButton';
import { useGitHub } from '@/contexts/GitHubContext';
import { Button } from '@/components/ui/button';
import { Github, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

export function GitHubSettings() {
  const { isAuthenticated, user, logout } = useGitHub();

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Github className="h-6 w-6 mr-2" />
              GitHub Integration
            </CardTitle>
            <CardDescription>
              Connect your GitHub account to manage repositories and collaborate on code.
            </CardDescription>
          </div>
          {isAuthenticated && user && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                Connected as <span className="font-medium">{user.login}</span>
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={logout}
              >
                Disconnect
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {!isAuthenticated ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Connect to GitHub</h3>
              <p className="text-sm text-muted-foreground">
                Connect your GitHub account to access your repositories and collaborate on code directly from SpaceChild.
              </p>
            </div>
            
            <div className="border rounded-md p-4 bg-muted/50">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 bg-foreground/10 p-2 rounded-md">
                  <Github className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">GitHub Integration</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Connect with GitHub to access your repositories, create pull requests, and manage your code.
                  </p>
                  <div className="mt-4">
                    <GitHubLoginButton />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4 pt-4">
              <h4 className="font-medium">What you can do with GitHub integration:</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Browse and search your GitHub repositories</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>View and edit files directly in SpaceChild</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Create branches and submit pull requests</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Sync your work across devices with GitHub</span>
                </li>
              </ul>
              
              <div className="pt-2">
                <a
                  href="https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline flex items-center"
                >
                  Learn how to create a GitHub Personal Access Token
                  <ExternalLink className="h-3.5 w-3.5 ml-1" />
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-md bg-green-50 dark:bg-green-900/30 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                    Successfully connected to GitHub
                  </h3>
                  <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                    <p>You can now access your GitHub repositories from SpaceChild.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium">Connected account details:</h4>
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex items-center space-x-3">
                  <img 
                    src={user?.avatar_url} 
                    alt={user?.login} 
                    className="h-10 w-10 rounded-full"
                  />
                  <div>
                    <p className="font-medium">{user?.name || user?.login}</p>
                    <p className="text-sm text-muted-foreground">{user?.login}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Public Repositories</p>
                    <p className="font-medium">{user?.public_repos}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Account created</p>
                    <p className="font-medium">
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
                
                <div className="pt-2">
                  <a
                    href={user?.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline flex items-center"
                  >
                    View on GitHub
                    <ExternalLink className="h-3.5 w-3.5 ml-1" />
                  </a>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-3">GitHub Permissions</h4>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Repository Access</p>
                      <p className="text-sm text-muted-foreground">
                        Read and write access to your repositories (public and private)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Workflow Access</p>
                      <p className="text-sm text-muted-foreground">
                        Manage GitHub Actions workflows
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <div className="rounded-md bg-amber-50 dark:bg-amber-900/20 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-amber-500" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
                        Security Notice
                      </h3>
                      <div className="mt-2 text-sm text-amber-700 dark:text-amber-300">
                        <p>
                          SpaceChild only requests the minimum permissions required to function. 
                          You can revoke access at any time from your 
                          <a 
                            href="https://github.com/settings/tokens" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-amber-700 dark:text-amber-300 font-medium hover:underline ml-1"
                          >
                            GitHub settings
                          </a>.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
