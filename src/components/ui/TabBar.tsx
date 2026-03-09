"use client";
import React from "react";
import { X } from "lucide-react";
import { useEditor } from "@/context/EditorContext";
import { getLanguageIcon } from "@/utils/getLanguageIcon";

const TabBar: React.FC = () => {
    const { openFiles, activeFileId, setActiveFileId, closeFile } = useEditor();

    if (openFiles.length === 0) return null;

    return (
        <div className="flex items-center bg-[var(--ide-bg-main)] border-b border-[var(--ide-border)] overflow-x-auto no-scrollbar h-10">
            {openFiles.map((fileId) => {
                const fileName = fileId.split("/").pop() || fileId;
                const isActive = activeFileId === fileId;

                return (
                    <div
                        key={fileId}
                        onClick={() => setActiveFileId(fileId)}
                        className={`
              flex items-center gap-2 px-3 h-full cursor-pointer border-r border-[var(--ide-border)] transition-colors min-w-[120px] max-w-[200px]
              ${isActive ? "bg-[var(--ide-bg-active)] text-[var(--ide-text-main)] border-t-2 border-t-[var(--ide-border-hover)]" : "bg-transparent text-[var(--ide-text-muted)] hover:bg-[var(--ide-bg-active)]/50"}
            `}
                    >
                        <span className="flex-shrink-0">{getLanguageIcon(fileName, 11)}</span>
                        <span className="text-[11px] font-mono truncate flex-1">{fileName}</span>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                closeFile(fileId);
                            }}
                            className="p-1 rounded-sm hover:bg-[var(--ide-bg-active)] transition-colors"
                        >
                            <X size={12} className="text-[var(--ide-text-muted)] hover:text-[var(--ide-text-main)]" />
                        </button>
                    </div>
                );
            })}
        </div>
    );
};

export default TabBar;
