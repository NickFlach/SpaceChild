/**
 * Collaboration Service
 * 
 * Manages real-time collaborative editing sessions with operational transformation
 */

import { WebSocket } from 'ws';
import { storage } from '../storage';
import { 
  CollaborationRoom, 
  UserPresence, 
  WebSocketMessage, 
  createRoomId, 
  createUserPresence,
  ConflictStrategy,
  type ConflictResolution
} from '@shared/collaboration';
import { 
  Operation, 
  OperationalTransform, 
  CursorTransform 
} from '@shared/operationalTransform';

interface ExtendedWebSocket extends WebSocket {
  userId?: string;
  roomId?: string;
}

export class CollaborationService {
  private rooms: Map<string, CollaborationRoom> = new Map();
  private userSockets: Map<string, ExtendedWebSocket> = new Map();
  private socketUsers: Map<ExtendedWebSocket, string> = new Map();
  
  constructor() {
    // Clean up inactive rooms every 5 minutes
    setInterval(() => this.cleanupInactiveRooms(), 5 * 60 * 1000);
  }
  
  /**
   * Handle WebSocket connection
   */
  async handleConnection(ws: ExtendedWebSocket, userId?: string) {
    if (userId) {
      ws.userId = userId;
      this.userSockets.set(userId, ws);
      this.socketUsers.set(ws, userId);
    }
    
    ws.on('close', () => {
      this.handleDisconnection(ws);
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      this.handleDisconnection(ws);
    });
  }
  
  /**
   * Handle WebSocket disconnection
   */
  private handleDisconnection(ws: ExtendedWebSocket) {
    const userId = this.socketUsers.get(ws);
    
    if (userId) {
      // Remove user from all rooms
      for (const [roomId, room] of this.rooms) {
        if (room.users.has(userId)) {
          room.users.delete(userId);
          this.broadcastToRoom(roomId, {
            type: 'presence',
            data: {
              roomId,
              user: { userId } as UserPresence,
              action: 'leave'
            },
            timestamp: Date.now()
          }, userId);
          
          // Remove empty rooms
          if (room.users.size === 0) {
            this.rooms.delete(roomId);
          }
        }
      }
      
      this.userSockets.delete(userId);
      this.socketUsers.delete(ws);
    }
  }
  
  /**
   * Handle user joining a collaboration room
   */
  async joinRoom(userId: string, projectId: number, fileId: number): Promise<CollaborationRoom> {
    const roomId = createRoomId(projectId, fileId);
    
    // SECURITY FIX: Enhanced access control with detailed validation
    const project = await storage.getProject(projectId);
    if (!project) {
      throw new Error('Project not found');
    }
    
    // Verify user has access to the project (owner only for now)
    if (project.userId !== userId) {
      console.warn(`Access denied: User ${userId} attempted to join room for project ${projectId} owned by ${project.userId}`);
      throw new Error('Access denied: You do not have permission to access this project');
    }
    
    // Verify the file exists in the project (if fileId is specified)
    if (fileId) {
      const projectFiles = await storage.getProjectFiles(projectId);
      const fileExists = projectFiles.some(f => f.id === fileId);
      if (!fileExists) {
        throw new Error('File not found in project');
      }
    }
    
    // Get or create room
    let room = this.rooms.get(roomId);
    if (!room) {
      room = {
        roomId,
        projectId,
        fileId,
        users: new Map(),
        documentRevision: 0,
        lastActivity: Date.now()
      };
      this.rooms.set(roomId, room);
    }
    
    // Get user information
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Create user presence
    const userPresence = createUserPresence(
      userId, 
      user.username || user.email, 
      user.firstName || undefined, 
      user.lastName || undefined
    );
    
    // Add user to room
    room.users.set(userId, userPresence);
    room.lastActivity = Date.now();
    
    // Update user's socket room
    const userSocket = this.userSockets.get(userId);
    if (userSocket) {
      userSocket.roomId = roomId;
    }
    
    // Broadcast presence update
    this.broadcastToRoom(roomId, {
      type: 'presence',
      data: {
        roomId,
        user: userPresence,
        action: 'join'
      },
      timestamp: Date.now()
    }, userId);
    
    // Send sync message to new user
    await this.sendSyncMessage(userId, roomId);
    
    return room;
  }
  
  /**
   * Handle user leaving a room
   */
  async leaveRoom(userId: string, roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room || !room.users.has(userId)) {
      return;
    }
    
    const userPresence = room.users.get(userId);
    room.users.delete(userId);
    
    // Update user's socket room
    const userSocket = this.userSockets.get(userId);
    if (userSocket) {
      userSocket.roomId = undefined;
    }
    
    // Broadcast presence update
    this.broadcastToRoom(roomId, {
      type: 'presence',
      data: {
        roomId,
        user: userPresence!,
        action: 'leave'
      },
      timestamp: Date.now()
    }, userId);
    
    // Remove empty rooms
    if (room.users.size === 0) {
      this.rooms.delete(roomId);
    }
  }
  
  /**
   * Process and apply an operation with OT
   */
  async processOperation(userId: string, operation: Operation, roomId: string): Promise<Operation> {
    const room = this.rooms.get(roomId);
    if (!room || !room.users.has(userId)) {
      throw new Error('User not in room');
    }
    
    // Transform operation against any concurrent operations
    const transformedOperation = await this.transformOperation(operation, room);
    
    // Apply operation to document
    await this.applyOperation(transformedOperation, room);
    
    // Broadcast transformed operation to other users
    this.broadcastToRoom(roomId, {
      type: 'operation',
      data: {
        operation: transformedOperation,
        roomId
      },
      userId,
      timestamp: Date.now()
    }, userId);
    
    // Update room activity
    room.lastActivity = Date.now();
    
    return transformedOperation;
  }
  
  /**
   * Transform operation using OT algorithms
   */
  private async transformOperation(operation: Operation, room: CollaborationRoom): Promise<Operation> {
    // For now, we'll use a simplified approach
    // In a production system, you'd maintain a history of operations
    
    if (operation.revision < room.documentRevision) {
      // Operation is behind, needs transformation
      // This is where you'd apply transformation against intervening operations
      return {
        ...operation,
        revision: room.documentRevision + 1
      };
    }
    
    return {
      ...operation,
      revision: room.documentRevision + 1
    };
  }
  
  /**
   * Apply operation to the document
   */
  private async applyOperation(operation: Operation, room: CollaborationRoom) {
    try {
      // Get current file content using project ID from room
      const files = await storage.getProjectFiles(room.projectId);
      const file = files.find(f => f.id === operation.fileId);
      if (!file) {
        throw new Error('File not found');
      }
      
      // Apply operation to content
      const newContent = OperationalTransform.applyOperations(
        file.content || '', 
        operation.operations
      );
      
      // Update file with new content
      await storage.updateProjectFile(operation.fileId, { content: newContent });
      
      // Update room revision
      room.documentRevision = operation.revision;
      
    } catch (error) {
      console.error('Error applying operation:', error);
      throw error;
    }
  }
  
  /**
   * Handle cursor position updates
   */
  async updateCursor(
    userId: string, 
    roomId: string, 
    cursorPosition: { line: number; column: number },
    selection?: { start: { line: number; column: number }; end: { line: number; column: number } },
    isTyping: boolean = false
  ) {
    const room = this.rooms.get(roomId);
    if (!room || !room.users.has(userId)) {
      return;
    }
    
    const userPresence = room.users.get(userId)!;
    userPresence.cursorPosition = cursorPosition;
    userPresence.selection = selection;
    userPresence.isTyping = isTyping;
    userPresence.lastSeen = Date.now();
    
    // Broadcast cursor update
    this.broadcastToRoom(roomId, {
      type: 'cursor',
      data: {
        roomId,
        cursorPosition,
        selection,
        isTyping
      },
      userId,
      timestamp: Date.now()
    }, userId);
    
    room.lastActivity = Date.now();
  }
  
  /**
   * Send synchronization message to a user
   */
  private async sendSyncMessage(userId: string, roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    
    try {
      // Get current file content
      const files = await storage.getProjectFiles(room.projectId);
      const file = files.find(f => f.id === room.fileId);
      if (!file) return;
      
      const userSocket = this.userSockets.get(userId);
      if (!userSocket || userSocket.readyState !== WebSocket.OPEN) return;
      
      const syncMessage: WebSocketMessage = {
        type: 'sync',
        data: {
          roomId,
          content: file.content || '',
          revision: room.documentRevision,
          users: Array.from(room.users.values())
        },
        timestamp: Date.now()
      };
      
      userSocket.send(JSON.stringify(syncMessage));
      
    } catch (error) {
      console.error('Error sending sync message:', error);
    }
  }
  
  /**
   * Broadcast message to all users in a room
   */
  private broadcastToRoom(roomId: string, message: WebSocketMessage, excludeUserId?: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    
    const messageStr = JSON.stringify(message);
    
    for (const [userId, userPresence] of room.users) {
      if (userId === excludeUserId) continue;
      
      const userSocket = this.userSockets.get(userId);
      if (userSocket && userSocket.readyState === WebSocket.OPEN) {
        userSocket.send(messageStr);
      }
    }
  }
  
  /**
   * Get room information
   */
  getRoom(roomId: string): CollaborationRoom | undefined {
    return this.rooms.get(roomId);
  }
  
  /**
   * Get all active rooms
   */
  getActiveRooms(): CollaborationRoom[] {
    return Array.from(this.rooms.values());
  }
  
  /**
   * Clean up inactive rooms
   */
  private cleanupInactiveRooms() {
    const now = Date.now();
    const INACTIVE_THRESHOLD = 30 * 60 * 1000; // 30 minutes
    
    for (const [roomId, room] of this.rooms) {
      if (now - room.lastActivity > INACTIVE_THRESHOLD || room.users.size === 0) {
        this.rooms.delete(roomId);
        console.log(`Cleaned up inactive room: ${roomId}`);
      }
    }
  }
  
  /**
   * Handle conflict resolution
   */
  async resolveConflict(
    operations: Operation[], 
    strategy: ConflictStrategy = ConflictStrategy.OPERATIONAL_TRANSFORM
  ): Promise<ConflictResolution> {
    switch (strategy) {
      case ConflictStrategy.OPERATIONAL_TRANSFORM:
        return this.resolveWithOT(operations);
      
      case ConflictStrategy.LAST_WRITE_WINS:
        return this.resolveWithLWW(operations);
      
      case ConflictStrategy.MERGE_CHANGES:
        return this.resolveWithMerge(operations);
      
      default:
        return this.resolveWithOT(operations);
    }
  }
  
  /**
   * Resolve conflicts using Operational Transformation
   */
  private async resolveWithOT(operations: Operation[]): Promise<ConflictResolution> {
    if (operations.length <= 1) {
      return {
        strategy: ConflictStrategy.OPERATIONAL_TRANSFORM,
        resolvedContent: '',
        mergedOperations: operations,
        conflictCount: 0
      };
    }
    
    try {
      // Transform operations sequentially
      let mergedOperations = [operations[0]];
      
      for (let i = 1; i < operations.length; i++) {
        const { transformedOp } = OperationalTransform.transform(
          operations[i], 
          mergedOperations[mergedOperations.length - 1]
        );
        mergedOperations.push(transformedOp);
      }
      
      return {
        strategy: ConflictStrategy.OPERATIONAL_TRANSFORM,
        resolvedContent: '', // Would be computed by applying all operations
        mergedOperations,
        conflictCount: operations.length - 1
      };
    } catch (error) {
      console.error('Error in OT resolution:', error);
      return {
        strategy: ConflictStrategy.OPERATIONAL_TRANSFORM,
        resolvedContent: '',
        mergedOperations: operations,
        conflictCount: operations.length > 1 ? operations.length - 1 : 0
      };
    }
  }
  
  /**
   * Resolve conflicts using Last Write Wins
   */
  private async resolveWithLWW(operations: Operation[]): Promise<ConflictResolution> {
    const latestOperation = operations.reduce((latest, current) => 
      current.timestamp > latest.timestamp ? current : latest
    );
    
    return {
      strategy: ConflictStrategy.LAST_WRITE_WINS,
      resolvedContent: '',
      mergedOperations: [latestOperation],
      conflictCount: operations.length - 1
    };
  }
  
  /**
   * Resolve conflicts by merging changes
   */
  private async resolveWithMerge(operations: Operation[]): Promise<ConflictResolution> {
    // Simplified merge strategy
    try {
      const composed = OperationalTransform.compose(operations);
      return {
        strategy: ConflictStrategy.MERGE_CHANGES,
        resolvedContent: '',
        mergedOperations: composed ? [composed] : [],
        conflictCount: operations.length > 1 ? operations.length - 1 : 0
      };
    } catch (error) {
      console.error('Error composing operations:', error);
      return {
        strategy: ConflictStrategy.MERGE_CHANGES,
        resolvedContent: '',
        mergedOperations: operations,
        conflictCount: operations.length > 1 ? operations.length - 1 : 0
      };
    }
  }
  
  /**
   * Get user presence in a room
   */
  getUserPresence(roomId: string, userId: string): UserPresence | undefined {
    const room = this.rooms.get(roomId);
    return room?.users.get(userId);
  }
  
  /**
   * Update user presence
   */
  updateUserPresence(roomId: string, userId: string, updates: Partial<UserPresence>) {
    const room = this.rooms.get(roomId);
    if (!room || !room.users.has(userId)) return;
    
    const userPresence = room.users.get(userId)!;
    Object.assign(userPresence, updates, { lastSeen: Date.now() });
    
    // Broadcast presence update
    this.broadcastToRoom(roomId, {
      type: 'presence',
      data: {
        roomId,
        user: userPresence,
        action: 'update'
      },
      userId,
      timestamp: Date.now()
    }, userId);
  }
}

// Singleton instance
export const collaborationService = new CollaborationService();