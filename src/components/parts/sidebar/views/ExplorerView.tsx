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

  const getIcon = (name: string) => {
    if (name.endsWith('.tsx') || name.endsWith('.ts')) return <FileCode size={14} className="text-[#4fc1ff]" />;
    if (name.endsWith('.css')) return <Hash size={14} className="text-[#42a5f5]" />;
    if (name.endsWith('.json')) return <FileJson size={14} className="text-[#fbc02d]" />;
    return <FileText size={14} className="text-[#cccccc]" />;
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
          flex items-center gap-1.5 py-1 cursor-pointer text-[12px] border-l-[2px] transition-colors select-none font-mono
          ${isActive ? 'bg-white/5 text-white border-white/40' : 'border-transparent text-[#a1a1aa] hover:bg-white/5 hover:text-white'}
        `}
        style={{ paddingLeft: `${level * 12 + 10}px` }}
      >
        {node.type === 'folder' ? (
          <span className="text-[#cccccc]">
            {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
        ) : (
          <span className="w-[14px]"></span>
        )}
        {node.type === 'folder' ? <Folder size={14} className="text-[#a1a1aa]" /> : getIcon(node.name)}
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

export default function ExplorerView() {
  const { files, activeFileId, setActiveFileId: selectFile, projectName } = useEditor();

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a]">
      <div className="h-[40px] flex items-center justify-between px-4 text-[10px] font-bold uppercase tracking-widest text-[#a1a1aa] border-b border-[#27272a]">
        <span className="font-mono">Explorer</span>
        <MoreHorizontal size={14} className="cursor-pointer hover:text-white transition-colors" />
      </div>

      <div className="flex items-center px-2 py-2 text-[10px] font-bold uppercase tracking-widest text-[#a1a1aa] cursor-pointer hover:bg-white/5 hover:text-white transition-colors font-mono select-none">
        <ChevronDown size={14} className="mr-1" />
        <span>{projectName || 'PROJECT'}</span>
      </div>

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