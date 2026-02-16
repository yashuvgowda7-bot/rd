import { getDocuments } from '@/actions/documents';
import { UploadDocumentForm } from './upload-form';
import Link from 'next/link';
import { FileText, MessageSquare, Plus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default async function DocumentsPage() {
    // Fetch documents on the server
    const documents = await getDocuments();

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                        My Documents
                    </h1>
                    <p className="text-gray-400 mt-2">Upload PDFs and ask questions about them.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Upload Card */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col items-center justify-center text-center space-y-4 hover:bg-white/10 transition duration-300">
                    <div className="p-4 bg-blue-500/20 rounded-full text-blue-400">
                        <Plus size={32} />
                    </div>
                    <div className="w-full">
                        <UploadDocumentForm />
                    </div>
                </div>

                {/* Document Cards */}
                {documents.map((doc) => (
                    <Link
                        key={doc.id}
                        href={`/dashboard/documents/${doc.id}`}
                        className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col justify-between hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition duration-300 group relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MessageSquare className="text-blue-400" size={20} />
                        </div>

                        <div className="space-y-4 z-10">
                            <div className="flex items-start justify-between">
                                <div className="p-3 bg-white/5 rounded-lg text-blue-400 group-hover:scale-110 transition-transform">
                                    <FileText size={24} />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold line-clamp-2 group-hover:text-blue-400 transition-colors">
                                    {doc.title}
                                </h3>
                                <p className="text-xs text-gray-500 font-mono mt-1">
                                    Added {formatDistanceToNow(new Date(doc.createdAt), { addSuffix: true })}
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-sm text-gray-400 group-hover:text-white transition-colors">
                            <span>View & Chat</span>
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                        </div>
                    </Link>
                ))}

                {documents.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-500 border border-dashed border-white/10 rounded-xl">
                        No documents yet. Upload a PDF using the plus button above!
                    </div>
                )}
            </div>
        </div>
    );
}
