import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useState, useEffect } from 'react';
import type { User } from "@shared/schema";

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Load token from localStorage on mount
    const storedToken = localStorage.getItem('zkp_token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const { data: user, isLoading, error, refetch } = useQuery<User | null>({
    queryKey: ['/api/zkp/auth/user'],
    queryFn: async () => {
      const token = localStorage.getItem('zkp_token');
      if (!token) {
        return null;
      }

      const response = await fetch('/api/zkp/auth/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Clear invalid token
          localStorage.removeItem('zkp_token');
          localStorage.removeItem('zkp_user');
          return null;
        }
        throw new Error('Failed to fetch user');
      }

      return response.json();
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const logout = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('zkp_token');
      if (token) {
        await fetch('/api/zkp/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
      
      // Clear local storage
      localStorage.removeItem('zkp_token');
      localStorage.removeItem('zkp_user');
      setToken(null);
    },
    onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['/api/zkp/auth/user'] });
      // Force reload to go back to landing page
      window.location.href = '/';
    },
  });

  const setAuthToken = (newToken: string) => {
    localStorage.setItem('zkp_token', newToken);
    setToken(newToken);
    refetch(); // Refetch user data with new token
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    logout: logout.mutate,
    setAuthToken,
    token,
  };
}
