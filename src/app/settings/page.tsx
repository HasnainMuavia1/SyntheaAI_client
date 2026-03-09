'use client';

import React, { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import { Settings as SettingsIcon, Shield, User as UserIcon, AlertTriangle, Loader2 } from 'lucide-react';
import { UserMenu } from '@/components/ui/UserMenu';
import { apiRequest } from '@/lib/api-client';

export default function SettingsPage() {
    const { user, logout } = useUser();
    const router = useRouter();

    const [name, setName] = useState(user?.name || '');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    // Protect route
    if (!user && typeof window !== 'undefined') {
        router.push('/signin');
        return null;
    }

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg('');
        setSuccessMsg('');

        try {
            const payload: any = {};
            if (name.trim() && name !== user?.name) payload.username = name;
            if (password.trim()) payload.password = password;

            if (Object.keys(payload).length === 0) {
                setIsLoading(false);
                return;
            }

            await apiRequest('/api/profile', {
                method: 'PUT',
                body: JSON.stringify(payload)
            });

            setSuccessMsg('Profile updated successfully.');
            setPassword(''); // Clear password field after update
            // Optionally ideally refresh user context here, but reloading for now
            setTimeout(() => window.location.reload(), 1000);

        } catch (err: any) {
            setErrorMsg(err.message || 'Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm("Are you absolutely sure you want to delete your account? This action cannot be undone.")) {
            return;
        }

        setIsLoading(true);
        try {
            await apiRequest('/api/profile', { method: 'DELETE' });
            // Proceed to logout
            logout();
        } catch (err: any) {
            setErrorMsg(err.message || 'Failed to delete account');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white font-mono selection:bg-white selection:text-black">
            {/* Top Navigation */}
            <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 bg-black/80 backdrop-blur z-50">
                <div className="flex items-center gap-4">
                    <div className="w-8 h-8 flex items-center justify-center bg-white/5 border border-white/10 rounded-sm">
                        <SettingsIcon size={16} className="text-blue-500" />
                    </div>
                    <span className="font-bold tracking-widest uppercase text-sm">Core_Settings</span>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push('/dashboard')} className="text-xs text-gray-400 hover:text-white uppercase tracking-widest transition-colors">
                        Return to Dashboard
                    </button>
                    <UserMenu />
                </div>
            </nav>

            <main className="max-w-3xl mx-auto px-6 py-20">
                <div className="mb-12">
                    <h1 className="text-4xl font-bold tracking-tighter uppercase mb-4">Account Config</h1>
                    <p className="text-gray-500 text-sm uppercase tracking-widest">Manage your personal node settings and security credentials.</p>
                </div>

                {errorMsg && (
                    <div className="mb-8 p-4 border border-red-500/20 bg-red-500/10 text-red-500 text-xs tracking-widest uppercase flex items-center gap-3">
                        <AlertTriangle size={16} /> {errorMsg}
                    </div>
                )}

                {successMsg && (
                    <div className="mb-8 p-4 border border-green-500/20 bg-green-500/10 text-green-500 text-xs tracking-widest uppercase flex items-center gap-3">
                        <Shield size={16} /> {successMsg}
                    </div>
                )}

                {/* Profile Update Form */}
                <section className="bg-[#18181b] border border-[#27272a] rounded-xl p-8 mb-8">
                    <h2 className="text-xl font-bold uppercase tracking-widest mb-6 flex items-center gap-3 border-b border-[#27272a] pb-4">
                        <UserIcon size={20} className="text-blue-500" /> Profile Details
                    </h2>

                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Node Designation (Username)</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-[#0a0a0a] border border-[#27272a] rounded p-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="Enter new username"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Access Protocol (Password)</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-[#0a0a0a] border border-[#27272a] rounded p-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="Leave blank to keep current"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || (!name.trim() && !password.trim())}
                            className="px-6 py-3 bg-blue-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-blue-500 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {isLoading ? <><Loader2 size={14} className="animate-spin" /> Syncing Node...</> : 'Update Parameters'}
                        </button>
                    </form>
                </section>

                {/* Danger Zone */}
                <section className="bg-red-950/10 border border-red-900/30 rounded-xl p-8">
                    <h2 className="text-xl font-bold uppercase tracking-widest mb-6 text-red-500 flex items-center gap-3 border-b border-red-900/30 pb-4">
                        <AlertTriangle size={20} /> Danger Zone
                    </h2>
                    <p className="text-gray-400 text-sm leading-relaxed mb-6">
                        Permanently deleting your account will erase all workspaces, saved settings, and active sessions. This operation is immediate and irreversible.
                    </p>
                    <button
                        onClick={handleDeleteAccount}
                        disabled={isLoading}
                        className="px-6 py-3 border border-red-500/50 text-red-500 text-xs font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {isLoading ? <Loader2 size={14} className="animate-spin" /> : 'Terminate Account'}
                    </button>
                </section>
            </main>
        </div>
    );
}
