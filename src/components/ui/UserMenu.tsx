'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Settings, Moon, Sun, Monitor, User as UserIcon, CreditCard, Plus, Activity, Cpu } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useUser } from '@/context/UserContext';

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useUser();

  // Fallback but with brand consistency
  const activeUser = user || { name: 'GUEST_NODE', email: 'ANONYMOUS@SYNT.PROT', initials: 'G' };

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuRef]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="size-10 border-2 border-white flex items-center justify-center font-black italic -skew-x-12 hover:bg-white hover:text-black transition-all bg-black text-white"
      >
        {activeUser.initials}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-14 w-80 bg-[#0a0a0a] border border-white/10 rounded-none shadow-2xl p-6 z-50 animate-in fade-in zoom-in-95 duration-150 origin-top-right font-mono">
          {/* Plus Decorations */}
          <div className="absolute top-2 right-2 text-white/10"><Plus size={14} /></div>
          <div className="absolute bottom-2 left-2 text-white/10"><Plus size={14} /></div>

          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/5">
            <div className="size-12 border border-white/10 bg-white/5 flex items-center justify-center text-blue-500 font-black text-xl">
              {activeUser.initials}
            </div>
            <div className="overflow-hidden">
              <div className="text-[8px] text-blue-500 uppercase tracking-[0.4em] mb-1">Authenticated_Node</div>
              <h4 className="font-black text-white uppercase tracking-tighter truncate text-sm">{activeUser.name}</h4>
              <p className="text-[10px] text-white/30 uppercase tracking-widest truncate">{activeUser.email}</p>
            </div>
          </div>

          <div className="mb-6 space-y-3">
            <label className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em] block">System_Theme</label>
            <div className="grid grid-cols-3 gap-2 bg-white/5 p-1">
              <button
                onClick={() => setTheme('light')}
                className={`flex items-center justify-center gap-2 py-2 text-[10px] uppercase tracking-widest transition-all ${theme === 'light' ? 'bg-white text-black font-black' : 'text-white/40 hover:text-white'}`}
              >
                <Sun size={12} /> LIGHT
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center justify-center gap-2 py-2 text-[10px] uppercase tracking-widest transition-all ${theme === 'dark' ? 'bg-white text-black font-black' : 'text-white/40 hover:text-white'}`}
              >
                <Moon size={12} /> DARK
              </button>
              <button
                onClick={() => setTheme('system')}
                className={`flex items-center justify-center gap-2 py-2 text-[10px] uppercase tracking-widest transition-all ${theme === 'system' ? 'bg-white text-black font-black' : 'text-white/40 hover:text-white'}`}
              >
                <Monitor size={12} /> AUTO
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => { setIsOpen(false); router.push('/settings'); }}
              className="w-full flex items-center gap-4 px-3 py-2 text-[10px] text-white/40 uppercase tracking-widest hover:text-white hover:bg-white/5 transition-all group"
            >
              <UserIcon size={14} className="group-hover:text-blue-500" /> <span>Manage_Account</span>
            </button>
            <button className="w-full flex items-center gap-4 px-3 py-2 text-[10px] text-white/40 uppercase tracking-widest hover:text-white hover:bg-white/5 transition-all group">
              <CreditCard size={14} className="group-hover:text-blue-500" /> <span>Subscription_Plan</span>
            </button>
            <button
              onClick={() => { setIsOpen(false); router.push('/settings'); }}
              className="w-full flex items-center gap-4 px-3 py-2 text-[10px] text-white/40 uppercase tracking-widest hover:text-white hover:bg-white/5 transition-all group"
            >
              <Settings size={14} className="group-hover:text-blue-500" /> <span>Core_Settings</span>
            </button>
          </div>

          <div className="border-t border-white/5 mt-6 pt-4">
            <div className="flex items-center justify-between mb-4 text-[8px] text-white/20 uppercase tracking-widest">
              <span className="flex items-center gap-1"><Activity size={10} /> Node: 0xFD12</span>
              <span className="flex items-center gap-1"><Cpu size={10} /> LAT: 4MS</span>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="w-full flex items-center justify-center gap-3 h-12 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white text-[10px] font-black uppercase tracking-[0.3em] transition-all"
            >
              <LogOut size={14} /> TERMINATE_SESSION
            </button>
          </div>
        </div>
      )}
    </div>
  );
}