'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { LayoutDashboard, Users, Settings, LogOut, Shield, BookOpen, Files } from 'lucide-react';
import { cn } from '../../lib/utils';

export function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const isAdmin = session?.user?.role === 'admin';

    const menuItems = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        ...(isAdmin ? [{ name: 'User Management', href: '/admin', icon: Users }] : []),
        { name: 'Study', href: '/dashboard/study', icon: BookOpen },
        { name: 'Documents', href: '/dashboard/documents', icon: Files },
        { name: 'Settings', href: '/settings', icon: Settings },
    ];

    return (
        <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 w-64 p-4 text-slate-300">
            <div className="flex items-center gap-3 px-2 mb-8 mt-2">
                <div className="p-2 bg-indigo-600 rounded-lg">
                    <Shield className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold text-white text-xl">AdminCore</span>
            </div>

            <nav className="flex-1 space-y-1">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const active = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group",
                                active
                                    ? "bg-indigo-600/10 text-indigo-400"
                                    : "hover:bg-slate-800 hover:text-white"
                            )}
                        >
                            <Icon className={cn("w-5 h-5", active ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300")} />
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="pt-4 border-t border-slate-800">
                <div className="px-3 py-4 mb-4 bg-slate-800/50 rounded-lg">
                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Logged in as</p>
                    <p className="text-sm font-medium text-white truncate">{session?.user?.name}</p>
                    <p className="text-xs text-slate-500 truncate">{session?.user?.email}</p>
                </div>
                <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="flex items-center gap-3 px-3 py-2 w-full text-left rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-colors group text-slate-400"
                >
                    <LogOut className="w-5 h-5 group-hover:text-red-400" />
                    <span className="font-medium">Sign Out</span>
                </button>
            </div>
        </div>
    );
}
