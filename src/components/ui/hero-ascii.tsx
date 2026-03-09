'use client';

import { useEffect, useState } from 'react';
import { Mic, CornerDownRight, Zap, Activity, Shield, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SplineScene } from '@/components/ui/splite';
import Link from 'next/link';

export default function HeroAscii() {
    const [status, setStatus] = useState('System.Active');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const statuses = ['System.Active', 'Processing Voice Input', 'Analyzing Context', 'Synthesizing Response'];
        let i = 0;
        const interval = setInterval(() => {
            i = (i + 1) % statuses.length;
            setStatus(statuses[i]);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    if (!mounted) return null;

    return (
        <section className="relative h-screen min-h-[600px] overflow-hidden bg-black border-b border-white/10 font-mono">
            {/* Background Dither / Grid */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

            {/* Header / HUD */}
            <div className="absolute top-20 left-0 w-full p-6 flex justify-between items-start z-20 pointer-events-none">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="size-2 bg-blue-500 animate-pulse" />
                        <span className="text-[10px] text-white/40 tracking-[0.4em] uppercase">Synthea_Node_01</span>
                    </div>
                </div>

                <div className="text-right flex flex-col items-end">
                    <div className="bg-white/5 border border-white/10 px-3 py-1 backdrop-blur-md">
                        <span className="text-[10px] text-blue-400 animate-pulse">{status}</span>
                    </div>
                </div>
            </div>

            {/* 3D Spline Scene (Robot) - Moved to Right and Fully Bright */}
            <div className="absolute top-0 right-0 w-full lg:w-1/2 h-full z-10 pointer-events-none">
                <SplineScene
                    scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                    className="w-full h-full opacity-100"
                />
            </div>

            {/* Main Content Overlay - Shrunk Text */}
            <div className="relative z-20 container mx-auto h-full flex flex-col justify-center px-6 md:px-12 pointer-events-none">
                <div className="max-w-xl space-y-6">
                    <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 px-2 py-0.5 border border-white/5 bg-white/5 uppercase tracking-[0.5em] text-[8px] text-white/30">
                            <Zap size={8} className="text-blue-500" /> Active_Session
                        </div>

                        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter leading-tight text-white uppercase flex flex-col pointer-events-auto selection:bg-white selection:text-black">
                            <span>Voice</span>
                            <span className="text-blue-500">Development</span>
                        </h1>
                    </div>

                    <p className="text-gray-500 text-xs md:text-sm max-w-md leading-relaxed uppercase tracking-widest border-l border-white/5 pl-4 pointer-events-auto selection:bg-white selection:text-black">
                        The world&apos;s first voice-native development environment. Code at the speed of thought.
                        No keys required. Just intent.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 pt-2 pointer-events-auto">
                        <Button className="bg-white text-black hover:bg-gray-200 rounded-none h-12 px-8 font-bold tracking-[0.2em] text-[10px]">
                            INITIATE SESSION <CornerDownRight size={14} className="ml-2" />
                        </Button>
                        <Button variant="outline" asChild className="border-white/10 hover:bg-white hover:text-black rounded-none h-12 px-8 tracking-[0.2em] text-[10px] uppercase">
                            <Link href="/signin">Sign In_Protocol</Link>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Bottom HUD accents */}
            <div className="absolute bottom-6 left-6 flex gap-8 z-20 pointer-events-none opacity-20">
                <div className="flex items-center gap-2">
                    <Activity size={12} className="text-white" />
                    <span className="text-[8px] text-white uppercase tracking-[0.3em]">Live_Stream: OK</span>
                </div>
                <div className="flex items-center gap-2">
                    <Shield size={12} className="text-white" />
                    <span className="text-[8px] text-white uppercase tracking-[0.3em]">Encrypted: ACTIVE</span>
                </div>
            </div>

            {/* Corner styling */}
            <div className="absolute top-0 right-0 p-2 opacity-10"><Terminal size={10} /></div>
            <div className="absolute bottom-0 left-0 p-2 opacity-10 rotate-180"><Terminal size={10} /></div>
        </section>
    );
}
