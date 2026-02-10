import { auth } from '@/auth';
import { Activity, Users, CheckCircle, Clock, Shield, Database, Layout, Bell, Terminal, Key, Cpu } from 'lucide-react';

export default async function DashboardPage() {
    const session = await auth();

    const stats = [
        { name: 'Identity', value: session?.user?.role, icon: Users, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
        { name: 'Approval', value: session?.user?.isApproved ? 'Verified' : 'Pending', icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        { name: 'Security', value: 'Active', icon: Shield, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { name: 'Uptime', value: '99.9%', icon: Cpu, color: 'text-pink-400', bg: 'bg-pink-500/10' },
    ];

    const guides = [
        {
            title: 'Role-Based Access Control',
            description: 'Your account is protected by RBAC. Admins can manage users, while users access personal data.',
            icon: Shield,
            color: 'text-indigo-400'
        },
        {
            title: 'Automated Approvals',
            description: 'The first registered user is auto-promoted to Admin. All others require manual verification.',
            icon: Key,
            color: 'text-amber-400'
        },
        {
            title: 'Neon Serverless DB',
            description: 'Data is persisted in Neon PostgreSQL, ensuring high availability and ACID compliance.',
            icon: Database,
            color: 'text-emerald-400'
        },
        {
            title: 'Scalable Architecture',
            description: 'Built with Next.js App Router for optimal performance, SEO, and developer experience.',
            icon: Layout,
            color: 'text-blue-400'
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 border border-slate-800 rounded-[2.5rem] p-10 md:p-16">
                <div className="relative z-10 max-w-3xl">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-6">
                        <Terminal className="w-4 h-4" />
                        System Active
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-white mb-6 leading-[1.1]">
                        Welcome to <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400">AdminCore</span>
                    </h1>
                    <p className="text-xl text-slate-400 leading-relaxed mb-10 max-w-2xl">
                        A high-performance management console designed for precision and security. Explore your system metrics and manage resources with ease.
                    </p>
                    <div className="flex flex-wrap gap-5">
                        <button className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-indigo-600/20 active:scale-95">
                            Get Started
                        </button>
                        <button className="px-8 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all active:scale-95 border border-slate-700">
                            System Guide
                        </button>
                    </div>
                </div>

                {/* Visual Orbs */}
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px]"></div>
            </div>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.name} className="group hover:scale-[1.02] bg-slate-900/40 backdrop-blur-md border border-slate-800 hover:border-indigo-500/50 p-6 rounded-3xl transition-all duration-300">
                        <div className="flex items-center gap-5">
                            <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} ring-1 ring-inset ring-white/5`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter mb-1">{stat.name}</p>
                                <p className="text-2xl font-black text-white">{stat.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Main Content Areas */}
                <div className="xl:col-span-2 space-y-8">
                    {/* Informative Cards */}
                    <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800 rounded-[2rem] p-8 md:p-10">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h2 className="text-2xl font-black text-white mb-2 tracking-tight">System Knowledge Base</h2>
                                <p className="text-slate-500 text-sm">Everything you need to know about your AdminCore instance.</p>
                            </div>
                            <div className="hidden sm:flex w-12 h-12 bg-slate-800 rounded-2xl items-center justify-center border border-slate-700">
                                <Bell className="w-6 h-6 text-slate-400" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {guides.map((guide) => (
                                <div key={guide.title} className="group flex gap-6">
                                    <div className={`mt-1 shrink-0 w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center ${guide.color} group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300`}>
                                        <guide.icon className="w-6 h-6" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">{guide.title}</h3>
                                        <p className="text-sm text-slate-400 leading-relaxed font-medium">{guide.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Tips */}
                    <div className="bg-indigo-600/5 border border-indigo-500/10 rounded-[2rem] p-8 flex items-start gap-6">
                        <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-600/20">
                            <Activity className="w-6 h-6" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-black text-white text-xl">Operational Intelligence</h3>
                            <p className="text-slate-400 leading-relaxed">
                                Our dashboard utilizes real-time monitoring to provide you with the most accurate data. For better insights, check the user management module to audit account permissions and approval queues.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Account Summary Sidebar */}
                <div className="space-y-8">
                    <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8">
                        <h2 className="text-xl font-bold text-white mb-8 tracking-tight">Active Identity</h2>
                        <div className="flex flex-col items-center text-center space-y-4 mb-8">
                            <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-4xl font-black text-white shadow-2xl shadow-indigo-600/20">
                                {session?.user?.name?.[0].toUpperCase()}
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-white tracking-tight">{session?.user?.name}</h3>
                                <p className="text-slate-500 font-medium text-sm">{session?.user?.email}</p>
                            </div>
                        </div>

                        <div className="space-y-4 pt-8 border-t border-slate-800/50">
                            <div className="bg-slate-800/30 p-4 rounded-2xl flex justify-between items-center group hover:bg-slate-800/50 transition-colors">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Role</span>
                                <span className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em]">{session?.user?.role}</span>
                            </div>
                            <div className="bg-slate-800/30 p-4 rounded-2xl flex justify-between items-center group hover:bg-slate-800/50 transition-colors">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Status</span>
                                <span className="text-xs font-black text-emerald-400 uppercase tracking-[0.2em]">
                                    {session?.user?.isApproved ? 'Approved' : 'Pending'}
                                </span>
                            </div>
                        </div>

                        <button className="w-full mt-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-indigo-600/10 active:scale-95 text-xs uppercase tracking-[0.2em]">
                            Update Profile
                        </button>
                    </div>

                    {/* Support Card */}
                    <div className="bg-slate-800/20 border border-slate-800 p-8 rounded-[2rem]">
                        <h4 className="text-white font-bold mb-2 tracking-tight">Need help?</h4>
                        <p className="text-slate-400 text-sm mb-6 leading-relaxed">Our technical support team is available 24/7 for system troubleshooting.</p>
                        <button className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors flex items-center gap-2 group">
                            Contact Support
                            <Clock className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
