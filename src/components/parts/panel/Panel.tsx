'use client';
import React from 'react';
import { X, Plus, Trash2, ChevronUp, MoreHorizontal } from 'lucide-react';
import { useLayoutStore } from '@/stores/useLayoutStore';

export default function PanelPart() {
  const { togglePanel } = useLayoutStore();

  return (
    <div className="h-full w-full bg-[var(--ide-bg-main)] flex flex-col border-t border-[var(--ide-border)]">

      {/* Panel Toolbar */}
      <div className="flex items-center px-4 min-h-[35px] gap-6 text-[11px] font-bold tracking-wide border-b border-[var(--ide-border)] select-none uppercase text-[var(--ide-text-muted)]">
        <div className="cursor-pointer border-b border-[var(--ide-text-main)] text-[var(--ide-text-main)] pb-1 h-full flex items-center">Terminal</div>
        <div className="cursor-pointer hover:text-[var(--ide-text-main)] pb-1 h-full flex items-center">Output</div>
        <div className="cursor-pointer hover:text-[var(--ide-text-main)] pb-1 h-full flex items-center">Debug Console</div>
        <div className="cursor-pointer hover:text-[var(--ide-text-main)] pb-1 h-full flex items-center">Problems</div>

        <div className="ml-auto flex items-center gap-3 text-[var(--ide-text-muted)]">
          <Plus size={14} className="cursor-pointer hover:text-[var(--ide-text-main)]" />
          <Trash2 size={14} className="cursor-pointer hover:text-[var(--ide-text-main)]" />
          <ChevronUp size={14} className="cursor-pointer hover:text-[var(--ide-text-main)]" onClick={togglePanel} />
          <X size={14} className="cursor-pointer hover:text-[var(--ide-text-main)]" onClick={togglePanel} />
        </div>
      </div>

      {/* Terminal Body */}
      <div className="flex-1 p-3 font-mono text-sm overflow-y-auto custom-scrollbar text-[var(--ide-text-main)] bg-[var(--ide-bg-main)]">
        <div className="opacity-70 mb-2">Synthea Code Environment [Version 1.0.0]</div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-green-500 font-bold">➜</span>
            <span className="text-cyan-400 font-bold">~/project</span>
            <span className="text-[#e8b024] font-bold">git:(main)</span>
            <span>npm run dev</span>
          </div>

          <div className="text-gray-400 pl-4">
            <div>&gt; voice-code-workspace@0.1.0 dev</div>
            <div>&gt; next dev</div>
            <div className="mt-2 text-green-400">ready - started server on 0.0.0.0:3000, url: http://localhost:3000</div>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <span className="text-green-500 font-bold">➜</span>
            <span className="text-cyan-400 font-bold">~/project</span>
            <span className="text-[#e8b024] font-bold">git:(main)</span>
            <span className="w-2 h-4 bg-gray-500 animate-pulse block"></span>
          </div>
        </div>
      </div>
    </div>
  );
}