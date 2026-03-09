'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Mic, MicOff, Loader2, Sparkles, Send, Terminal, Paperclip, X, Copy, Check, FileText, Plus, History, ArrowRight, Trash2, ChevronDown, Square } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { useVoiceAgent } from '../hooks/useVoiceAgent';
import { parseVoiceCommand } from '../utils/commandParser';
import { useEditor } from '@/context/EditorContext';
import { apiClient } from '@/lib/api-client';

interface ChatSession {
  id: string;
  title: string;
  updated_at: string;
}

interface ChatMsg {
  id?: string;
  sender: 'user' | 'agent';
  text: string;
}

interface AgentPanelProps {
  onClose?: () => void;
}

const AudioVisualizer = () => (
  <div className="flex items-center justify-center gap-0.5 h-4">
    {[...Array(5)].map((_, i) => (
      <div
        key={i}
        className="w-0.5 bg-blue-500 rounded-full animate-pulse"
        style={{
          height: `${30 + Math.random() * 70}%`,
          animationDuration: `${0.6 + Math.random() * 0.4}s`,
          animationDelay: `${i * 0.1}s`
        }}
      />
    ))}
  </div>
);

export default function AgentPanel({ onClose }: AgentPanelProps) {
  const { state, transcript, startListening, stopListening, reset } = useVoiceAgent();

  // FIX: Destructure uploadFile and createFile from context
  const { createFile, uploadFile, projectId, fetchWorkspace, setActiveFileId } = useEditor();

  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isHistoryView, setIsHistoryView] = useState(false);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);
  const [agentReasoning, setAgentReasoning] = useState<string>('');
  const [isAgentThinking, setIsAgentThinking] = useState(false);
  const [pendingFileChanges, setPendingFileChanges] = useState<string[]>([]);
  const [agentMode, setAgentMode] = useState<'agent' | 'ask'>('agent');
  const [isModeDropdownOpen, setIsModeDropdownOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputBeforeListeningRef = useRef<string>('');
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const agentWsRef = useRef<WebSocket | null>(null);
  const streamingTextRef = useRef<string>('');
  // Tracks if current session already has messages (for new-chat empty guard)
  const sessionHasMessages = useRef<boolean>(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, agentReasoning]);

  // When starting to listen, preserve current input so we can restore/append later
  useEffect(() => {
    if (state === 'LISTENING') {
      inputBeforeListeningRef.current = inputValue;
    }
  }, [state]);

  // When stopping: put final transcript into input only (do not send to chat)
  useEffect(() => {
    if (state === 'IDLE' && transcript) {
      const prefix = inputBeforeListeningRef.current ? inputBeforeListeningRef.current + ' ' : '';
      setInputValue((prefix + transcript).trim());
      reset();
    }
  }, [state, transcript, reset]);

  // Auto-resize command input textarea as content grows
  useEffect(() => {
    const el = textAreaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, inputValue, transcript]);

  // Fetch Chat Sessions on Project Mount
  useEffect(() => {
    if (projectId) {
      apiClient.ide.getChatSessions(projectId)
        .then(data => {
          if (data && data.length > 0) {
            setSessions(data);
            setActiveSessionId(data[0].id); // Select latest
          } else {
            handleNewChat(); // Auto-create initial session
          }
        })
        .catch(err => console.error("Failed to load sessions:", err));
    } else {
      setSessions([]);
      setActiveSessionId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // Fetch Chat History when Session changes
  useEffect(() => {
    if (projectId && activeSessionId) {
      sessionHasMessages.current = false; // reset until we know
      setIsFetchingHistory(true);
      apiClient.ide.getChatHistory(projectId, activeSessionId)
        .then(history => {
          const msgs = history || [];
          setMessages(msgs);
          sessionHasMessages.current = msgs.length > 0;
        })
        .catch(err => console.error("Failed to load chat history:", err))
        .finally(() => setIsFetchingHistory(false));
    } else {
      setMessages([]);
      sessionHasMessages.current = false;
    }
  }, [projectId, activeSessionId]);

  const handleNewChat = async () => {
    if (!projectId) return;

    // Block if current active session is already empty
    if (activeSessionId && !sessionHasMessages.current) {
      setIsHistoryView(false);
      return;
    }

    try {
      const newSession = await apiClient.ide.createChatSession(projectId);
      setSessions(prev => [newSession, ...prev]);
      setActiveSessionId(newSession.id);
      setIsHistoryView(false);
      setMessages([]);
      sessionHasMessages.current = false;
    } catch (e) {
      console.error("Failed to create new chat", e);
    }
  };

  // WebSocket Connection for LangChain Agent
  useEffect(() => {
    if (!projectId || !activeSessionId) return;

    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const host = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'localhost:8000'
      : window.location.host;
    const wsUrl = `${protocol}://${host}/ws/agent/?projectId=${projectId}&sessionId=${activeSessionId}`;

    console.log("Connecting to Agent WS:", wsUrl);
    const ws = new WebSocket(wsUrl);
    agentWsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // Handle Reasoning Stream
        if (data.type === 'reasoning') {
          setAgentReasoning(prev => prev + data.content);
          setIsAgentThinking(true);
        }

        // Handle File Events (Dynamic Open + Track for Accept/Reject)
        else if (data.type === 'file_event') {
          console.log("Agent modified file event received:", data.path);
          const path = data.path;
          setPendingFileChanges(prev => Array.from(new Set([...prev, path])));

          // Add a small delay to ensure filesystem consistency
          setTimeout(async () => {
            console.log("Refreshing workspace for path:", path);
            await fetchWorkspace();
            console.log("Workspace refreshed.");
            setActiveFileId(path);
          }, 500);
        }

        // Handle Final Output
        else if (data.type === 'final_output') {
          setIsAgentThinking(false);
          setAgentReasoning(''); // Clear reasoning on completion
          if (data.output) {
            addMessage('agent', data.output);
          }
          // Force a final workspace refresh to guarantee UI sync
          fetchWorkspace();
        }

        // Backward compatibility for simple output
        else if (data.output) {
          let cleanOutput = data.output.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
          if (cleanOutput) {
            addMessage('agent', cleanOutput);
          }
        }

        if (data.error) {
          addMessage('agent', `❌ Error: ${data.error}`);
          setIsAgentThinking(false);
          setAgentReasoning('');
        }
      } catch (e) {
        console.error("WS parse error:", e);
      }
    };

    ws.onopen = () => console.log("Claude WS Connected");
    ws.onclose = () => console.log("Claude WS Disconnected");
    ws.onerror = (err) => console.error("Claude WS Error", err);

    return () => {
      ws.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, activeSessionId]);

  // Handle polling for filesystem changes while agent is working
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAgentThinking && projectId) {
      interval = setInterval(() => {
        fetchWorkspace();
      }, 2000); // Poll every 2 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAgentThinking, projectId, fetchWorkspace]);

  const handleDeleteChat = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    if (!projectId) return;

    try {
      await apiClient.ide.deleteChatSession(projectId, sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));

      // If we deleted the active session, switch to another one or create new
      if (sessionId === activeSessionId) {
        const remaining = sessions.filter(s => s.id !== sessionId);
        if (remaining.length > 0) {
          setActiveSessionId(remaining[0].id);
        } else {
          setActiveSessionId(null);
          setMessages([]);
          // auto-create a new one
          handleNewChat();
        }
      }
    } catch (e) {
      console.error("Failed to delete chat session", e);
    }
  };

  const handleAcceptChanges = () => {
    setPendingFileChanges([]);
  };

  const handleRejectChanges = () => {
    const files = pendingFileChanges.join(', ');
    setPendingFileChanges([]);
    addMessage('user', `I reject the changes made to: ${files}. Please revert them.`);
    if (agentWsRef.current && agentWsRef.current.readyState === WebSocket.OPEN) {
      agentWsRef.current.send(JSON.stringify({
        message: `I reject the changes made to: ${files}. Please revert the file contents to their previous state.`
      }));
    }
  };

  const addMessage = async (sender: 'user' | 'agent', text: string) => {
    // Only accept if it's not a duplicate of the LAST message from the SAME sender
    setMessages(prev => {
      if (prev.length > 0) {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg.sender === sender && lastMsg.text === text) {
          return prev; // Ignore duplicate
        }
      }
      return [...prev, { sender, text }];
    });

    // Auto-title session from first user message
    if (sender === 'user' && !sessionHasMessages.current && projectId && activeSessionId) {
      const words = text.trim().split(/\s+/).slice(0, 5).join(' ');
      const autoTitle = words.length < text.trim().length ? words + '…' : words;
      sessionHasMessages.current = true;
      // Update local state immediately
      setSessions(prev => prev.map(s =>
        s.id === activeSessionId ? { ...s, title: autoTitle } : s
      ));
      // Persist to backend (fire-and-forget)
      apiClient.ide.updateChatSessionTitle(projectId, activeSessionId, autoTitle).catch(() => { });
    } else {
      sessionHasMessages.current = true;
    }

    // Move current session to top of sessions list if not already
    setSessions(prev => {
      const idx = prev.findIndex(s => s.id === activeSessionId);
      if (idx > 0) {
        const current = { ...prev[idx], updated_at: new Date().toISOString() };
        return [current, ...prev.slice(0, idx), ...prev.slice(idx + 1)];
      }
      if (idx === 0) {
        const current = { ...prev[idx], updated_at: new Date().toISOString() };
        return [current, ...prev.slice(1)];
      }
      return prev;
    });

    // Only save to DB if it's from the user.
    if (projectId && activeSessionId && sender === 'user') {
      try {
        await apiClient.ide.sendChatMessage(projectId, activeSessionId, sender, text);
      } catch (e) {
        console.error("Failed to save message to DB", e);
      }
    }
  };

  // Global Wake Word Integration
  useEffect(() => {
    const handleWakeWord = () => {
      addMessage('agent', 'How can I help you?');
    };

    const handleStartListen = () => {
      startListening();
    };

    window.addEventListener('wake-word-activated', handleWakeWord);
    window.addEventListener('agent-start-listening', handleStartListen);

    return () => {
      window.removeEventListener('wake-word-activated', handleWakeWord);
      window.removeEventListener('agent-start-listening', handleStartListen);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startListening]);

  const handleCommandExecution = async (command: ReturnType<typeof parseVoiceCommand>) => {
    addMessage('user', command.originalText);

    switch (command.type) {
      case 'CREATE_FILE':
        if (command.payload.path) {
          addMessage('agent', `Creating file: ${command.payload.path}...`);
          try {
            await createFile(command.payload.path, '// Generated by Synthea');
            addMessage('agent', `✅ Created ${command.payload.path}`);
          } catch (e) {
            addMessage('agent', '❌ Failed to create file.');
          }
        }
        break;
      case 'UNKNOWN':
        setTimeout(() => addMessage('agent', `I heard: "${command.originalText}"`), 1000);
        break;
    }
    setTimeout(() => { reset(); }, 3000);
  };

  const toggleListening = () => {
    if (state === 'IDLE' || state === 'ERROR') startListening();
    else stopListening();
  };

  const handleTextSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;
    const currentInput = inputValue;
    setInputValue('');

    addMessage('user', currentInput);
    // Removed 'Processing...' message as requested

    // Send to WebSocket if connected
    if (agentWsRef.current && agentWsRef.current.readyState === WebSocket.OPEN) {
      agentWsRef.current.send(JSON.stringify({ message: currentInput, mode: agentMode }));
    } else {
      // Fallback for voice commands if ws is down
      const command = parseVoiceCommand(currentInput);
      handleCommandExecution(command);
    }
  };

  const handleInterrupt = () => {
    if (agentWsRef.current && agentWsRef.current.readyState === WebSocket.OPEN) {
      agentWsRef.current.send(JSON.stringify({ type: 'interrupt' }));
      setIsAgentThinking(false);
      setAgentReasoning('');
    }
  };

  // NEW: Handle File Upload Click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // NEW: Handle File Selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        addMessage('user', `Uploaded file: ${file.name}`);
        addMessage('agent', `Uploading ${file.name}...`);
        await uploadFile(file);
        addMessage('agent', `✅ Uploaded ${file.name}`);
        e.target.value = ''; // Reset
      } catch (err) {
        addMessage('agent', '❌ Upload failed.');
      }
    }
  };

  return (
    <div className="flex flex-col h-full min-w-0 bg-[var(--ide-bg-main)] text-[var(--ide-text-main)] w-full">
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between bg-[var(--ide-bg-main)] border-b border-[var(--ide-border)]">
        <h2 className="font-bold flex items-center gap-2 text-[10px] tracking-widest text-[var(--ide-text-muted)] uppercase font-mono">
          <Sparkles className="w-3.5 h-3.5 text-[var(--ide-text-main)]" />
          SYNTHEA AI
        </h2>
        <div className="flex items-center gap-3">
          <div className={`w-1.5 h-1.5 rounded-full ${state === 'IDLE' ? 'bg-[var(--ide-border)]' : 'bg-green-500 animate-pulse'}`} />

          <button onClick={handleNewChat} className="text-[var(--ide-text-muted)] hover:text-[var(--ide-text-main)] transition-colors" title="New Chat">
            <Plus size={14} />
          </button>

          <button onClick={() => setIsHistoryView(!isHistoryView)} className={`transition-colors ${isHistoryView ? 'text-[var(--ide-text-main)]' : 'text-[var(--ide-text-muted)] hover:text-[var(--ide-text-main)]'}`} title="Chat History">
            <History size={14} />
          </button>

          {onClose && (
            <X
              size={14}
              className="text-[var(--ide-text-muted)] hover:text-[var(--ide-text-main)] cursor-pointer transition-colors ml-1"
              onClick={onClose}
            />
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 px-4 py-4 overflow-y-auto overflow-x-hidden space-y-4 custom-scrollbar text-[12px]">
        {isHistoryView ? (
          <div className="animate-in fade-in flex flex-col gap-2 h-full">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[var(--ide-text-muted)] font-bold uppercase tracking-widest text-[10px] font-mono border border-[var(--ide-border-hover)] px-2 py-1 inline-block rounded">Chat Windows</h3>
            </div>
            {sessions.map(s => (
              <div key={s.id} className={`p-3 rounded border transition-all flex items-center justify-between group relative ${s.id === activeSessionId ? 'bg-[var(--ide-bg-active)]/50 border-[var(--ide-border-hover)]' : 'bg-transparent border-[var(--ide-border)] hover:border-[var(--ide-border-hover)] hover:bg-[var(--ide-bg-active)]/30'}`}>
                <button
                  onClick={() => { setActiveSessionId(s.id); setIsHistoryView(false); }}
                  className="text-left flex flex-col items-start gap-1 flex-1 min-w-0"
                >
                  <div className="font-mono text-[11px] text-[var(--ide-text-main)] flex items-center gap-2 truncate w-full pr-6">
                    <Terminal size={10} className="text-[var(--ide-text-muted)] flex-shrink-0" />
                    <span className="truncate">{s.title || 'Agent Session'}</span>
                  </div>
                  <div className="text-[9px] text-gray-500 font-mono shrink-0">ID: {s.id.split('-')[0]}</div>
                </button>
                <div className="flex items-center gap-2 pl-2">
                  <button
                    onClick={(e) => handleDeleteChat(e, s.id)}
                    className="p-1.5 rounded-md text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete Chat"
                  >
                    <Trash2 size={12} />
                  </button>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-[var(--ide-text-main)] pointer-events-none" />
                </div>
              </div>
            ))}
          </div>
        ) : isFetchingHistory ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="animate-spin text-blue-500" size={24} />
          </div>
        ) : messages.length === 0 && !isAgentThinking ? (
          <div className="flex-1 flex flex-col items-center justify-center h-full py-10 text-center animate-in fade-in duration-500">
            <div className="w-16 h-16 rounded-2xl bg-[var(--ide-bg-active)]/50 border border-[var(--ide-border-hover)] flex items-center justify-center mb-6 shadow-2xl relative">
              <Sparkles className="w-8 h-8 text-[var(--ide-text-main)] relative z-10" />
            </div>
            <h1 className="text-2xl font-semibold text-[var(--ide-text-main)] mb-2 tracking-tight">Build with Agent</h1>
            <div className="flex items-center gap-1.5 text-[var(--ide-text-muted)] text-sm mb-8">
              <span className="text-purple-400/80">AI responses may be inaccurate.</span>
            </div>

            {/* Recent Sessions List in Empty State */}
            {sessions.length > 1 && (
              <div className="flex flex-col gap-2 w-full max-w-sm mt-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest text-left mb-1">Recent Sessions</div>
                {sessions.filter(s => s.id !== activeSessionId).slice(0, 3).map(s => (
                  <button
                    key={s.id}
                    onClick={() => { setActiveSessionId(s.id); setIsHistoryView(false); }}
                    className="p-3 rounded border border-[var(--ide-border)] hover:border-[var(--ide-border-hover)] text-left text-[11px] text-[var(--ide-text-muted)] transition-all flex items-center justify-between group bg-transparent hover:bg-[var(--ide-bg-active)]/30"
                  >
                    <span className="truncate flex-1 font-mono">{s.title || 'Chat Session'}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-[var(--ide-text-main)] ml-2 flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          messages.map((msg, idx) => (
            msg.sender === 'user' ? (
              <div key={idx} className="flex justify-end">
                <div className="px-3 py-2 max-w-[90%] break-all whitespace-pre-wrap leading-relaxed bg-blue-600 text-white rounded-2xl rounded-tr-none shadow-lg">
                  {msg.text}
                </div>
              </div>
            ) : (
              <div key={idx} className="flex items-start group">
                <div className="flex-1 min-w-0 text-gray-300 leading-relaxed py-0.5 relative group/msg select-text prose prose-invert prose-p:text-[11px] prose-p:my-1 prose-headings:text-[12px] prose-headings:font-bold prose-headings:my-2 prose-li:text-[11px] prose-li:my-0.5 prose-strong:text-[11px] prose-code:text-[10px] prose-code:bg-[var(--ide-bg-active)] prose-code:px-1 prose-code:rounded prose-pre:bg-[var(--ide-bg-panel)] prose-pre:border prose-pre:border-[var(--ide-border)] prose-pre:text-[10px] prose-a:text-blue-400 prose-a:text-[11px] prose-table:text-[10px] prose-table:w-auto prose-th:px-3 prose-th:py-2 prose-th:whitespace-nowrap prose-td:px-3 prose-td:py-2 max-w-full break-words overflow-x-auto custom-scrollbar">
                  <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                    {msg.text}
                  </ReactMarkdown>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(msg.text);
                    }}
                    className="absolute top-0 -right-8 opacity-0 group-hover/msg:opacity-100 p-1 hover:bg-[var(--ide-bg-active)] rounded transition-all text-[var(--ide-text-muted)] hover:text-[var(--ide-text-main)]"
                    title="Copy message"
                  >
                    <Copy size={12} />
                  </button>
                </div>
              </div>
            )
          ))
        )}

        {/* Reasoning Stream */}
        {isAgentThinking && agentReasoning && (
          <div className="flex gap-3 items-start animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="w-6 h-6 rounded-lg bg-purple-600/10 flex items-center justify-center flex-shrink-0 border border-purple-500/20">
              <Loader2 size={12} className="text-purple-400 animate-spin" />
            </div>
            <div className="flex-1 bg-purple-900/10 border border-purple-500/10 rounded-xl p-3 text-[11px] text-gray-400 font-mono leading-relaxed italic">
              <div className="text-purple-400/60 font-bold mb-1 uppercase tracking-tighter text-[10px]">Thinking...</div>
              {agentReasoning}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Accept/Reject Banner */}
      {pendingFileChanges.length > 0 && (
        <div className="mx-4 mb-2 p-3 bg-blue-900/20 border border-blue-500/30 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-500/20 rounded-lg">
              <Sparkles size={14} className="text-blue-400" />
            </div>
            <div className="text-[11px]">
              <span className="text-blue-300 font-bold block uppercase tracking-tighter">Review Changes</span>
              <span className="text-gray-400 line-clamp-1 italic">Modified: {pendingFileChanges.join(', ')}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRejectChanges}
              className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all uppercase tracking-wider"
            >
              Reject
            </button>
            <button
              onClick={handleAcceptChanges}
              className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20 transition-all uppercase tracking-wider"
            >
              Accept
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="p-2 bg-transparent border-t border-[var(--ide-border)]">

        {/* Visualizer */}
        {state === 'LISTENING' && (
          <div className="h-6 w-full flex items-center justify-center mb-2">
            <AudioVisualizer />
          </div>
        )}

        {/* Unified Modern Input Bar */}
        <form
          onSubmit={handleTextSubmit}
          className="relative group bg-[var(--ide-bg-panel)] rounded-md border border-[var(--ide-border)] focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/20 transition-all p-1.5 shadow-xl"
        >
          <div className="flex flex-col">
            <textarea
              ref={textAreaRef}
              rows={1}
              value={state === 'LISTENING' ? transcript : inputValue}
              onChange={(e) => {
                if (state !== 'LISTENING') setInputValue(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleTextSubmit();
                }
              }}
              placeholder={state === 'LISTENING' ? 'Listening...' : 'Ask anything or use / for commands...'}
              readOnly={state === 'LISTENING'}
              className="w-full bg-transparent border-none text-[12px] text-[var(--ide-text-main)] px-3 py-2 focus:outline-none placeholder:text-[var(--ide-text-muted)] resize-none leading-relaxed min-h-[40px]"
            />

            <div className="flex items-center justify-between px-1 pb-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleUploadClick}
                  className="p-1.5 rounded-lg text-[var(--ide-text-muted)] hover:text-[var(--ide-text-main)] hover:bg-[var(--ide-bg-active)] transition-all flex-shrink-0"
                  title="Attach file"
                >
                  <Paperclip size={12} />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileChange}
                />

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsModeDropdownOpen(!isModeDropdownOpen)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--ide-bg-panel)] hover:bg-[var(--ide-bg-active)] rounded-lg text-[10px] text-[var(--ide-text-muted)] font-medium transition-colors"
                  >
                    {agentMode === 'agent' ? 'Agent' : 'Ask'}
                    <ChevronDown size={12} className="text-[var(--ide-text-muted)]" />
                  </button>

                  {isModeDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsModeDropdownOpen(false)}></div>
                      <div className="absolute bottom-full left-0 mb-2 w-[220px] bg-[var(--ide-bg-panel)] border border-[var(--ide-border)] rounded-lg shadow-2xl z-50 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-2">
                        <div className="px-2.5 py-1.5 border-b border-[var(--ide-border)] text-[10px] font-semibold text-[var(--ide-text-muted)] capitalize">
                          Conversation mode
                        </div>
                        <button
                          type="button"
                          className={`flex flex-col text-left px-2.5 py-2 hover:bg-[var(--ide-bg-active)] transition-colors ${agentMode === 'agent' ? 'bg-[var(--ide-bg-active)]/50' : ''}`}
                          onClick={() => { setAgentMode('agent'); setIsModeDropdownOpen(false); }}
                        >
                          <span className="text-[11px] font-semibold text-[var(--ide-text-main)] mb-0.5">Agent</span>
                          <span className="text-[9px] text-[var(--ide-text-muted)] leading-relaxed">Agent can plan and execute tasks. Use for deep research, complex tasks, or collaborative work.</span>
                        </button>
                        <button
                          type="button"
                          className={`flex flex-col text-left px-2.5 py-2 hover:bg-[var(--ide-bg-active)] transition-colors border-t border-[var(--ide-border)] ${agentMode === 'ask' ? 'bg-[var(--ide-bg-active)]/50' : ''}`}
                          onClick={() => { setAgentMode('ask'); setIsModeDropdownOpen(false); }}
                        >
                          <span className="text-[11px] font-semibold text-[var(--ide-text-main)] mb-0.5">Ask</span>
                          <span className="text-[9px] text-[var(--ide-text-muted)] leading-relaxed">Agent answers directly without tools. Use for simple tasks or quick questions.</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-1.5 rounded-lg flex-shrink-0 transition-all ${state === 'LISTENING' ? 'bg-red-500 text-[var(--ide-text-main)] shadow-lg' : 'text-[var(--ide-text-muted)] hover:text-[var(--ide-text-main)] hover:bg-[var(--ide-bg-active)]'}`}
                  title={state === 'LISTENING' ? 'Stop Listening' : 'Voice Input'}
                >
                  {state === 'LISTENING' ? <MicOff size={12} /> : <Mic size={12} />}
                </button>

                {isAgentThinking ? (
                  <button
                    type="button"
                    onClick={handleInterrupt}
                    className="p-1.5 rounded-sm bg-red-600 text-white hover:bg-red-500 transition-all flex-shrink-0 shadow-lg shadow-red-600/20"
                    title="Stop Agent"
                  >
                    <Square fill="currentColor" size={12} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="p-1.5 rounded-sm bg-blue-600 text-white hover:bg-blue-500 transition-all flex-shrink-0 disabled:opacity-40 disabled:hover:bg-blue-600 disabled:grayscale shadow-lg shadow-blue-600/20"
                    disabled={(state as any) === 'LISTENING' || !(((state as any) === 'LISTENING' ? transcript : inputValue) || '').trim()}
                    title="Send message"
                  >
                    <Send size={12} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
