'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Shield, LayoutDashboard, LogIn, UserPlus, LogOut } from 'lucide-react';

export function Navbar() {
    const { data: session, status } = useSession();
    const isLoggedIn = status === 'authenticated';

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-3 shadow-2xl">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg shadow-indigo-600/20">
                        <Shield className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-black text-white tracking-tight">Admin<span className="text-indigo-400">Core</span></span>
                </Link>

                <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-300">
                    <Link href="/#features" className="hover:text-white transition-colors">Features</Link>
                    <Link href="/#security" className="hover:text-white transition-colors">Security</Link>
                    <Link href="/#about" className="hover:text-white transition-colors">Documentation</Link>
                </div>

                <div className="flex items-center gap-3">
                    {isLoggedIn ? (
                        <>
                            <Link
                                href="/dashboard"
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all active:scale-95"
                            >
                                <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                                Dashboard
                            </Link>
                            <button
                                onClick={() => signOut({ callbackUrl: '/' })}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600/10 hover:bg-red-600/20 border border-red-600/20 text-red-500 transition-all active:scale-95"
                            >
                                <LogOut className="w-4 h-4" />
                                Sign Out
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all active:scale-95"
                            >
                                <LogIn className="w-4 h-4 text-indigo-400" />
                                Log In
                            </Link>
                            <Link
                                href="/signup"
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
                            >
                                <UserPlus className="w-4 h-4" />
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
