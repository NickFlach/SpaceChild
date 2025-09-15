/**
 * User Presence Component
 * 
 * Displays real-time user presence indicators and cursor positions
 */

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { UserPresence as UserPresenceType } from '@shared/collaboration';
import { Users, Eye, Edit3 } from 'lucide-react';

interface UserPresenceProps {
  users: UserPresenceType[];
  maxVisible?: number;
  showDetails?: boolean;
}

export function UserPresence({ users, maxVisible = 5, showDetails = true }: UserPresenceProps) {
  const activeUsers = users.filter(user => 
    Date.now() - user.lastSeen < 30000 // Active in last 30 seconds
  );
  
  const visibleUsers = activeUsers.slice(0, maxVisible);
  const hiddenCount = Math.max(0, activeUsers.length - maxVisible);
  
  if (activeUsers.length === 0) {
    return (
      <div className="flex items-center space-x-2 text-muted-foreground text-sm">
        <Users className="h-4 w-4" />
        <span>No active collaborators</span>
      </div>
    );
  }
  
  return (
    <div className="flex items-center space-x-2">
      {/* User Count Badge */}
      <div className="flex items-center space-x-1">
        <Users className="h-4 w-4 text-muted-foreground" />
        <Badge variant="secondary" className="text-xs">
          {activeUsers.length}
        </Badge>
      </div>
      
      {/* User Avatars */}
      <div className="flex -space-x-2">
        <TooltipProvider>
          {visibleUsers.map((user) => (
            <Tooltip key={user.userId}>
              <TooltipTrigger asChild>
                <div className="relative">
                  <Avatar 
                    className="h-8 w-8 border-2 border-background hover:z-10 transition-all duration-200"
                    style={{ borderColor: user.color }}
                  >
                    <AvatarImage 
                      src={`https://api.dicebear.com/6.x/initials/svg?seed=${user.username}&backgroundColor=${user.color.slice(1)}`} 
                      alt={user.username}
                    />
                    <AvatarFallback 
                      className="text-xs font-medium text-white"
                      style={{ backgroundColor: user.color }}
                    >
                      {(user.firstName?.[0] || user.username[0] || 'U').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Activity Indicators */}
                  {user.isTyping && (
                    <div 
                      className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-background flex items-center justify-center"
                      style={{ backgroundColor: user.color }}
                    >
                      <Edit3 className="h-2 w-2 text-white animate-pulse" />
                    </div>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <div className="space-y-1">
                  <div className="font-medium">
                    {user.firstName && user.lastName 
                      ? `${user.firstName} ${user.lastName}` 
                      : user.username}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    @{user.username}
                  </div>
                  {showDetails && (
                    <div className="text-xs space-y-1 pt-1 border-t">
                      <div>
                        Cursor: Line {user.cursorPosition.line}, Col {user.cursorPosition.column}
                      </div>
                      {user.isTyping && (
                        <div className="flex items-center space-x-1 text-orange-600 dark:text-orange-400">
                          <Edit3 className="h-3 w-3" />
                          <span>Typing...</span>
                        </div>
                      )}
                      <div className="text-muted-foreground">
                        Last seen: {new Date(user.lastSeen).toLocaleTimeString()}
                      </div>
                    </div>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
          
          {/* Hidden Users Count */}
          {hiddenCount > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium text-muted-foreground hover:z-10 transition-all duration-200">
                  +{hiddenCount}
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <div>
                  {hiddenCount} more collaborator{hiddenCount > 1 ? 's' : ''}
                </div>
              </TooltipContent>
            </Tooltip>
          )}
        </TooltipProvider>
      </div>
      
      {/* Connection Status */}
      <div className="flex items-center space-x-1">
        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-xs text-muted-foreground">Live</span>
      </div>
    </div>
  );
}

/**
 * Cursor Indicator Component
 * 
 * Shows other users' cursor positions in the editor
 */
interface CursorIndicatorProps {
  user: UserPresenceType;
  editorRect: DOMRect;
  lineHeight: number;
  characterWidth: number;
}

export function CursorIndicator({ 
  user, 
  editorRect, 
  lineHeight, 
  characterWidth 
}: CursorIndicatorProps) {
  const x = (user.cursorPosition.column - 1) * characterWidth;
  const y = (user.cursorPosition.line - 1) * lineHeight;
  
  const style = {
    position: 'absolute' as const,
    left: `${x}px`,
    top: `${y}px`,
    height: `${lineHeight}px`,
    width: '2px',
    backgroundColor: user.color,
    zIndex: 10,
    pointerEvents: 'none' as const,
    transform: 'translateX(-1px)',
  };
  
  return (
    <div className="relative">
      {/* Cursor Line */}
      <div style={style} className="animate-pulse" />
      
      {/* User Label */}
      <div 
        style={{
          position: 'absolute',
          left: `${x}px`,
          top: `${y - 24}px`,
          zIndex: 11,
          pointerEvents: 'none',
        }}
        className="flex items-center space-x-1"
      >
        <div 
          className="px-2 py-1 rounded text-xs font-medium text-white shadow-md"
          style={{ backgroundColor: user.color }}
        >
          {user.firstName || user.username}
        </div>
        {user.isTyping && (
          <div 
            className="px-1 py-1 rounded text-xs text-white shadow-md animate-pulse"
            style={{ backgroundColor: user.color }}
          >
            <Edit3 className="h-3 w-3" />
          </div>
        )}
      </div>
      
      {/* Selection Range */}
      {user.selection && (
        <div
          style={{
            position: 'absolute',
            left: `${(user.selection.start.column - 1) * characterWidth}px`,
            top: `${(user.selection.start.line - 1) * lineHeight}px`,
            width: `${
              user.selection.end.line === user.selection.start.line
                ? (user.selection.end.column - user.selection.start.column) * characterWidth
                : '100%'
            }px`,
            height: `${
              (user.selection.end.line - user.selection.start.line + 1) * lineHeight
            }px`,
            backgroundColor: `${user.color}20`,
            border: `1px solid ${user.color}40`,
            pointerEvents: 'none',
            zIndex: 5,
          }}
          className="rounded-sm"
        />
      )}
    </div>
  );
}

/**
 * Collaboration Status Component
 * 
 * Shows overall collaboration status
 */
interface CollaborationStatusProps {
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'reconnecting';
  userCount: number;
  currentRoom?: string | null;
}

export function CollaborationStatus({ 
  isConnected, 
  connectionStatus, 
  userCount,
  currentRoom 
}: CollaborationStatusProps) {
  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-500';
      case 'connecting': 
      case 'reconnecting': return 'bg-yellow-500 animate-pulse';
      case 'disconnected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };
  
  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return `Connected • ${userCount} user${userCount !== 1 ? 's' : ''}`;
      case 'connecting': return 'Connecting...';
      case 'reconnecting': return 'Reconnecting...';
      case 'disconnected': return 'Disconnected';
      default: return 'Unknown';
    }
  };
  
  return (
    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
      <div className={`h-2 w-2 rounded-full ${getStatusColor()}`} />
      <span>{getStatusText()}</span>
      {currentRoom && isConnected && (
        <Badge variant="outline" className="text-xs">
          Room: {currentRoom.split('_').pop()}
        </Badge>
      )}
    </div>
  );
}

export default UserPresence;