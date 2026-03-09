'use client';
import React from 'react';
import { useLayoutStore } from '@/stores/useLayoutStore';
import ExplorerView from './views/ExplorerView';
import SearchView from './views/SearchView';
import ScmView from './views/ScmView';

export default function SideBar() {
  const { activeView } = useLayoutStore();

  return (
    <div className="w-[260px] h-full bg-[#0a0a0a] border-r border-[#27272a] flex flex-col text-[#a1a1aa] font-mono">
      <div className="flex-1 overflow-hidden">
        {activeView === 'workbench.view.explorer' && <ExplorerView />}
        {activeView === 'workbench.view.search' && <SearchView />}
        {activeView === 'workbench.view.scm' && <ScmView />}

        {/* Fallback for other views */}
        {(activeView === 'workbench.view.extensions' || activeView === 'workbench.view.debug') && (
          <div className="p-5 text-xs text-gray-400">View not implemented yet.</div>
        )}
      </div>
    </div>
  );
}