# GPU-Driven Grass (1 Million Strands)

Standard "GameObject" grass will crush your CPU. To achieve truly lush, dense fields that react to the player, you must move the entire pipeline to the **GPU** using **Compute Shaders** and **Indirect Drawing**.

## 1. The Pipeline: Indirect Rendering
1. **Compute Shader:** Calculates the position, rotation, and height of every blade of grass once per frame (or on start).
2. **Append Buffer:** The shader "appends" visible blades to a GPU buffer.
3. **DrawMeshInstancedIndirect:** We tell the GPU: "Here is one blade of grass mesh. Look at that buffer I just made and render it 1,000,000 times."

## 2. Making it "Live": Wind & Interaction
Because the grass is rendered in a shader, we can animate it with zero CPU cost:
- **Wind:** We sample a "Wind Noise" texture using `WorldPosition + Time`.
- **Player Interaction:** We pass the player's position to the shader as a `Vector4`. The grass blades check their distance to the player and "bend" away if too close.

## 3. Frustum Culling (The Performance Savior)
We don't need to render grass behind the camera. In the Compute Shader, we check each blade's position against the **Camera Frustum**. If it's outside, we simply don't add it to the Append Buffer. This allows us to have "infinite" grass fields while only processing what the player actually sees.

## 4. Shader Snippet (Vertex Shader)
```hlsl
// Apply wind and bending in the vertex shader
float3 worldPos = instanceData[unity_InstanceID].pos;
float wind = tex2Dlod(_WindNoise, float4(worldPos.xz * _Scale + _Time.y, 0, 0)).r;

// Offset vertex based on height
v.vertex.xyz += v.normal * wind * v.uv.y * _WindStrength;
```

## 5. Summary
- Use **Compute Shaders** for culling and generation.
- Use **Indirect Drawing** to bypass CPU limits.
- Animate strand physics purely in the **Vertex Shader**.
