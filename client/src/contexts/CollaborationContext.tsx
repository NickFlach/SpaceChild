/**
 * Collaboration Context
 * 
 * Provides collaboration state and functionality throughout the application
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useEditorContext } from '@/contexts/EditorContext';
import { useCollaboration } from '@/hooks/useCollaboration';
import { 
  CollaborationState, 
  UserPresence, 
  createRoomId 
} from '@shared/collaboration';

interface CollaborationContextData {
  // Connection state
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'reconnecting';
  currentRoom: string | null;

  // Users and presence
  users: UserPresence[];
  getUserById: (userId: string) => UserPresence | undefined;

  // Document state
  documentRevision: number;
  isTyping: boolean;
  setIsTyping: (typing: boolean) => void;

  // Room management
  joinRoom: (projectId: number, fileId: number) => void;
  leaveRoom: () => void;

  // Connection management
  connect: () => void;
  disconnect: () => void;

  // Full collaboration state
  collaborationState: CollaborationState;
  
  // Error state
  error: string | null;

  // Enable collaboration when needed
  enableCollaboration: () => void;
}

const CollaborationContext = createContext<CollaborationContextData | null>(null);

interface CollaborationProviderProps {
  children: React.ReactNode;
  autoConnect?: boolean;
}

export function CollaborationProvider({ 
  children, 
  autoConnect = true 
}: CollaborationProviderProps) {
  const { user } = useAuth();
  const { currentFile, currentProject } = useEditorContext();

  // Determine current project and file IDs
  const projectId = currentProject?.id;
  const fileId = currentFile?.id;

  // Use collaboration hook with auto-determined project and file
  const collaboration = useCollaboration({
    projectId,
    fileId,
    autoConnect: false // Never auto-connect, require explicit user action
  });

  // Auto-join room when project/file changes
  useEffect(() => {
    if (collaboration.isConnected && projectId && fileId) {
      const newRoomId = createRoomId(projectId, fileId);

      // Only join if we're not already in the correct room
      if (collaboration.currentRoom !== newRoomId) {
        if (collaboration.currentRoom) {
          collaboration.leaveRoom();
        }
        collaboration.joinRoom(projectId, fileId);
      }
    }
  }, [collaboration.isConnected, projectId, fileId, collaboration.currentRoom]);

  // Auto-disconnect when user logs out
  useEffect(() => {
    if (!user?.id && collaboration.isConnected) {
      collaboration.disconnect();
    }
  }, [user?.id, collaboration.isConnected]);

  const contextValue: CollaborationContextData = {
    // Connection state
    isConnected: collaboration.isConnected,
    connectionStatus: collaboration.connectionStatus,
    currentRoom: collaboration.currentRoom,

    // Users and presence
    users: collaboration.users,
    getUserById: collaboration.getUserById,

    // Document state
    documentRevision: collaboration.documentRevision,
    isTyping: collaboration.isTyping,
    setIsTyping: collaboration.setIsTyping,

    // Actions
    joinRoom: collaboration.joinRoom,
    leaveRoom: collaboration.leaveRoom,
    connect: collaboration.connect,
    disconnect: collaboration.disconnect,

    // Full state
    collaborationState: collaboration.collaborationState,
    
    // Error state
    error: collaboration.error,

    // Enable collaboration
    enableCollaboration: () => {
      if (!collaboration.isConnected && user?.id) {
        collaboration.connect();
      }
    },
  };

  return (
    <CollaborationContext.Provider value={contextValue}>
      {children}
    </CollaborationContext.Provider>
  );
}

export function useCollaborationContext() {
  const context = useContext(CollaborationContext);
  if (!context) {
    throw new Error('useCollaborationContext must be used within a CollaborationProvider');
  }
  return context;
}

/**
 * Hook for components that need to react to collaboration state changes
 */
export function useCollaborationUpdates(
  onUserJoin?: (user: UserPresence) => void,
  onUserLeave?: (userId: string) => void,
  onCursorUpdate?: (userId: string, cursor: { line: number; column: number }) => void
) {
  const { users } = useCollaborationContext();
  const [previousUsers, setPreviousUsers] = useState<UserPresence[]>([]);

  useEffect(() => {
    const currentUserIds = new Set(users.map(u => u.userId));
    const previousUserIds = new Set(previousUsers.map(u => u.userId));

    // Detect new users
    for (const user of users) {
      if (!previousUserIds.has(user.userId)) {
        onUserJoin?.(user);
      } else {
        // Check for cursor updates
        const previousUser = previousUsers.find(u => u.userId === user.userId);
        if (previousUser && 
            (previousUser.cursorPosition.line !== user.cursorPosition.line ||
             previousUser.cursorPosition.column !== user.cursorPosition.column)) {
          onCursorUpdate?.(user.userId, user.cursorPosition);
        }
      }
    }

    // Detect users who left
    for (const previousUser of previousUsers) {
      if (!currentUserIds.has(previousUser.userId)) {
        onUserLeave?.(previousUser.userId);
      }
    }

    setPreviousUsers(users);
  }, [users, previousUsers, onUserJoin, onUserLeave, onCursorUpdate]);
}

/**
 * Hook for accessing collaboration status without full context
 */
export function useCollaborationStatus() {
  const context = useContext(CollaborationContext);

  if (!context) {
    // Return safe defaults when outside provider
    return {
      isConnected: false,
      connectionStatus: 'disconnected' as const,
      userCount: 0,
      currentRoom: null,
    };
  }

  return {
    isConnected: context.isConnected,
    connectionStatus: context.connectionStatus,
    userCount: context.users.length,
    currentRoom: context.currentRoom,
  };
}

export default CollaborationContext;