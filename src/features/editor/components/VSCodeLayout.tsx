'use client';
import React, { useEffect, useRef, useState } from 'react';
import {
  Files, Search, GitGraph, Play, Settings,
  Split, Bell, UserCircle, ChevronDown, ChevronRight, MoreHorizontal, Code2, X, Bot, FileCode, FileJson, Hash, FileText
} from 'lucide-react';
import { VscNewFile, VscNewFolder, VscRefresh, VscCollapseAll, VscFolder } from 'react-icons/vsc';
import { useEditorStore } from '@/features/editor/stores/useEditorStore';
import { useEditor } from '@/context/EditorContext';
import { getLanguageIcon } from '@/utils/getLanguageIcon';

// --- FIXED IMPORT PATHS ---
import TitleBar from '@/components/parts/titlebar/TitleBar';
import AgentPanel from '@/features/agent/components/AgentPanel';
import dynamic from 'next/dynamic';

const TerminalPanel = dynamic(() => import('./TerminalPanel'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-[#0a0a0a] border-t border-[#27272a] flex items-center justify-center text-xs text-[#52525b] uppercase font-mono">Terminal Loading...</div>
});

const SIDEBAR_MIN = 180;
const SIDEBAR_MAX = 480;
const SIDEBAR_DEFAULT = 256;
const PANEL_MIN = 220;
const PANEL_MAX = 560;
const PANEL_DEFAULT = 320;
const TERMINAL_MIN = 100;
const TERMINAL_MAX = 600;
const TERMINAL_DEFAULT = 240;

type ViewMode = 'EXPLORER' | 'SEARCH' | 'SCM' | 'DEBUG' | 'EXTENSIONS';

interface VSCodeLayoutProps {
  children: React.ReactNode;
  fileTree: React.ReactNode;
  panel: React.ReactNode;
  fileName: string;
}

export default function VSCodeLayout({ children, fileTree, panel, fileName }: VSCodeLayoutProps) {
  const { isGuest, editorTheme, setEditorTheme } = useEditorStore();
  const { projectName, activeFileId, files, createFile, createFolder, uploadFile } = useEditor();
  const [activeView, setActiveView] = useState<ViewMode>('EXPLORER');
  const [userName, setUserName] = useState('User');
  const [showTerminal, setShowTerminal] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_DEFAULT);
  const [panelWidth, setPanelWidth] = useState(PANEL_DEFAULT);
  const [resizingSidebar, setResizingSidebar] = useState(false);
  const [resizingPanel, setResizingPanel] = useState(false);
  const [resizingTerminal, setResizingTerminal] = useState(false);
  const [terminalHeight, setTerminalHeight] = useState(TERMINAL_DEFAULT);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const rootInputRef = useRef<HTMLInputElement>(null);
  const [isProjectExpanded, setIsProjectExpanded] = useState(true);
  const [isCreatingRoot, setIsCreatingRoot] = useState<'file' | 'folder' | null>(null);
  const [newRootName, setNewRootName] = useState('');
  const [isLiveServerRunning, setIsLiveServerRunning] = useState(false);
  const pendingCommandRef = useRef<string | null>(null);

  // Focus the input when creating starts
  useEffect(() => {
    if (isCreatingRoot) {
      setTimeout(() => rootInputRef.current?.focus(), 50);
    }
  }, [isCreatingRoot]);

  // Apply Global Theme to body attribute
  useEffect(() => {
    if (editorTheme) {
      document.body.setAttribute('data-theme', editorTheme);
    } else {
      document.body.setAttribute('data-theme', 'synthea-default');
    }
  }, [editorTheme]);

  const submitRootCreate = () => {
    if (newRootName.trim()) {
      const finalName = (isCreatingRoot === 'file' && !newRootName.includes('.')) ? `${newRootName.trim()}.txt` : newRootName.trim();
      if (isCreatingRoot === 'file') createFile(finalName);
      else createFolder(finalName);
    }
    setIsCreatingRoot(null);
    setNewRootName('');
  };

  const handleRootKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') submitRootCreate();
    else if (e.key === 'Escape') setIsCreatingRoot(null);
  };

  useEffect(() => {
    const onMouseUp = () => {
      setResizingSidebar(false);
      setResizingPanel(false);
      setResizingTerminal(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    document.addEventListener('mouseup', onMouseUp);
    return () => document.removeEventListener('mouseup', onMouseUp);
  }, []);

  useEffect(() => {
    if (!resizingSidebar) return;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    const onMouseMove = (e: MouseEvent) => {
      const newW = Math.min(SIDEBAR_MAX, Math.max(SIDEBAR_MIN, e.clientX - 48));
      setSidebarWidth(newW);
    };
    document.addEventListener('mousemove', onMouseMove);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [resizingSidebar]);

  useEffect(() => {
    if (!resizingPanel) return;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    const onMouseMove = (e: MouseEvent) => {
      const newW = Math.min(PANEL_MAX, Math.max(PANEL_MIN, window.innerWidth - e.clientX));
      setPanelWidth(newW);
    };
    document.addEventListener('mousemove', onMouseMove);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [resizingPanel]);

  useEffect(() => {
    if (!resizingTerminal) return;
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
    const onMouseMove = (e: MouseEvent) => {
      const newH = Math.min(TERMINAL_MAX, Math.max(TERMINAL_MIN, window.innerHeight - e.clientY - 22));
      setTerminalHeight(newH);
    };
    document.addEventListener('mousemove', onMouseMove);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [resizingTerminal]);

  useEffect(() => {
    if (isGuest) setUserName('Guest');
    else setUserName(localStorage.getItem('user_name') || 'Dev');
  }, [isGuest]);

  // Global Wake Word Listener
  useEffect(() => {
    if (typeof window === 'undefined' || !('webkitSpeechRecognition' in window)) return;

    let isSpeaking = false;
    let keepAlive = true;
    const SpeechRecognition = (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    const playBeep = () => {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.15); // short beep
      } catch (e) { }
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        interimTranscript += event.results[i][0].transcript;
      }

      const text = interimTranscript.toLowerCase();
      if (text.includes('wake up') || text.includes('wakeup') || text.includes('synthea') || text.includes('cynthia')) {
        if (!isSpeaking) {
          isSpeaking = true;
          setShowRightPanel(true);

          playBeep();

          try { recognition.stop(); } catch (e) { }

          // Notify Agent Panel to show state
          window.dispatchEvent(new CustomEvent('wake-word-activated'));

          const utterance = new SpeechSynthesisUtterance("How can I help you?");
          utterance.onend = () => {
            window.dispatchEvent(new CustomEvent('agent-start-listening'));
            // 5 second cooldown before global listener starts trying to detect wake word again
            setTimeout(() => {
              isSpeaking = false;
              if (keepAlive) {
                try { recognition.start(); } catch (e) { }
              }
            }, 5000);
          };
          window.speechSynthesis.speak(utterance);
        }
      }
    };

    recognition.onend = () => {
      if (keepAlive && !isSpeaking) {
        setTimeout(() => {
          try { recognition.start(); } catch (e) { }
        }, 1000);
      }
    };

    // Auto-start listening on mount
    try { recognition.start(); } catch (e) { }

    return () => {
      keepAlive = false;
      try { recognition.stop(); } catch (e) { }
    };
  }, []);

  // Auto-open terminal when play button fires a run command
  useEffect(() => {
    const handleRunRequest = (event: Event) => {
      const command = (event as CustomEvent)?.detail?.command as string | undefined;
      if (!command) return;

      if (!showTerminal) {
        // Terminal not mounted yet — open it and re-dispatch after WS connects
        pendingCommandRef.current = command;
        setShowTerminal(true);
      }
      // If terminal already open the event bubbles directly to TerminalPanel
    };

    window.addEventListener('synthea-run-command', handleRunRequest);
    return () => window.removeEventListener('synthea-run-command', handleRunRequest);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showTerminal]);

  // Once terminal has just opened with a pending command, re-dispatch after WS connects
  useEffect(() => {
    if (!showTerminal || !pendingCommandRef.current) return;
    const cmd = pendingCommandRef.current;
    pendingCommandRef.current = null;
    const timer = setTimeout(() => {
      window.dispatchEvent(new CustomEvent('synthea-run-command', { detail: { command: cmd } }));
    }, 1500); // give WS time to connect
    return () => clearTimeout(timer);
  }, [showTerminal]);

  const toggleLiveServer = () => {
    if (isLiveServerRunning) {
      window.dispatchEvent(new CustomEvent('synthea-terminal-kill'));
      setIsLiveServerRunning(false);
    } else {
      window.dispatchEvent(new CustomEvent('synthea-run-command', { detail: { command: 'python -m http.server 5500' } }));
      setIsLiveServerRunning(true);
      setTimeout(() => window.open('http://localhost:5500', '_blank'), 1500); // Wait a bit for server to start
    }
  };

  const getFile = (id: string, nodes: any[] = files): any => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = getFile(id, node.children);
        if (found) return found;
      }
    }
    return null;
  };

  const activeFileNode = activeFileId ? getFile(activeFileId) : null;
  const trueFileName = activeFileNode ? activeFileNode.name : (activeFileId ? activeFileId.split('/').pop() || 'Untitled' : 'Untitled');

  const getLanguageDetails = (name: string) => {
    if (!name || name === 'Untitled') return { text: 'Plain Text', icon: getLanguageIcon('txt', 12) };
    const ext = name.split('.').pop()?.toLowerCase();

    // We can just rely on getLanguageIcon for the icon, we just need the text here
    const icon = <div className="flex items-center justify-center opacity-90">{getLanguageIcon(name, 12)}</div>;

    switch (ext) {
      case 'ts':
      case 'tsx':
        return { text: 'TypeScript', icon };
      case 'js':
      case 'jsx':
        return { text: 'JavaScript', icon };
      case 'py':
        return { text: 'Python', icon };
      case 'cpp':
      case 'c':
      case 'h':
      case 'hpp':
        return { text: 'C++', icon };
      case 'html':
        return { text: 'HTML', icon };
      case 'css':
        return { text: 'CSS', icon };
      case 'json':
        return { text: 'JSON', icon };
      case 'md':
        return { text: 'Markdown', icon };
      case 'sh':
      case 'bash':
        return { text: 'Shell', icon };
      default:
        return { text: 'Plain Text', icon };
    }
  };

  const activeSpaceLang = getLanguageDetails(trueFileName);

  const renderSidebarContent = () => {
    switch (activeView) {
      case 'EXPLORER':
        return (
          <>
            <div
              className="group flex items-center gap-1 px-2 py-1.5 font-mono font-bold text-[10px] uppercase tracking-widest hover:bg-white/5 cursor-pointer text-[var(--ide-text-muted)] hover:text-[var(--ide-text-main)] transition-colors border-b border-[var(--ide-border)]"
              onClick={() => setIsProjectExpanded(!isProjectExpanded)}
            >
              {isProjectExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              <span className="truncate flex-1">{isGuest ? 'GUEST-PROJECT' : (projectName ? projectName.toUpperCase() : 'MY-PROJECT')}</span>

              {/* Root actions: only on hover, aligned with project row */}
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 ml-auto pr-1">
                <button
                  type="button"
                  title="New File"
                  className="p-1 rounded hover:bg-white/10 hover:text-white transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsProjectExpanded(true);
                    setIsCreatingRoot('file');
                    setNewRootName('');
                  }}
                >
                  <VscNewFile size={14} />
                </button>
                <button
                  type="button"
                  title="New Folder"
                  className="p-1 rounded hover:bg-white/10 hover:text-white transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsProjectExpanded(true);
                    setIsCreatingRoot('folder');
                    setNewRootName('');
                  }}
                >
                  <VscNewFolder size={14} />
                </button>
                <button
                  type="button"
                  title="Refresh Explorer"
                  className="p-1 rounded hover:bg-white/10 hover:text-white transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Just a visual refresh or re-fetch logic if needed
                  }}
                >
                  <VscRefresh size={14} />
                </button>
                <button
                  type="button"
                  title="Collapse All"
                  className="p-1 rounded hover:bg-white/10 hover:text-white transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsProjectExpanded(false);
                  }}
                >
                  <VscCollapseAll size={14} />
                </button>
                <input
                  ref={uploadInputRef}
                  type="file"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      await uploadFile(file);
                    } finally {
                      e.target.value = '';
                    }
                  }}
                />
              </div>
            </div>
            {isProjectExpanded && (
              <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
                {isCreatingRoot && (
                  <div className="flex items-center gap-1 py-1.5 px-2">
                    <span className="opacity-70 w-3 flex justify-center"></span>
                    {isCreatingRoot === 'folder' ? <VscFolder size={14} className="text-blue-400 flex-shrink-0" /> : <div className="flex-shrink-0 scale-75 origin-center">{getLanguageIcon(newRootName || 'file', 14)}</div>}
                    <input
                      ref={rootInputRef}
                      type="text"
                      className="bg-[#3c3c3c] text-white text-[11px] px-1 py-0.5 outline-none border border-[#007acc] w-full ml-1"
                      value={newRootName}
                      onChange={(e) => setNewRootName(e.target.value)}
                      onKeyDown={handleRootKeyDown}
                      onBlur={submitRootCreate}
                      placeholder={isCreatingRoot === 'file' ? "New file (e.g. main.py)" : "New folder"}
                    />
                  </div>
                )}
                {fileTree}
              </div>
            )}
          </>
        );
      case 'SEARCH':
        return (
          <div className="p-4">
            <div className="text-xs font-bold mb-2 uppercase text-[var(--ide-text-muted)]">Search</div>
            <input type="text" placeholder="Search" className="w-full bg-transparent border border-[var(--ide-border)] focus:border-white/40 text-[var(--ide-text-main)] text-[12px] font-mono px-2 py-1 outline-none mb-2" />
            <div className="text-xs text-[var(--ide-text-muted)] mt-4 text-center">No results found</div>
          </div>
        );
      default:
        return <div className="p-4 text-xs text-gray-500">View not implemented yet.</div>;
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[var(--ide-bg-main)] text-[var(--ide-text-muted)] overflow-hidden font-mono select-none text-[12px]">

      <TitleBar title={trueFileName} onToggleAgent={() => setShowRightPanel((prev) => !prev)} />

      <div className="flex-1 flex overflow-hidden">

        {/* Activity Bar */}
        <div className="w-10 flex flex-col items-center py-2 justify-between z-20 bg-[var(--ide-bg-main)] border-r border-[var(--ide-border)]">
          <div className="flex flex-col gap-2">
            <ActivityIcon
              icon={<Files size={20} />}
              active={activeView === 'EXPLORER' && showSidebar}
              onClick={() => {
                if (activeView === 'EXPLORER') setShowSidebar(!showSidebar);
                else { setActiveView('EXPLORER'); setShowSidebar(true); }
              }}
              title="Explorer"
            />
            <ActivityIcon
              icon={<Search size={20} />}
              active={activeView === 'SEARCH' && showSidebar}
              onClick={() => {
                if (activeView === 'SEARCH') setShowSidebar(!showSidebar);
                else { setActiveView('SEARCH'); setShowSidebar(true); }
              }}
              title="Search"
            />
            <ActivityIcon
              icon={<Code2 size={20} />}
              active={showTerminal}
              onClick={() => setShowTerminal(!showTerminal)}
              title="Toggle Terminal"
            />
            <ActivityIcon
              icon={<Bot size={20} />}
              active={showRightPanel}
              onClick={() => setShowRightPanel(!showRightPanel)}
              title="Toggle AI Agent"
            />
          </div>
          <div className="flex flex-col gap-4 mb-2 relative">
            <ActivityIcon icon={<UserCircle size={20} />} title={userName} />
            <ActivityIcon icon={<Settings size={20} />} title="Manage Themes" onClick={() => setShowThemeMenu(!showThemeMenu)} />

            {/* Theme Dropdown */}
            {showThemeMenu && (
              <div className="absolute left-10 bottom-0 bg-[var(--ide-bg-hover)] border border-[var(--ide-border)] shadow-2xl rounded rounded-bl-none z-50 w-48 text-[11px] overflow-hidden flex flex-col">
                <div className="px-3 py-2 text-[var(--ide-text-muted)] font-bold uppercase tracking-wider border-b border-[var(--ide-border)] bg-[var(--ide-bg-panel)]">
                  Color Themes
                </div>
                {[
                  { id: 'synthea-default', label: 'Synthea Default' },
                  { id: 'monaco-red', label: 'Monaco Red' },
                  { id: 'monaco-purple', label: 'Monaco Purple' },
                  { id: 'monaco-green', label: 'Monaco Green' },
                  { id: 'monaco-bluish', label: 'Monaco Bluish' },
                  { id: 'greenhacker', label: 'Terminal Hacker' },
                ].map((th) => (
                  <div
                    key={th.id}
                    className={`px-3 py-2 cursor-pointer hover:bg-[var(--ide-bg-active)] flex items-center justify-between ${editorTheme === th.id ? 'text-[var(--ide-text-main)] bg-[var(--ide-bg-active)]/50' : 'text-[var(--ide-text-muted)]'}`}
                    onClick={() => {
                      setEditorTheme(th.id);
                      setShowThemeMenu(false);
                    }}
                  >
                    {th.label}
                    {editorTheme === th.id && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar (resizable) */}
        {showSidebar && (
          <>
            <div
              className="flex flex-col bg-[var(--ide-bg-main)] border-r border-[var(--ide-border)] shrink-0"
              style={{ width: sidebarWidth }}
            >
              <div className="h-10 px-4 flex items-center text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--ide-text-muted)] border-b border-[var(--ide-border)]">
                {activeView}
                <MoreHorizontal size={14} className="ml-auto opacity-0 group-hover:opacity-100 cursor-pointer" />
              </div>
              {renderSidebarContent()}
            </div>
            <div
              className="w-1 shrink-0 cursor-col-resize hover:bg-blue-500/50 transition-colors group flex items-stretch"
              onMouseDown={() => setResizingSidebar(true)}
              aria-label="Resize sidebar"
            >
              <div className="w-0.5 group-hover:w-1 bg-transparent group-hover:bg-blue-500/80 transition-all mx-auto" />
            </div>
          </>
        )}

        {/* Main Workspace */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden bg-[var(--ide-bg-main)]">
          {/* Editor Area */}
          <div className="flex-1 relative overflow-hidden min-h-0">
            {children}
          </div>

          {/* Terminal Area */}
          {showTerminal && (
            <>
              <div
                className="h-1 shrink-0 cursor-row-resize hover:bg-blue-500/50 transition-colors group flex items-stretch z-20"
                onMouseDown={() => setResizingTerminal(true)}
                aria-label="Resize terminal"
              >
                <div className="h-0.5 w-full group-hover:h-1 bg-transparent group-hover:bg-blue-500/80 transition-all my-auto" />
              </div>
              <div
                className="shrink-0 shadow-2xl z-10 relative overflow-hidden bg-[var(--ide-bg-main)]"
                style={{ height: terminalHeight }}
              >
                <TerminalPanel onClose={() => setShowTerminal(false)} />
              </div>
            </>
          )}
        </div>

        {/* Right Panel (resizable) */}
        {showRightPanel && (
          <>
            <div
              className="w-1 shrink-0 cursor-col-resize hover:bg-blue-500/50 transition-colors group flex items-stretch"
              onMouseDown={() => setResizingPanel(true)}
              aria-label="Resize agent panel"
            >
              <div className="w-0.5 group-hover:w-1 bg-transparent group-hover:bg-blue-500/80 transition-all mx-auto" />
            </div>
            <div
              className="flex flex-col border-l border-[var(--ide-border)] bg-[var(--ide-bg-main)] shrink-0 min-w-0"
              style={{ width: panelWidth }}
            >
              <div className="flex-1 overflow-hidden bg-[var(--ide-bg-main)] min-h-0">
                <AgentPanel onClose={() => setShowRightPanel(false)} />
              </div>
            </div>
          </>
        )}

      </div>

      {/* Status Bar */}
      <div className={`h-[22px] flex items-center px-3 text-[10px] justify-between z-50 text-[var(--ide-text-main)] bg-[var(--ide-bg-active)] border-t border-[var(--ide-border)]`}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 hover:bg-[#ffffff20] px-2 h-full cursor-pointer">
            <Split size={12} /> {isGuest ? 'Guest Mode' : 'main*'}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {activeSpaceLang.text === 'HTML' && (
            <div
              onClick={toggleLiveServer}
              className={`px-2 h-full cursor-pointer flex items-center gap-1.5 font-bold transition-colors ${isLiveServerRunning ? 'text-red-400 hover:bg-red-900/30' : 'text-green-400 hover:bg-green-900/30'
                }`}
            >
              {isLiveServerRunning ? 'Port: 5500 (Kill)' : 'Go Live'}
            </div>
          )}
          <div className="hover:bg-[#ffffff20] px-2 h-full cursor-pointer flex items-center gap-1.5">
            {activeSpaceLang.icon}
            <span>{activeSpaceLang.text}</span>
          </div>
          <div className="hover:bg-[#ffffff20] px-2 h-full cursor-pointer"><Bell size={12} /></div>
        </div>
      </div>
    </div>
  );
}

function ActivityIcon({ icon, active, title, onClick }: { icon: any, active?: boolean, title?: string, onClick?: () => void }) {
  return (
    <div
      title={title}
      onClick={onClick}
      className={`
        p-2 cursor-pointer relative group flex justify-center w-full
        ${active ? 'text-[var(--ide-text-main)]' : 'text-[var(--ide-text-muted)] hover:text-[var(--ide-text-main)]'}
      `}
    >
      {active && <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--ide-text-main)]" />}
      {icon}
    </div>
  )
}