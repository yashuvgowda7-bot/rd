'use client';

import { useState } from 'react';
import { createWorkspace } from '@/actions/workspaces';
import { Loader2, Plus } from 'lucide-react';

export function CreateWorkspaceForm() {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || loading) return;

        setLoading(true);
        setError('');

        try {
            const result = await createWorkspace(name);
            if (result.error) {
                setError(result.error);
            } else {
                setName('');
            }
        } catch (err) {
            setError('An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mb-8">
            <div className="flex flex-col gap-2">
                <label htmlFor="workspace-name" className="text-sm font-medium text-slate-400">
                    Create New Workspace
                </label>
                <div className="flex gap-3">
                    <input
                        id="workspace-name"
                        type="text"
                        placeholder="Workspace name..."
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading || !name.trim()}
                        className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl transition-all flex items-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                        Create
                    </button>
                </div>
                {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
            </div>
        </form>
    );
}
