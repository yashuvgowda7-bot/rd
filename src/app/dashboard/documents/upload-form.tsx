'use client';

import { uploadDocument } from '@/actions/documents';
import { useActionState } from 'react';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

const initialState = {
    message: '',
    error: '',
};

export function UploadDocumentForm() {
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    // TODO: useActionState is experimental/requires setup, switching to standard form submission for stability
    // Or actually, let's use a simpler client component approach since I need immediate feedback on file selection

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!file) return;

        setIsUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const result = await uploadDocument(formData);
            if (result.error) {
                setError(result.error);
            } else {
                // Success - simplify reload/feedback
                setFile(null);
                // Optionally trigger a router refresh if the server action doesn't handle revalidatePath correctly
                // Check server action: it uses revalidatePath('/dashboard/documents')
            }
        } catch (err) {
            setError('Upload failed. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center gap-4">
            <label
                htmlFor="file-upload"
                className={`
                    cursor-pointer flex flex-col items-center justify-center 
                    w-full h-32 border-2 border-dashed rounded-lg transition-colors
                    ${file
                        ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                        : 'border-gray-600 hover:border-gray-500 text-gray-400 hover:text-gray-300'
                    }
                `}
            >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {file ? (
                        <>
                            <FileText className="w-8 h-8 mb-2" />
                            <p className="text-sm font-semibold truncate max-w-[200px]">{file.name}</p>
                            <p className="text-xs text-blue-300/70">Click to change</p>
                        </>
                    ) : (
                        <>
                            <Upload className="w-8 h-8 mb-2" />
                            <p className="text-sm font-semibold">Click to upload PDF</p>
                            <p className="text-xs text-gray-500">PDF (MAX. 10MB)</p>
                        </>
                    )}
                </div>
                <input
                    id="file-upload"
                    name="file"
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => {
                        const selected = e.target.files?.[0];
                        if (selected) {
                            if (selected.type !== 'application/pdf') {
                                setError('Only PDF files are allowed');
                                return;
                            }
                            setFile(selected);
                            setError(null);
                        }
                    }}
                />
            </label>

            {error && <p className="text-red-400 text-xs text-center">{error}</p>}

            <button
                type="submit"
                disabled={!file || isUploading}
                className={`
                    w-full py-2 px-4 rounded-lg text-sm font-medium transition-all
                    ${!file || isUploading
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                    }
                `}
            >
                {isUploading ? (
                    <span className="flex items-center justify-center gap-2">
                        <Loader2 className="animate-spin" size={16} />
                        Uploading...
                    </span>
                ) : (
                    'Upload Document'
                )}
            </button>
        </form>
    );
}
