import React from 'react';

interface SimpleCodeBlockProps {
  code: string;
  language?: string;
  className?: string;
}

export function SimpleCodeBlock({ code, language = 'plaintext', className = '' }: SimpleCodeBlockProps) {
  // This is a simple code block without syntax highlighting
  // We can enhance this later with a more sophisticated solution if needed
  return (
    <pre className={`p-4 bg-gray-100 dark:bg-gray-800 rounded-md overflow-auto ${className}`}>
      <code className={`language-${language}`}>
        {code}
      </code>
    </pre>
  );
}
