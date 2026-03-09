'use client';
import React from 'react';
import { Sparkles } from 'lucide-react';

export default function TitleBar({ title, onToggleAgent }: { title: string; onToggleAgent?: () => void }) {
  return (
    <div className="h-[30px] w-full bg-[var(--ide-bg-main)] flex items-center justify-between select-none border-b border-[var(--ide-border)]">
      {/* Left — Synthea brand */}
      <div className="flex items-center gap-2 px-3 h-full">
        <div className="flex items-center justify-center text-blue-500">
          <Sparkles size={14} />
        </div>
        <span className="text-[11px] font-semibold tracking-widest uppercase text-[var(--ide-text-muted)]">
          Synthea
        </span>
      </div>

      {/* Centre — workspace · project */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-gray-500 pointer-events-none">
        <span>synthea-workspace</span>
        <span className="text-gray-600">·</span>
        <span className="text-[var(--ide-text-muted)] font-medium">{title || 'untitled'}</span>
      </div>

      {/* Right — toggle AI panel */}
      {onToggleAgent && (
        <div
          className="flex items-center gap-1.5 px-3 h-full cursor-pointer text-gray-500 hover:text-blue-400 transition-colors border-l border-[var(--ide-border)] group"
          onClick={onToggleAgent}
          title="Toggle AI Agent"
        >
          <Sparkles size={13} className="group-hover:drop-shadow-[0_0_5px_rgba(96,165,250,0.8)] transition-all" />
          <span className="text-[10px] font-mono uppercase tracking-widest hidden sm:block">AI</span>
        </div>
      )}
    </div>
  );
}