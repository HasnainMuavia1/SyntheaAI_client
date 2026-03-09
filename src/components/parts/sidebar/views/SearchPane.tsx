'use client';
import React from 'react';
import { ChevronRight, MoreHorizontal } from 'lucide-react';

export default function SearchPane() {
  return (
    <div className="flex flex-col h-full text-[var(--ide-text-main)]">
      <div className="h-[35px] min-h-[35px] flex items-center justify-between px-4 text-[11px] font-bold uppercase tracking-wide text-[var(--ide-text-muted)] select-none">
        <span>Search</span>
        <MoreHorizontal size={16} className="cursor-pointer hover:text-[var(--ide-text-main)] transition-colors" />
      </div>

      <div className="px-4 py-2">
        <div className="relative">
          <input
            type="text"
            placeholder="Search"
            className="w-full bg-[var(--ide-bg-active)] border border-[var(--ide-border)] focus:border-[var(--ide-border-hover)] text-[var(--ide-text-main)] text-sm px-2 py-1 outline-none placeholder-[var(--ide-text-muted)]"
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center text-[var(--ide-text-muted)] p-4 text-xs">
        <p>No results found.</p>
      </div>
    </div>
  );
}