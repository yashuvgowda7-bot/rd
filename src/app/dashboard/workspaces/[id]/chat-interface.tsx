'use client';

import { chatWithWorkspace } from '@/actions/documents';
import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Globe, FileText, ChevronDown, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export function WorkspaceChatInterface({ workspaceId }: { workspaceId: string }) {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Hello! I\'ve indexed the documents in this workspace. How can I help you today?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [deepSearch, setDeepSearch] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await chatWithWorkspace(workspaceId, userMessage, deepSearch);

            if (response.error) {
                setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${response.error}` }]);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: response.answer || 'No answer generated.' }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Something went wrong. Please try again.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-900/60">
            {/* Header / Controls */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/20 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                    <Bot size={20} className="text-indigo-400" />
                    <span className="text-sm font-bold text-white tracking-tight">Workspace Assistant</span>
                </div>

                <button
                    onClick={() => setDeepSearch(!deepSearch)}
                    className={`
                        flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all border
                        ${deepSearch
                            ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-400'
                            : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:border-slate-600'
                        }
                    `}
                >
                    <Globe size={14} className={deepSearch ? 'animate-pulse' : ''} />
                    Deep Search {deepSearch ? 'ON' : 'OFF'}
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                        <div className={`
                            w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg
                            ${msg.role === 'user'
                                ? 'bg-gradient-to-tr from-indigo-600 to-indigo-500'
                                : 'bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-700'
                            }
                        `}>
                            {msg.role === 'user' ? <User size={20} className="text-white" /> : <Bot size={20} className="text-indigo-400" />}
                        </div>

                        <div className={`
                            max-w-[85%] rounded-[2rem] px-6 py-4 text-sm leading-relaxed shadow-sm
                            ${msg.role === 'user'
                                ? 'bg-indigo-600/10 text-indigo-100 rounded-tr-none border border-indigo-500/10'
                                : 'bg-slate-800/40 text-slate-200 rounded-tl-none border border-slate-700/50'
                            }
                        `}>
                            {msg.role === 'assistant' ? (
                                <ReactMarkdown
                                    components={{
                                        p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
                                        ul: ({ children }) => <ul className="list-disc ml-6 mb-4 space-y-2">{children}</ul>,
                                        ol: ({ children }) => <ol className="list-decimal ml-6 mb-4 space-y-2">{children}</ol>,
                                        li: ({ children }) => <li className="mb-1">{children}</li>,
                                        h1: ({ children }) => <h1 className="text-xl font-black text-indigo-400 mt-6 mb-4">{children}</h1>,
                                        h2: ({ children }) => <h2 className="text-lg font-bold text-indigo-300 mt-5 mb-3">{children}</h2>,
                                        h3: ({ children }) => <h3 className="text-md font-bold text-white mt-4 mb-2">{children}</h3>,
                                        code: ({ className, children, ...props }) => {
                                            const match = /language-(\w+)/.exec(className || '')
                                            return match ? (
                                                <div className="relative group my-4">
                                                    <code className={`${className} block bg-black/40 p-4 rounded-2xl border border-slate-700 font-mono text-xs overflow-x-auto`} {...props}>
                                                        {children}
                                                    </code>
                                                </div>
                                            ) : (
                                                <code className="bg-slate-700/50 px-1.5 py-0.5 rounded text-xs font-mono text-indigo-300" {...props}>
                                                    {children}
                                                </code>
                                            )
                                        },
                                        blockquote: ({ children }) => (
                                            <blockquote className="border-l-4 border-indigo-500/50 pl-4 py-1 my-4 italic text-slate-400 bg-indigo-500/5 rounded-r-xl">
                                                {children}
                                            </blockquote>
                                        )
                                    }}
                                >
                                    {msg.content}
                                </ReactMarkdown>
                            ) : (
                                <p className="whitespace-pre-wrap">{msg.content}</p>
                            )}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 animate-pulse">
                            <Bot size={20} className="text-indigo-500" />
                        </div>
                        <div className="bg-slate-800/20 border border-slate-700/50 rounded-[2rem] rounded-tl-none px-6 py-4 flex items-center gap-3 text-sm text-slate-500">
                            <div className="flex gap-1">
                                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
                            </div>
                            <span>Synthesizing knowledge from {deepSearch ? 'documents and web' : 'documents'}...</span>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-slate-800 bg-slate-950/20">
                <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto group">
                    <div className="absolute inset-0 bg-indigo-600/20 blur-2xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={deepSearch ? "Ask anything... (Deep Search active)" : "Query your workspace documents..."}
                        className="relative w-full bg-slate-900 border border-slate-700/50 rounded-[2rem] py-4 pl-8 pr-16 text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all shadow-xl"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white rounded-full transition-all flex items-center justify-center shadow-lg shadow-indigo-600/20"
                    >
                        <Send size={18} />
                    </button>
                </form>
                <div className="flex items-center justify-center gap-6 mt-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                    <div className="flex items-center gap-1.5">
                        <FileText size={12} className="text-slate-700" />
                        Multi-Doc RAG
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Globe size={12} className="text-slate-700" />
                        Web Augmented
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Check size={12} className="text-emerald-500/50" />
                        Source Citations
                    </div>
                </div>
            </div>
        </div>
    );
}
