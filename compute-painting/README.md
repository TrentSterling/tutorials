# Compute Shader Painting (Substance Clone)

Building a real-time 3D painter (like Substance Painter) requires updating high-resolution textures (4K+) every frame as the user moves their brush. Doing this on the CPU would cause the engine to stutter. The solution is to move the painting logic entirely to the **GPU**.

## 1. The Setup: Storage Textures
Your canvas is a `RenderTexture` with **Random Write** enabled. This allows a Compute Shader to write to any pixel (texel) at any time.

## 2. The Brush Pipeline
When the user clicks the 3D model:
1. **Raycast:** Find the UV coordinate $(u, v)$ where the mouse hit the mesh.
2. **Dispatch:** Send the UV and brush parameters (size, hardness, color) to the Compute Shader.
3. **The Shader:**
   - Every thread processes one pixel of the texture.
   - It calculates the distance between its own pixel and the "Brush UV."
   - If the distance is within the brush radius, it blends the brush color with the existing pixel color.

## 3. Architecture: The Buffer Stack
To create a professional tool, you don't just have one texture. You have a **Layer Stack**:
- **Paint Buffer:** Stores the raw color strokes.
- **Mask Buffer:** Stores transparency data.
- **Normal Buffer:** Stores the "bumpiness" of the paint.
A final "Composition Shader" runs at the end to flatten these layers into the final material seen on the model.

## 4. Why use Compute Shaders?
- **Ultra-High Resolution:** You can paint on an 8K texture with zero lag.
- **Procedural Brushes:** You can use noise functions (Perlin/Worley) inside the shader to create "grungy" or "organic" brush strokes.
- **Physics-Based Paint:** Since you're on the GPU, you can simulate paint "run-off" or "dripping" using simple fluid simulation on the same texture.

## 5. Summary
- Treat the texture as a **Data Buffer**.
- Perform distance checks in **UV Space**.
- Use **Atomic Operations** if multiple brushes are painting the same area.
