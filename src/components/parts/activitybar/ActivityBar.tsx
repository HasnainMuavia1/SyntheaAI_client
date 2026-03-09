'use client';
import React from 'react';
import { Files, Search, GitGraph, Play, LayoutGrid, Settings, UserCircle } from 'lucide-react';
import { useLayoutStore, ActivityView } from '@/stores/useLayoutStore';

export default function ActivityBar() {
  const { activeViewlet, setActiveViewlet } = useLayoutStore();

  const actions = [
    { id: 'EXPLORER', icon: <Files size={24} /> },
    { id: 'SEARCH', icon: <Search size={24} /> },
    { id: 'SCM', icon: <GitGraph size={24} /> },
    { id: 'DEBUG', icon: <Play size={24} /> },
    { id: 'EXTENSIONS', icon: <LayoutGrid size={24} /> },
  ];

  return (
    <div className="w-[48px] flex flex-col justify-between bg-[var(--ide-bg-main)] text-[var(--ide-text-muted)] border-r border-[var(--ide-border)] z-50">
      {/* Top Actions */}
      <div className="flex flex-col">
        {actions.map((item) => (
          <div
            key={item.id}
            onClick={() => setActiveViewlet(item.id as ActivityView)}
            className={`
              h-[48px] flex items-center justify-center cursor-pointer relative transition-colors
              ${activeViewlet === item.id ? 'text-[var(--ide-text-main)]' : 'text-gray-500 hover:text-[var(--ide-text-main)]'}
            `}
          >
            {/* Active Border Indicator */}
            {activeViewlet === item.id && (
              <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--ide-text-main)]" />
            )}
            {item.icon}
          </div>
        ))}
      </div>

      {/* Bottom Actions (Settings/Account) */}
      <div className="flex flex-col pb-2 text-gray-500">
        <div className="h-[48px] flex items-center justify-center hover:text-[var(--ide-text-main)] transition-colors cursor-pointer">
          <UserCircle size={24} />
        </div>
        <div className="h-[48px] flex items-center justify-center hover:text-[var(--ide-text-main)] transition-colors cursor-pointer">
          <Settings size={24} />
        </div>
      </div>
    </div>
  );
}