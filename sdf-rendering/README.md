# SDF Rendering (Signed Distance Fields)

A Signed Distance Field (SDF) is a function or texture where each point stores the **distance** to the nearest edge or surface. The "Sign" indicates whether you are inside (negative) or outside (positive) the shape.

## 1. Why use SDFs?
- **Infinite Resolution:** SDFs can be sampled and interpolated, providing perfectly smooth edges regardless of zoom level. This is why tools like **TextMeshPro** and **Figma** use them.
- **Cheap Visual Effects:** 
  - **Outlines:** `if (dist > 0 && dist < thickness)`
  - **Glow/Shadows:** Use the distance value directly as an alpha gradient.
  - **Morphing:** Linearly interpolating between two SDFs creates a perfect "melting" transition.

## 2. Basic Math (2D Circle)
In a shader, rendering a circle is just calculating the distance from the current pixel to the center, then subtracting the radius.
```hlsl
float sdfCircle(vec2 p, float r) {
    return length(p) - r;
}

// In Fragment Shader:
float d = sdfCircle(uv, 0.5);
float col = d > 0.0 ? 0.0 : 1.0; // Hard edge
float aaCol = smoothstep(pixelSize, 0.0, d); // Anti-aliased edge
```

## 3. Boolean Operations (The "Magic")
Because SDFs are just numbers, you can combine shapes using simple math instead of complex mesh clipping:
- **Union:** `min(dA, dB)` (Combine shapes)
- **Intersection:** `max(dA, dB)` (Where they overlap)
- **Subtraction:** `max(dA, -dB)` (Cut a hole in A using B)
- **Smooth Union:** `min(dA, dB) - k * max(0, ...)` (The "Metaball" or "Blobby" effect)

## 4. 3D Raymarching
SDFs are the foundation of Raymarching (seen on **Shadertoy**). Instead of checking for triangle intersections, a ray "marches" forward by the distance stored in the SDF. Since the SDF tells you the "safe" distance to the nearest surface, you never over-step.

## 5. Multi-channel SDFs (MSDF)
Standard SDFs can lose detail at sharp corners. **MSDF** stores distance information in three color channels (RGB). By taking the median of the three, you can maintain perfectly sharp corners even for complex fonts and icons at tiny texture sizes.

## 6. Summary
SDFs turn geometry into a continuous mathematical field. They are the ultimate tool for high-quality UI, procedural 3D modeling, and performant visual effects.
