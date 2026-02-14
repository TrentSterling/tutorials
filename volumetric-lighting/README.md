# Volumetric Lighting (The "HL2" Way)

True volumetric lighting (raymarching through a dense volume of fog) is incredibly expensive for real-time games, especially in VR. However, you can achieve the iconic "God Ray" or "Light Beam" look with extreme efficiency using **Faked Volumetrics**—a technique perfected by Valve in *Half-Life 2*.

## 1. The Geometry-Based Approach
Instead of fog, we use **Transparent Mesh Geometry** (usually a cone or cylinder) placed at the light source.
- **Pros:** It's a standard draw call. No expensive raymarching.
- **Cons:** It's a "faked" effect that requires clever shading to look natural.

## 2. The Three Secret Ingredients

### 1. View-Angle Fading (The "Fresnel" Trick)
If you look directly at the side of a transparent cone, you see the edges. To hide these and make the beam look "wispy," we fade the alpha based on the angle between the surface normal and the camera view.
`alpha *= pow(1.0 - abs(dot(ViewDir, Normal)), RimPower)`

### 2. Distance Falloff
The beam should be most intense at the source and fade into nothingness as it extends.
`alpha *= saturate(1.0 - (distFromSource / maxBeamLength))`

### 3. Soft Particles (Depth Blending)
The most important part! Without this, the beam creates an ugly "hard line" where it intersects with a wall or floor. We sample the **Scene Depth Buffer** and compare it to the beam's depth. If they are close, we fade the alpha.
`softAlpha = saturate((sceneDepth - beamDepth) * invFadeRange)`

## 3. Implementation (HLSL / Shader Graph)
```hlsl
// Fragment Shader Logic
float sceneDepth = LinearEyeDepth(tex2D(_CameraDepthTexture, i.screenPos).r);
float beamDepth = i.screenPos.z;

// Calculate Soft Intersection
float softFade = saturate((sceneDepth - beamDepth) * _Softness);

// Calculate Rim Fade (Hide the mesh edges)
float rimFade = pow(1.0 - saturate(dot(i.viewDir, i.normal)), _RimPower);

// Final Output
return _Color * rimFade * softFade * i.vertexColor.a;
```

## 4. Practical Use Cases
- **Flashlights:** Essential for that "horror" vibe without the performance cost.
- **Streetlamps:** Highlighting paths in dark levels.
- **God Rays:** Sunlight streaming through windows or canopy gaps.

## 5. Summary
- Use geometry instead of volumes.
- Always use **Depth Blending** to hide intersections.
- Use **View-Angle Fading** to hide mesh boundaries.
- This is the only way to get high-density light beams in 120Hz VR experiences.
