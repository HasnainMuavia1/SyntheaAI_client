'use client';
import React from 'react';
import { Split, Bell, X, Check, Radio } from 'lucide-react';
import { useLayoutStore } from '@/stores/useLayoutStore';

export default function StatusBar() {
    const { togglePanel } = useLayoutStore();

    return (
        <div className="h-[22px] flex items-center px-3 justify-between z-50 text-[var(--ide-text-muted)] text-[11px] font-mono bg-[var(--ide-bg-main)] border-t border-[var(--ide-border)] select-none cursor-default">

            {/* Left Side */}
            <div className="flex items-center gap-3 h-full">
                <div className="flex items-center gap-1 hover:bg-[var(--ide-bg-active)] px-2 h-full cursor-pointer transition-colors">
                    <Split size={12} /> <span>main*</span>
                </div>
                <div className="flex items-center gap-1 hover:bg-[var(--ide-bg-active)] px-2 h-full cursor-pointer transition-colors">
                    <Radio size={12} className="animate-pulse text-emerald-500" /> <span>0 errors</span>
                </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-4 h-full">
                <div
                    className="hover:bg-[var(--ide-bg-active)] px-2 h-full cursor-pointer flex items-center gap-2 transition-colors"
                    onClick={togglePanel}
                >
                    <span>Ln 12, Col 4</span>
                </div>
                <div className="hover:bg-[var(--ide-bg-active)] px-2 h-full cursor-pointer transition-colors flex items-center">
                    UTF-8
                </div>
                <div className="hover:bg-[var(--ide-bg-active)] px-2 h-full cursor-pointer transition-colors flex items-center">
                    TypeScript React
                </div>
                <div className="hover:bg-[var(--ide-bg-active)] px-2 h-full cursor-pointer transition-colors flex items-center">
                    <Bell size={12} />
                </div>
            </div>
        </div>
    );
}