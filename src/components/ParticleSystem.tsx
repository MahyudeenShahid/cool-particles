import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { ShapeType } from '../types';
import { generateGeometry } from '../utils/geometryFactory';

interface ParticleSystemProps {
    shape: ShapeType;
    color: string;
    tension: number;
    isClapping: boolean;
    gesture: string;
    handX: number;
    handY: number;
    particleCount?: number;
}

const TRAIL_LENGTH = 5;

const vertexShader = `
  varying float vTrailIdx;
  varying float vRandom;
  
  uniform float uTime;
  uniform float uTension;
  uniform float uExplosion;
  uniform float uHandX;
  uniform float uHandY;
  uniform float uGesture; // 0: none, 1: peace, 2: thumbsUp, 3: pointing
  
  attribute vec3 targetPos;
  attribute float randomness;
  attribute float pScale;
  attribute float trailIdx;

  // Simplex 3D Noise 
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute( permute( permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );
    vec4 x = x_ * ns.x + ns.y;
    vec4 y = y_ * ns.x + ns.y;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
  }

  void main() {
    vTrailIdx = trailIdx;
    vRandom = randomness;

    float lag = trailIdx * 0.1;
    float time = uTime - lag;

    // Hand tension control: uTension 0.0 (fist) to 1.0 (open)
    // Closed fist (uTension=0) starts at a visible 1.0 scale
    float scaleFactor = mix(1.0, 4.0, uTension);
    vec3 pos = targetPos * scaleFactor;

    // Move particles based on hand position
    // The follow strength fades out as the hand closes, so a fist stays at the center
    float followStrength = smoothstep(0.1, 0.6, uTension);
    pos.x += uHandX * 1.5 * followStrength;
    pos.y -= uHandY * 1.5 * followStrength;  // Invert Y for natural movement

    // Subtle directional lean based on hand movement
    // Only lean when following the hand
    pos.x += uHandX * 0.4 * (pos.y + 1.0) * followStrength;
    pos.z += uHandY * 0.4 * (pos.y + 1.0) * followStrength;

    // Turbulence / Noise
    float noise = snoise(pos * 0.4 + time * 0.2);
    pos += noise * 0.3 * scaleFactor;

    // Movement test - ensures we see something moving
    pos.x += sin(uTime * 3.0 + randomness * 6.28) * 0.1 * (1.0 - uTension);

    // --- Gesture Specific Effects ---
    
    // 1. Peace Vortex (uGesture == 1.0)
    if (uGesture > 0.5 && uGesture < 1.5) {
        float angle = time * 2.0 + length(pos.xy) * 2.0;
        float s = sin(angle);
        float c = cos(angle);
        pos.xy = mat2(c, -s, s, c) * pos.xy;
    }
    
    // 2. Thumbs Up Pulse (uGesture == 2.0)
    if (uGesture > 1.5 && uGesture < 2.5) {
        float pulse = sin(uTime * 8.0) * 0.2 + 1.1;
        pos *= pulse;
    }

    // Breathing effect
    float breath = sin(time * 2.0) * 0.05;
    pos += normalize(pos + vec3(0.001)) * breath;

    // Explosion
    pos += normalize(pos + vec3(0.001)) * uExplosion * 5.0 * (1.0 - lag * 2.0);

    // Gravity pull when contracted
    pos.y -= (1.0 - uTension) * 0.4;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    
    // Much smaller, more delicate particles
    float size = pScale * (25.0 / -mvPosition.z);
    size *= (1.0 - trailIdx * 0.18);
    
    gl_PointSize = size;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  varying float vTrailIdx;
  varying float vRandom;
  uniform vec3 uColor;
  uniform float uTension;

  void main() {
    float dist = distance(gl_PointCoord, vec2(0.5));
    if (dist > 0.5) discard;

    // Richer glow: Brighter core, softer falloff
    float alpha = pow(1.0 - dist * 2.0, 1.5);
    alpha *= 0.9;
    alpha *= (1.0 - vTrailIdx * 0.2);
    
    vec3 tensionColor = mix(vec3(1.0, 0.4, 0.4), uColor, uTension); // Warmer red
    // Extra brightness in the center of each particle
    vec3 finalColor = mix(tensionColor, vec3(1.0), pow(1.0 - dist * 2.0, 2.0) * 0.9);

    gl_FragColor = vec4(finalColor, alpha);
  }
`;

const ParticleSystem: React.FC<ParticleSystemProps> = ({
    shape,
    color,
    tension,
    isClapping,
    gesture,
    handX,
    handY,
    particleCount = 5000
}) => {
    const meshRef = useRef<THREE.Points>(null);
    const explosionRef = useRef(0);

    const totalCount = particleCount * TRAIL_LENGTH;

    const { positions, targetPositions, randomness, pScales, trailIndices } = useMemo(() => {
        const target = generateGeometry(shape, particleCount);
        const pos = new Float32Array(totalCount * 3);
        const tar = new Float32Array(totalCount * 3);
        const rand = new Float32Array(totalCount);
        const scales = new Float32Array(totalCount);
        const trails = new Float32Array(totalCount);

        for (let i = 0; i < particleCount; i++) {
            const tx = target[i * 3];
            const ty = target[i * 3 + 1];
            const tz = target[i * 3 + 2];
            const r = Math.random();
            const s = 0.5 + Math.random();

            for (let t = 0; t < TRAIL_LENGTH; t++) {
                const idx = i + t * particleCount;
                // Initialize both position and target
                pos[idx * 3] = tx;
                pos[idx * 3 + 1] = ty;
                pos[idx * 3 + 2] = tz;
                tar[idx * 3] = tx;
                tar[idx * 3 + 1] = ty;
                tar[idx * 3 + 2] = tz;
                rand[idx] = r;
                scales[idx] = s;
                trails[idx] = t;
            }
        }

        return { positions: pos, targetPositions: tar, randomness: rand, pScales: scales, trailIndices: trails };
    }, [shape, particleCount]);

    useEffect(() => {
        if (isClapping) explosionRef.current = 1.0;
    }, [isClapping]);

    useFrame((state) => {
        if (meshRef.current) {
            const mat = meshRef.current.material as THREE.ShaderMaterial;
            if (mat && mat.uniforms) {
                const currentTime = state.clock.elapsedTime;
                const oldTime = mat.uniforms.uTime.value;

                mat.uniforms.uTime.value = currentTime;
                mat.uniforms.uTension.value = THREE.MathUtils.lerp(mat.uniforms.uTension.value, 1.0 - tension, 0.5);

                // Force Three.js to update the uniforms
                mat.uniformsNeedUpdate = true;

                // Detailed logging
                if (Math.floor(currentTime * 2) % 2 === 0 && Math.floor(currentTime * 20) % 20 === 0) {
                    console.log('Frame:', currentTime.toFixed(2), '| Old uTime:', oldTime.toFixed(2), '| New uTime:', mat.uniforms.uTime.value.toFixed(2), '| Changed:', (currentTime !== oldTime));
                }

                if (explosionRef.current > 0) {
                    explosionRef.current *= 0.92;
                    if (explosionRef.current < 0.01) explosionRef.current = 0;
                }
                mat.uniforms.uExplosion.value = explosionRef.current;
                mat.uniforms.uColor.value.set(color);

                // Update hand position uniforms
                if (mat.uniforms.uHandX && mat.uniforms.uHandY) {
                    // Smoothly follow hand position
                    mat.uniforms.uHandX.value = THREE.MathUtils.lerp(mat.uniforms.uHandX.value, handX, 0.1);
                    mat.uniforms.uHandY.value = THREE.MathUtils.lerp(mat.uniforms.uHandY.value, handY, 0.1);
                }

                // Gesture-based overrides or effects
                let gestureVal = 0;
                if (gesture === 'peace') gestureVal = 1;
                else if (gesture === 'thumbsUp') gestureVal = 2;

                mat.uniforms.uGesture.value = THREE.MathUtils.lerp(mat.uniforms.uGesture.value, gestureVal, 0.2);

                if (gesture === 'peace') {
                    // Peace gesture makes it extra glowy
                    mat.uniforms.uExplosion.value = Math.max(mat.uniforms.uExplosion.value, 0.2);
                }

                if (explosionRef.current > 0) {
                    explosionRef.current *= 0.92;
                    if (explosionRef.current < 0.01) explosionRef.current = 0;
                }
                mat.uniforms.uExplosion.value = Math.max(mat.uniforms.uExplosion.value, explosionRef.current);
                mat.uniforms.uColor.value.set(color);
            }
        }
    });

    const shaderMaterialConfig = useMemo(() => ({
        vertexShader,
        fragmentShader,
        uniforms: {
            uTime: { value: 0 },
            uTension: { value: 0 },
            uExplosion: { value: 0 },
            uHandX: { value: 0 },
            uHandY: { value: 0 },
            uGesture: { value: 0 },
            uColor: { value: new THREE.Color(color) }
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    }), []); // Empty deps - create once and never recreate

    return (
        <points ref={meshRef} key={shape}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[positions, 3]}
                />
                <bufferAttribute
                    attach="attributes-targetPos"
                    args={[targetPositions, 3]}
                />
                <bufferAttribute
                    attach="attributes-randomness"
                    args={[randomness, 1]}
                />
                <bufferAttribute
                    attach="attributes-pScale"
                    args={[pScales, 1]}
                />
                <bufferAttribute
                    attach="attributes-trailIdx"
                    args={[trailIndices, 1]}
                />
            </bufferGeometry>
            <shaderMaterial
                {...shaderMaterialConfig}
            />
        </points>
    );
};

export default ParticleSystem;
