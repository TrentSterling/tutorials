# Research & Methodology

This project is a synthesis of advanced game development research, moving beyond basic tutorials into the "Hard Systems" required for AAA-quality physics, AI, and networking.

## 1. Core Philosophy: The "Tront Twist"
Most tutorials focus on "how to do X." We focus on:
- **Performance at Scale:** (ECS, Spatial Hashing, 100k agent rendering).
- **Mathematical Rigor:** (SPD, FABRIK, Verlet).
- **Practical Robustness:** (Hysteresis, Idempotence, SPD).
- **VR & Networking First:** Every algorithm is considered for its impact on VR latency and network synchronization.

## 2. Key Influences & Sources
We stand on the shoulders of giants. Key research sources integrated into this hub include:
- **Digital Opus:** Advanced PD controller logic and force-based object control.
- **Alec Pizziferro:** Configurable Joint masterclass for VR physics hands.
- **Jie Tan et al.:** Stable Proportional Derivative (SPD) control for character physics.
- **20 Games Challenge:** Structural learning paths for finishing games.

## 3. Breakthroughs Synthesized
- **Inverse Force Climbing:** Using Newton’s 3rd law via Configurable Joints instead of kinematic state machines.
- **Stable Network Sync:** Using PD controllers to drive local proxies instead of position snapping.
- **Voxel-Discretized Light:** Approximating complex GI with 3D texture cone tracing.

## 4. The Roadmap Strategy
Each tutorial is categorized by:
- **Difficulty:** Junior to Architect.
- **Focus:** Math, Physics, AI, Arch, or Graphics.
- **Interactivity:** Every major concept includes a JS-based visualizer to bridge the gap between math and intuition.
