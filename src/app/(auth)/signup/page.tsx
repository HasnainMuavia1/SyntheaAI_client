'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Plus, Activity, Shield, Cpu, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SignUpPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, email: email, password: password }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || errorData.username?.[0] || 'Registration failed');
      }
      router.push('/signin?registered=true');
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex bg-black font-mono overflow-hidden">
      {/* Left Side: Branding & Intelligence HUD */}
      <div className="hidden lg:flex flex-1 flex-col p-8 relative border-r border-white/10 bg-[radial-gradient(circle_at_20%_30%,rgba(59,130,246,0.05)_0%,transparent_50%)]">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        <div className="relative z-10 flex flex-col h-full space-y-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="size-8 border-2 border-white flex items-center justify-center font-bold italic -skew-x-12 group-hover:bg-white group-hover:text-black transition-all">S</div>
            <span className="text-xl font-bold tracking-[0.2em] uppercase italic -skew-x-12">Synthea</span>
          </Link>

          <div className="space-y-4 flex-1 justify-center flex flex-col">
            <div className="space-y-1">
              <div className="text-[8px] text-blue-500 uppercase tracking-[0.4em]">Identity_Protocol: Inactive</div>
              <h2 className="text-2xl font-bold uppercase tracking-tighter leading-none">Register <br /> Your_<span className="text-blue-500">Node</span></h2>
            </div>

            <p className="text-white/30 text-[10px] max-w-xs leading-relaxed uppercase tracking-widest">
              Join the next generation of voice-first development.
            </p>

            <div className="space-y-3 pt-8">
              <div className="flex items-center gap-3 text-[8px] uppercase tracking-widest text-white/20">
                <Activity size={12} /> STATUS: PENDING
              </div>
              <div className="flex items-center gap-3 text-[8px] uppercase tracking-widest text-white/20">
                <Shield size={12} /> SEC_LAYER: READY
              </div>
              <div className="flex items-center gap-3 text-[8px] uppercase tracking-widest text-white/20">
                <Cpu size={12} /> VOCODER: ENABLED
              </div>
            </div>
          </div>

          <div className="text-[8px] text-white/10 uppercase tracking-[0.5em] mt-auto">
            © 2025 SYNT_PROT
          </div>
        </div>
      </div>

      {/* Right Side: Auth Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-8 relative">
        <div className="w-full max-w-sm space-y-6 relative z-10">
          <div className="space-y-2 text-center lg:text-left">
            <div className="inline-flex lg:hidden items-center gap-2 mb-4 justify-center w-full">
              <div className="size-6 border border-white flex items-center justify-center font-bold italic -skew-x-12">S</div>
              <span className="text-lg font-bold tracking-widest uppercase italic">Synthea</span>
            </div>
            <div className="text-[8px] text-blue-500 uppercase tracking-[0.4em]">Protocol_Initiation</div>
            <h1 className="text-3xl font-bold tracking-[0.2em] uppercase text-white">Register</h1>
            <p className="text-gray-500 uppercase text-[9px] tracking-widest">Begin identity synchronization.</p>
          </div>

          <div className="space-y-6">
            {error && (
              <div className="border border-red-500/20 bg-red-500/5 text-red-500 text-[8px] uppercase tracking-widest p-3 text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSignUp} className="space-y-3">
              <div className="space-y-2">
                <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full h-11 px-4 bg-white/5 border border-white/5 focus:border-white/20 focus:outline-none text-[10px] tracking-widest text-white placeholder:text-white/10 uppercase" placeholder="FULL_NAME" />
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full h-11 px-4 bg-white/5 border border-white/5 focus:border-white/20 focus:outline-none text-[10px] tracking-widest text-white placeholder:text-white/10 uppercase" placeholder="USER_EMAIL" />
                <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full h-11 px-4 bg-white/5 border border-white/5 focus:border-white/20 focus:outline-none text-[10px] tracking-widest text-white placeholder:text-white/10 uppercase" placeholder="SECURITY_KEY" />
              </div>

              <Button disabled={isLoading} type="submit" className="w-full h-12 bg-white text-black hover:bg-gray-200 rounded-none uppercase tracking-[0.3em] font-bold text-[10px]">
                {isLoading ? 'Processing...' : 'Initialize_Identity'}
              </Button>
            </form>

            <div className="pt-4 flex flex-col items-center gap-4">
              <Link href="/signin" className="group flex items-center gap-2 text-[9px] text-white/40 uppercase tracking-[0.3em] hover:text-white transition-all">
                <ArrowLeft size={10} className="group-hover:-translate-x-1 transition-transform" /> Back_To_Login
              </Link>
              <div className="h-px w-8 bg-white/10" />
            </div>
          </div>
        </div>

        {/* Plus Decorations */}
        <div className="absolute top-6 right-6 text-white/10"><Plus size={16} /></div>
        <div className="absolute bottom-6 right-6 text-white/10"><Plus size={16} /></div>
      </div>
    </div>
  );
}