"use client";
import { useState, useRef } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { VscNewFile, VscNewFolder, VscEdit, VscTrash, VscFolder, VscFolderOpened } from "react-icons/vsc";
import { useEditor } from "@/context/EditorContext";
import { getLanguageIcon } from "@/utils/getLanguageIcon";

// --- RECURSIVE ITEM COMPONENT (Unchanged logic, just keeping context) ---
const FileTreeItem = ({ item, level, onSelect, onRequestDelete }: any) => {
  const { deleteNode, renameNode, createFile, createFolder } = useEditor();
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState<'file' | 'folder' | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState('');
  const renameInputRef = useRef<HTMLInputElement>(null);

  const isFolder = item.type === "directory" || item.type === "folder";

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFolder) setIsOpen(!isOpen);
    else onSelect(item.id);
  };

  const handleRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRenaming(true);
    setNewName(item.name);
    setTimeout(() => renameInputRef.current?.focus(), 50);
  };

  const submitRename = () => {
    if (newName.trim() && newName !== item.name) {
      renameNode(item.id, newName.trim());
    }
    setIsRenaming(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRequestDelete(item);
  };

  const handleAddFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isFolder) return;
    setIsCreating('file');
    setIsOpen(true);
    setNewName('');
  };

  const handleAddFolder = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isFolder) return;
    setIsCreating('folder');
    setIsOpen(true);
    setNewName('');
  };

  const submitCreate = () => {
    if (newName.trim()) {
      const finalName = (isCreating === 'file' && !newName.includes('.')) ? `${newName.trim()}.txt` : newName.trim();
      if (isCreating === 'file') createFile(finalName, '', item.id);
      else createFolder(finalName, item.id);
    }
    setIsCreating(null);
    setNewName('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') submitCreate();
    else if (e.key === 'Escape') setIsCreating(null);
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') submitRename();
    else if (e.key === 'Escape') setIsRenaming(false);
  };

  return (
    <div className="select-none">
      <div
        className={`group flex items-center gap-1 py-0.5 px-2 hover:bg-[#2a2d2e] cursor-pointer ${level > 0 ? "ml-4" : ""}`}
        onClick={handleToggle}
      >
        <span className="opacity-70 w-3 flex justify-center">
          {isFolder ? (isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />) : null}
        </span>

        {isFolder ? (
          isOpen ? <VscFolderOpened size={14} className="text-blue-400 flex-shrink-0" /> : <VscFolder size={14} className="text-blue-400 flex-shrink-0" />
        ) : (
          <div className="flex-shrink-0 scale-75 transform origin-center">
            {getLanguageIcon(item.name, 16)}
          </div>
        )}

        {isRenaming ? (
          <input
            ref={renameInputRef}
            type="text"
            className="bg-[#3c3c3c] text-white text-[11px] px-1 py-0.5 outline-none border border-[#007acc] w-full ml-1 flex-1"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={handleRenameKeyDown}
            onBlur={submitRename}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="text-[12px] truncate ml-1 text-gray-300 group-hover:text-white flex-1">{item.name}</span>
        )}

        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity mr-1 text-[#71717a]">
          {isFolder && (
            <>
              <button onClick={handleAddFile} title="New File" className="p-0.5 rounded hover:bg-white/10 hover:text-white transition-colors">
                <VscNewFile size={13} />
              </button>
              <button onClick={handleAddFolder} title="New Folder" className="p-0.5 rounded hover:bg-white/10 hover:text-white transition-colors">
                <VscNewFolder size={13} />
              </button>
            </>
          )}
          <button onClick={handleRename} title="Rename" className="p-0.5 rounded hover:bg-white/10 hover:text-white transition-colors">
            <VscEdit size={12} />
          </button>
          <button onClick={handleDelete} title="Delete" className="p-0.5 rounded hover:bg-red-500/20 hover:text-red-400 transition-colors">
            <VscTrash size={12} />
          </button>
        </div>
      </div>

      {isFolder && isOpen && (
        <div>
          {item.children && item.children.map((child: any) => (
            <FileTreeItem key={child.id} item={child} level={level + 1} onSelect={onSelect} onRequestDelete={onRequestDelete} />
          ))}

          {isCreating && (
            <div className={`flex items-center gap-1 py-0.5 px-2 ${level + 1 > 0 ? "ml-4" : ""}`}>
              <span className="opacity-70 w-3 flex justify-center"></span>
              {isCreating === 'folder' ? <VscFolder size={14} className="text-blue-400" /> : <div className="scale-75 transform origin-center">{getLanguageIcon(newName || 'new file', 16)}</div>}
              <input
                autoFocus
                type="text"
                className="bg-[#3c3c3c] text-white text-[11px] px-1 py-0.5 outline-none border border-[#007acc] w-full ml-1"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={submitCreate}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// --- MAIN FILE TREE COMPONENT ---
export default function FileTree({ projectId }: { projectId: string }) {
  const { files, createFile, createFolder, setActiveFileId, uploadFile, deleteNode } = useEditor();
  const [isCreatingRoot, setIsCreatingRoot] = useState<'file' | 'folder' | null>(null);
  const [newRootName, setNewRootName] = useState('');
  const [nodeToDelete, setNodeToDelete] = useState<any>(null);

  // Ref for the hidden input
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRootFile = () => {
    setIsCreatingRoot('file');
    setNewRootName('');
  };

  const handleRootFolder = () => {
    setIsCreatingRoot('folder');
    setNewRootName('');
  };

  const submitRootCreate = () => {
    if (newRootName.trim()) {
      const finalName = (isCreatingRoot === 'file' && !newRootName.includes('.')) ? `${newRootName.trim()}.txt` : newRootName.trim();
      if (isCreatingRoot === 'file') createFile(finalName);
      else createFolder(finalName);
    }
    setIsCreatingRoot(null);
    setNewRootName('');
  };

  const handleRootKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') submitRootCreate();
    else if (e.key === 'Escape') setIsCreatingRoot(null);
  };

  // Trigger hidden input click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Handle actual file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await uploadFile(file); // Add to root
        // Reset input so you can upload the same file again if deleted
        e.target.value = '';
      } catch (err) {
        alert("Failed to read file.");
      }
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Root actions are rendered in the Explorer header (VSCodeLayout). */}

      {/* TREE */}
      <div className="flex-1 overflow-y-auto pb-10">
        {files.length === 0 && !isCreatingRoot ? (
          <div className="text-center mt-10 text-xs text-gray-500 italic">
            No files.<br />Click + or Upload.
          </div>
        ) : (
          <>
            {files.map((item) => (
              <FileTreeItem key={item.id} item={item} level={0} onSelect={setActiveFileId} onRequestDelete={setNodeToDelete} />
            ))}

            {isCreatingRoot && (
              <div className={`flex items-center gap-1 py-1.5 px-2`}>
                <span className="opacity-70 w-4 flex justify-center"></span>
                {isCreatingRoot === 'folder' ? <VscFolder size={14} className="text-blue-400" /> : getLanguageIcon(newRootName || 'new file', 14)}
                <input
                  autoFocus
                  type="text"
                  className="bg-[#3c3c3c] text-white text-xs px-1 py-0.5 outline-none border border-[#007acc] w-full ml-2"
                  value={newRootName}
                  onChange={(e) => setNewRootName(e.target.value)}
                  onKeyDown={handleRootKeyDown}
                  onBlur={submitRootCreate}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {nodeToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 shadow-2xl backdrop-blur-sm">
          <div className="bg-[#1e1e1e] border border-[#27272a] rounded-lg p-5 max-w-[320px] w-[90%] font-mono text-white shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-[13px] font-bold mb-3">Delete {nodeToDelete.type === 'folder' ? 'Folder' : 'File'}</h3>
            <p className="text-[11px] text-[#a1a1aa] mb-5 whitespace-normal break-words leading-relaxed">
              Are you sure you want to delete <span className="text-white font-bold">'{nodeToDelete.name}'</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 text-[11px]">
              <button
                onClick={() => setNodeToDelete(null)}
                className="px-4 py-1.5 rounded bg-[#2d2d30] border border-[#3e3e42] hover:bg-[#3e3e42] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteNode(nodeToDelete.id);
                  setNodeToDelete(null);
                }}
                className="px-4 py-1.5 rounded bg-red-600/90 hover:bg-red-500 text-white shadow-lg transition-colors border border-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}