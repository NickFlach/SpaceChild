import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Loader2, Github } from 'lucide-react';
import { useGitHub } from '@/contexts/GitHubContext';

export function GitHubLoginButton() {
  const { isAuthenticated, login, logout, isLoading, user } = useGitHub();
  const [isOpen, setIsOpen] = useState(false);
  const [token, setToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;
    
    setIsSubmitting(true);
    try {
      await login(token);
      setIsOpen(false);
      setToken('');
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-sm text-muted-foreground">
          {user.login}
        </span>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleLogout}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            'Disconnect'
          )}
        </Button>
      </div>
    );
  }

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setIsOpen(true)}
        disabled={isLoading}
      >
        <Github className="mr-2 h-4 w-4" />
        {isLoading ? 'Connecting...' : 'Connect GitHub'}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <form onSubmit={handleLogin}>
            <DialogHeader>
              <DialogTitle>Connect to GitHub</DialogTitle>
              <DialogDescription>
                Enter your GitHub Personal Access Token to connect your account.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="token">GitHub Personal Access Token</Label>
                <Input
                  id="token"
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  We'll use this token to access your GitHub repositories. We'll only request the necessary permissions.
                </p>
                <div className="mt-2 text-xs">
                  <p className="font-medium">Required permissions:</p>
                  <ul className="list-disc pl-5 space-y-1 mt-1">
                    <li><code>repo</code> - Full control of private repositories</li>
                    <li><code>workflow</code> - Update GitHub Action workflows</li>
                    <li><code>read:user</code> - Read user profile data</li>
                  </ul>
                </div>
                <div className="mt-2">
                  <a
                    href="https://github.com/settings/tokens/new?scopes=repo,workflow,read:user"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Create a new token on GitHub
                  </a>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!token.trim() || isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  'Connect'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
