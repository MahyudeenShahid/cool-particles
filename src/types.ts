export const VERSION = '1.0.0';
export type ShapeType = 'Sphere' | 'Heart' | 'Flower' | 'Saturn' | 'Fireworks';

export interface AppSettings {
    shape: ShapeType;
    color: string;
    particleCount: number;
}

export interface HandData {
    tension: number;
    isClapping: boolean;
    gesture: 'none' | 'peace' | 'thumbsUp';
    handX: number;  // -1 to 1 (left to right)
    handY: number;  // -1 to 1 (top to bottom)
}
