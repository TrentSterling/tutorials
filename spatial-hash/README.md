# Spatial Hashing

Spatial hashing is a technique for broad-phase collision detection that maps 2D or 3D positions into a 1D hash table. Unlike fixed Grids, it doesn't require a pre-defined world size, making it ideal for infinite or sparse environments.

## 1. How it Works
1. **Divide World into Cells:** Imagine a virtual grid of a fixed cell size (e.g., 128x128 units).
2. **Compute Hash:** For any position `(x, y)`, calculate which cell it belongs to and hash those coordinates into a single integer.
3. **Store Entities:** Each hash entry points to a "bucket" (usually a `std::vector` or `List`) of entities currently occupying that cell.

## 2. The Hash Function
For 2D coordinates, a common spatial hash function is:
`hash = ((int(x / cellSize) * P1) ^ (int(y / cellSize) * P2)) % tableSize`
Where `P1` and `P2` are large prime numbers (e.g., `73856093`, `19349663`).

## 3. Implementation (C# Example)
```csharp
public class SpatialHash {
    private int cellSize;
    private Dictionary<int, List<Entity>> table = new();

    public SpatialHash(int size) => cellSize = size;

    private int GetKey(float x, float y) {
        int gx = (int)Math.Floor(x / cellSize);
        int gy = (int)Math.Floor(y / cellSize);
        return (gx * 73856093) ^ (gy * 19349663);
    }

    public void Insert(Entity e) {
        int key = GetKey(e.X, e.Y);
        if (!table.ContainsKey(key)) table[key] = new List<Entity>();
        table[key].Add(e);
    }

    public IEnumerable<Entity> Query(float x, float y) {
        int key = GetKey(x, y);
        return table.TryGetValue(key, out var list) ? list : Enumerable.Empty<Entity>();
    }
}
```

## 4. Querying Neighbors
To check for collisions, you don't just query the object's current cell. Because an object might overlap the boundary, you typically query the **9 neighboring cells** (in 2D) or **27 neighboring cells** (in 3D) to find all potential colliders.

## 5. Why use Spatial Hash?
- **O(1) Performance:** Average case for insertion and lookup is constant time.
- **Memory Efficient:** Only uses memory for cells that actually contain objects.
- **Dynamic:** Handles objects moving across the world easily—just re-hash them every frame or when they cross a boundary.
