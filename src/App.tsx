import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import ParticleSystem from './components/ParticleSystem';
import HandTracker from './components/HandTracker';
import Controls from './components/Controls';
import type { AppSettings, HandData, ShapeType } from './types';

const App: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>({
    shape: 'Sphere',
    color: '#00f7ff',
    particleCount: 3000  // Reduced for clearer visibility
  });

  const [handData, setHandData] = useState<HandData>({
    tension: 0,
    isClapping: false,
    gesture: 'none',
    handX: 0,
    handY: 0
  });

  const handleShapeChange = (shape: ShapeType) => {
    setSettings(prev => ({ ...prev, shape }));
  };

  const handleColorChange = (color: string) => {
    setSettings(prev => ({ ...prev, color }));
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sans selection:bg-cyan-500/30">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_#1a1a1a_0%,_#000000_100%)] -z-10" />
      <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] -z-10 brightness-50" />

      {/* Hero Title */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 z-10 text-center pointer-events-none">
        <h1 className="text-5xl md:text-7xl font-black tracking-[0.3em] text-white/90 mb-2 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
          COOL PARTICLES
        </h1>
        <div className="h-px w-24 bg-gradient-to-r from-transparent via-white/40 to-transparent mx-auto mb-4" />
        <p className="text-white/30 text-xs tracking-[0.5em] uppercase font-bold">
          Bio-Interactive Visual Nexus
        </p>
      </div>

      <div className="absolute top-4 left-4 z-50 flex flex-col gap-4">
        {/* Status HUD */}
        <div className="px-4 py-2 bg-black/60 border border-cyan-500/40 rounded-lg backdrop-blur-sm shadow-[0_0_20px_rgba(6,182,212,0.15)] w-fit">
          <div className="text-cyan-400 text-[10px] font-mono uppercase tracking-[0.2em] mb-1 opacity-60">Status</div>
          <div className="text-cyan-400 text-xs font-mono">
            <div className="flex justify-between gap-4"><span>Focus:</span> <span className="text-white font-bold">{(1.0 - handData.tension).toFixed(2)}</span></div>
            {handData.gesture !== 'none' && (
              <div className="text-purple-400 font-bold animate-pulse mt-1 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                {handData.gesture.toUpperCase()}
              </div>
            )}
            {handData.isClapping && <div className="text-rose-400 font-bold animate-pulse mt-1">EXPLOSION!</div>}
          </div>
        </div>

        {/* Gesture Guide (Now on the left) */}
        <div className="hidden lg:block bg-black/40 backdrop-blur-md border border-white/10 p-4 rounded-xl text-white/60 text-[10px] font-bold tracking-widest uppercase w-48 shadow-xl">
          <div className="mb-3 text-cyan-400 opacity-100 border-b border-white/10 pb-2 flex items-center gap-2">
            <div className="w-1 h-3 bg-cyan-400 rounded-full" />
            <span>Interaction</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 group">
              <span className="text-base group-hover:scale-125 transition-transform">✌️</span>
              <div>
                <div className="text-white">Peace</div>
                <div className="text-[7px] opacity-40 font-mono tracking-normal capitalize">Vortex swirl</div>
              </div>
            </div>
            <div className="flex items-center gap-3 group">
              <span className="text-base group-hover:scale-125 transition-transform">👍</span>
              <div>
                <div className="text-white">Thumbs Up</div>
                <div className="text-[7px] opacity-40 font-mono tracking-normal capitalize">Energy pulse</div>
              </div>
            </div>
            <div className="flex items-center gap-3 group">
              <span className="text-base group-hover:scale-125 transition-transform">✊</span>
              <div>
                <div className="text-white">Fist</div>
                <div className="text-[7px] opacity-40 font-mono tracking-normal capitalize">Compress center</div>
              </div>
            </div>
            <div className="flex items-center gap-3 group">
              <span className="text-base group-hover:scale-125 transition-transform">👋</span>
              <div>
                <div className="text-white">Open</div>
                <div className="text-[7px] opacity-40 font-mono tracking-normal capitalize">Expand & move</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Credits - Improved styling */}
      <div className="absolute bottom-8  z-10 text-center pointer-events-auto">
        <div className="px-6 py-4 bg-white/[0.03] backdrop-blur-md border border-white/5 rounded-2xl shadow-2xl transition-all hover:bg-white/[0.05] hover:border-cyan-500/20 group">
          <a
            href="https://mahyudeen.me/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1.5 no-underline"
          >
            <span className="text-[9px] tracking-[0.5em] text-white/20 uppercase font-black">
              Crafted By
            </span>
            <div className="flex items-center gap-2">
              <div className="h-px w-4 bg-cyan-500/30 group-hover:w-8 transition-all" />
              <span className="text-sm tracking-[0.3em] text-white/70 font-semibold uppercase group-hover:text-cyan-400">
                Mahyudeen Shahid
              </span>
              <div className="h-px w-4 bg-cyan-500/30 group-hover:w-8 transition-all" />
            </div>
            <span className="text-[8px] text-white/10 mt-1 uppercase tracking-widest font-bold group-hover:text-cyan-500/30">
              mahyudeen.me
            </span>
          </a>
        </div>
      </div>

      {/* 3D Scene */}
      <div className="absolute inset-0 z-0">
        <Canvas dpr={[1, 2]}>
          <Suspense fallback={null}>
            <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={75} />
            <OrbitControls
              enableZoom={true}
              enablePan={false}
              autoRotate={false}
              autoRotateSpeed={0}
            />

            <ParticleSystem
              shape={settings.shape}
              color={settings.color}
              tension={handData.tension}
              isClapping={handData.isClapping}
              gesture={handData.gesture}
              handX={handData.handX}
              handY={handData.handY}
              particleCount={settings.particleCount}
            />

            <Environment preset="night" />
          </Suspense>
        </Canvas>
      </div>

      {/* UI Layers */}
      <HandTracker onHandUpdate={setHandData} />

      <Controls
        currentShape={settings.shape}
        onShapeChange={handleShapeChange}
        currentColor={settings.color}
        onColorChange={handleColorChange}
        tension={handData.tension}
      />

      {/* Vignette Effect */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,1)]" />
    </div>
  );
};

export default App;
