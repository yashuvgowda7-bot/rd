'use client';

import { useState } from 'react';
import { generateStudyNotes } from '@/actions/generate-notes';
import ReactMarkdown from 'react-markdown';
import { Loader2, Wand2, Youtube, AlertCircle } from 'lucide-react';

export default function StudyPage() {
    const [url, setUrl] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setNotes('');

        try {
            const result = await generateStudyNotes(url);
            if (result.error) {
                setError(result.error);
            } else if (result.notes) {
                setNotes(result.notes);
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-indigo-500/20 rounded-lg text-indigo-400">
                        <Wand2 size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">AI Study Companion</h1>
                        <p className="text-white/60">Turn any YouTube video into structured study notes instantly.</p>
                    </div>
                </div>

                <form onSubmit={handleGenerate} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                            YouTube Video URL
                        </label>
                        <div className="relative">
                            <input
                                type="url"
                                required
                                placeholder="https://www.youtube.com/watch?v=..."
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 pl-11 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                            />
                            <Youtube className="absolute left-4 top-3.5 text-white/40" size={20} />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !url}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                Analyzing Video...
                            </>
                        ) : (
                            <>
                                <Wand2 size={20} className="group-hover:rotate-12 transition-transform" />
                                Generate Notes
                            </>
                        )}
                    </button>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-xl flex items-center gap-3 text-sm animate-in fade-in slide-in-from-top-2">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}
                </form>
            </div>

            {notes && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4">
                    <div className="prose prose-invert max-w-none prose-headings:text-indigo-300 prose-strong:text-white prose-li:text-white/80">
                        <ReactMarkdown>{notes}</ReactMarkdown>
                    </div>
                </div>
            )}
        </div>
    );
}
