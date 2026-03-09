'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useEditorStore } from '@/features/editor/stores/useEditorStore';

// 1. Import the missing Provider
import { EditorProvider } from '@/context/EditorContext';

import VSCodeLayout from '@/features/editor/components/VSCodeLayout';
import AgentPanel from '@/features/agent/components/AgentPanel';
import FileTree from '@/components/layouts/FileTree';
import EditorPart from '@/components/parts/editor/EditorPart';

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();

  // Safely handle params
  const projectId = params?.projectId as string;

  const { setGuestMode, setProjectId, activeFile } = useEditorStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    if (!projectId) {
      router.push('/dashboard');
      return;
    }

    if (projectId === 'guest') {
      setGuestMode(true);
      setProjectId('guest-session');
    } else {
      setGuestMode(false);
      setProjectId(projectId);
    }
  }, [projectId, router, setGuestMode, setProjectId]);

  if (!mounted) return <div className="h-screen bg-[#1e1e1e] text-gray-500 flex items-center justify-center">Loading Editor...</div>;

  return (
    // 2. Wrap the entire layout in EditorProvider
    <EditorProvider projectId={projectId}>
      <VSCodeLayout
        fileName={activeFile || 'Untitled'}
        fileTree={<FileTree projectId={projectId} />}
        panel={<AgentPanel />}
      >
        <EditorPart fileName={activeFile || 'Untitled'} />
      </VSCodeLayout>
    </EditorProvider>
  );
}