'use client';

import { useState, useEffect } from 'react';
import HeroAscii from '@/components/ui/hero-ascii';
import { Mic, ChevronRight } from 'lucide-react';

import { StaggerTestimonials } from '@/components/ui/stagger-testimonials';
import { CallToAction } from '@/components/ui/cta-3';
import { WavePath } from '@/components/ui/wave-path';
import { Navbar } from '@/components/ui/navbar';
import { Pricing } from '@/components/ui/pricing';

import { Footer } from '@/components/ui/footer';

export default function LandingPage() {
  const [showIntro, setShowIntro] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const hasSeenIntro = localStorage.getItem('has_seen_intro_v2');
    if (!hasSeenIntro) {
      setShowIntro(true);
    }
  }, []);

  const dismissIntro = () => {
    setIsExiting(true);
    setTimeout(() => {
      setShowIntro(false);
      localStorage.setItem('has_seen_intro_v2', 'true');
    }, 500);
  };

  if (!mounted) return null;

  return (
    <div className="relative w-full bg-black overflow-x-hidden selection:bg-white selection:text-black">
      <Navbar />

      {/* Existing Intro Overlay */}
      {showIntro && (
        <div
          className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black text-white transition-opacity duration-500 ${isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[600px] max-h-[600px] bg-blue-600/20 rounded-full blur-[100px] animate-pulse pointer-events-none" />

          <div className="relative z-10 w-full max-w-2xl px-6 text-center space-y-8">
            <div className="inline-flex items-center justify-center p-4 bg-white/5 backdrop-blur-md rounded-2xl mb-4 shadow-2xl ring-1 ring-white/10">
              <Mic size={48} className="text-blue-500" />
            </div>

            <h1 className="text-4xl md:text-7xl font-bold tracking-tight bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent font-mono">
              SYNTHEA
            </h1>

            <p className="text-base md:text-xl text-gray-400 leading-relaxed max-w-lg mx-auto font-mono uppercase tracking-wider">
              Voice-First Development Environment.
            </p>

            <div className="flex flex-col sm:row gap-4 justify-center pt-8 w-full max-w-md mx-auto">
              <button
                onClick={dismissIntro}
                className="w-full px-8 py-4 bg-white text-black rounded-sm font-bold text-lg transition-all hover:bg-gray-200 active:scale-95 flex items-center justify-center gap-2 font-mono"
              >
                INITIALIZE <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <HeroAscii />

      {/* Wave Path Divider */}
      <div className="flex justify-center py-20 bg-black">
        <WavePath />
      </div>

      {/* Testimonials Section */}
      <div id="testimonials" className="border-y border-white/10">
        <div className="container mx-auto px-6 pt-20 text-center">
          <h2 className="text-2xl md:text-4xl font-mono text-white tracking-[0.3em] uppercase mb-4">Voice of the Alpha</h2>
          <p className="text-gray-500 font-mono text-xs uppercase tracking-[0.2em] mb-12">Consensus from our early engineering partners</p>
        </div>
        <StaggerTestimonials />
      </div>

      {/* World of Art Section (Features) */}
      <div id="features" className="py-32 bg-black flex justify-center">
        <div className="flex w-[70vw] flex-col items-end font-mono">
          <WavePath className="mb-10" />
          <div className="flex w-full flex-col items-end text-right">
            <div className="flex justify-end gap-12 group">
              <p className="text-blue-500 uppercase text-[10px] tracking-[0.4em] mt-2 whitespace-nowrap opacity-50 group-hover:opacity-100 transition-opacity">World_of_Art</p>
              <p className="text-white/80 w-3/4 text-2xl md:text-5xl uppercase tracking-tighter leading-tight font-bold">
                Experience the emotions of artists through their works. Let the
                beauty of art inspire you and fill your soul.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Wave Path Divider Reverse */}
      <div className="flex justify-center py-20 bg-black rotate-180">
        <WavePath />
      </div>

      {/* Pricing Section */}
      <Pricing />

      {/* CTA Section */}
      <div className="py-32 bg-black border-t border-white/10">
        <CallToAction />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="p-6 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 hover:border-blue-500/30 transition-all hover:-translate-y-1">
      <div className="w-12 h-12 bg-white dark:bg-white/10 rounded-xl flex items-center justify-center mb-4 shadow-sm">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}