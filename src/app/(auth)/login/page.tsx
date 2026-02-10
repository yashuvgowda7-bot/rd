'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const searchParams = useSearchParams();
    const message = searchParams.get('message');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await signIn('credentials', {
            email,
            password,
            callbackUrl: '/dashboard',
        });

        if (result?.error) {
            setError('Invalid email or password');
            setLoading(false);
        }
    };

    return (
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md">
            <h1 className="text-3xl font-bold text-white mb-6 text-center">Login</h1>
            {message && <div className="bg-emerald-500/20 border border-emerald-500 text-emerald-100 p-3 rounded-lg mb-4 text-sm text-center">{message}</div>}
            {error && <div className="bg-red-500/20 border border-red-500 text-red-100 p-3 rounded-lg mb-4 text-sm">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-white/80 text-sm mb-1">Email</label>
                    <input
                        type="email"
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-white/80 text-sm mb-1">Password</label>
                    <input
                        type="password"
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition transform active:scale-[0.98] disabled:opacity-50"
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
            <p className="mt-6 text-center text-white/60 text-sm">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="text-white hover:underline">
                    Sign Up
                </Link>
            </p>
        </div>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
            <Suspense fallback={<div className="text-white text-xl animate-pulse text-center">Loading...</div>}>
                <LoginForm />
            </Suspense>
        </div>
    );
}
