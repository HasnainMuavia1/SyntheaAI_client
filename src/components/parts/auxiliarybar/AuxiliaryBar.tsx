'use client';
import React from 'react';
import { MoreHorizontal, X } from 'lucide-react';
import { useLayoutStore } from '@/stores/useLayoutStore';
// Import your existing feature
import AgentPanel from '@/features/agent/components/AgentPanel';

export default function AuxiliaryBar() {
   const { toggleAuxiliaryBar } = useLayoutStore();

   return (
      <div className="w-[300px] h-full bg-[var(--ide-bg-main)] border-l border-[var(--ide-border)] flex flex-col">

         {/* Header */}
         <div className="h-[40px] min-h-[40px] flex items-center justify-between px-4 text-[10px] font-mono tracking-widest text-[var(--ide-text-muted)] uppercase select-none bg-[var(--ide-bg-main)] border-b border-[var(--ide-border)]">
            <span>Synthea AI</span>
            <div className="flex gap-2">
               <MoreHorizontal size={14} className="cursor-pointer hover:text-[var(--ide-text-main)] transition-colors" />
               <X size={14} className="cursor-pointer hover:text-[var(--ide-text-main)] transition-colors" onClick={toggleAuxiliaryBar} />
            </div>
         </div>

         {/* Content */}
         <div className="flex-1 overflow-hidden relative">
            <AgentPanel />
         </div>
      </div>
   );
}