import { useState, useEffect, useCallback } from 'react';
import { useGitHub } from '@/contexts/GitHubContext';
import { GitHubRepo, GitHubFile } from '@/services/github';
import { toast } from 'sonner';

export function useGitHubIntegration() {
  const { isAuthenticated, user } = useGitHub();
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user's repositories
  const loadRepositories = useCallback(async () => {
    if (!isAuthenticated || !user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`https://api.github.com/user/repos?per_page=100&sort=updated`, {
        headers: {
          'Authorization': `token ${localStorage.getItem('github_access_token')}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch repositories');
      }
      
      const data = await response.json();
      setRepos(data);
    } catch (err) {
      console.error('Error loading repositories:', err);
      setError('Failed to load repositories. Please try again.');
      toast.error('Failed to load repositories');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  // Load repository contents
  const loadRepositoryContents = useCallback(async (owner: string, repo: string, path: string = '') => {
    if (!isAuthenticated) return [];
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${path}`, 
        {
          headers: {
            'Authorization': `token ${localStorage.getItem('github_access_token')}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch repository contents');
      }
      
      return await response.json();
    } catch (err) {
      console.error('Error loading repository contents:', err);
      setError('Failed to load repository contents');
      toast.error('Failed to load repository contents');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Get file content
  const getFileContent = useCallback(async (owner: string, repo: string, path: string) => {
    if (!isAuthenticated) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${path}`, 
        {
          headers: {
            'Authorization': `token ${localStorage.getItem('github_access_token')}`,
            'Accept': 'application/vnd.github.v3.raw',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch file content');
      }
      
      return await response.text();
    } catch (err) {
      console.error('Error loading file content:', err);
      setError('Failed to load file content');
      toast.error('Failed to load file content');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Create a new file
  const createFile = useCallback(async (
    owner: string, 
    repo: string, 
    path: string, 
    content: string, 
    message: string = 'Create file'
  ) => {
    if (!isAuthenticated) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${path}`, 
        {
          method: 'PUT',
          headers: {
            'Authorization': `token ${localStorage.getItem('github_access_token')}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message,
            content: btoa(unescape(encodeURIComponent(content))),
          }),
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create file');
      }
      
      toast.success('File created successfully');
      return true;
    } catch (err) {
      console.error('Error creating file:', err);
      setError(err instanceof Error ? err.message : 'Failed to create file');
      toast.error('Failed to create file');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Update an existing file
  const updateFile = useCallback(async (
    owner: string, 
    repo: string, 
    path: string, 
    content: string, 
    sha: string,
    message: string = 'Update file'
  ) => {
    if (!isAuthenticated) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${path}`, 
        {
          method: 'PUT',
          headers: {
            'Authorization': `token ${localStorage.getItem('github_access_token')}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message,
            content: btoa(unescape(encodeURIComponent(content))),
            sha,
          }),
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update file');
      }
      
      toast.success('File updated successfully');
      return true;
    } catch (err) {
      console.error('Error updating file:', err);
      setError(err instanceof Error ? err.message : 'Failed to update file');
      toast.error('Failed to update file');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Create a pull request
  const createPullRequest = useCallback(async (
    owner: string, 
    repo: string, 
    title: string, 
    head: string, 
    base: string = 'main',
    body: string = ''
  ) => {
    if (!isAuthenticated) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/pulls`, 
        {
          method: 'POST',
          headers: {
            'Authorization': `token ${localStorage.getItem('github_access_token')}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title,
            head,
            base,
            body,
          }),
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create pull request');
      }
      
      const pr = await response.json();
      toast.success('Pull request created successfully');
      return pr;
    } catch (err) {
      console.error('Error creating pull request:', err);
      setError(err instanceof Error ? err.message : 'Failed to create pull request');
      toast.error('Failed to create pull request');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Initialize by loading repositories if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadRepositories();
    }
  }, [isAuthenticated, user, loadRepositories]);

  return {
    isAuthenticated,
    user,
    repos,
    isLoading,
    error,
    loadRepositories,
    loadRepositoryContents,
    getFileContent,
    createFile,
    updateFile,
    createPullRequest,
  };
}
