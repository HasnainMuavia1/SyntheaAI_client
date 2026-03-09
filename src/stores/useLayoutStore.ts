import { create } from 'zustand';

// ───────────────────────────────────────────────────────────────
// Types
// ───────────────────────────────────────────────────────────────
export type ThemeType = 'dark' | 'light';
export type ActivityView = 'EXPLORER' | 'SEARCH' | 'SCM' | 'DEBUG' | 'EXTENSIONS';

// ───────────────────────────────────────────────────────────────
// Theme Store (kept for backward compat)
// ───────────────────────────────────────────────────────────────
interface ThemeState {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'dark',
  setTheme: (theme) => set({ theme }),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
}));

// ───────────────────────────────────────────────────────────────
// Layout Store
// ───────────────────────────────────────────────────────────────
interface LayoutState {
  // Activity Bar / Sidebar
  activeViewlet: ActivityView;
  setActiveViewlet: (viewlet: ActivityView) => void;

  // Legacy view key (used by some components)
  activeView: string;
  setActiveView: (view: string) => void;

  // Sidebar visibility
  sidebarVisible: boolean;
  toggleSidebar: () => void;

  // Bottom Panel visibility
  panelVisible: boolean;
  togglePanel: () => void;

  // Right Auxiliary Bar visibility (AI agent panel)
  auxiliaryBarVisible: boolean;
  toggleAuxiliaryBar: () => void;

  // Command Palette
  commandPaletteVisible: boolean;
  setCommandPaletteVisible: (visible: boolean) => void;
}

export const useLayoutStore = create<LayoutState>((set) => ({
  activeViewlet: 'EXPLORER',
  setActiveViewlet: (viewlet) => set({ activeViewlet: viewlet }),

  activeView: 'workbench.view.explorer',
  setActiveView: (view) => set({ activeView: view }),

  sidebarVisible: true,
  toggleSidebar: () => set((state) => ({ sidebarVisible: !state.sidebarVisible })),

  panelVisible: false,
  togglePanel: () => set((state) => ({ panelVisible: !state.panelVisible })),

  auxiliaryBarVisible: true,
  toggleAuxiliaryBar: () => set((state) => ({ auxiliaryBarVisible: !state.auxiliaryBarVisible })),

  commandPaletteVisible: false,
  setCommandPaletteVisible: (visible) => set({ commandPaletteVisible: visible }),
}));
