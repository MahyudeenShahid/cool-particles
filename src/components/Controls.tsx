import React from 'react';
import { Heart, Flower, Disc, Zap, Circle, Palette } from 'lucide-react';
import type { ShapeType } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ControlsProps {
    currentShape: ShapeType;
    onShapeChange: (shape: ShapeType) => void;
    currentColor: string;
    onColorChange: (color: string) => void;
    tension: number;
}

const SHAPES: { type: ShapeType; icon: React.ReactNode; label: string }[] = [
    { type: 'Sphere', icon: <Circle size={18} />, label: 'Sphere' },
    { type: 'Heart', icon: <Heart size={18} />, label: 'Heart' },
    { type: 'Flower', icon: <Flower size={18} />, label: 'Flower' },
    { type: 'Saturn', icon: <Disc size={18} />, label: 'Saturn' },
    { type: 'Fireworks', icon: <Zap size={18} />, label: 'Fireworks' },
];

const COLORS = [
    { value: '#00f7ff', label: 'Cyan' },
    { value: '#bd00ff', label: 'Nebula' },
    { value: '#ffcc00', label: 'Gold' },
    { value: '#ff006a', label: 'Rose' },
    { value: '#ffffff', label: 'Zen' },
];

const Controls: React.FC<ControlsProps> = ({
    currentShape,
    onShapeChange,
    currentColor,
    onColorChange,
    tension,
}) => {
    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-6 w-full max-w-2xl px-6">
            {/* Tension Bar */}
            <div className="w-full flex flex-col gap-2">
                <div className="flex justify-between items-end px-1">
                    <span className="text-[10px] font-bold text-white/40 tracking-widest uppercase">Hand Tension</span>
                    <span className="text-[10px] font-mono text-white/60">{(tension * 100).toFixed(0)}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                    <div
                        className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-rose-500 transition-all duration-150 ease-out"
                        style={{ width: `${tension * 100}%` }}
                    />
                </div>
            </div>

            {/* Main Panel */}
            <div className="w-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center justify-between shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]">

                {/* Shape Selector */}
                <div className="flex items-center gap-2">
                    {SHAPES.map((shape) => {
                        const isActive = currentShape === shape.type;
                        return (
                            <button
                                key={shape.type}
                                onClick={() => onShapeChange(shape.type)}
                                className={cn(
                                    "relative group flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-300",
                                    isActive
                                        ? "bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                                        : "text-white/40 hover:text-white/70 hover:bg-white/5"
                                )}
                                title={shape.label}
                            >
                                {shape.icon}
                                {isActive && (
                                    <span className="absolute -bottom-1 w-1 h-1 bg-cyan-400 rounded-full animate-pulse" />
                                )}
                                {/* Glow effect for active */}
                                {isActive && (
                                    <div className="absolute inset-0 rounded-xl bg-white/5 animate-pulse -z-1" />
                                )}
                            </button>
                        );
                    })}
                </div>

                <div className="h-8 w-px bg-white/10 mx-4" />

                {/* Color Picker */}
                <div className="flex items-center gap-3">
                    <Palette size={16} className="text-white/30 mr-1" />
                    {COLORS.map((color) => {
                        const isActive = currentColor === color.value;
                        return (
                            <button
                                key={color.value}
                                onClick={() => onColorChange(color.value)}
                                className={cn(
                                    "w-6 h-6 rounded-full border-2 transition-all duration-300 hover:scale-125",
                                    isActive ? "border-white scale-125 shadow-[0_0_15px_rgba(255,255,255,0.3)]" : "border-transparent opacity-60 hover:opacity-100"
                                )}
                                style={{ backgroundColor: color.value }}
                                title={color.label}
                            />
                        );
                    })}
                </div>
            </div>


        </div>
    );
};

export default Controls;
