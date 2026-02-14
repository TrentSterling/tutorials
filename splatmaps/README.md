# Splatmap Texturing

A **Splatmap** (or Weightmap) is a control texture that tells the terrain shader which texture to draw where. This is how games achieve smooth transitions between grass, sand, and rock without creating thousands of unique textures.

## 1. How it Works: The RGBA Channels
A standard Splatmap uses the four color channels of a texture as weights for four different detail textures:
- **Red:** Channel weight for **Grass**.
- **Green:** Channel weight for **Dirt**.
- **Blue:** Channel weight for **Rock**.
- **Alpha:** Channel weight for **Snow**.

In the shader, we sample all four detail textures and multiply them by their respective weight from the Splatmap.

## 2. Shader Implementation (HLSL)
```hlsl
// Sample the control texture
float4 weights = tex2D(_SplatMap, i.uv);

// Sample the detail textures
float4 grass = tex2D(_GrassTex, i.worldPos.xz * _Tiling);
float4 dirt  = tex2D(_DirtTex, i.worldPos.xz * _Tiling);
float4 rock  = tex2D(_RockTex, i.worldPos.xz * _Tiling);
float4 snow  = tex2D(_SnowTex, i.worldPos.xz * _Tiling);

// Blend them
float4 final = (grass * weights.r) + (dirt * weights.g) + 
               (rock * weights.b) + (snow * weights.a);
```

## 3. Advanced: Texture Arrays
The 4-texture limit of a single RGBA splatmap is a common bottleneck.
- **The Solution:** Use **Texture2DArrays**.
- You can store a "Texture ID" in the Splatmap instead of a weight. This allows you to have 256+ different textures on a single terrain chunk with only 2-3 texture samples per pixel.

## 4. Procedural Splatmaps
You don't have to paint splatmaps by hand. You can generate them based on the terrain's geometry:
- **Slope:** If the normal is steep, increase the **Rock** weight.
- **Height:** If the height is above a certain level, increase the **Snow** weight.
- **Curvature:** Increase **Dirt** weight in valleys where sediment would collect.

## 5. Summary
- Use a control texture to define weights.
- Multi-texture blending creates natural, seamless transitions.
- Combine with **Triplanar Mapping** (see our other tutorial!) for the ultimate procedural environment.
