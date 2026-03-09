import { ArrowRightIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CallToAction() {
    return (
        <div className="relative mx-auto flex w-full max-w-4xl flex-col justify-between gap-y-6 border-y border-white/20 bg-black px-4 py-16 font-mono overflow-hidden">
            {/* Plus Icons for technical feel */}
            <PlusIcon
                className="absolute top-[-12px] left-[-12px] z-10 size-6 text-white/40"
                strokeWidth={1}
            />
            <PlusIcon
                className="absolute top-[-12px] right-[-12px] z-10 size-6 text-white/40"
                strokeWidth={1}
            />
            <PlusIcon
                className="absolute bottom-[-12px] left-[-12px] z-10 size-6 text-white/40"
                strokeWidth={1}
            />
            <PlusIcon
                className="absolute right-[-12px] bottom-[-12px] z-10 size-6 text-white/40"
                strokeWidth={1}
            />

            {/* Decorative lines */}
            <div className="-inset-y-6 pointer-events-none absolute left-0 w-px border-l border-white/10" />
            <div className="-inset-y-6 pointer-events-none absolute right-0 w-px border-r border-white/10" />

            {/* Grid Pattern Background */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

            <div className="space-y-4 relative z-10">
                <h2 className="text-center font-bold text-3xl md:text-4xl text-white tracking-widest uppercase">
                    Evolve Your Workflow
                </h2>
                <p className="text-center text-gray-400 max-w-xl mx-auto uppercase text-xs tracking-[0.2em] leading-relaxed">
                    The future of development is vocal. Join the Synthea alpha and experience coding without limits.
                </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white hover:text-black rounded-none h-12 px-10">
                    READ DOCS
                </Button>
                <Button className="bg-white text-black hover:bg-gray-200 rounded-none h-12 px-10">
                    START SESSION <ArrowRightIcon className="size-4 ml-2" />
                </Button>
            </div>

            {/* Bottom technical text */}
            <div className="mt-8 text-center">
                <span className="text-[10px] text-white/20 uppercase tracking-[0.4em]">Node_Status: Active // Latency: 4ms</span>
            </div>
        </div>
    );
}
