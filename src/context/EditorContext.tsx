import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';

// Types
export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  content?: string;
}

interface EditorContextType {
  files: FileNode[];
  activeFileId: string | null;
  code: string;
  projectName: string;
  projectId: string;
  setFiles: (files: FileNode[]) => void;
  setActiveFileId: (id: string | null) => void;
  setCode: (code: string) => void;
  createFile: (name: string, content?: string, parentId?: string) => void;
  createFolder: (name: string, parentId?: string) => void;
  renameNode: (id: string, newName: string) => void;
  deleteNode: (id: string) => void;
  saveFile: (path: string, content: string) => Promise<void>;
  closeFile: (id: string) => void;
  openFiles: string[];
  // NEW: Upload function
  uploadFile: (file: File) => Promise<void>;
  fetchWorkspace: () => Promise<void>;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

const STORAGE_KEY = 'voicecode_workspace_v1';

export function EditorProvider({ children, projectId }: { children: ReactNode, projectId: string }) {
  const [files, setFiles] = useState<FileNode[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [projectName, setProjectName] = useState('');
  const [openFiles, setOpenFiles] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from Backend API
  const fetchWorkspace = useCallback(async () => {
    if (!projectId) return;
    try {
      const data = await apiClient.ide.listFiles(projectId);
      if (data && data.files) {
        setFiles(data.files);
      }
      if (data && data.projectName) {
        setProjectName(data.projectName);
      }
    } catch (e) {
      console.error("Failed to load workspace:", e);
    } finally {
      setIsLoaded(true);
    }
  }, [projectId]);

  useEffect(() => {
    fetchWorkspace();
  }, [fetchWorkspace]);

  // Load File Content when activeFileId changes
  useEffect(() => {
    const loadFileContent = async () => {
      if (!activeFileId) {
        setCode('');
        return;
      }
      try {
        const data = await apiClient.ide.readFile(projectId, activeFileId);
        setCode(data.content || '');
      } catch (e) {
        console.error("Failed to read file source:", e);
      }
    };
    loadFileContent();
  }, [activeFileId, projectId]);

  // --- ACTIONS ---

  const createFile = async (name: string, content: string = '', parentId?: string) => {
    const filePath = parentId ? `${parentId}/${name}` : name;
    try {
      await apiClient.ide.writeFile(projectId, filePath, content, false);
      await fetchWorkspace();
      setActiveFileId(filePath);
    } catch (e) {
      console.error("Create file failed:", e);
    }
  };

  const handleSetActiveFile = useCallback((id: string | null) => {
    setActiveFileId(id);
    if (id && !openFiles.includes(id)) {
      setOpenFiles(prev => [...prev, id]);
    }
  }, [openFiles]);

  const closeFile = (id: string) => {
    setOpenFiles(prev => {
      const newOpen = prev.filter(f => f !== id);
      if (activeFileId === id) {
        setActiveFileId(newOpen.length > 0 ? newOpen[newOpen.length - 1] : null);
      }
      return newOpen;
    });
  };

  const saveFile = async (path: string, content: string) => {
    try {
      if (!projectId) return;
      await apiClient.ide.writeFile(projectId, path, content, false);
    } catch (e) {
      console.error("Save file failed:", e);
    }
  };

  const createFolder = async (name: string, parentId?: string) => {
    const folderPath = parentId ? `${parentId}/${name}` : name;
    try {
      await apiClient.ide.writeFile(projectId, folderPath, '', true);
      await fetchWorkspace();
    } catch (e) {
      console.error("Create folder failed:", e);
    }
  };

  // NEW: Upload File Logic
  const uploadFile = async (file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const content = e.target?.result as string;
        // Add uploaded file to root (you can expand this to support folders later)
        createFile(file.name, content);
        resolve();
      };

      reader.onerror = (e) => reject(e);
      reader.readAsText(file); // Reads code as text
    });
  };

  const deleteNode = async (id: string) => {
    try {
      await apiClient.ide.deleteFile(projectId, id);
      if (activeFileId === id || activeFileId?.startsWith(id + '/')) {
        setActiveFileId(null);
      }
      await fetchWorkspace();
    } catch (e) {
      console.error("Delete failed:", e);
    }
  };

  const renameNode = async (id: string, newName: string) => {
    if (!newName.trim()) return;
    const parentPath = id.substring(0, id.lastIndexOf('/'));
    const newPath = parentPath ? `${parentPath}/${newName}` : newName;

    try {
      await apiClient.ide.renameFile(projectId, id, newPath);
      if (activeFileId === id) setActiveFileId(newPath);
      await fetchWorkspace();
    } catch (e) {
      console.error("Rename failed:", e);
    }
  };

  // --- HELPERS ---
  const addChildToNode = (nodes: FileNode[], parentId: string, child: FileNode): FileNode[] => {
    return nodes.map(node => {
      if (node.id === parentId && node.type === 'folder') {
        return { ...node, children: [...(node.children || []), child] };
      }
      if (node.children) {
        return { ...node, children: addChildToNode(node.children, parentId, child) };
      }
      return node;
    });
  };

  const deleteNodeRecursive = (nodes: FileNode[], id: string): FileNode[] => {
    return nodes
      .filter(node => node.id !== id)
      .map(node => ({
        ...node,
        children: node.children ? deleteNodeRecursive(node.children, id) : undefined
      }));
  };

  const updateNodeRecursive = (nodes: FileNode[], id: string, transform: (n: FileNode) => FileNode): FileNode[] => {
    return nodes.map(node => {
      if (node.id === id) return transform(node);
      if (node.children) return { ...node, children: updateNodeRecursive(node.children, id, transform) };
      return node;
    });
  };

  if (!isLoaded) return null;

  return (
    <EditorContext.Provider value={{
      files, activeFileId, code, projectName, projectId, openFiles,
      setFiles, setActiveFileId: handleSetActiveFile, setCode,
      createFile, createFolder, renameNode, deleteNode, uploadFile, saveFile, fetchWorkspace, closeFile
    }}>
      {children}
    </EditorContext.Provider>
  );
}

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (!context) throw new Error('useEditor must be used within EditorProvider');
  return context;
};