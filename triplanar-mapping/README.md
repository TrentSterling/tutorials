# Triplanar Mapping (Texturing without UVs)

UV unwrapping is notoriously tedious. **Triplanar Mapping** is a "Technical Art" technique that allows you to texture procedural meshes (terrain, voxels, or complex statues) perfectly without ever opening a UV editor.

## 1. The Concept: Projection Blending
Instead of using 2D coordinates assigned to vertices (UVs), we project the texture from three world-space directions: **X, Y, and Z**. 

Imagine three projectors pointed at your object:
- **Top/Bottom (Y):** Uses the `(position.x, position.z)` as coordinates.
- **Front/Back (Z):** Uses the `(position.x, position.y)` as coordinates.
- **Sides (X):** Uses the `(position.y, position.z)` as coordinates.

## 2. The Secret: Normal-Based Blending
If we just projected all three at once, they would overlap messily. We use the **Surface Normal** to determine which "projector" should be visible.
- If a face points straight up (Normal = `0, 1, 0`), we use the **Y** projection.
- If it's a vertical wall (Normal = `1, 0, 0`), we use the **X** projection.
- We use the absolute value of the normal and ensure they sum to 1.0 for a smooth blend.

## 3. Shader Implementation (HLSL)
```hlsl
float3 blending = abs(i.worldNormal);
blending /= (blending.x + blending.y + blending.z);

// Sample the texture from 3 directions
float4 xTex = tex2D(_MainTex, i.worldPos.zy * _Scale);
float4 yTex = tex2D(_MainTex, i.worldPos.xz * _Scale);
float4 zTex = tex2D(_MainTex, i.worldPos.xy * _Scale);

// Blend them based on the normal
float4 finalColor = xTex * blending.x + yTex * blending.y + zTex * blending.z;
```

## 4. Why use Triplanar?
- **Procedural Mesh Support:** Perfect for terrain generated at runtime where UVs aren't available.
- **No Seams:** Because it's based on world position, textures align perfectly between separate objects.
- **Speed:** Great for "Auto-Texturing" large environments or rocks.

## 5. Summary
- Project from 3 axes.
- Blend based on the normal.
- Zero UV unwrapping required.
