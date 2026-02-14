# Shadow Mapping

Shadow mapping is the standard technique for rendering shadows in 3D games. It works by treating the light as a camera and determining which surfaces are "visible" to the light and which are blocked.

## 1. The Two-Pass Process

### Pass 1: The Shadow Pass
Render the scene from the Light's point of view. 
- Instead of colors, we store only the **Depth** (distance from the light) in a special texture called the **Shadow Map**.
- This tells us exactly how far light can "travel" before hitting an object.

### Pass 2: The Lighting Pass
Render the scene from the Camera's perspective. For every pixel on screen:
1. Convert its world position into **Light Space**.
2. Calculate its current distance from the light (`pixelDepth`).
3. Sample the Shadow Map to see the closest thing the light hit (`mapDepth`).
4. **The Comparison:** 
   - If `pixelDepth > mapDepth`, something is blocking the light. The pixel is **In Shadow**.
   - Otherwise, it is **Lit**.

## 2. Common Challenges

### Shadow Acne
Tiny precision errors cause surfaces to shadow themselves, creating "Z-fighting" stripes. 
- **Fix:** Add a small **Bias** (an offset) to the depth comparison.

### Peter Panning
If the bias is too high, the shadow "detaches" from the object and appears to float.
- **Fix:** Use "Normal Bias" which pushes the shadow inward based on the surface normal.

### Resolution & Cascades
Standard shadow maps look blocky in the distance. 
- **The Solution:** **Cascaded Shadow Maps (CSM)**. We split the camera's view into different "frustum slices." Each slice gets its own shadow map. Close-up slices get high resolution, while distant ones get lower resolution.

## 3. Implementation (HLSL Snippet)
```hlsl
float4 lightSpacePos = mul(_WorldToShadowMatrix, float4(i.worldPos, 1.0));
float depthFromMap = tex2D(_ShadowMap, lightSpacePos.xy).r;

// The Comparison
float shadow = lightSpacePos.z > (depthFromMap + _Bias) ? 0.5 : 1.0;

return col * shadow;
```

## 4. Summary
- **Pass 1:** Save depth from light perspective.
- **Pass 2:** Compare pixel depth against that map.
- **CSM:** Scale resolution based on distance.
