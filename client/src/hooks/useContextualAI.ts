import { useState, useEffect, useCallback } from "react";
import { useEditorContext } from "@/contexts/EditorContext";
import { debounce } from "lodash";

export interface AIContextSuggestion {
  id: string;
  type: "optimization" | "error" | "style" | "security" | "best-practice";
  severity: "low" | "medium" | "high";
  message: string;
  line?: number;
  fix?: string;
  timestamp: Date;
}

export function useContextualAI() {
  const [suggestions, setSuggestions] = useState<AIContextSuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const editorContext = useEditorContext();

  // Debounced analysis function to avoid too frequent calls
  const analyzeCode = useCallback(
    debounce(async (content: string, language: string, fileName: string) => {
      if (!content.trim()) {
        setSuggestions([]);
        return;
      }

      setIsAnalyzing(true);
      
      try {
        const newSuggestions: AIContextSuggestion[] = [];
        
        // JavaScript/TypeScript analysis
        if (language === 'typescript' || language === 'javascript') {
          const lines = content.split('\n');
          
          lines.forEach((line, index) => {
            const trimmedLine = line.trim();
            
            // Check for console.log
            if (trimmedLine.includes('console.log')) {
              newSuggestions.push({
                id: `console-${index}`,
                type: "best-practice",
                severity: "low",
                message: "Consider removing console.log statement before production",
                line: index + 1,
                timestamp: new Date()
              });
            }
            
            // Check for var usage
            if (trimmedLine.includes('var ')) {
              newSuggestions.push({
                id: `var-${index}`,
                type: "style",
                severity: "medium",
                message: "Consider using 'const' or 'let' instead of 'var'",
                line: index + 1,
                fix: trimmedLine.replace('var ', 'const '),
                timestamp: new Date()
              });
            }
            
            // Check for == instead of ===
            if (trimmedLine.includes('==') && !trimmedLine.includes('===')) {
              newSuggestions.push({
                id: `equality-${index}`,
                type: "best-practice",
                severity: "medium",
                message: "Use strict equality (===) instead of loose equality (==)",
                line: index + 1,
                timestamp: new Date()
              });
            }
          });
          
          // Check for React-specific patterns
          if (content.includes('useState') && !content.includes('useCallback')) {
            newSuggestions.push({
              id: "react-callback",
              type: "optimization",
              severity: "low",
              message: "Consider using useCallback to memoize function references",
              timestamp: new Date()
            });
          }
          
          if (content.includes('useEffect') && content.includes('[]')) {
            newSuggestions.push({
              id: "react-effect",
              type: "best-practice",
              severity: "low",
              message: "Empty dependency array - ensure this effect should only run once",
              timestamp: new Date()
            });
          }
        }
        
        // CSS analysis
        if (language === 'css') {
          if (content.includes('!important')) {
            newSuggestions.push({
              id: "css-important",
              type: "style",
              severity: "medium",
              message: "Avoid !important declarations when possible",
              timestamp: new Date()
            });
          }
        }
        
        // General security checks
        if (content.includes('eval(')) {
          newSuggestions.push({
            id: "security-eval",
            type: "security",
            severity: "high",
            message: "Avoid using eval() as it can be a security risk",
            timestamp: new Date()
          });
        }
        
        // File size check
        const lineCount = content.split('\n').length;
        if (lineCount > 200) {
          newSuggestions.push({
            id: "file-size",
            type: "best-practice",
            severity: "low",
            message: `Large file (${lineCount} lines). Consider breaking into smaller modules.`,
            timestamp: new Date()
          });
        }
        
        setSuggestions(newSuggestions);
      } catch (error) {
        console.error('Failed to analyze code:', error);
      } finally {
        setIsAnalyzing(false);
      }
    }, 1000), // Debounce for 1 second
    []
  );

  // Trigger analysis when editor content changes
  useEffect(() => {
    if (editorContext.currentFile && editorContext.fileContent) {
      analyzeCode(
        editorContext.fileContent,
        editorContext.getFileLanguage(),
        editorContext.currentFile.filePath
      );
    } else {
      setSuggestions([]);
    }
  }, [editorContext.fileContent, editorContext.currentFile, editorContext.getFileLanguage, analyzeCode]);

  const dismissSuggestion = useCallback((id: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== id));
  }, []);

  const applySuggestionFix = useCallback((suggestion: AIContextSuggestion) => {
    if (suggestion.fix && suggestion.line && editorContext.currentFile) {
      const lines = editorContext.fileContent.split('\n');
      lines[suggestion.line - 1] = suggestion.fix;
      editorContext.updateFileContent(lines.join('\n'));
      dismissSuggestion(suggestion.id);
    }
  }, [editorContext, dismissSuggestion]);

  return {
    suggestions,
    isAnalyzing,
    dismissSuggestion,
    applySuggestionFix,
    hasHighSeverity: suggestions.some(s => s.severity === 'high'),
    hasMediumSeverity: suggestions.some(s => s.severity === 'medium'),
    suggestionCount: suggestions.length,
  };
}