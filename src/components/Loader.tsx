import React, { useEffect, useState } from 'react';

interface LoaderProps {
    isLoading: boolean;
}

const Loader: React.FC<LoaderProps> = ({ isLoading }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [progress, setProgress] = useState(0);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    useEffect(() => {
        if (!isLoading) {
            const timer = setTimeout(() => setIsVisible(false), 800);
            return () => clearTimeout(timer);
        }
    }, [isLoading]);

    useEffect(() => {
        if (isLoading) {
            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 99) return prev;
                    return prev + Math.random() * 2;
                });
            }, 100);
            return () => clearInterval(interval);
        } else {
            setProgress(100);
        }
    }, [isLoading]);

    if (!isVisible) return null;

    return (
        <div
            className={`fixed inset-0 z-[100] flex items-center justify-center bg-black transition-opacity duration-700 ${!isLoading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
            {/* Ambient Mouse-Following Glow */}
            <div
                className="absolute pointer-events-none w-[600px] h-[600px] bg-cyan-500/10 blur-[130px] rounded-full transition-transform duration-300 ease-out"
                style={{
                    left: `${mousePos.x}px`,
                    top: `${mousePos.y}px`,
                    transform: 'translate(-50%, -50%)'
                }}
            />

            <div className="relative flex flex-col items-center">
                {/* Main Interactive Circle */}
                <div className="relative w-48 h-48 mb-12 group cursor-none">
                    <div className="absolute inset-0 border-2 border-white/5 rounded-full" />
                    <div className="absolute inset-0 border-2 border-cyan-500/30 rounded-full animate-[spin_4s_linear_infinite]" />
                    <div className="absolute inset-4 border border-white/10 rounded-full animate-[spin_3s_linear_infinite_reverse]" />

                    {/* Inner Glowing Core */}
                    <div className="absolute inset-8 bg-gradient-to-tr from-cyan-600/40 to-cyan-400/10 rounded-full backdrop-blur-xl flex items-center justify-center shadow-[0_0_50px_rgba(6,182,212,0.2)]">
                        <div className="text-3xl font-black text-white/90 tracking-tighter">
                            {Math.floor(progress)}%
                        </div>
                    </div>

                    {/* Orbiting Particles (CSS dots) */}
                    {[...Array(3)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute top-0 left-1/2 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee]"
                            style={{
                                transformOrigin: `0 96px`,
                                transform: `rotate(${i * 120}deg)`,
                                animation: `spin ${2 + i}s linear infinite`
                            }}
                        />
                    ))}
                </div>

                {/* Text Elements */}
                <div className="text-center space-y-4">
                    <h2 className="text-white text-3xl font-black tracking-[0.4em] uppercase">
                        Cool Particles
                    </h2>
                    <div className="flex items-center justify-center gap-3">
                        <div className="h-px w-8 bg-white/20" />
                        <span className="text-cyan-400/60 text-[10px] font-bold uppercase tracking-[0.5em] animate-pulse">
                            Initializing AI Nexus
                        </span>
                        <div className="h-px w-8 bg-white/20" />
                    </div>
                </div>

                {/* Interactive Status Line */}
                <div className="mt-12 w-64 h-1 bg-white/5 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Loader Credits */}
                <div className="mt-8 flex flex-col items-center gap-1 opacity-0 animate-[fadeIn_1s_ease-out_0.5s_forwards]">
                    <span className="text-[8px] tracking-[0.4em] text-white/20 uppercase font-black">
                        Designed & Developed
                    </span>
                    <a
                        href="https://mahyudeen.me/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] tracking-[0.2em] text-white/40 font-bold uppercase transition-colors hover:text-cyan-400 no-underline"
                    >
                        Mahyudeen Shahid
                    </a>
                </div>
            </div>

            {/* Corner Decorative Elements */}
            <div className="absolute top-12 left-12 w-12 h-12 border-t-2 border-l-2 border-white/10" />
            <div className="absolute top-12 right-12 w-12 h-12 border-t-2 border-r-2 border-white/10" />
            <div className="absolute bottom-12 left-12 w-12 h-12 border-b-2 border-l-2 border-white/10" />
            <div className="absolute bottom-12 right-12 w-12 h-12 border-b-2 border-r-2 border-white/10" />
        </div>
    );
};

export default Loader;
