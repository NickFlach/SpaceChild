/**
 * Operational Transformation (OT) Implementation for Real-time Collaborative Editing
 * 
 * This module implements conflict-free collaborative editing using operational transformation.
 * Operations are transformed to handle concurrent edits while maintaining document consistency.
 */

export interface TextOperation {
  type: 'retain' | 'insert' | 'delete';
  characters?: number; // For retain and delete operations
  text?: string; // For insert operations
}

export interface Operation {
  id: string;
  authorId: string;
  fileId: number;
  revision: number;
  operations: TextOperation[];
  timestamp: number;
}

export interface TransformResult {
  transformedOp: Operation;
  transformedBase: Operation;
}

/**
 * Core Operational Transformation Functions
 */
export class OperationalTransform {
  
  /**
   * Apply a sequence of text operations to a string
   */
  static applyOperations(text: string, operations: TextOperation[]): string {
    let result = text;
    let offset = 0;
    
    for (const op of operations) {
      switch (op.type) {
        case 'retain':
          offset += op.characters || 0;
          break;
          
        case 'insert':
          if (op.text) {
            result = result.slice(0, offset) + op.text + result.slice(offset);
            offset += op.text.length;
          }
          break;
          
        case 'delete':
          const deleteCount = op.characters || 0;
          result = result.slice(0, offset) + result.slice(offset + deleteCount);
          break;
      }
    }
    
    return result;
  }
  
  /**
   * Transform two concurrent operations to resolve conflicts
   * 
   * @param opA First operation
   * @param opB Second operation (concurrent with opA)
   * @returns Transformed operations that can be applied sequentially
   */
  static transform(opA: Operation, opB: Operation): TransformResult {
    if (opA.revision !== opB.revision) {
      throw new Error('Operations must be at the same revision to transform');
    }
    
    const [transformedA, transformedB] = this.transformOperationLists(
      opA.operations, 
      opB.operations
    );
    
    return {
      transformedOp: {
        ...opA,
        operations: transformedA,
        revision: opA.revision + 1
      },
      transformedBase: {
        ...opB,
        operations: transformedB,
        revision: opB.revision + 1
      }
    };
  }
  
  /**
   * Transform two lists of text operations
   */
  private static transformOperationLists(
    opsA: TextOperation[], 
    opsB: TextOperation[]
  ): [TextOperation[], TextOperation[]] {
    const transformedA: TextOperation[] = [];
    const transformedB: TextOperation[] = [];
    
    let i = 0, j = 0;
    let offsetA = 0, offsetB = 0;
    
    while (i < opsA.length || j < opsB.length) {
      const opA = opsA[i];
      const opB = opsB[j];
      
      if (!opA) {
        // Only operations from B remain
        transformedB.push({ ...opB });
        j++;
        continue;
      }
      
      if (!opB) {
        // Only operations from A remain
        transformedA.push({ ...opA });
        i++;
        continue;
      }
      
      const [newOpA, newOpB, advanceA, advanceB] = this.transformPair(opA, opB);
      
      if (newOpA) transformedA.push(newOpA);
      if (newOpB) transformedB.push(newOpB);
      
      if (advanceA) i++;
      if (advanceB) j++;
    }
    
    return [transformedA, transformedB];
  }
  
  /**
   * Transform a pair of concurrent operations
   */
  private static transformPair(
    opA: TextOperation, 
    opB: TextOperation
  ): [TextOperation | null, TextOperation | null, boolean, boolean] {
    
    // Retain vs Retain
    if (opA.type === 'retain' && opB.type === 'retain') {
      const minChars = Math.min(opA.characters || 0, opB.characters || 0);
      return [
        { type: 'retain', characters: minChars },
        { type: 'retain', characters: minChars },
        opA.characters === minChars,
        opB.characters === minChars
      ];
    }
    
    // Insert vs Insert (concurrent inserts at same position)
    if (opA.type === 'insert' && opB.type === 'insert') {
      // Author priority based on ID to ensure deterministic ordering
      if (opA.text && opB.text) {
        return [
          { type: 'insert', text: opA.text },
          { type: 'retain', characters: opA.text.length },
          true,
          false
        ];
      }
    }
    
    // Insert vs Retain
    if (opA.type === 'insert' && opB.type === 'retain') {
      return [
        { type: 'insert', text: opA.text },
        { type: 'retain', characters: (opA.text?.length || 0) + (opB.characters || 0) },
        true,
        true
      ];
    }
    
    // Retain vs Insert
    if (opA.type === 'retain' && opB.type === 'insert') {
      return [
        { type: 'retain', characters: (opA.characters || 0) + (opB.text?.length || 0) },
        { type: 'insert', text: opB.text },
        true,
        true
      ];
    }
    
    // Insert vs Delete
    if (opA.type === 'insert' && opB.type === 'delete') {
      return [
        { type: 'insert', text: opA.text },
        null,
        true,
        false
      ];
    }
    
    // Delete vs Insert
    if (opA.type === 'delete' && opB.type === 'insert') {
      return [
        null,
        { type: 'insert', text: opB.text },
        false,
        true
      ];
    }
    
    // Delete vs Retain
    if (opA.type === 'delete' && opB.type === 'retain') {
      const minChars = Math.min(opA.characters || 0, opB.characters || 0);
      return [
        { type: 'delete', characters: minChars },
        null,
        opA.characters === minChars,
        opB.characters === minChars
      ];
    }
    
    // Retain vs Delete
    if (opA.type === 'retain' && opB.type === 'delete') {
      const minChars = Math.min(opA.characters || 0, opB.characters || 0);
      return [
        null,
        { type: 'delete', characters: minChars },
        opA.characters === minChars,
        opB.characters === minChars
      ];
    }
    
    // Delete vs Delete
    if (opA.type === 'delete' && opB.type === 'delete') {
      const minChars = Math.min(opA.characters || 0, opB.characters || 0);
      return [
        null,
        null,
        opA.characters === minChars,
        opB.characters === minChars
      ];
    }
    
    // Fallback
    return [opA, opB, true, true];
  }
  
  /**
   * Create operations from text differences
   */
  static createOperationsFromDiff(oldText: string, newText: string, authorId: string, fileId: number, revision: number): Operation {
    const operations: TextOperation[] = [];
    
    // Simple diff algorithm - can be enhanced with Myers' diff algorithm
    let i = 0;
    let j = 0;
    
    while (i < oldText.length || j < newText.length) {
      if (i < oldText.length && j < newText.length && oldText[i] === newText[j]) {
        // Characters match, retain
        let retainCount = 0;
        while (i < oldText.length && j < newText.length && oldText[i] === newText[j]) {
          retainCount++;
          i++;
          j++;
        }
        operations.push({ type: 'retain', characters: retainCount });
      } else if (j < newText.length) {
        // Character inserted
        let insertText = '';
        while (j < newText.length && (i >= oldText.length || oldText[i] !== newText[j])) {
          insertText += newText[j];
          j++;
        }
        operations.push({ type: 'insert', text: insertText });
      } else if (i < oldText.length) {
        // Character deleted
        let deleteCount = 0;
        while (i < oldText.length && (j >= newText.length || oldText[i] !== newText[j])) {
          deleteCount++;
          i++;
        }
        operations.push({ type: 'delete', characters: deleteCount });
      }
    }
    
    return {
      id: `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      authorId,
      fileId,
      revision,
      operations,
      timestamp: Date.now()
    };
  }
  
  /**
   * Compose multiple operations into a single operation
   */
  static compose(operations: Operation[]): Operation | null {
    if (operations.length === 0) return null;
    if (operations.length === 1) return operations[0];
    
    const baseOp = operations[0];
    let composedOps = baseOp.operations;
    
    for (let i = 1; i < operations.length; i++) {
      composedOps = this.composeOperationLists(composedOps, operations[i].operations);
    }
    
    return {
      ...baseOp,
      operations: composedOps,
      timestamp: Math.max(...operations.map(op => op.timestamp))
    };
  }
  
  /**
   * Compose two operation lists
   */
  private static composeOperationLists(opsA: TextOperation[], opsB: TextOperation[]): TextOperation[] {
    const result: TextOperation[] = [];
    let i = 0, j = 0;
    
    while (i < opsA.length || j < opsB.length) {
      const opA = opsA[i];
      const opB = opsB[j];
      
      if (!opA) {
        result.push({ ...opB });
        j++;
        continue;
      }
      
      if (!opB) {
        result.push({ ...opA });
        i++;
        continue;
      }
      
      // Compose operations based on types
      if (opA.type === 'retain' && opB.type === 'retain') {
        const minChars = Math.min(opA.characters || 0, opB.characters || 0);
        result.push({ type: 'retain', characters: minChars });
        
        if (opA.characters === minChars) i++;
        if (opB.characters === minChars) j++;
      } else if (opA.type === 'insert') {
        result.push({ ...opA });
        i++;
      } else if (opB.type === 'delete') {
        result.push({ ...opB });
        j++;
      } else {
        // More complex composition cases
        result.push({ ...opA });
        i++;
      }
    }
    
    return result;
  }
  
  /**
   * Invert an operation (for undo functionality)
   */
  static invert(operation: Operation, baseText: string): Operation {
    const invertedOps: TextOperation[] = [];
    let offset = 0;
    
    for (const op of operation.operations) {
      switch (op.type) {
        case 'retain':
          invertedOps.push({ ...op });
          offset += op.characters || 0;
          break;
          
        case 'insert':
          invertedOps.push({ 
            type: 'delete', 
            characters: op.text?.length || 0 
          });
          break;
          
        case 'delete':
          const deletedText = baseText.slice(offset, offset + (op.characters || 0));
          invertedOps.push({ 
            type: 'insert', 
            text: deletedText 
          });
          offset += op.characters || 0;
          break;
      }
    }
    
    return {
      ...operation,
      operations: invertedOps,
      timestamp: Date.now()
    };
  }
}

/**
 * Utility functions for cursor position transformation
 */
export class CursorTransform {
  
  /**
   * Transform cursor position based on an operation
   */
  static transformCursor(cursorPos: number, operation: Operation, isOwnOperation: boolean): number {
    if (isOwnOperation) return cursorPos;
    
    let newPos = cursorPos;
    let offset = 0;
    
    for (const op of operation.operations) {
      switch (op.type) {
        case 'retain':
          offset += op.characters || 0;
          break;
          
        case 'insert':
          if (offset <= cursorPos) {
            newPos += op.text?.length || 0;
          }
          offset += op.text?.length || 0;
          break;
          
        case 'delete':
          if (offset <= cursorPos) {
            newPos -= Math.min(op.characters || 0, cursorPos - offset);
          }
          break;
      }
    }
    
    return Math.max(0, newPos);
  }
  
  /**
   * Transform selection range based on an operation
   */
  static transformSelection(
    start: number, 
    end: number, 
    operation: Operation, 
    isOwnOperation: boolean
  ): { start: number; end: number } {
    if (isOwnOperation) return { start, end };
    
    return {
      start: this.transformCursor(start, operation, false),
      end: this.transformCursor(end, operation, false)
    };
  }
}