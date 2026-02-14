# Navmesh (Navigation Mesh)

A Navigation Mesh is a collection of convex polygons that define the walkable surfaces of a game world. It is the industry standard for AI navigation in 3D environments (used by Unity, Unreal, and specialized libraries like Recast).

## 1. Why Navmesh over Grids?
- **Memory:** A massive open field can be represented by a single large polygon instead of thousands of grid cells.
- **Verticality:** Naturally handles bridges, ramps, and multi-story buildings.
- **Connectivity:** Nodes are polygons, and edges represent "portals" between them.

## 2. Navmesh Generation (The Pipeline)
Generating a navmesh from raw triangles is complex. The common "Recast" approach involves:
1. **Voxelization:** Convert all scene geometry into a 3D grid of voxels.
2. **Filtering:** Remove voxels where an agent can't stand (too steep, not enough ceiling height).
3. **Region Partitioning:** Group connected walkable voxels into regions.
4. **Contouring:** Create simplified vector outlines around these regions.
5. **Polygonization:** Break complex outlines into **convex** polygons (essential for pathfinding).

## 3. The Funnel Algorithm
A* on a navmesh gives you a sequence of polygons. If an agent simply moves toward the center of each polygon's edge, they will move in a jagged, unnatural way.
- **The Solution:** The Funnel algorithm "pulls a string" through the sequence of portals to find the shortest straight-line path between the start and the goal within the navmesh boundaries.

## 4. Movement & Steerage
Navmeshes provide the "Global Path." For "Local Navigation" (avoiding other moving NPCs), games use:
- **RVO (Reciprocal Velocity Obstacles):** Agents calculate a safe velocity that avoids collision with others.
- **Steering Behaviors:** Simple force-based movement to stay on the path.

## 5. Summary
- **Pros:** Efficient, handles complex geometry, produces high-quality paths.
- **Cons:** Extremely difficult to generate dynamically at runtime (requires "tiling" or expensive re-baking).
