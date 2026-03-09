import React from "react";
import { Github, Twitter, Linkedin, Mail, ArrowUpRight } from "lucide-react";

export function Footer() {
    return (
        <footer className="w-full bg-black border-t border-white/10 pt-16 pb-12 font-mono">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-1 md:col-span-2 space-y-6">
                        <h2 className="text-2xl font-bold tracking-tighter text-white uppercase">Synthea</h2>
                        <p className="text-gray-400 max-w-sm text-sm leading-relaxed uppercase tracking-wider">
                            The next generation of development. Modular, vocal, and local-first. Built for the modern engineer.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="p-2 border border-white/10 hover:border-white/40 transition-colors text-white">
                                <Github size={18} />
                            </a>
                            <a href="#" className="p-2 border border-white/10 hover:border-white/40 transition-colors text-white">
                                <Twitter size={18} />
                            </a>
                            <a href="#" className="p-2 border border-white/10 hover:border-white/40 transition-colors text-white">
                                <Linkedin size={18} />
                            </a>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-xs font-bold text-white uppercase tracking-[0.3em]">Platform</h3>
                        <ul className="space-y-4">
                            <li><a href="#" className="text-gray-500 hover:text-white text-xs uppercase tracking-widest transition-colors flex items-center gap-1">Workflow <ArrowUpRight size={12} strokeWidth={3} /></a></li>
                            <li><a href="#" className="text-gray-500 hover:text-white text-xs uppercase tracking-widest transition-colors flex items-center gap-1">Voice Engine <ArrowUpRight size={12} strokeWidth={3} /></a></li>
                            <li><a href="#" className="text-gray-500 hover:text-white text-xs uppercase tracking-widest transition-colors flex items-center gap-1">Security <ArrowUpRight size={12} strokeWidth={3} /></a></li>
                        </ul>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-xs font-bold text-white uppercase tracking-[0.3em]">Connect</h3>
                        <ul className="space-y-4">
                            <li><a href="#" className="text-gray-500 hover:text-white text-xs uppercase tracking-widest transition-colors">Discord</a></li>
                            <li><a href="#" className="text-gray-500 hover:text-white text-xs uppercase tracking-widest transition-colors">Documentation</a></li>
                            <li><a href="mailto:contact@synthea.io" className="text-gray-500 hover:text-white text-xs uppercase tracking-widest transition-colors">Contact</a></li>
                            <li><a href="#" className="text-gray-500 hover:text-white text-xs uppercase tracking-widest transition-colors">Support</a></li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-[10px] text-white/40 uppercase tracking-[0.5em]">
                    &copy; 2025 Synthea_Protocol. All rights reserved.
                </div>
                <div className="flex gap-8 items-center">
                    <div className="flex items-center gap-2">
                        <div className="size-1.5 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-[10px] text-white/40 uppercase tracking-[0.2em]">System: Active</span>
                    </div>
                    <div className="text-[10px] text-white/40 uppercase tracking-[0.2em]">Region: US-EAST-1</div>
                </div>
            </div>
        </footer>
    );
}
