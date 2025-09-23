import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { GitHubUser, getAuthenticatedUser, initializeGitHub } from '@/services/github';
import { toast } from 'sonner';

interface GitHubContextType {
  isAuthenticated: boolean;
  user: GitHubUser | null;
  accessToken: string | null;
  login: (token: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const GitHubContext = createContext<GitHubContextType | undefined>(undefined);

interface GitHubProviderProps {
  children: ReactNode;
}

export const GitHubProvider: React.FC<GitHubProviderProps> = ({ children }) => {
  const [accessToken, setAccessToken] = useLocalStorage<string | null>('github_access_token', null);
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize GitHub client when access token changes
  useEffect(() => {
    const initGitHub = async () => {
      if (!accessToken) {
        setIsLoading(false);
        return;
      }

      try {
        initializeGitHub(accessToken);
        const userData = await getAuthenticatedUser();
        setUser(userData);
        setError(null);
      } catch (err) {
        console.error('Failed to initialize GitHub:', err);
        setError('Failed to authenticate with GitHub. Please login again.');
        setAccessToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initGitHub();
  }, [accessToken, setAccessToken]);

  const login = async (token: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Initialize GitHub client with the new token
      initializeGitHub(token);
      
      // Verify the token by fetching the authenticated user
      const userData = await getAuthenticatedUser();
      
      // If successful, update state
      setAccessToken(token);
      setUser(userData);
      toast.success('Successfully connected to GitHub!');
    } catch (err) {
      console.error('GitHub login failed:', err);
      setError('Invalid GitHub token. Please check your token and try again.');
      setAccessToken(null);
      setUser(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setAccessToken(null);
    setUser(null);
    toast.info('Disconnected from GitHub');
  };

  const value = {
    isAuthenticated: !!user,
    user,
    accessToken,
    login,
    logout,
    isLoading,
    error,
  };

  return <GitHubContext.Provider value={value}>{children}</GitHubContext.Provider>;
};

export const useGitHub = (): GitHubContextType => {
  const context = useContext(GitHubContext);
  if (context === undefined) {
    throw new Error('useGitHub must be used within a GitHubProvider');
  }
  return context;
};

export default GitHubContext;
