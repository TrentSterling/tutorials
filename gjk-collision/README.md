# GJK Algorithm (Gilbert-Johnson-Keerthi)

GJK is the "ultimate" collision detection algorithm for convex shapes. While SAT (Separating Axis Theorem) works great for 2D, GJK is significantly more efficient for 3D and can handle any convex shape (spheres, capsules, boxes, etc.) without needing to check every face normal.

## 1. The Core Concept: Minkowski Difference
The genius of GJK lies in the **Minkowski Difference**. If you have two shapes $A$ and $B$, their Minkowski Difference is the set of all points calculated by $a - b$. 

- **The Key Insight:** If the two shapes are overlapping, their Minkowski Difference will contain the **Origin** (0,0,0). 
- GJK is essentially an efficient way to check if the origin is inside this hidden shape.

## 2. The Simplex
Instead of calculating the entire Minkowski Difference shape, GJK tries to build the smallest possible shape (a **Simplex**) that could potentially enclose the origin.
- In 2D, the simplex is a **Triangle**.
- In 3D, the simplex is a **Tetrahedron**.

## 3. Support Functions
To build the simplex, we use a **Support Function**. A support function returns the point in a shape that is furthest in a given direction.
`Support(Shape, Direction)`

For the Minkowski Difference, the support point in direction $D$ is simply:
`Support(A, D) - Support(B, -D)`

## 4. The Algorithm Loop
1. Pick an initial direction (e.g., the vector between the two shape centers).
2. Get the Minkowski support point in that direction and add it to the simplex.
3. Update the search direction to point from the current simplex toward the **Origin**.
4. Get a new support point in this new direction.
5. **Check:** If the new point hasn't passed the origin, the shapes *cannot* be overlapping. Return `false`.
6. **Contains Origin?** If the simplex now contains the origin, return `true` (Collision).
7. If not, simplify the simplex (keep only the face closest to the origin) and repeat from step 3.

## 5. Implementation (C++ Concept)
```cpp
bool GJK(Shape a, Shape b) {
    Vector3 d = b.center - a.center; // Initial direction
    Simplex s;
    s.add(MinkowskiSupport(a, b, d));
    d = -s.last(); // Search toward origin

    while (true) {
        Vector3 a_new = MinkowskiSupport(a, b, d);
        if (dot(a_new, d) < 0) return false; // No collision possible
        
        s.add(a_new);
        if (s.Solve(d)) return true; // Simplex contains origin
    }
}
```

## 6. Beyond GJK: EPA
GJK only tells you *if* a collision happened. To find the **Penetration Depth** and **Normal** (the Minimum Translation Vector needed for physics response), you typically run the **EPA (Expanding Polytope Algorithm)** using the final simplex from GJK as a starting point.

## Summary
- **Fast:** Usually converges in 4-8 iterations regardless of shape complexity.
- **Convex only:** Like SAT, it requires convex shapes.
- **Shape Agnostic:** Works on any shape you can write a support function for (spheres, boxes, point clouds).
