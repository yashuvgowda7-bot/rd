import { getWorkspace, getWorkspaceDocuments } from '@/actions/workspaces';
import { notFound } from 'next/navigation';
import { WorkspaceChatInterface } from './chat-interface';
import { WorkspaceUploadForm } from './upload-form';
import Link from 'next/link';
import { ChevronLeft, FileText, Settings } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function WorkspaceDetailPage(props: PageProps) {
    const params = await props.params;
    const workspace = await getWorkspace(params.id);

    if (!workspace) {
        notFound();
    }

    const documents = await getWorkspaceDocuments(workspace.id);

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard/workspaces"
                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                    >
                        <ChevronLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-white">{workspace.name}</h1>
                        <p className="text-sm text-slate-500">Workspace • {documents.length} Documents</p>
                    </div>
                </div>
                <button className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
                    <Settings size={20} />
                </button>
            </div>

            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar: Documents in Workspace */}
                <div className="lg:col-span-1 bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl p-6 flex flex-col gap-6 overflow-hidden">
                    <div>
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Upload</h3>
                        <WorkspaceUploadForm workspaceId={workspace.id} />
                    </div>

                    <div className="flex-1 min-h-0 flex flex-col">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Documents</h3>
                        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {documents.map((doc) => (
                                <div
                                    key={doc.id}
                                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/50 transition-colors group"
                                >
                                    <FileText size={18} className="text-indigo-400 shrink-0" />
                                    <span className="text-sm text-slate-300 truncate font-medium">{doc.title}</span>
                                </div>
                            ))}
                            {documents.length === 0 && (
                                <p className="text-xs text-slate-600 italic">No documents yet.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main: Chat Interface */}
                <div className="lg:col-span-3 bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl overflow-hidden shadow-2xl shadow-indigo-500/5">
                    <WorkspaceChatInterface workspaceId={workspace.id} />
                </div>
            </div>
        </div>
    );
}
