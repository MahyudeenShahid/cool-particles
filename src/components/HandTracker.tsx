import React, { useEffect, useRef, useState } from 'react';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { Camera, RefreshCcw, AlertCircle } from 'lucide-react';
import type { HandData } from '../types';

interface HandTrackerProps {
    onHandUpdate: (data: HandData) => void;
}

const HandTracker: React.FC<HandTrackerProps> = ({ onHandUpdate }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const handLandmarkerRef = useRef<HandLandmarker | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isHandPresent, setIsHandPresent] = useState(false);

    // Use refs for values needed in the loop to avoid stale closures
    const lastTensionRef = useRef(0);
    const lastUpdateRef = useRef(0);
    const requestRef = useRef<number>(0);
    const onHandUpdateRef = useRef(onHandUpdate);

    // Keep the update ref current
    useEffect(() => {
        onHandUpdateRef.current = onHandUpdate;
    }, [onHandUpdate]);

    const calculateTension = (landmarks: any[]) => {
        const wrist = landmarks[0];
        const tips = [8, 12, 16, 20]; // Index, Middle, Ring, Pinky
        const mcpIndex = landmarks[5];
        const mcpPinky = landmarks[17];

        const palmSize = Math.sqrt(
            Math.pow(mcpIndex.x - mcpPinky.x, 2) +
            Math.pow(mcpIndex.y - mcpPinky.y, 2)
        );

        const distances = tips.map(idx => {
            const tip = landmarks[idx];
            return Math.sqrt(
                Math.pow(tip.x - wrist.x, 2) +
                Math.pow(tip.y - wrist.y, 2)
            );
        });

        const avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length;
        const ratio = avgDistance / (palmSize + 0.0001);

        // Open ~2.4, Closed ~1.0
        let tension = 1.0 - (ratio - 1.0) / 1.5;
        tension = Math.max(0, Math.min(1, tension));

        return tension;
    };

    const detectGesture = (landmarks: any[]): 'none' | 'peace' | 'thumbsUp' => {
        // Landmarkers: 4 (thumb tip), 8 (index tip), 12 (middle tip), 16 (ring tip), 20 (pinky tip)
        // Base points: 2, 5, 9, 13, 17
        const wrist = landmarks[0];
        const thumbTip = landmarks[4];
        const indexBase = landmarks[5];

        const isExtended = (tipIdx: number, baseIdx: number) => {
            const tip = landmarks[tipIdx];
            const base = landmarks[baseIdx];
            const distTip = Math.sqrt(Math.pow(tip.x - wrist.x, 2) + Math.pow(tip.y - wrist.y, 2));
            const distBase = Math.sqrt(Math.pow(base.x - wrist.x, 2) + Math.pow(base.y - wrist.y, 2));
            return distTip > distBase * 1.35; // Increased threshold for stability
        };

        const indexExtended = isExtended(8, 5);
        const middleExtended = isExtended(12, 9);
        const ringExtended = isExtended(16, 13);
        const pinkyExtended = isExtended(20, 17);

        const thumbExtended = Math.sqrt(Math.pow(thumbTip.x - indexBase.x, 2) + Math.pow(thumbTip.y - indexBase.y, 2)) > 0.18; // Increased for fist/thumbsUp clarity
        const thumbUp = thumbTip.y < landmarks[3].y && thumbTip.y < landmarks[2].y; // Thumb tip significantly above its base joints

        // Peace sign: index and middle extended, others closed
        if (indexExtended && middleExtended && !ringExtended && !pinkyExtended) {
            return 'peace';
        }

        // Thumbs up: thumb up and extended, others closed
        if (thumbUp && thumbExtended && !indexExtended && !middleExtended && !ringExtended) {
            return 'thumbsUp';
        }

        return 'none';
    };

    // The loop function is defined outside of the main render-loop logic to be stable
    const runPrediction = () => {
        const landmarker = handLandmarkerRef.current;
        const video = videoRef.current;

        if (landmarker && video && video.readyState >= 2) {
            const results = landmarker.detectForVideo(video, performance.now());

            if (results.landmarks && results.landmarks.length > 0) {
                const tension = calculateTension(results.landmarks[0]);
                const gesture = detectGesture(results.landmarks[0]);
                const now = performance.now();
                const isClapping =
                    lastTensionRef.current < 0.35 &&
                    tension > 0.8 &&
                    (now - lastUpdateRef.current) < 200;

                // Get hand position (wrist position normalized to -1 to 1)
                const wrist = results.landmarks[0][0];
                const handX = (0.5 - wrist.x) * 4;  // Invert X for mirror effect and scale
                const handY = (0.5 - wrist.y) * 4;  // Scale and keep Y

                // Call the ref'd update function
                onHandUpdateRef.current({ tension, isClapping, gesture, handX, handY });

                lastTensionRef.current = tension;
                lastUpdateRef.current = now;
                setIsHandPresent(true);
            } else {
                // No hand detected
                if (lastTensionRef.current !== 0) {
                    onHandUpdateRef.current({ tension: 0.5, isClapping: false, gesture: 'none', handX: 0, handY: 0 });
                }
                setIsHandPresent(false);
            }
        }
        requestRef.current = requestAnimationFrame(runPrediction);
    };

    useEffect(() => {
        const init = async () => {
            try {
                setIsLoading(true);
                const vision = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
                );
                const landmarker = await HandLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
                        delegate: "GPU"
                    },
                    runningMode: "VIDEO",
                    numHands: 1
                });
                handLandmarkerRef.current = landmarker;

                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 640, height: 480 }
                });

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadeddata = () => {
                        setIsLoading(false);
                        requestRef.current = requestAnimationFrame(runPrediction);
                    };
                }
            } catch (err) {
                console.error("MediaPipe initialization error:", err);
                setError("Camera access required for interaction.");
                setIsLoading(false);
            }
        };

        init();

        return () => {
            cancelAnimationFrame(requestRef.current);
            handLandmarkerRef.current?.close();
        };
    }, []);

    return (
        <div className="fixed top-4 right-4 z-50">
            <div className="relative w-48 h-36 rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl bg-black/40 backdrop-blur-md">
                {isLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white/60">
                        <RefreshCcw className="w-8 h-8 animate-spin mb-2" />
                        <span className="text-xs font-medium uppercase tracking-tighter">Syncing AI...</span>
                    </div>
                )}

                {error && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-red-400 p-4 text-center">
                        <AlertCircle className="w-6 h-6 mb-2" />
                        <span className="text-[10px] uppercase font-bold tracking-tight">{error}</span>
                    </div>
                )}

                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover scale-x-[-1] transition-opacity duration-1000 ${isLoading || error ? 'opacity-0' : 'opacity-100'}`}
                />

                <div className="absolute top-2 left-2 flex items-center gap-2">
                    <div className="px-2 py-0.5 rounded-full bg-black/40 border border-white/10 backdrop-blur-sm flex items-center gap-1.5">
                        <Camera className="w-3 h-3 text-cyan-400" />
                        <span className="text-[10px] text-white/80 font-mono tracking-wider">LIVE</span>
                    </div>
                    {isHandPresent && !isLoading && !error && (
                        <div className="px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 backdrop-blur-sm flex items-center gap-1">
                            <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />
                            <span className="text-[8px] text-cyan-300 font-bold uppercase tracking-tighter">Tracking</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HandTracker;
