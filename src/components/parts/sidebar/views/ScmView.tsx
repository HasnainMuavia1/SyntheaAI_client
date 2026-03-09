'use client';
import React from 'react';
import { MoreHorizontal, Check, RefreshCw } from 'lucide-react';

export default function ScmView() {
  return (
    <div className="flex flex-col h-full">
       <div className="h-[35px] flex items-center justify-between px-4 text-[11px] font-bold uppercase tracking-wide text-[#bbbbbb]">
        <span>Source Control</span>
        <div className="flex gap-2">
           <Check size={16} className="cursor-pointer hover:text-white" />
           <RefreshCw size={14} className="cursor-pointer hover:text-white" />
           <MoreHorizontal size={16} className="cursor-pointer hover:text-white" />
        </div>
      </div>
      <div className="p-4 text-xs text-gray-400 text-center">
         No changes to commit.
      </div>
    </div>
  );
}