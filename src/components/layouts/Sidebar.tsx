import { FolderOpen, FileCode, Settings, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function Sidebar({ isOpen, toggle }: { isOpen: boolean, toggle: () => void }) {
  return (
    <div className={`bg-[#18181b] border-r border-[#27272a] flex flex-col transition-all duration-300 ${isOpen ? "w-64" : "w-12"}`}>
      {/* TOGGLE BUTTON */}
      <div className="h-10 flex items-center justify-end px-2 border-b border-[#27272a]">
        <button onClick={toggle} className="text-gray-500 hover:text-white">
            {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      {/* CONTENT */}
      {isOpen ? (
        <div className="p-4">
            <div className="text-xs font-bold text-gray-500 mb-4">EXPLORER</div>
            <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-blue-400 bg-[#27272a] p-2 rounded cursor-pointer">
                    <FileCode size={14} /> main.py
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400 hover:text-white p-2 rounded cursor-pointer">
                    <FileCode size={14} /> utils.py
                </div>
            </div>
        </div>
      ) : (
        <div className="flex flex-col items-center pt-4 gap-4">
            <FolderOpen size={20} className="text-gray-500" />
            <Settings size={20} className="text-gray-500" />
        </div>
      )}
    </div>
  );
}