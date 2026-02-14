# SAT (Separating Axis Theorem)

The Separating Axis Theorem (SAT) is the gold standard for detecting collisions between convex polygons. It not only tells you *if* they collide but also provides the **Minimum Translation Vector (MTV)**—the shortest path to move the shapes so they are no longer overlapping.

## 1. The Core Theorem
Two convex shapes are **not** colliding if there exists an axis on which their projections do not overlap. 

Imagine shining a flashlight from different angles: if you can find just one angle where the shadows of the two shapes don't touch, the shapes are separate.

## 2. Which Axes to Check?
For 2D polygons, you only need to check the **normals** of every edge of both shapes.
- Shape A has $n$ edges $\rightarrow$ $n$ axes.
- Shape B has $m$ edges $\rightarrow$ $m$ axes.
- Total checks: $n + m$ axes.

## 3. The Algorithm
1. **Find Axes:** For each shape, take every edge and find its perpendicular (normal) vector.
2. **Project Vertices:** For each axis, project every vertex of both polygons onto that axis. This gives you two 1D intervals (min/max).
3. **Test Overlap:** If the intervals don't overlap on **any** axis, the shapes are separate. Return `false`.
4. **Calculate MTV:** If they overlap on **all** axes, they are colliding. The axis with the *smallest* overlap is the direction of the MTV.

## 4. Pseudo-code (C++)
```cpp
struct Projection {
    float min, max;
    bool Overlaps(Projection other) {
        return !(this->max < other.min || other.max < this->min);
    }
    float GetOverlap(Projection other) {
        return std::min(this->max, other.max) - std::max(this->min, other.min);
    }
};

bool CheckCollision(Polygon polyA, Polygon polyB, Vector2& outMTV) {
    float minOverlap = std::numeric_limits<float>::max();
    Vector2 shortestAxis;

    auto axes = polyA.GetNormals();
    axes.insert(axes.end(), polyB.GetNormals().begin(), polyB.GetNormals().end());

    for (Vector2 axis : axes) {
        Projection pA = polyA.Project(axis);
        Projection pB = polyB.Project(axis);

        if (!pA.Overlaps(pB)) return false; // Gap found!

        float overlap = pA.GetOverlap(pB);
        if (overlap < minOverlap) {
            minOverlap = overlap;
            shortestAxis = axis;
        }
    }

    outMTV = shortestAxis * minOverlap;
    return true;
}
```

## 5. Summary
- **Fast:** Only $N+M$ checks.
- **Accurate:** Provides exact penetration depth and direction for physics resolution.
- **Constraint:** Only works on **convex** shapes. For concave shapes, use Convex Decomposition to break them into convex pieces first.
