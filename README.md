# 💖 COOL PARTICLES

An immersive, AI-powered 3D particle system that responds to your hand gestures in real-time. Built with a focus on premium aesthetics and fluid interactions.

![COOL PARTICLES](https://img.shields.io/badge/Project-Cool%20Particles-cyan?style=for-the-badge)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white)
![MediaPipe](https://img.shields.io/badge/MediaPipe-007FFF?style=for-the-badge&logo=google&logoColor=white)

## ✨ Features

- **🧠 Gesture Recognition**: Uses MediaPipe AI to detect hand gestures (Peace, Thumbs Up, Fist, Open Hand).
- **🖐️ Real-time Interaction**: Particles follow your hand movement across the screen.
- **💝 High-Fidelity Volumetric Shapes**:
  - **Heart**: A sculpted 3D silhouette with exact silhouette mapping.
  - **Saturn**: Realistic solid planet with thick, luminous rings.
  - **Flower**: A 6-petal bloom with volumetric depth.
  - **Sphere**: A solid mass of light particles.
- **✨ Gesture-Specific Behaviors**:
  - ✌️ **Peace**: Creates a swirling **Vortex**.
  - 👍 **Thumbs Up**: Triggers an **Energy Pulse**.
  - ✊ **Fist**: Gathers all particles at the exact **Center** (Magnetic Centering).
  - 👋 **Open Hand**: Expands the shape and allows movement.
- **🎆 Quick Explosions**: Clap your hands to trigger a particle explosion!
- **🎨 Premium UI**: Glassmorphism HUD, interactive guide, and cinematic typography.

## 🚀 Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **3D Engine**: Three.js, @react-three/fiber, @react-three/drei
- **AI/ML**: Google MediaPipe Hand Landmarker
- **Styling**: Tailwind CSS, Lucide Icons, Framer Motion
- **Shaders**: Custom GLSL (Vertex & Fragment)

## 🛠️ Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/MahyudeenShahid/cool-particles.git
   
   cd cool-particles
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

## 🎮 How to Use

1. Grant camera access when prompted.
2. Wait for the "Syncing AI..." loader to complete.
3. Once tracking is active (blue indicator):
   - **Move hand**: Particles follow.
   - **Change Shape**: Use the side panel.
   - **Gestures**: Try Peace, Thumbs Up, or a Fist.
   - **Clap**: Trigger a burst of energy.

## 👨‍💻 Developed By

**Mahyudeen Shahid**
- Website: [mahyudeen.me](https://mahyudeen.me/)
- GitHub: [@MahyudeenShahid](https://github.com/MahyudeenShahid)

---
*Created with 💖 for high-end web practice.*
