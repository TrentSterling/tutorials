# Voxel Global Illumination (Voxel GI)

Global Illumination (GI) is notoriously expensive because light bounces infinitely. Ray tracing (Path Tracing) is the "correct" way but is slow. **Voxel GI** (often called VXGI) approximates the scene as a 3D grid of lighting volumes, allowing for real-time indirect lighting and glossy reflections.

## 1. The Core Idea: Cone Tracing
Instead of tracing millions of rays, we trace **Cones** through a mip-mapped 3D texture.
- **Direct Light:** We inject light into the voxel grid (e.g., from the Sun).
- **Indirect Light:** We propagate this light to neighboring voxels.
- **Cone Tracing:** For every pixel on screen, we sample the voxel grid using a "cone" shape. A wide cone gathers diffuse light; a narrow cone gathers sharp reflections.

## 2. The Pipeline
### Step 1: Voxelization
We render the scene geometry into a **3D Texture** (e.g., `256x256x256`).
- A Geometry Shader ensures triangles are "conservatively rasterized" so thin objects don't disappear.
- We store **Albedo**, **Normal**, and **Emissive** data in the voxels.

### Step 2: Light Injection
We inject direct lighting (shadow maps, point lights) into the voxel grid. If a voxel contains geometry, it receives light.

### Step 3: Mip-Mapping (Filtering)
We generate mip-maps for the 3D texture. Each lower mip level contains the average of its 8 children. This is crucial for performance—tracing a wide cone means sampling from a lower-resolution mip level.

### Step 4: Cone Tracing
In the final deferred shading pass:
- **Diffuse GI:** Trace a wide cone (aperture ~60°) along the surface normal.
- **Specular GI:** Trace a narrow cone along the reflection vector based on surface roughness.

## 3. Why Voxels?
- **Dynamic:** Objects can move, lights can change color/intensity instantly. No baking.
- **Volume:** Handles semi-transparent objects (smoke, glass) better than screen-space techniques.
- **Speed:** Tracing a few steps in a 3D texture is much faster than intersection testing millions of triangles.

## 4. Challenges
- **Light Leaking:** Thin walls might let light bleed through due to low voxel resolution.
- **Memory:** A 512^3 texture with RGBA16F takes hundreds of MBs of VRAM.
