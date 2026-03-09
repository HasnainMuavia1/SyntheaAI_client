'use client';
import React from 'react';
import { useEditor, FileNode } from '@/context/EditorContext';
import { ChevronDown, ChevronRight, FileCode, FileJson, Folder, Hash, FileText, MoreHorizontal } from 'lucide-react';

interface FileItemProps {
  node: FileNode;
  level: number;
  activeFileId: string | null;
  selectFile: (id: string | null) => void;
}

const FileItem: React.FC<FileItemProps> = ({ node, level, activeFileId, selectFile }) => {
  const [isOpen, setIsOpen] = React.useState(true);
  const isActive = activeFileId === node.id;

  // Auto-expand folder if the active file is inside it
  React.useEffect(() => {
    if (node.type === 'folder' && activeFileId && activeFileId.startsWith(node.id + '/')) {
      setIsOpen(true);
    }
  }, [activeFileId, node.id, node.type]);

  const getIcon = (name: string) => {
    if (name.endsWith('.tsx') || name.endsWith('.ts')) return <FileCode size={14} className="text-[#4fc1ff]" />;
    if (name.endsWith('.css')) return <Hash size={14} className="text-[#42a5f5]" />;
    if (name.endsWith('.json')) return <FileJson size={14} className="text-[#fbc02d]" />;
    if (name.endsWith('.md')) return <FileText size={14} className="text-[#969696]" />;
    return <FileCode size={14} className="text-[#cccccc]" />;
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (node.type === 'folder') {
      setIsOpen(!isOpen);
    } else {
      selectFile(node.id);
    }
  };

  return (
    <div>
      <div
        onClick={handleToggle}
        className={`
          flex items-center gap-1.5 px-4 py-1 cursor-pointer text-[12px] border-l-[2px] transition-colors select-none font-mono
          ${isActive ? 'bg-[var(--ide-bg-active)] text-[var(--ide-text-main)] border-[var(--ide-border-hover)]' : 'border-transparent text-[var(--ide-text-muted)] hover:bg-[var(--ide-bg-active)]/50 hover:text-[var(--ide-text-main)]'}
        `}
        style={{ paddingLeft: `${level * 12 + 16}px` }}
      >
        {node.type === 'folder' ? (
          <span className="text-[var(--ide-text-muted)]">
            {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
        ) : (
          <span className="w-[14px]"></span>
        )}
        {node.type === 'folder' ? <Folder size={14} className="text-[var(--ide-text-muted)]" /> : getIcon(node.name)}
        <span className="truncate ml-1">{node.name}</span>
      </div>
      {node.type === 'folder' && isOpen && node.children && (
        <div>
          {node.children.map((child) => (
            <FileItem
              key={child.id}
              node={child}
              level={level + 1}
              activeFileId={activeFileId}
              selectFile={selectFile}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function ExplorerPane() {
  const { files, activeFileId, setActiveFileId: selectFile, projectName } = useEditor();

  return (
    <div className="flex flex-col h-full bg-[var(--ide-bg-main)]">
      {/* Title */}
      <div className="h-[40px] min-h-[40px] flex items-center justify-between px-4 text-[10px] font-bold uppercase tracking-widest text-[var(--ide-text-muted)] select-none border-b border-[var(--ide-border)]">
        <span className="font-mono">Explorer</span>
        <MoreHorizontal size={14} className="cursor-pointer hover:text-[var(--ide-text-main)] transition-colors" />
      </div>

      {/* Accordion Header */}
      <div className="flex items-center px-2 py-2 font-bold text-[10px] uppercase tracking-widest hover:bg-[var(--ide-bg-active)] cursor-pointer text-[var(--ide-text-muted)] hover:text-[var(--ide-text-main)] transition-colors select-none font-mono">
        <ChevronDown size={14} />
        <span className="ml-1">{projectName || 'PROJECT'}</span>
      </div>

      {/* Files */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {files.map((file) => (
          <FileItem
            key={file.id}
            node={file}
            level={0}
            activeFileId={activeFileId}
            selectFile={selectFile}
          />
        ))}
      </div>
    </div>
  );
}
