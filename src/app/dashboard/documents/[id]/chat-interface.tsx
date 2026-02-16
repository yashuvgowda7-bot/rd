'use client';

import { chatWithDocument } from '@/actions/documents';
import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export function ChatInterface({ documentId }: { documentId: string }) {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Hello! I\'ve read your document. What would you like to know?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
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
            const response = await chatWithDocument(documentId, userMessage);

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
        <div className="flex flex-col h-full">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                        <div className={`
                            p-2 rounded-full flex-shrink-0
                            ${msg.role === 'user' ? 'bg-blue-600' : 'bg-purple-600'}
                        `}>
                            {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                        </div>

                        <div className={`
                            max-w-[80%] rounded-2xl px-5 py-3 text-sm leading-relaxed
                            ${msg.role === 'user'
                                ? 'bg-blue-600/20 text-blue-100 rounded-tr-none'
                                : 'bg-white/10 text-gray-200 rounded-tl-none'
                            }
                        `}>
                            {msg.role === 'assistant' ? (
                                <ReactMarkdown
                                    components={{
                                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                        ul: ({ children }) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
                                        ol: ({ children }) => <ol className="list-decimal ml-4 mb-2">{children}</ol>,
                                        li: ({ children }) => <li className="mb-1">{children}</li>,
                                        code: ({ className, children, ...props }) => {
                                            const match = /language-(\w+)/.exec(className || '')
                                            return match ? (
                                                <code className={className} {...props}>
                                                    {children}
                                                </code>
                                            ) : (
                                                <code className="bg-black/30 px-1 py-0.5 rounded text-xs font-mono" {...props}>
                                                    {children}
                                                </code>
                                            )
                                        }
                                    }}
                                >
                                    {msg.content}
                                </ReactMarkdown>
                            ) : (
                                msg.content
                            )}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex items-start gap-4">
                        <div className="p-2 rounded-full bg-purple-600 flex-shrink-0">
                            <Bot size={20} />
                        </div>
                        <div className="bg-white/10 rounded-2xl rounded-tl-none px-5 py-3 flex items-center gap-2 text-sm text-gray-400">
                            <Loader2 className="animate-spin" size={16} />
                            Thinking...
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/10 bg-black/20">
                <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask a question about the document..."
                        className="w-full bg-white/5 border border-white/10 rounded-full py-3.5 pl-6 pr-14 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white rounded-full transition-all"
                    >
                        <Send size={18} />
                    </button>
                </form>
                <p className="text-center text-xs text-gray-600 mt-2">
                    AI can make mistakes. Check important information.
                </p>
            </div>
        </div>
    );
}
