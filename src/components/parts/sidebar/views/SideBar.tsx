'use client';
import React from 'react';
import { useLayoutStore } from '@/stores/useLayoutStore';
import ExplorerPane from './ExplorerPane';
import SearchPane from './SearchPane';

export default function SideBar() {
  const { activeViewlet } = useLayoutStore();

  return (
    <div className="w-[260px] h-full bg-[var(--ide-bg-main)] flex flex-col border-r border-[var(--ide-border)] text-[var(--ide-text-muted)] font-mono">

      {/* Dynamic View Content */}
      <div className="flex-1 overflow-hidden">
        {activeViewlet === 'EXPLORER' && <ExplorerPane />}
        {activeViewlet === 'SEARCH' && <SearchPane />}

        {/* Placeholders for other views */}
        {activeViewlet === 'SCM' && (
          <div className="p-4 text-xs text-gray-500">Source Control: No git repository detected.</div>
        )}
        {activeViewlet === 'EXTENSIONS' && (
          <div className="p-4 text-xs text-gray-500">Extensions Marketplace (Coming Soon)</div>
        )}
      </div>

    </div>
  );
}