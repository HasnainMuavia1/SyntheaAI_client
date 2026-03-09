import { create } from 'zustand';

interface EditorState {
  isGuest: boolean;
  projectId: string | null;
  activeFile: string | null;
  editorTheme: string;

  setGuestMode: (isGuest: boolean) => void;
  setProjectId: (id: string) => void;
  setActiveFile: (fileName: string) => void;
  setEditorTheme: (theme: string) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  isGuest: false,
  projectId: null,
  activeFile: 'script.ts', // Default file
  editorTheme: 'synthea-default', // Default theme

  setGuestMode: (isGuest) => set({ isGuest }),
  setProjectId: (projectId) => set({ projectId }),
  setActiveFile: (activeFile) => set({ activeFile }),
  setEditorTheme: (editorTheme) => set({ editorTheme }),
}));