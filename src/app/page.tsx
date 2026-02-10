import { Navbar } from '@/components/navbar';
import { Shield, Database, Zap, ArrowRight, CheckCircle2, Globe, Lock } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-indigo-500/30">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <Zap className="w-4 h-4 fill-indigo-400" />
                Vercel & Neon DB Optimized
              </div>
              <h1 className="text-6xl md:text-8xl font-black text-white mb-8 leading-[1.05] tracking-tight animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-100">
                Next-Gen <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400">Admin Console</span>
              </h1>
              <p className="text-xl text-slate-400 leading-relaxed mb-12 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                Experience the first-ever role-based dashboard built for extreme performance. Scalable, secure, and ready to orchestrate your entire cloud infrastructure.
              </p>
              <div className="flex flex-wrap justify-center gap-6 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
                <Link
                  href="/signup"
                  className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl transition-all shadow-2xl shadow-indigo-600/30 active:scale-95 flex items-center gap-2"
                >
                  Start Building Now
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/login"
                  className="px-10 py-4 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl transition-all active:scale-95 border border-slate-800"
                >
                  Live Demo
                </Link>
              </div>
            </div>
          </div>

          {/* Background Decorative Orbs */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] -z-10"></div>
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[100px] -z-10"></div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 bg-slate-900/50 relative border-y border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Engineered for Excellence</h2>
              <p className="text-slate-500 max-w-xl mx-auto">Built on a world-class technology stack to ensure your data stays fast and protected.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: 'RBAC Security',
                  desc: 'Advanced Role-Based Access Control ensuring granular permissions for admins and users.',
                  icon: Shield,
                  color: 'text-indigo-400'
                },
                {
                  title: 'Neon Persistence',
                  desc: 'Blazing fast SQL queries with Neon DB serverless PostgreSQL integration.',
                  icon: Database,
                  color: 'text-emerald-400'
                },
                {
                  title: 'Next.js Power',
                  desc: 'Leveraging App Router and Server Components for instant page transitions.',
                  icon: Zap,
                  color: 'text-amber-400'
                }
              ].map((f, i) => (
                <div key={i} className="group p-8 bg-slate-950 border border-slate-800 rounded-[2rem] hover:border-indigo-500/50 transition-all duration-300">
                  <div className={`w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${f.color} border border-white/5`}>
                    <f.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{f.title}</h3>
                  <p className="text-slate-500 leading-relaxed text-sm font-medium">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Info Blocks */}
        <section id="security" className="py-24 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div className="relative">
                <div className="relative z-10 bg-gradient-to-br from-slate-900 to-indigo-950 border border-indigo-500/20 p-10 rounded-[3rem] shadow-2xl">
                  <div className="flex gap-4 mb-8">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  </div>
                  <div className="space-y-6">
                    <div className="h-4 w-3/4 bg-slate-800 rounded-full"></div>
                    <div className="h-4 w-1/2 bg-slate-800 rounded-full"></div>
                    <div className="h-4 w-full bg-slate-800/50 rounded-full"></div>
                    <div className="grid grid-cols-2 gap-4 mt-12">
                      <div className="h-24 bg-indigo-500/10 border border-white/5 rounded-2xl flex items-center justify-center">
                        <Lock className="w-8 h-8 text-indigo-400" />
                      </div>
                      <div className="h-24 bg-emerald-500/10 border border-white/5 rounded-2xl flex items-center justify-center">
                        <Globe className="w-8 h-8 text-emerald-400" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -inset-10 bg-indigo-500/10 rounded-full blur-[100px] -z-10 animate-pulse"></div>
              </div>

              <div className="space-y-8">
                <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
                  Security isn&apos;t an option. <br /> It&apos;s the <span className="text-indigo-400">Foundation.</span>
                </h2>
                <ul className="space-y-6">
                  {[
                    'Automated admin self-promotion on cold starts.',
                    'Manual review required for all new user onboarding.',
                    'BcryptJS password hashing with salt rounds.',
                    'JWT session management with strict expiration.'
                  ].map((text, i) => (
                    <li key={i} className="flex gap-4 items-center group">
                      <div className="p-1 bg-indigo-500/10 rounded-lg text-indigo-400 border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <span className="text-lg font-medium text-slate-300">{text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-indigo-400" />
            <span className="font-black text-white tracking-tighter">ADMINCORE</span>
          </div>
          <p className="text-slate-600 text-sm italic font-medium">© 2026 AdminCore Systems. Designed for the Modern Web.</p>
          <div className="flex gap-6 text-slate-500 text-sm font-bold">
            <a href="#" className="hover:text-white transition-all">Privacy</a>
            <a href="#" className="hover:text-white transition-all">Terms</a>
            <a href="#" className="hover:text-white transition-all">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
