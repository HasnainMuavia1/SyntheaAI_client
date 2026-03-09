"use client"

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const SQRT_5000 = Math.sqrt(5000);

const testimonials = [
    {
        tempId: 0,
        testimonial: "The voice-driven workflow in Synthea has completely transformed how I handle boilerplate. I'm 5x faster now.",
        by: "Alex, CEO at TechCorp",
        imgSrc: "https://i.pravatar.cc/150?img=1"
    },
    {
        tempId: 1,
        testimonial: "I'm confident my source code is handled securely with Synthea's local-first approach.",
        by: "Dan, CTO at SecureNet",
        imgSrc: "https://i.pravatar.cc/150?img=2"
    },
    {
        tempId: 2,
        testimonial: "We were struggling with accessibility in our IDE until we found Synthea. It's a game changer.",
        by: "Stephanie, COO at InnovateCo",
        imgSrc: "https://i.pravatar.cc/150?img=3"
    },
    {
        tempId: 3,
        testimonial: "Synthea's voice commands make debugging almost seamless. I can't recommend it enough!",
        by: "Marie, CFO at FuturePlanning",
        imgSrc: "https://i.pravatar.cc/150?img=4"
    },
    {
        tempId: 4,
        testimonial: "If I could give 11 stars specifically for the voice engine, I'd give 12.",
        by: "Andre, Head of Design at CreativeSolutions",
        imgSrc: "https://i.pravatar.cc/150?img=5"
    },
    {
        tempId: 5,
        testimonial: "SO SO SO HAPPY I found Synthea! It's saved me 100+ hours of typing repetitive code.",
        by: "Jeremy, Product Manager at TimeWise",
        imgSrc: "https://i.pravatar.cc/150?img=6"
    }
];

interface TestimonialCardProps {
    position: number;
    testimonial: typeof testimonials[0];
    handleMove: (steps: number) => void;
    cardSize: number;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
    position,
    testimonial,
    handleMove,
    cardSize
}) => {
    const isCenter = position === 0;

    return (
        <div
            onClick={() => handleMove(position)}
            className={cn(
                "absolute left-1/2 top-1/2 cursor-pointer border-2 p-8 transition-all duration-500 ease-in-out font-mono",
                isCenter
                    ? "z-10 bg-white text-black border-white"
                    : "z-0 bg-black text-gray-400 border-white/20 hover:border-white/50"
            )}
            style={{
                width: cardSize,
                height: cardSize,
                clipPath: `polygon(50px 0%, calc(100% - 50px) 0%, 100% 50px, 100% 100%, calc(100% - 50px) 100%, 50px 100%, 0 100%, 0 0)`,
                transform: `
          translate(-50%, -50%) 
          translateX(${(cardSize / 1.5) * position}px)
          translateY(${isCenter ? -65 : position % 2 ? 15 : -15}px)
          rotate(${isCenter ? 0 : position % 2 ? 2.5 : -2.5}deg)
        `,
                boxShadow: isCenter ? "0px 8px 0px 4px rgba(255,255,255,0.1)" : "0px 0px 0px 0px transparent"
            }}
        >
            <span
                className="absolute block origin-top-right rotate-45 bg-white/20"
                style={{
                    right: -2,
                    top: 48,
                    width: SQRT_5000,
                    height: 2
                }}
            />
            <Image
                src={testimonial.imgSrc}
                alt={`${testimonial.by.split(',')[0]}`}
                width={48}
                height={56}
                className="mb-4 h-14 w-12 bg-gray-800 object-cover object-top filter grayscale"
                style={{
                    boxShadow: "3px 3px 0px rgba(255,255,255,0.2)"
                }}
            />
            <h3 className={cn(
                "text-base sm:text-xl font-medium tracking-tight",
                isCenter ? "text-black" : "text-white"
            )}>
                &quot;{testimonial.testimonial}&quot;
            </h3>
            <p className={cn(
                "absolute bottom-8 left-8 right-8 mt-2 text-xs italic uppercase tracking-widest",
                isCenter ? "text-black/60" : "text-gray-500"
            )}>
                - {testimonial.by}
            </p>
        </div>
    );
};

export const StaggerTestimonials: React.FC = () => {
    const [cardSize, setCardSize] = useState(365);
    const [testimonialsList, setTestimonialsList] = useState(testimonials);

    const handleMove = (steps: number) => {
        const newList = [...testimonialsList];
        if (steps > 0) {
            for (let i = steps; i > 0; i--) {
                const item = newList.shift();
                if (!item) return;
                newList.push({ ...item });
            }
        } else {
            for (let i = steps; i < 0; i++) {
                const item = newList.pop();
                if (!item) return;
                newList.unshift({ ...item });
            }
        }
        setTestimonialsList(newList);
    };

    useEffect(() => {
        const updateSize = () => {
            const { matches } = window.matchMedia("(min-width: 640px)");
            setCardSize(matches ? 365 : 290);
        };

        updateSize();
        window.addEventListener("resize", updateSize);
        return () => window.removeEventListener("resize", updateSize);
    }, []);

    return (
        <div
            className="relative w-full overflow-hidden bg-black py-20"
            style={{ height: 750 }}
        >
            <div className="absolute top-10 left-10 opacity-20 font-mono text-[10px] text-white uppercase tracking-[0.5em]">
                Validation_Protocol: Feedback_Loop
            </div>

            {testimonialsList.map((testimonial, index) => {
                const position = testimonialsList.length % 2
                    ? index - (testimonialsList.length - 1) / 2
                    : index - testimonialsList.length / 2;
                return (
                    <TestimonialCard
                        key={testimonial.imgSrc + index}
                        testimonial={testimonial}
                        handleMove={handleMove}
                        position={position}
                        cardSize={cardSize}
                    />
                );
            })}
            <div className="absolute bottom-12 left-1/2 flex -translate-x-1/2 gap-4">
                <button
                    onClick={() => handleMove(-1)}
                    className={cn(
                        "flex h-14 w-14 items-center justify-center text-2xl transition-all",
                        "bg-transparent border border-white/20 hover:border-white text-white",
                        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
                    )}
                    aria-label="Previous testimonial"
                >
                    <ChevronLeft />
                </button>
                <button
                    onClick={() => handleMove(1)}
                    className={cn(
                        "flex h-14 w-14 items-center justify-center text-2xl transition-all",
                        "bg-transparent border border-white/20 hover:border-white text-white",
                        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
                    )}
                    aria-label="Next testimonial"
                >
                    <ChevronRight />
                </button>
            </div>
        </div>
    );
};
