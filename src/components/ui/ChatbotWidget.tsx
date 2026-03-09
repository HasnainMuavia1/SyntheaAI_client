'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { MessageCircle, X, Send, Loader2, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

export default function ChatbotWidget() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ sender: 'user' | 'agent', text: string }[]>([{
        sender: 'agent', text: 'Hello! I am the Synthea assistant. How can I help you today?'
    }]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Hide on editor routes
    if (pathname?.startsWith('/editor') || pathname?.startsWith('/ide')) {
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const userMessage = inputValue;
        setInputValue('');
        setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:8000/api/ide/chatbot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage }),
            });

            const data = await response.json();

            if (response.ok && data.reply) {
                setMessages(prev => [...prev, { sender: 'agent', text: data.reply }]);
            } else {
                setMessages(prev => [...prev, { sender: 'agent', text: 'Sorry, I encountered an error.' }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, { sender: 'agent', text: 'Failed to connect to the server.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {isOpen && (
                <div className="bg-[#0a0a0a] border border-[#27272a] rounded-lg shadow-2xl overflow-hidden mb-4 w-[350px] flex flex-col h-[480px] animate-in slide-in-from-bottom-5">
                    {/* Header */}
                    <div className="px-4 py-3 flex items-center justify-between bg-[#0a0a0a] border-b border-[#27272a]">
                        <h2 className="font-bold flex items-center gap-2 text-[10px] tracking-widest text-[#a1a1aa] uppercase font-mono">
                            <Sparkles className="w-3.5 h-3.5 text-white" />
                            SYNTHEA ASSISTANT
                        </h2>
                        <button onClick={() => setIsOpen(false)} className="text-[#a1a1aa] hover:text-white transition-colors">
                            <X size={14} />
                        </button>
                    </div>

                    {/* Output Area */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar text-[12px]">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.sender === 'user' ? (
                                    <div className="px-3 py-2 max-w-[85%] rounded-2xl bg-blue-600 text-white rounded-tr-none shadow-lg whitespace-pre-wrap">
                                        {msg.text}
                                    </div>
                                ) : (
                                    <div className="flex-1 min-w-0 text-gray-300 leading-relaxed py-0.5 relative group/msg select-text prose prose-invert prose-p:text-[12px] prose-p:my-1 prose-headings:text-[13px] prose-headings:font-bold prose-headings:my-2 prose-li:text-[12px] prose-li:my-0.5 prose-strong:text-[12px] prose-code:text-[11px] prose-code:bg-white/10 prose-code:px-1 prose-code:rounded prose-pre:bg-black/40 prose-pre:border prose-pre:border-white/10 prose-pre:text-[11px] prose-a:text-blue-400 prose-a:text-[12px] prose-table:text-[11px] prose-table:w-auto prose-th:px-3 prose-th:py-2 prose-th:whitespace-nowrap prose-td:px-3 prose-td:py-2 max-w-full break-words overflow-x-auto custom-scrollbar">
                                        <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                                            {msg.text}
                                        </ReactMarkdown>
                                    </div>
                                )}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex gap-3 items-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="w-6 h-6 rounded-lg bg-blue-600/10 flex items-center justify-center flex-shrink-0 border border-blue-500/20">
                                    <Loader2 size={12} className="text-blue-400 animate-spin" />
                                </div>
                                <div className="flex-1 bg-blue-900/10 border border-blue-500/10 rounded-xl p-3 text-[11px] text-gray-400 font-mono leading-relaxed italic">
                                    <div className="text-blue-400/60 font-bold mb-1 uppercase tracking-tighter text-[10px]">Thinking...</div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-2 bg-transparent border-t border-[#27272a]/50">
                        <form onSubmit={handleSubmit} className="relative group bg-[#18181b] rounded-md border border-[#27272a] focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/20 transition-all p-1.5 shadow-xl flex items-center gap-2">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Ask anything about Synthea..."
                                className="flex-1 bg-transparent border-none text-[12px] text-white px-2 py-1.5 focus:outline-none placeholder:text-gray-500"
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !inputValue.trim()}
                                className="p-1.5 rounded-sm bg-blue-600 text-white hover:bg-blue-500 transition-all flex-shrink-0 disabled:opacity-40 disabled:hover:bg-blue-600 disabled:grayscale shadow-lg shadow-blue-600/20"
                            >
                                <Send size={14} />
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Floating Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-[#18181b] hover:bg-[#27272a] text-[#a1a1aa] hover:text-white border border-[#27272a] p-3.5 rounded-full shadow-2xl transition-all duration-300 z-50 flex items-center gap-2 group hover:scale-105"
                >
                    <Sparkles className="w-5 h-5 text-blue-500 group-hover:text-blue-400 transition-colors" />
                    <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap text-[12px] font-bold tracking-widest uppercase font-mono group-hover:ml-1 group-hover:mr-2">Chat</span>
                </button>
            )}
        </div>
    );
}
