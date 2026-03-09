import React from 'react';
import { Check } from 'lucide-react';

const plans = [
    {
        name: 'Alpha',
        price: '$0',
        description: 'Perfect for solo developers and quick prototyping.',
        features: [
            'Basic voice commands',
            'AI code completion',
            'Community support',
            '1 project limit',
        ],
        buttonText: 'Start Free',
        isPopular: false,
    },
    {
        name: 'Beta',
        price: '$19',
        period: '/month',
        description: 'For professional developers who need advanced AI capabilities.',
        features: [
            'Advanced voice macros',
            'Context-aware multi-agent planning',
            'Priority email support',
            'Unlimited projects',
            'Custom LLM configuration',
        ],
        buttonText: 'Subscribe Now',
        isPopular: true,
    },
    {
        name: 'Omega',
        price: '$99',
        period: '/month',
        description: 'Enterprise-grade features for engineering teams.',
        features: [
            'Everything in Beta',
            'Dedicated private server',
            '24/7 priority support',
            'Custom integrations',
            'SLA guarantee',
            'Team collaboration tools',
        ],
        buttonText: 'Contact Sales',
        isPopular: false,
    },
];

export function Pricing() {
    return (
        <section id="pricing" className="py-24 bg-black border-y border-white/10 font-mono">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-2xl md:text-4xl text-white tracking-[0.3em] uppercase mb-4">
                        Initialize Access
                    </h2>
                    <p className="text-gray-500 text-xs uppercase tracking-[0.2em] max-w-2xl mx-auto">
                        Choose the protocol that fits your development workflow. No credit card required for Alpha.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`relative flex flex-col p-8 rounded-2xl border transition-all duration-300 hover:-translate-y-2 ${plan.isPopular
                                    ? 'bg-[#18181b] border-blue-500/50 shadow-2xl shadow-blue-500/10'
                                    : 'bg-[#0a0a0a] border-[#27272a] hover:border-gray-500/30'
                                }`}
                        >
                            {plan.isPopular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 text-white text-[10px] uppercase tracking-widest rounded-full font-bold">
                                    Recommended
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-xl text-white font-bold tracking-widest uppercase mb-2">
                                    {plan.name}
                                </h3>
                                <p className="text-xs text-gray-400 tracking-wider h-10">
                                    {plan.description}
                                </p>
                            </div>

                            <div className="mb-8">
                                <span className="text-4xl text-white font-bold">{plan.price}</span>
                                {plan.period && <span className="text-gray-500 text-sm ml-1">{plan.period}</span>}
                            </div>

                            <ul className="flex-1 space-y-4 mb-8">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-3 text-sm text-gray-300">
                                        <Check size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                                        <span className="leading-relaxed">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                className={`w-full py-4 text-xs font-bold uppercase tracking-widest rounded-sm transition-colors ${plan.isPopular
                                        ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20'
                                        : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                                    }`}
                            >
                                {plan.buttonText}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
