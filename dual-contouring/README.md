# Dual Contouring

While **Marching Cubes** is the standard way to turn voxels into meshes, it has a fatal flaw: it cannot represent sharp edges (it "rounds" them off). **Dual Contouring** is the mad scientist's choice because it preserves sharp corners and thin features by using **Hermite Data**.

## 1. The Core Difference
- **Marching Cubes:** Places vertices on the *edges* of the voxel grid based on density.
- **Dual Contouring:** Places one vertex *inside* each grid cell that is intersected by the surface.

## 2. The Math: Quadratic Error Function (QEF)
To find the perfect spot for the vertex inside a cell, we look at where the surface crosses the cell's edges. For each intersection, we store:
1. The intersection point ($P$).
2. The surface normal at that point ($N$).

We solve a **QEF** to find the point $X$ that is "least wrong"—minimizing the distance to all surface planes:
`Minimize sum( dot(N_i, X - P_i)^2 )`

If three perpendicular planes (like a corner) meet in a cell, the QEF will place the vertex **exactly at the corner**.

## 3. The Implementation Pipeline
1. **Octree Generation:** Build an octree of your voxel data.
2. **Data Collection:** For every leaf node, find the intersection points and normals on its edges.
3. **Vertex Placement:** Solve the QEF for each leaf to find the optimized vertex position.
4. **Polygonization:** For every edge crossing the surface, generate a quad connecting the optimized vertices of the four cells sharing that edge.

## 4. Why use Dual Contouring?
- **Sharp Features:** Essential for man-made structures (buildings, ruins) in a procedural voxel world.
- **Adaptive Resolution:** Naturally works with Octrees, allowing for high detail where needed and large triangles in flat areas.
- **Manifold Meshes:** Always produces a closed, "watertight" mesh.

## 5. Summary
- Marching Cubes = Smooth/Blobby.
- Dual Contouring = Sharp/Structural.
- Use DC if your voxel world needs to look like it was built, not just grown.
