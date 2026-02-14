# Verlet Integration

Verlet integration is a numerical method used to integrate Newton's equations of motion. In gamedev, it is the "secret weapon" for stable physics simulations involving constraints like ropes, cloth, or bridges.

## 1. Why Verlet? (Euler is a lie)
Most beginners use **Euler Integration**:
`pos += velocity * dt`
`velocity += acceleration * dt`

The problem? Euler accumulates error quickly. If a rope is pulled tight, the velocity can become massive, causing the simulation to "explode." 

**Verlet Integration** is different—it doesn't store velocity at all. It calculates motion based on the **Current Position** and the **Previous Position**.

## 2. The Core Formula
`next_pos = pos + (pos - prev_pos) + acceleration * (dt * dt)`

Think of it as the object "remembering" where it was. The difference between `pos` and `prev_pos` implicitly acts as the velocity. This makes it incredibly stable for objects under tension.

## 3. Implementation (C# Example)
```csharp
public class VerletPoint {
    public Vector2 position;
    public Vector2 prevPosition;
    public Vector2 acceleration;

    public void Update(float dt) {
        // (position - prevPosition) is effectively our velocity
        Vector2 velocity = position - prevPosition;
        
        prevPosition = position;
        position = position + velocity + acceleration * (dt * dt);
        
        // Reset acceleration for the next frame
        acceleration = Vector2.zero; 
    }
}
```

## 4. Constraints (The Magic Part)
The true power of Verlet is how it handles constraints (e.g., a stick connecting two points). Instead of calculating forces, you simply **move the points** until the distance between them is correct. 

```csharp
void SatisfyConstraint(VerletPoint a, VerletPoint b, float targetDist) {
    Vector2 diff = a.position - b.position;
    float dist = diff.magnitude;
    float fraction = (targetDist - dist) / dist / 2f;
    Vector2 offset = diff * fraction;

    a.position += offset;
    b.position -= offset;
}
```
If you run this constraint check 5-10 times per frame, the rope becomes "stiffer."

## 5. Why it’s "Genius"
- **Stability:** It never gains energy out of nowhere. If you pull it too hard, it just stays at its maximum length.
- **Simplicity:** No need for complex friction or momentum calculations.
- **Scalability:** It's the foundation for modern **Position Based Dynamics (PBD)** used for cloth and water in AAA games.

## 6. Summary
1. Store `prevPosition` instead of `velocity`.
2. Update position based on the delta from the last frame.
3. Use simple position-shifting to solve constraints.
