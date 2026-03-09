'use client';
import React from 'react';
import { MoreHorizontal } from 'lucide-react';

export default function SearchView() {
  return (
    <div className="flex flex-col h-full">
      <div className="h-[35px] flex items-center justify-between px-4 text-[11px] font-bold uppercase tracking-wide text-[#bbbbbb]">
        <span>Search</span>
        <MoreHorizontal size={16} className="cursor-pointer hover:text-white" />
      </div>

      <div className="px-4 mt-2">
         <div className="relative mb-2">
            <input className="w-full bg-[#3c3c3c] border border-transparent focus:border-[#007acc] text-white text-xs px-2 py-1.5 outline-none" placeholder="Search" />
         </div>
         <div className="relative">
            <input className="w-full bg-[#3c3c3c] border border-transparent focus:border-[#007acc] text-white text-xs px-2 py-1.5 outline-none" placeholder="Replace" />
         </div>
      </div>
    </div>
  );
}