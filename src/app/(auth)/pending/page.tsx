'use client';

import { signOut } from 'next-auth/react';
import { Clock } from 'lucide-react';

export default function PendingPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 border-t-4 border-amber-500">
            <div className="max-w-md w-full p-8 text-center">
                <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Clock className="w-10 h-10 text-amber-500" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-4">Approval Pending</h1>
                <p className="text-slate-400 mb-8">
                    Your account has been created successfully, but an administrator needs to approve your access before you can use the dashboard.
                </p>
                <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition"
                >
                    Sign Out & Return to Login
                </button>
            </div>
        </div>
    );
}
