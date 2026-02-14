# Terrain Mesh Generation

Generating terrain meshes programmatically is the first step toward building procedural worlds. Instead of hand-modeling a landscape, we generate a grid of vertices and "displace" them using a heightmap or noise.

## 1. The Grid Structure
A terrain mesh is a 2D grid of vertices. For a $10 \times 10$ terrain "quad," we need $11 \times 11$ vertices to close the loops.
- **Vertices:** Each vertex has a position $(x, y, z)$. The $y$ component is the height.
- **UVs:** Standard $(0..1)$ coordinates used for the splatmap and detail texturing.
- **Triangles:** Every grid square (quad) is split into two triangles (e.g., indices `[0, 1, 11]` and `[1, 12, 11]`).

## 2. Displacement (Height)
The $y$ value of each vertex is determined by:
1. **Heightmaps:** Grayscale textures where Black = Valley and White = Peak.
2. **Noise Functions:** Using **Perlin** or **Simplex** noise allows for infinite, deterministic terrain generation.

## 3. Implementation (C# Example)
```csharp
void CreateMesh() {
    vertices = new Vector3[(xSize + 1) * (zSize + 1)];
    for (int i = 0, z = 0; z <= zSize; z++) {
        for (int x = 0; x <= xSize; x++) {
            float y = Mathf.PerlinNoise(x * .3f, z * .3f) * 2f;
            vertices[i] = new Vector3(x, y, z);
            i++;
        }
    }
    // ... Triangle and Normal generation ...
}
```

## 4. Calculating Normals
Lighting requires accurate surface normals. For procedural terrain, don't rely on the engine's default calculator.
- **Neighbor Sampling:** For a vertex at $(x, z)$, sample the height at $(x+1, z)$ and $(x, z+1)$.
- **Cross Product:** The cross product of the vectors pointing to those neighbors gives you the exact normal for that point on the terrain.

## 5. Performance: Chunking & LOD
Rendering a massive $4096 \times 4096$ grid as a single mesh will kill performance.
- **Chunking:** Break the terrain into $32 \times 32$ or $64 \times 64$ "Chunks."
- **Culling:** Only render chunks inside the camera frustum.
- **LOD (Level of Detail):** Faraway chunks should use a lower resolution (fewer vertices) to save GPU cycles.
