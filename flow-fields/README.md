# Flow Fields (Crowd Pathfinding)

A* is great for pathfinding with a few dozen units, but if you have thousands of units (like in *Total War* or *Supreme Commander*), calculating individual paths will crush your CPU. **Flow Fields** solve this by calculating a "navigation map" for the entire world once per frame.

## 1. How it Works
Instead of a "Path" (a sequence of nodes), a Flow Field is a **Vector Field**. Every tile in the world contains a vector pointing in the optimal direction toward the goal.
- **Many-to-One:** Any number of units (1 to 100,000) can use the same flow field to reach the same goal simultaneously.
- **Movement:** Units simply look at the vector of the tile they are standing on and apply it to their velocity.

## 2. The Generation Pipeline
Generating a flow field happens in three distinct stages:

### Step 1: Cost Field
A grid where each cell stores the "weight" of the terrain. 
- Walkable floor = 1.
- Swamp/Slow terrain = 5.
- Walls = 255 (Impassable).

### Step 2: Integration Field
Using **Dijkstra's Algorithm**, we start at the Goal (cost 0) and propagate outward. Each cell calculates its cumulative "distance-to-goal" by adding its cost to the lowest neighbor's integration value.

### Step 3: Flow Field (The Vectors)
For every cell, we look at its 8 neighbors and find the one with the **lowest integration value**. We then store a normalized vector pointing from the current cell toward that neighbor.

## 3. Implementation (C# Snippet)
```csharp
public void UpdateFlowField(Vector2Int target) {
    // 1. Reset and run Dijkstra for Integration Field
    integrationGrid.Fill(float.MaxValue);
    integrationGrid[target.x, target.y] = 0;
    
    // ... Dijkstra propagation here ...

    // 2. Generate Vectors
    for (int x = 0; x < width; x++) {
        for (int y = 0; y < height; y++) {
            Vector2Int bestNeighbor = FindLowestNeighbor(x, y);
            flowField[x, y] = (bestNeighbor - new Vector2Int(x, y)).normalized;
        }
    }
}

// In Unit Update:
void FixedUpdate() {
    Vector2 direction = globalFlowField.GetDirectionAt(transform.position);
    rb.velocity = direction * speed;
}
```

## 4. Why use Flow Fields?
- **Unbeatable Performance:** The cost of moving a unit is a constant O(1) lookup.
- **Dynamic Goals:** Perfect for "Rally Points" where a whole army needs to move to one spot.
- **Collision Avoidance:** Because units aren't following a strict line, they can easily steer around each other while still following the general "flow."

## 5. Summary
- **Pros:** Handles infinite units, very fast lookups, handles dynamic terrain changes (by re-integrating).
- **Cons:** You need one full Flow Field per unique goal. Not ideal for 1,000 units all going to 1,000 different places.
