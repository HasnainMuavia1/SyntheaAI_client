'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useLayoutStore } from '@/stores/useLayoutStore';
import { Search, ChevronRight } from 'lucide-react';
import { useThemeStore } from '@/stores/useThemeStore';

export default function CommandPalette() {
  const {
    commandPaletteVisible,
    setCommandPaletteVisible,
    toggleSidebar,
    togglePanel,
    toggleAuxiliaryBar,
    setActiveView
  } = useLayoutStore();

  const { toggleTheme } = useThemeStore();
  const [query, setQuery] = useState('>');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Define available commands
  const commands = [
    { id: 'workbench.action.showCommands', label: 'Show All Commands', shortcut: 'Ctrl+Shift+P', action: () => { } },
    { id: 'workbench.action.toggleSidebarVisibility', label: 'View: Toggle Primary Side Bar Visibility', shortcut: 'Ctrl+B', action: toggleSidebar },
    { id: 'workbench.action.togglePanel', label: 'View: Toggle Panel', shortcut: 'Ctrl+J', action: togglePanel },
    { id: 'workbench.action.toggleAuxiliaryBar', label: 'View: Toggle Secondary Side Bar Visibility', shortcut: '', action: toggleAuxiliaryBar },
    { id: 'workbench.view.explorer', label: 'View: Show Explorer', shortcut: 'Ctrl+Shift+E', action: () => setActiveView('workbench.view.explorer') },
    { id: 'workbench.view.search', label: 'View: Show Search', shortcut: 'Ctrl+Shift+F', action: () => setActiveView('workbench.view.search') },
    { id: 'workbench.view.scm', label: 'View: Show Source Control', shortcut: 'Ctrl+Shift+G', action: () => setActiveView('workbench.view.scm') },
    { id: 'editor.action.formatDocument', label: 'Format Document', shortcut: 'Shift+Alt+F', action: () => console.log('Format') },
    { id: 'workbench.action.toggleTheme', label: 'Preferences: Toggle Light/Dark Theme', shortcut: 'F2', action: toggleTheme },
  ];

  // Filter commands based on input
  const filteredCommands = commands.filter(cmd =>
    cmd.label.toLowerCase().includes(query.replace('>', '').trim().toLowerCase())
  );

  // Focus input when opened
  useEffect(() => {
    if (commandPaletteVisible) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('>');
      setSelectedIndex(0);
    }
  }, [commandPaletteVisible]);

  // Handle Keyboard Navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      e.preventDefault();
    } else if (e.key === 'Enter') {
      executeCommand(filteredCommands[selectedIndex]);
      e.preventDefault();
    } else if (e.key === 'Escape') {
      setCommandPaletteVisible(false);
    }
  };

  const executeCommand = (cmd: any) => {
    if (cmd) {
      cmd.action();
      setCommandPaletteVisible(false);
    }
  };

  if (!commandPaletteVisible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex justify-center pt-1"
      onClick={(e) => { if (e.target === e.currentTarget) setCommandPaletteVisible(false); }}
    >
      <div className="w-[600px] max-w-[90%] bg-[#0a0a0a] shadow-2xl overflow-hidden border border-[#27272a] flex flex-col max-h-[400px] text-[#a1a1aa] animate-in fade-in zoom-in-95 duration-100">

        {/* Input Area */}
        <div className="p-2 border-b border-[#27272a]">
          <div className="bg-transparent border border-[#27272a] flex items-center px-2">
            <ChevronRight size={14} className="text-[#cccccc] mr-1" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent border-none outline-none text-[12px] py-1.5 text-white placeholder-[#52525b] font-mono"
              placeholder="Type a command..."
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar py-1">
          {filteredCommands.length === 0 ? (
            <div className="px-4 py-2 text-sm text-gray-500">No matching commands</div>
          ) : (
            filteredCommands.map((cmd, index) => (
              <div
                key={cmd.id}
                onClick={() => executeCommand(cmd)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`px-3 py-1.5 flex items-center justify-between cursor-pointer text-[12px] font-mono ${index === selectedIndex ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-[#a1a1aa]'}`}
              >
                <span className="font-medium">{cmd.label}</span>
                {cmd.shortcut && <span className="text-xs opacity-60 ml-4">{cmd.shortcut}</span>}
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}