import type { ShapeType } from '../types';

export function generateGeometry(type: ShapeType, count: number): Float32Array {
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
        let x = 0, y = 0, z = 0;

        switch (type) {
            case 'Sphere':
                {
                    const theta = Math.random() * Math.PI * 2;
                    const phi = Math.acos(2 * Math.random() - 1);
                    // Math.pow(Math.random(), 0.33) ensures even distribution in volume
                    const r = 2 * Math.pow(Math.random(), 0.33);
                    x = r * Math.sin(phi) * Math.cos(theta);
                    y = r * Math.sin(phi) * Math.sin(theta);
                    z = r * Math.cos(phi);
                }
                break;

            case 'Heart':
                {
                    // Volumetric 3D Heart - Exact & Centered
                    const t = Math.random() * Math.PI * 2;
                    const r = Math.pow(Math.random(), 0.33);

                    // The classic parametric heart formula
                    const hX = 16 * Math.pow(Math.sin(t), 3);
                    const hY = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);

                    // Vertical midpoint is (5 + (-17))/2 = -6. 
                    // To center at 0, we add 6.
                    const centeredY = hY + 6.0;

                    x = hX * 0.15 * r;
                    y = centeredY * 0.15 * r;

                    // Rounded 3D depth
                    const normalizedX = Math.abs(hX) / 16.0;
                    const depthFactor = Math.sqrt(Math.max(0, 1.0 - Math.pow(normalizedX, 2.0)));
                    z = (Math.random() - 0.5) * 2.8 * depthFactor * r;

                    // Final scaling
                    const scale = 0.75;
                    x *= scale;
                    y *= scale;
                    z *= scale;
                }
                break;

            case 'Flower':
                {
                    // Volumetric 3D Flower with better petal definition
                    const angle = Math.random() * Math.PI * 2;
                    const petals = 6;
                    const rBase = Math.pow(Math.random(), 0.5) * 2.5;
                    const petalEffect = 0.4 * Math.pow(Math.abs(Math.sin(angle * petals / 2.0)), 2.0);
                    const rValue = rBase * (0.6 + petalEffect);

                    x = rValue * Math.cos(angle);
                    y = rValue * Math.sin(angle);
                    // Add a slight "bowl" shape and thickness
                    z = (Math.pow(rValue / 2.5, 2.0) * 1.0) + (Math.random() - 0.5) * 0.25;
                }
                break;

            case 'Saturn':
                {
                    if (Math.random() > 0.4) {
                        // Solid Planet
                        const theta = Math.random() * Math.PI * 2;
                        const phi = Math.acos(2 * Math.random() - 1);
                        const r = 1.2 * Math.pow(Math.random(), 0.33);
                        x = r * Math.sin(phi) * Math.cos(theta);
                        y = r * Math.sin(phi) * Math.sin(theta);
                        z = r * Math.cos(phi);
                    } else {
                        // Thick Ring
                        const theta = Math.random() * Math.PI * 2;
                        const r = 1.8 + Math.random() * 0.8;
                        x = r * Math.cos(theta);
                        y = (Math.random() - 0.5) * 0.15;
                        z = r * Math.sin(theta);
                    }
                }
                break;

            case 'Fireworks':
                {
                    const theta = Math.random() * Math.PI * 2;
                    const phi = Math.acos(2 * Math.random() - 1);
                    const r = Math.pow(Math.random(), 0.5) * 3;
                    x = r * Math.sin(phi) * Math.cos(theta);
                    y = r * Math.sin(phi) * Math.sin(theta);
                    z = r * Math.cos(phi);
                }
                break;
        }

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
    }

    return positions;
}
