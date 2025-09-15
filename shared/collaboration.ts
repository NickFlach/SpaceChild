/**
 * Collaboration Types and Interfaces
 * 
 * Shared types for real-time collaborative editing system
 */

import type { Operation, TextOperation } from './operationalTransform';

export interface UserPresence {
  userId: string;
  username: string;
  firstName?: string;
  lastName?: string;
  cursorPosition: {
    line: number;
    column: number;
  };
  selection?: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
  color: string; // User color for cursor/selection display
  lastSeen: number;
  isTyping: boolean;
}

export interface CollaborationRoom {
  roomId: string;
  projectId: number;
  fileId: number;
  users: Map<string, UserPresence>;
  documentRevision: number;
  lastActivity: number;
}

export interface CollaborationMessage {
  type: 'operation' | 'cursor' | 'presence' | 'join' | 'leave' | 'file_change' | 'sync' | 'consciousness_update' | 'error' | 'welcome' | 'joined' | 'operation_ack';
  data?: any;
  message?: string;
  userId?: string;
  timestamp: number;
}

export interface OperationMessage extends CollaborationMessage {
  type: 'operation';
  data: {
    operation: Operation;
    roomId: string;
  };
}

export interface CursorMessage extends CollaborationMessage {
  type: 'cursor';
  data: {
    roomId: string;
    cursorPosition: { line: number; column: number };
    selection?: {
      start: { line: number; column: number };
      end: { line: number; column: number };
    };
    isTyping: boolean;
  };
}

export interface PresenceMessage extends CollaborationMessage {
  type: 'presence';
  data: {
    roomId: string;
    user: UserPresence;
    action: 'join' | 'leave' | 'update';
  };
}

export interface JoinRoomMessage extends CollaborationMessage {
  type: 'join';
  data: {
    roomId: string;
    projectId: number;
    fileId: number;
  };
}

export interface LeaveRoomMessage extends CollaborationMessage {
  type: 'leave';
  data: {
    roomId: string;
  };
}

export interface FileChangeMessage extends CollaborationMessage {
  type: 'file_change';
  data: {
    roomId: string;
    fileId: number;
    newContent: string;
    revision: number;
  };
}

export interface SyncMessage extends CollaborationMessage {
  type: 'sync';
  data: {
    roomId: string;
    content: string;
    revision: number;
    users: UserPresence[];
  };
}

export type WebSocketMessage = 
  | OperationMessage 
  | CursorMessage 
  | PresenceMessage 
  | JoinRoomMessage 
  | LeaveRoomMessage 
  | FileChangeMessage 
  | SyncMessage
  | CollaborationMessage;

export interface CollaborationState {
  isConnected: boolean;
  currentRoom: string | null;
  users: UserPresence[];
  documentRevision: number;
  pendingOperations: Operation[];
  isTyping: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'reconnecting';
}

// User color palette for collaboration indicators
export const USER_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#96CEB4', // Green
  '#FECA57', // Yellow
  '#FF9FF3', // Pink
  '#54A0FF', // Light Blue
  '#5F27CD', // Purple
  '#00D2D3', // Cyan
  '#FF9F43', // Orange
  '#10AC84', // Dark Green
  '#EE5A24', // Dark Orange
  '#0984E3', // Dark Blue
  '#A55EEA', // Light Purple
  '#26DE81', // Mint Green
];

export function generateUserColor(userId: string): string {
  // Generate consistent color based on user ID
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  const index = Math.abs(hash) % USER_COLORS.length;
  return USER_COLORS[index];
}

export function createRoomId(projectId: number, fileId: number): string {
  return `project_${projectId}_file_${fileId}`;
}

// Utility functions for presence management
export function createUserPresence(
  userId: string, 
  username: string, 
  firstName?: string, 
  lastName?: string
): UserPresence {
  return {
    userId,
    username,
    firstName,
    lastName,
    cursorPosition: { line: 1, column: 1 },
    color: generateUserColor(userId),
    lastSeen: Date.now(),
    isTyping: false,
  };
}

export function updateUserPresence(
  presence: UserPresence, 
  updates: Partial<UserPresence>
): UserPresence {
  return {
    ...presence,
    ...updates,
    lastSeen: Date.now(),
  };
}

// Conflict resolution strategies
export enum ConflictStrategy {
  OPERATIONAL_TRANSFORM = 'ot',
  LAST_WRITE_WINS = 'lww',
  MERGE_CHANGES = 'merge'
}

export interface ConflictResolution {
  strategy: ConflictStrategy;
  resolvedContent: string;
  mergedOperations: Operation[];
  conflictCount: number;
}