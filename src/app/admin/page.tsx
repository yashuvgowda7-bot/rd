import { auth } from '@/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { notFound } from 'next/navigation';
import { UserCheck, UserX, Shield, User as UserIcon } from 'lucide-react';
import { desc, ne } from 'drizzle-orm';
import { ApproveButton } from '@/components/admin/approve-button';

export default async function AdminPage() {
    const session = await auth();

    if (session?.user?.role !== 'admin') {
        notFound();
    }


    const allUsers = await db.query.users.findMany({
        orderBy: [desc(users.createdAt)],
        where: session?.user?.id ? ne(users.id, session.user.id) : undefined,
    });

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
                <p className="text-slate-400">Approve new users or manage existing role permissions.</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-800/50 text-slate-400 text-xs uppercase font-bold">
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Joined</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {allUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center">
                                            <UserIcon className="w-5 h-5 text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">{user.name}</p>
                                            <p className="text-sm text-slate-500">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${user.role === 'admin' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-slate-800 text-slate-400'
                                        }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {user.isApproved ? (
                                        <div className="flex items-center gap-1.5 text-emerald-500">
                                            <UserCheck className="w-4 h-4" />
                                            <span className="text-sm font-medium">Approved</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5 text-amber-500">
                                            <Clock className="w-4 h-4" />
                                            <span className="text-sm font-medium">Pending</span>
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-500">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {!user.isApproved && (
                                        <ApproveButton userId={user.id} />
                                    )}
                                    {user.isApproved && user.role !== 'admin' && (
                                        <button className="text-slate-500 hover:text-red-400 transition-colors">
                                            <UserX className="w-5 h-5" />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {allUsers.length === 0 && (
                    <div className="p-12 text-center">
                        <p className="text-slate-500">No other users found in the system.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function Clock({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
        </svg>
    );
}
