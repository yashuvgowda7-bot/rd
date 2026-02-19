import { getWorkspaces } from '@/actions/workspaces';
import { CreateWorkspaceForm } from './create-form';
import Link from 'next/link';
import { Folder, ChevronRight, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';

export default async function WorkspacesPage() {
    const workspaces = await getWorkspaces();

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black text-white mb-2">Workspaces</h1>
                <p className="text-slate-400">Organize your documents and chat with multiple files at once.</p>
            </div>

            <CreateWorkspaceForm />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workspaces.map((workspace) => (
                    <Link
                        key={workspace.id}
                        href={`/dashboard/workspaces/${workspace.id}`}
                        className="group bg-slate-900/40 backdrop-blur-md border border-slate-800 hover:border-indigo-500/50 p-6 rounded-3xl transition-all duration-300 flex flex-col justify-between"
                    >
                        <div>
                            <div className="p-4 rounded-2xl bg-indigo-500/10 text-indigo-400 ring-1 ring-inset ring-white/5 w-fit mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                <Folder className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">
                                {workspace.name}
                            </h3>
                            <div className="flex items-center gap-2 text-slate-500 text-sm">
                                <Calendar size={14} />
                                <span>{format(new Date(workspace.createdAt), 'MMM d, yyyy')}</span>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                View Workspace
                            </span>
                            <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                        </div>
                    </Link>
                ))}

                {workspaces.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-slate-900/20 border border-dashed border-slate-800 rounded-3xl">
                        <Folder className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                        <p className="text-slate-500 font-medium">No workspaces yet. Create one to get started!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
