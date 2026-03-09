'use client';
import React from 'react';
import CodeEditor from '@/components/ui/CodeEditor';
import TabBar from '@/components/ui/TabBar';
import { X, Split, MoreHorizontal, Play } from 'lucide-react';
import { useEditor, FileNode } from '@/context/EditorContext';
import { useCallback, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { getLanguageIcon } from '@/utils/getLanguageIcon';

export default function EditorPart({ fileName }: { fileName: string }) {
  const { files, activeFileId, setActiveFileId, code, setCode, saveFile } = useEditor();

  // Helper to flat search the file from the tree
  const getFile = (id: string, nodes: FileNode[] = files): FileNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = getFile(id, node.children);
        if (found) return found;
      }
    }
    return null;
  };

  const getLanguage = (fileName: string) => {
    if (!fileName) return "plaintext";
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (!ext || ext === fileName.toLowerCase()) return "plaintext";

    // Standardize a few common ones for Monaco
    switch (ext) {
      case "ts":
      case "tsx":
        return "typescript";
      case "js":
      case "jsx":
        return "javascript";
      case "py":
        return "python";
      case "c":
      case "h":
      case "cpp":
      case "hpp":
        return "cpp";
      case "md":
        return "markdown";
      case "sh":
      case "bash":
        return "shell";
      case "txt":
        return "plaintext";
      default:
        return ext; // Pass the raw extension (like java, go, ruby, rust) to Monaco!
    }
  };

  const getRunCommand = () => {
    if (!activeFileId) return null;
    const file = getFile(activeFileId);
    const name: string = file ? file.name : activeFileId.split('/').pop() || '';
    const ext = name.split('.').pop()?.toLowerCase();
    const path = activeFileId; // treat activeFileId as project-relative path

    switch (ext) {
      case 'py':
        return `python "${path}"`;
      case 'js':
      case 'jsx':
        return `node "${path}"`;
      case 'ts':
      case 'tsx':
        // assume ts-node or transpiled env; you can adjust as needed
        return `node "${path}"`;
      case 'cpp':
      case 'cc':
      case 'c':
        // simple compile-and-run; user environment must have g++
        return `g++ "${path}" -o a.out && ./a.out`;
      default:
        return null;
    }
  };

  const runCommand = getRunCommand();

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[var(--ide-bg-main)] h-full relative">

      {/* 1. Tab Bar and Actions */}
      <div className="flex-shrink-0 bg-[var(--ide-bg-main)] flex items-center border-b border-[var(--ide-border)]">
        <div className="flex-1 overflow-hidden">
          <TabBar />
        </div>

        {/* Editor Actions (Right Side) */}
        <div className="flex items-center gap-2 px-2 text-gray-500 border-l border-[var(--ide-border)] h-10 bg-[var(--ide-bg-main)] flex-shrink-0">
          {runCommand && (
            <div title="Run file in terminal">
              <Play
                size={14}
                className="hover:text-blue-400 cursor-pointer transition-colors"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('synthea-run-command', {
                      detail: { command: runCommand }
                    }));
                  }
                }}
              />
            </div>
          )}
          <Split size={14} className="hover:text-[var(--ide-text-main)] cursor-pointer" />
          <MoreHorizontal size={14} className="hover:text-[var(--ide-text-main)] cursor-pointer" />
        </div>
      </div>

      {/* 2. Monaco Editor Surface */}
      <div className="flex-1 relative overflow-hidden">
        {activeFileId ? (
          <CodeEditor
            code={code}
            onChange={(val) => {
              setCode(val || '');
              // Simple save
              if (activeFileId) {
                saveFile(activeFileId, val || '');
              }
            }}
            language={getLanguage(getFile(activeFileId)?.name || '')}
          />
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center text-gray-500 bg-[var(--ide-bg-main)] font-mono">
            <div className="text-4xl font-light mb-4 text-[var(--ide-border)] tracking-widest uppercase flex items-center gap-3">
              SYNTHEA AI
            </div>
            <div className="text-[11px] mb-2">Show All Commands <span className="bg-[var(--ide-bg-active)] px-1.5 py-0.5 rounded text-[var(--ide-text-main)] ml-2 border border-[var(--ide-border)]">Ctrl+Shift+P</span></div>
            <div className="text-[11px]">Go to File <span className="bg-[var(--ide-bg-active)] px-1.5 py-0.5 rounded text-[var(--ide-text-main)] ml-2 border border-[var(--ide-border)]">Ctrl+P</span></div>
          </div>
        )}
      </div>

    </div>
  );
}