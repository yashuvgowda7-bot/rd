import { auth } from '@/auth';
import { Activity, Users, CheckCircle, Clock } from 'lucide-react';

export default async function DashboardPage() {
    const session = await auth();

    const stats = [
        { name: 'Role', value: session?.user?.role, icon: Users, color: 'text-indigo-500' },
        { name: 'Status', value: session?.user?.isApproved ? 'Approved' : 'Pending', icon: CheckCircle, color: 'text-emerald-500' },
        { name: 'Activity', value: 'High', icon: Activity, color: 'text-pink-500' },
        { name: 'Last Login', value: 'Just now', icon: Clock, color: 'text-blue-500' },
    ];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {session?.user?.name}</h1>
                <p className="text-slate-400">Here's what's happening with your account today.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat) => (
                    <div key={stat.name} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 bg-slate-800 rounded-xl ${stat.color}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">{stat.name}</p>
                                <p className="text-xl font-bold text-white capitalize">{stat.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
                <h2 className="text-xl font-bold text-white mb-4">Account Information</h2>
                <div className="space-y-4">
                    <div className="flex justify-between py-3 border-b border-slate-800">
                        <span className="text-slate-400">Email Address</span>
                        <span className="text-white">{session?.user?.email}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-slate-800">
                        <span className="text-slate-400">Account ID</span>
                        <span className="text-white font-mono text-sm">{session?.user?.id}</span>
                    </div>
                    <div className="flex justify-between py-3">
                        <span className="text-slate-400">Member Since</span>
                        <span className="text-white">February 2026</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
