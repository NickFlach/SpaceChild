/**
 * Collaboration Hook
 * 
 * Client-side hook for real-time collaborative editing
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useEditorContext } from '@/contexts/EditorContext';
import { 
  CollaborationState, 
  UserPresence, 
  WebSocketMessage,
  createRoomId,
  type OperationMessage,
  type CursorMessage,
  type PresenceMessage,
  type SyncMessage
} from '@shared/collaboration';
import { 
  Operation, 
  OperationalTransform, 
  CursorTransform 
} from '@shared/operationalTransform';

interface UseCollaborationOptions {
  projectId?: number;
  fileId?: number;
  autoConnect?: boolean;
}

export function useCollaboration({
  projectId,
  fileId,
  autoConnect = true
}: UseCollaborationOptions = {}) {

  const { user } = useAuth();
  const { 
    currentFile, 
    fileContent, 
    cursorPosition, 
    selection, 
    updateFileContent,
    setCursorPosition,
    setSelection
  } = useEditorContext();

  // WebSocket connection
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Collaboration state
  const [collaborationState, setCollaborationState] = useState<CollaborationState>({
    isConnected: false,
    currentRoom: null,
    users: [],
    documentRevision: 0,
    pendingOperations: [],
    isTyping: false,
    connectionStatus: 'disconnected'
  });

  // Track previous content for operation generation
  const previousContentRef = useRef<string>('');
  const lastOperationRef = useRef<Operation | null>(null);

  /**
   * Initialize WebSocket connection
   */
  const connect = useCallback(() => {
    if (!user?.id) return;

    setCollaborationState(prev => ({ ...prev, connectionStatus: 'connecting' }));

    // SECURITY FIX: Send authentication token with WebSocket connection
    const token = localStorage.getItem('zkp_token');
    if (!token) {
      console.error('No authentication token available for WebSocket connection');
      setCollaborationState(prev => ({ 
        ...prev, 
        connectionStatus: 'disconnected',
        isConnected: false 
      }));
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws?token=${encodeURIComponent(token)}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected for collaboration');
      setCollaborationState(prev => ({ 
        ...prev, 
        isConnected: true, 
        connectionStatus: 'connected' 
      }));

      // Connection established - ready for collaboration
    };

    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        handleWebSocketMessage(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setCollaborationState(prev => ({ 
        ...prev, 
        isConnected: false, 
        connectionStatus: 'disconnected' 
      }));

      // Attempt to reconnect
      if (autoConnect) {
        reconnectTimeoutRef.current = setTimeout(() => {
          setCollaborationState(prev => ({ ...prev, connectionStatus: 'reconnecting' }));
          connect();
        }, 3000);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setCollaborationState(prev => ({ ...prev, connectionStatus: 'disconnected' }));
    };

  }, [user?.id, projectId, fileId, autoConnect]);

  /**
   * Disconnect WebSocket
   */
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setCollaborationState(prev => ({ 
      ...prev, 
      isConnected: false, 
      connectionStatus: 'disconnected',
      currentRoom: null,
      users: []
    }));
  }, []);

  /**
   * Join a collaboration room
   */
  const joinRoom = useCallback((projectId: number, fileId: number) => {
    if (!wsRef.current || !user?.id) return;

    const roomId = createRoomId(projectId, fileId);

    const message: WebSocketMessage = {
      type: 'join',
      data: {
        roomId,
        projectId,
        fileId
      },
      userId: user.id,
      timestamp: Date.now()
    };

    wsRef.current.send(JSON.stringify(message));

    setCollaborationState(prev => ({ ...prev, currentRoom: roomId }));
  }, [user?.id]);

  /**
   * Leave current room
   */
  const leaveRoom = useCallback(() => {
    if (!wsRef.current || !collaborationState.currentRoom) return;

    const message: WebSocketMessage = {
      type: 'leave',
      data: {
        roomId: collaborationState.currentRoom
      },
      userId: user?.id,
      timestamp: Date.now()
    };

    wsRef.current.send(JSON.stringify(message));

    setCollaborationState(prev => ({ 
      ...prev, 
      currentRoom: null,
      users: []
    }));
  }, [collaborationState.currentRoom, user?.id]);

  /**
   * Send operation to server
   */
  const sendOperation = useCallback((operation: Operation) => {
    if (!wsRef.current || !collaborationState.currentRoom) return;

    const message: OperationMessage = {
      type: 'operation',
      data: {
        operation,
        roomId: collaborationState.currentRoom
      },
      userId: user?.id,
      timestamp: Date.now()
    };

    wsRef.current.send(JSON.stringify(message));
    lastOperationRef.current = operation;
  }, [collaborationState.currentRoom, user?.id]);

  /**
   * Send cursor position update
   */
  const sendCursorUpdate = useCallback((
    cursorPos: { line: number; column: number },
    sel?: { start: { line: number; column: number }; end: { line: number; column: number } },
    isTyping: boolean = false
  ) => {
    if (!wsRef.current || !collaborationState.currentRoom) return;

    const message: CursorMessage = {
      type: 'cursor',
      data: {
        roomId: collaborationState.currentRoom,
        cursorPosition: cursorPos,
        selection: sel,
        isTyping
      },
      userId: user?.id,
      timestamp: Date.now()
    };

    wsRef.current.send(JSON.stringify(message));
  }, [collaborationState.currentRoom, user?.id]);

  /**
   * Handle incoming WebSocket messages
   */
  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    switch (message.type) {
      case 'operation':
        handleOperationMessage(message as OperationMessage);
        break;

      case 'cursor':
        handleCursorMessage(message as CursorMessage);
        break;

      case 'presence':
        handlePresenceMessage(message as PresenceMessage);
        break;

      case 'sync':
        handleSyncMessage(message as SyncMessage);
        break;

      case 'welcome':
        // Server welcome message - no action needed
        console.log('WebSocket collaboration ready');
        break;

      default:
        console.log('Unknown collaboration message type:', message.type);
    }
  }, []);

  /**
   * Handle operation messages
   */
  const handleOperationMessage = useCallback((message: OperationMessage) => {
    const { operation } = message.data;

    if (message.userId === user?.id) {
      // This is our own operation, ignore
      return;
    }

    try {
      // Apply operation to current content
      const newContent = OperationalTransform.applyOperations(
        fileContent, 
        operation.operations
      );

      // Transform cursor position
      const textOffset = cursorPosition.line * fileContent.split('\n').length + cursorPosition.column;
      const newCursorOffset = CursorTransform.transformCursor(
        textOffset, 
        operation, 
        false
      );

      // Update content and cursor
      updateFileContent(newContent);
      previousContentRef.current = newContent;

      // Update document revision
      setCollaborationState(prev => ({
        ...prev,
        documentRevision: operation.revision
      }));

    } catch (error) {
      console.error('Error applying remote operation:', error);
    }
  }, [fileContent, cursorPosition, updateFileContent, user?.id]);

  /**
   * Handle cursor messages
   */
  const handleCursorMessage = useCallback((message: CursorMessage) => {
    if (message.userId === user?.id) return;

    const { cursorPosition, selection, isTyping } = message.data;

    setCollaborationState(prev => ({
      ...prev,
      users: prev.users.map(user => 
        user.userId === message.userId
          ? { ...user, cursorPosition, selection, isTyping, lastSeen: Date.now() }
          : user
      )
    }));
  }, [user?.id]);

  /**
   * Handle presence messages
   */
  const handlePresenceMessage = useCallback((message: PresenceMessage) => {
    const { user: presenceUser, action } = message.data;

    setCollaborationState(prev => {
      let newUsers = [...prev.users];

      switch (action) {
        case 'join':
          if (!newUsers.find(u => u.userId === presenceUser.userId)) {
            newUsers.push(presenceUser);
          }
          break;

        case 'leave':
          newUsers = newUsers.filter(u => u.userId !== presenceUser.userId);
          break;

        case 'update':
          newUsers = newUsers.map(u => 
            u.userId === presenceUser.userId ? { ...u, ...presenceUser } : u
          );
          break;
      }

      return { ...prev, users: newUsers };
    });
  }, []);

  /**
   * Handle sync messages
   */
  const handleSyncMessage = useCallback((message: SyncMessage) => {
    const { content, revision, users } = message.data;

    updateFileContent(content);
    previousContentRef.current = content;

    setCollaborationState(prev => ({
      ...prev,
      documentRevision: revision,
      users
    }));
  }, [updateFileContent]);

  /**
   * Generate and send operation when content changes
   */
  useEffect(() => {
    if (!collaborationState.isConnected || !collaborationState.currentRoom || !user?.id) {
      return;
    }

    const previousContent = previousContentRef.current;

    if (previousContent !== fileContent && currentFile) {
      // Generate operation from content diff
      const operation = OperationalTransform.createOperationsFromDiff(
        previousContent,
        fileContent,
        user.id,
        currentFile.id,
        collaborationState.documentRevision
      );

      if (operation.operations.length > 0) {
        sendOperation(operation);
      }

      previousContentRef.current = fileContent;
    }
  }, [fileContent, collaborationState.isConnected, collaborationState.currentRoom, 
      collaborationState.documentRevision, currentFile, user?.id, sendOperation]);

  /**
   * Send cursor updates when cursor position changes
   */
  useEffect(() => {
    if (!collaborationState.isConnected || !collaborationState.currentRoom) {
      return;
    }

    const selectionData = selection ? {
      start: selection.start,
      end: selection.end
    } : undefined;

    sendCursorUpdate(cursorPosition, selectionData, collaborationState.isTyping);
  }, [cursorPosition, selection, collaborationState.isConnected, 
      collaborationState.currentRoom, collaborationState.isTyping, sendCursorUpdate]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        disconnect();
      }
    };
  }, []);

  /**
   * Join room when project/file changes
   */
  useEffect(() => {
    if (collaborationState.isConnected && projectId && fileId) {
      joinRoom(projectId, fileId);
    }
  }, [collaborationState.isConnected, projectId, fileId, joinRoom]);

  /**
   * Handle typing indicator
   */
  const setIsTyping = useCallback((typing: boolean) => {
    setCollaborationState(prev => ({ ...prev, isTyping: typing }));

    if (typing) {
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set typing to false after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        setCollaborationState(prev => ({ ...prev, isTyping: false }));
      }, 2000);
    }
  }, []);

  /**
   * Get user by ID
   */
  const getUserById = useCallback((userId: string): UserPresence | undefined => {
    return collaborationState.users.find(u => u.userId === userId);
  }, [collaborationState.users]);

  /**
   * Send a message over the WebSocket connection
   */
  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify(message));
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
      }
    } else {
      console.warn('WebSocket not ready, queuing message:', message);
    }
  }, []);

  return {
    // Connection state
    isConnected: collaborationState.isConnected,
    connectionStatus: collaborationState.connectionStatus,
    currentRoom: collaborationState.currentRoom,

    // Users and presence
    users: collaborationState.users,
    getUserById,

    // Document state
    documentRevision: collaborationState.documentRevision,
    pendingOperations: collaborationState.pendingOperations,

    // Typing indicator
    isTyping: collaborationState.isTyping,
    setIsTyping,

    // Actions
    connect,
    disconnect,
    joinRoom,
    leaveRoom,
    sendOperation,
    sendCursorUpdate,
    sendMessage,

    // Collaboration state
    collaborationState,
  };
}

export default useCollaboration;