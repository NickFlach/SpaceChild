import { GitHubProvider as GitHubContextProvider } from '@/contexts/GitHubContext';
import { ReactNode } from 'react';

interface GitHubProviderProps {
  children: ReactNode;
}

export function GitHubProvider({ children }: GitHubProviderProps) {
  return (
    <GitHubContextProvider>
      {children}
    </GitHubContextProvider>
  );
}
