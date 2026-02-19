'use client';

import { useState, useRef } from 'react';
import { uploadDocument } from '@/actions/documents';
import { Loader2, Upload, CheckCircle2, AlertCircle } from 'lucide-react';

export function WorkspaceUploadForm({ workspaceId }: { workspaceId: string }) {
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setStatus(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('workspaceId', workspaceId);

        try {
            const result = await uploadDocument(formData);
            if (result.error) {
                setStatus({ type: 'error', message: result.error });
            } else {
                setStatus({ type: 'success', message: 'Document uploaded and indexed.' });
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        } catch (err) {
            setStatus({ type: 'error', message: 'Upload failed.' });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-4">
            <label className="relative group cursor-pointer block">
                <div className={`
                    border-2 border-dashed rounded-2xl p-6 transition-all flex flex-col items-center justify-center gap-2
                    ${uploading ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-slate-800/20 border-slate-700 hover:border-indigo-500/50 hover:bg-indigo-500/5'}
                `}>
                    {uploading ? (
                        <Loader2 className="animate-spin text-indigo-400" size={24} />
                    ) : (
                        <Upload size={24} className="text-slate-500 group-hover:text-indigo-400 transition-colors" />
                    )}
                    <span className="text-sm font-medium text-slate-400">
                        {uploading ? 'Processing PDF...' : 'Upload PDF'}
                    </span>
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept=".pdf"
                        onChange={handleUpload}
                        disabled={uploading}
                    />
                </div>
            </label>

            {status && (
                <div className={`
                    p-3 rounded-xl flex items-center gap-3 text-xs animate-in fade-in slide-in-from-top-2
                    ${status.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}
                `}>
                    {status.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                    {status.message}
                </div>
            )}
        </div>
    );
}
