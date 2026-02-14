# PBR (Physically Based Rendering)

Physically Based Rendering (PBR) is a shading model that simulates how light interacts with materials using real-world physics. It has replaced older "ad-hoc" models (like Phong or Blinn-Phong) because it ensures materials look consistent under any lighting environment.

## 1. The Core Principles
- **Energy Conservation:** A material cannot reflect more light than it receives. As the specular reflection gets brighter, the diffuse part must get darker.
- **Microfacets:** Surfaces are assumed to be made of tiny microscopic mirrors. Roughness determines how "organized" these mirrors are.
- **Fresnel (The F0):** Most dielectrics (plastic, wood, water) reflect about 2-5% of light when viewed head-on, but 100% at grazing angles.

## 2. The Standard BRDF (Cook-Torrance)
The specular part of a PBR shader is usually calculated using three functions (D, G, F):
- **D (Distribution):** How many microfacets are aligned with the "halfway" vector. Usually uses the **GGX/Trowbridge-Reitz** distribution.
- **G (Geometry):** How much the microfacets shadow or mask each other.
- **F (Fresnel):** The ratio of reflection vs. refraction (usually **Fresnel-Schlick**).

## 3. The Metallic-Roughness Workflow
- **Albedo:** The base color. For metals, this represents the specular tint; for dielectrics, it represents the diffuse color.
- **Roughness:** 0 is a perfect mirror; 1 is a completely matte surface.
- **Metallic:** A binary mask. Metals have no diffuse component and tint their reflections; non-metals have diffuse and white reflections.

## 4. Why use PBR?
- **Consistency:** Assets look "correct" in a jungle, a cave, or an office without manual tweaking.
- **Simplicity for Artists:** Artists use real-world values for materials instead of trying to "guess" specular powers.
- **Standardization:** It is the universal standard for Unity, Unreal, and all modern 3D authoring tools (Substance, Blender).

## 5. Summary
- **Metals:** Pure specular, tinted by Albedo.
- **Dielectrics:** Pure diffuse + small white specular (Fresnel).
- **Roughness:** Higher roughness = wider, dimmer highlights.
