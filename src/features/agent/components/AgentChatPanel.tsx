"use client";
import { useState, useEffect, useRef } from "react";
import { Send, Bot, User, Mic } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface Message {
  role: "user" | "assistant";
  text: string;
}

interface AgentChatPanelProps {
  messages: Message[];
  onSendMessage: (msg: string) => void;
  isProcessing: boolean;
}

export default function AgentChatPanel({ messages, onSendMessage, isProcessing }: AgentChatPanelProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(input);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full bg-[var(--ide-bg-panel)] border-l border-[var(--ide-border)]">
      {/* HEADER */}
      <div className="p-3 border-b border-[var(--ide-border)] flex justify-between items-center bg-[var(--ide-bg-panel)]">
        <h2 className="text-xs font-bold text-[var(--ide-text-muted)] uppercase tracking-wider">AI Copilot</h2>
        <span className="text-[10px] bg-blue-900 text-blue-300 px-2 py-0.5 rounded-full">Beta</span>
      </div>

      {/* CHAT HISTORY */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="text-center text-[var(--ide-text-muted)] mt-10 text-sm">
            <p>Ready to code.</p>
            <p>Say <span className="text-blue-400">&quot;Jarvis&quot;</span> or type below.</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-blue-600" : "bg-purple-600"}`}>
              {msg.role === "user" ? <User size={14} className="text-white" /> : <Bot size={14} className="text-white" />}
            </div>
            <div className={`p-3 rounded-lg max-w-[85%] leading-relaxed ${msg.role === "user" ? "bg-blue-900/30 text-blue-100 text-sm whitespace-pre-wrap" : "bg-[var(--ide-bg-active)] text-[var(--ide-text-main)] prose prose-invert prose-p:text-[13px] prose-p:my-1 prose-headings:text-[14px] prose-headings:font-bold prose-headings:my-2 prose-li:text-[13px] prose-li:my-0.5 prose-strong:text-[13px] prose-code:text-[12px] prose-code:bg-[var(--ide-bg-active)] prose-code:px-1 prose-code:rounded prose-pre:bg-[var(--ide-bg-panel)] prose-pre:border prose-pre:border-[var(--ide-border)] prose-pre:text-[12px] prose-a:text-blue-400 prose-a:text-[13px] prose-table:text-[12px] prose-table:w-auto prose-th:px-3 prose-th:py-2 prose-th:whitespace-nowrap prose-td:px-3 prose-td:py-2 custom-scrollbar overflow-x-auto min-w-0 break-words"}`}>
              {msg.role === "user" ? (
                msg.text
              ) : (
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                  {msg.text}
                </ReactMarkdown>
              )}
            </div>
          </div>
        ))}

        {isProcessing && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center animate-pulse"><Bot size={14} className="text-white" /></div>
            <div className="text-[var(--ide-text-muted)] text-sm flex items-center">Thinking...</div>
          </div>
        )}
      </div>

      {/* INPUT AREA */}
      <div className="p-4 border-t border-[var(--ide-border)] bg-[var(--ide-bg-panel)]">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
            placeholder="Ask AI to edit code or explain..."
            className="w-full bg-[var(--ide-bg-active)] text-[var(--ide-text-main)] text-sm rounded-md p-3 pr-10 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none h-20 placeholder:text-[var(--ide-text-muted)]"
          />
          <button
            onClick={handleSend}
            disabled={isProcessing || !input.trim()}
            className="absolute bottom-3 right-3 text-[var(--ide-text-muted)] hover:text-[var(--ide-text-main)] disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}