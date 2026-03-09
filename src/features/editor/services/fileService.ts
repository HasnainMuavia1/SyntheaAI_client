// src/features/editor/services/fileService.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  content?: string;
  path: string;
}

export const fileService = {
  /**
   * Fetches the file tree for a specific project.
   */
  getProjectFiles: async (projectId: string): Promise<FileNode[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/files`);
      if (!response.ok) throw new Error('Failed to fetch project files');
      return await response.json();
    } catch (error) {
      console.error('FileService Error:', error);
      throw error;
    }
  },

  /**
   * Lazy loads file content when a user opens a file.
   */
  getFileContent: async (filePath: string): Promise<string> => {
    try {
      const response = await fetch(`${API_BASE_URL}/files/content?path=${encodeURIComponent(filePath)}`);
      if (!response.ok) throw new Error('Failed to fetch file content');
      const data = await response.json();
      return data.content;
    } catch (error) {
      console.error(`Error reading ${filePath}:`, error);
      return ''; // Fail gracefully with empty content
    }
  },

  /**
   * Saves file content to disk (Docker volume).
   */
  saveFile: async (filePath: string, content: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/files/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: filePath, content })
      });
      if (!response.ok) throw new Error('Failed to save file');
    } catch (error) {
      console.error(`Error saving ${filePath}:`, error);
      throw error;
    }
  },

  /**
   * Creates a new file or directory.
   */
  createFile: async (path: string, type: 'file' | 'folder'): Promise<FileNode> => {
    const response = await fetch(`${API_BASE_URL}/files/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path, type })
    });
    
    if (!response.ok) throw new Error(`Failed to create ${type}`);
    return await response.json();
  }
};