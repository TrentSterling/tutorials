# Inverse Kinematics (FABRIK)

Inverse Kinematics (IK) is the process of calculating the joint parameters needed to place the end of a kinematic chain (like a hand or foot) at a specific target. **FABRIK** (Forward And Backward Reaching Inverse Kinematics) is a highly efficient, heuristic-based method that is the industry standard for games.

## 1. Why FABRIK over Jacobian Math?
Traditional IK uses complex matrix calculus (Jacobians) which is computationally expensive and prone to "singularities" (where the math breaks). FABRIK is:
- **Fast:** Only uses basic distance math and vector addition.
- **Stable:** It doesn't "explode" when the target is out of reach.
- **Scalable:** Works on chains of 2 bones or 200 bones equally well.

## 2. The Core Concept (The Two-Pass System)
FABRIK treats the limb as a series of points connected by fixed-length bones. It solves the position in two phases:

### Phase 1: The Backward Reach
1. Set the last point (Hand) exactly at the **Target**.
2. For the next point (Elbow), find the line between it and the Hand.
3. Move the Elbow along that line until it is exactly one "bone length" away from the Hand.
4. Repeat this all the way to the Root (Shoulder).

### Phase 2: The Forward Reach
1. The Shoulder is now out of place. Move it back to its **Original Root Position**.
2. Repeat the distance-snapping logic forward, from Shoulder to Elbow, then Elbow to Hand.
3. The Hand is now closer to the Target than it was before.

Repeat these two phases 3-10 times for a pixel-perfect fit.

## 3. Implementation (C# Example)
```csharp
void SolveIK(Vector3 target, int iterations = 5) {
    float[] lengths = GetBoneLengths(); // Distances between points
    
    for (int iter = 0; iter < iterations; iter++) {
        // 1. Backward Pass
        points[points.Length - 1] = target;
        for (int i = points.Length - 2; i >= 0; i--) {
            float dist = Vector3.Distance(points[i], points[i + 1]);
            float ratio = lengths[i] / dist;
            points[i] = points[i + 1] + (points[i] - points[i + 1]) * ratio;
        }

        // 2. Forward Pass
        points[0] = rootPosition;
        for (int i = 0; i < points.Length - 1; i++) {
            float dist = Vector3.Distance(points[i + 1], points[i]);
            float ratio = lengths[i] / dist;
            points[i + 1] = points[i] + (points[i + 1] - points[i]) * ratio;
        }
    }
}
```

## 4. VR Specifics: The Pole Target
In VR, you don't want the elbow to point toward the floor. We use a **Pole Target** (a hint point). After the IK pass, we rotate the elbow around the Shoulder-Hand axis to face the Pole Target, ensuring the arm looks "natural."

## 5. Summary
- Use FABRIK for procedural VR limbs and terrain-aware feet.
- Increase iterations for more precision; decrease for performance.
- Always apply constraints (rotational limits) *during* the forward pass to prevent bones from snapping backwards.
