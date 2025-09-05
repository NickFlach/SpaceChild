import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { ProjectFile, Project } from "@shared/schema";

export interface CursorPosition {
  line: number;
  column: number;
}

export interface Selection {
  start: CursorPosition;
  end: CursorPosition;
  text: string;
}

export interface EditorContextData {
  // Current file and project state
  currentFile: ProjectFile | null;
  currentProject: Project | null;
  fileContent: string;
  isDirty: boolean;
  
  // Cursor and selection state
  cursorPosition: CursorPosition;
  selection: Selection | null;
  
  // Editor actions
  setCurrentFile: (file: ProjectFile | null) => void;
  setCurrentProject: (project: Project | null) => void;
  updateFileContent: (content: string) => void;
  setCursorPosition: (position: CursorPosition) => void;
  setSelection: (selection: Selection | null) => void;
  setDirty: (dirty: boolean) => void;
  
  // Context analysis
  getFileLanguage: () => string;
  getSelectedText: () => string;
  getCurrentLine: () => string;
  getFileContext: () => EditorFileContext;
}

export interface EditorFileContext {
  file: ProjectFile | null;
  project: Project | null;
  content: string;
  language: string;
  cursorPosition: CursorPosition;
  selection: Selection | null;
  currentLine: string;
  selectedText: string;
  isDirty: boolean;
  lineCount: number;
  characterCount: number;
}

const EditorContext = createContext<EditorContextData | null>(null);

export function EditorContextProvider({ children }: { children: React.ReactNode }) {
  const [currentFile, setCurrentFile] = useState<ProjectFile | null>(null);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [fileContent, setFileContent] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [cursorPosition, setCursorPosition] = useState<CursorPosition>({ line: 1, column: 1 });
  const [selection, setSelection] = useState<Selection | null>(null);

  // Update file content and notify context change
  const updateFileContent = useCallback((content: string) => {
    setFileContent(content);
    setIsDirty(currentFile?.content !== content);
  }, [currentFile?.content]);

  // Set dirty state
  const setDirty = useCallback((dirty: boolean) => {
    setIsDirty(dirty);
  }, []);

  // Get file language based on extension
  const getFileLanguage = useCallback(() => {
    if (!currentFile) return "text";
    const ext = currentFile.filePath.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'tsx': return 'typescript';
      case 'ts': return 'typescript';
      case 'jsx': return 'javascript';
      case 'js': return 'javascript';
      case 'css': return 'css';
      case 'scss': return 'scss';
      case 'json': return 'json';
      case 'md': return 'markdown';
      case 'html': return 'html';
      case 'py': return 'python';
      case 'java': return 'java';
      case 'cpp':
      case 'cc':
      case 'cxx': return 'cpp';
      case 'c': return 'c';
      case 'rs': return 'rust';
      case 'go': return 'go';
      case 'php': return 'php';
      case 'rb': return 'ruby';
      case 'sql': return 'sql';
      case 'yaml':
      case 'yml': return 'yaml';
      case 'xml': return 'xml';
      default: return 'text';
    }
  }, [currentFile]);

  // Get currently selected text
  const getSelectedText = useCallback(() => {
    return selection?.text || "";
  }, [selection]);

  // Get current line text
  const getCurrentLine = useCallback(() => {
    const lines = fileContent.split('\n');
    const lineIndex = cursorPosition.line - 1;
    return lines[lineIndex] || "";
  }, [fileContent, cursorPosition.line]);

  // Get complete file context for AI tools
  const getFileContext = useCallback((): EditorFileContext => {
    const lines = fileContent.split('\n');
    return {
      file: currentFile,
      project: currentProject,
      content: fileContent,
      language: getFileLanguage(),
      cursorPosition,
      selection,
      currentLine: getCurrentLine(),
      selectedText: getSelectedText(),
      isDirty,
      lineCount: lines.length,
      characterCount: fileContent.length,
    };
  }, [
    currentFile,
    currentProject,
    fileContent,
    getFileLanguage,
    cursorPosition,
    selection,
    getCurrentLine,
    getSelectedText,
    isDirty,
  ]);

  // Reset state when file changes
  useEffect(() => {
    if (currentFile) {
      setFileContent(currentFile.content || "");
      setIsDirty(false);
      setCursorPosition({ line: 1, column: 1 });
      setSelection(null);
    } else {
      setFileContent("");
      setIsDirty(false);
      setCursorPosition({ line: 1, column: 1 });
      setSelection(null);
    }
  }, [currentFile]);

  const contextValue: EditorContextData = {
    // State
    currentFile,
    currentProject,
    fileContent,
    isDirty,
    cursorPosition,
    selection,
    
    // Actions
    setCurrentFile,
    setCurrentProject,
    updateFileContent,
    setCursorPosition,
    setSelection,
    setDirty,
    
    // Utilities
    getFileLanguage,
    getSelectedText,
    getCurrentLine,
    getFileContext,
  };

  return (
    <EditorContext.Provider value={contextValue}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditorContext() {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error("useEditorContext must be used within an EditorContextProvider");
  }
  return context;
}

// Hook for AI tools to subscribe to editor context changes
export function useEditorContextSubscription(callback: (context: EditorFileContext) => void) {
  const editorContext = useEditorContext();
  
  useEffect(() => {
    callback(editorContext.getFileContext());
  }, [
    editorContext.currentFile,
    editorContext.fileContent,
    editorContext.cursorPosition,
    editorContext.selection,
    editorContext.isDirty,
    callback,
  ]);
  
  return editorContext.getFileContext();
}