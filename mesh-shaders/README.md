# Mesh Shaders

The traditional "Vertex $\rightarrow$ Geometry $\rightarrow$ Rasterizer" pipeline is 20 years old and increasingly a bottleneck. **Mesh Shaders** (introduced with DirectX 12 Ultimate and Vulkan) replace this with a compute-like pipeline that gives the developer total control over geometry.

## 1. The Two-Stage Pipeline

### Stage 1: The Task Shader (Amplification)
The Task Shader operates on **Meshlets** (small groups of ~64-128 triangles). 
- It decides if an entire meshlet is visible (Frustum culling, Occlusion culling).
- If a meshlet is hidden, it's discarded before any vertex math happens.
- It can also decide to "amplify" work (e.g., tessellating a meshlet into many more triangles).

### Stage 2: The Mesh Shader
The Mesh Shader takes the visible meshlets and generates the final vertices and triangles. 
- It works in "Group Memory" (L1 cache), making it incredibly fast.
- It can output triangles directly without needing to go through a fixed-function hardware assembler.

## 2. Why it's a Revolution
- **Nanite-style Detail:** You can render billions of triangles by culling 99% of them in the Task Shader.
- **CPU Offloading:** The CPU no longer needs to do complex culling logic; the GPU handles it in parallel.
- **Procedural Geometry:** You can generate grass, hair, or planetary terrain entirely on the GPU without "bottlenecking" the vertex buffer.

## 3. Implementation Concept (HLSL)
```hlsl
struct Meshlet {
    uint vertexCount;
    uint triangleCount;
    // ... data ...
};

[NumThreads(128, 1, 1)]
[OutputTopology("triangle")]
void main(uint gtid : SV_GroupThreadID, out vertices Vertex v[64], out indices uint3 tri[126]) {
    // Direct control over the geometry buffer
    SetMeshOutputs(64, 126);
    
    // Process vertices in parallel
    v[gtid] = FetchAndTransformVertex(gtid);
    
    // Assemble triangles in parallel
    if(gtid < 126) {
        tri[gtid] = GetTriangleIndices(gtid);
    }
}
```

## 4. Part 2: GPU Culling Masterclass
Traditional engines cull entire objects. Mesh shaders allow you to cull individual groups of 64 triangles.

### Cluster Culling
We break a mesh into **Meshlets**. In the **Task Shader**, we calculate the bounding sphere of the meshlet.
- **Frustum Culling:** If the sphere is outside the camera's view, we discard it instantly.
- **Backface Culling:** If the entire cluster of triangles is facing away from the camera, it is discarded before a single vertex is transformed.

### Occlusion Culling (Hi-Z)
This is the "Black Magic" of modern rendering.
1. The GPU generates a low-res version of the previous frame's depth buffer (a **Hi-Z Pyramid**).
2. The Task Shader checks the meshlet's depth against the Hi-Z pyramid.
3. If the meshlet is "deeper" than the wall already rendered there, it is culled.

## 5. Why it wins
This happens entirely on the GPU. The CPU can send "One Billion Triangles" to the GPU, and the Task Shader will discard 99.9% of them in microseconds, leaving only the visible ones for the Mesh Shader to process.

## 6. Summary
- **Traditional:** GPU follows a fixed path for every vertex.
- **Mesh Shaders:** GPU acts like a parallel processor for chunks of geometry.
- **Result:** 10x-100x more triangles on screen with better performance.
