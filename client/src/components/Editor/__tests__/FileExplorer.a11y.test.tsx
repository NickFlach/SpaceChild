import { render, screen } from '@testing-library/react';
import React from 'react';
import FileExplorer from '../FileExplorer';

// Minimal stubs for required types
const noopAsync = async () => {};

describe('FileExplorer accessibility', () => {
  it('renders action buttons with aria-labels', () => {
    render(
      <FileExplorer
        files={[]}
        selectedFile={null}
        onSelectFile={() => {}}
        onCreateFile={async () => {}}
        currentProject={{ id: 1 } as any}
        onDeleteFile={noopAsync}
        onRenameFile={noopAsync}
        onCreateFolder={noopAsync}
        onDeleteFolder={noopAsync}
        onRenameFolder={noopAsync}
      />
    );

    // Buttons added with aria-labels
    expect(screen.getByLabelText('Reveal selected file in tree')).toBeInTheDocument();
    expect(screen.getByLabelText('Collapse all folders')).toBeInTheDocument();
    expect(screen.getByLabelText('Upload files or zip archives')).toBeInTheDocument();
    expect(screen.getByLabelText('Upload a folder')).toBeInTheDocument();
    const githubBtn = screen.getByLabelText(/GitHub/i);
    expect(githubBtn).toBeInTheDocument();
    expect(screen.getByLabelText('Help and shortcuts')).toBeInTheDocument();
  });
});
