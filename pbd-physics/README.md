# PBD (Position Based Dynamics)

Verlet integration is a great start, but **Position Based Dynamics (PBD)** is the modern standard for stable, high-performance physics. Used in *Nvidia PhysX* and AAA titles for cloth, ropes, and hair, it is significantly more robust than traditional force-based solvers.

## 1. The Core Idea: Skip the Force
In traditional physics (Newtonian), you calculate:
`Force -> Acceleration -> Velocity -> Position`

The problem is that if the force is too high, the object "overshoots" its target in one frame, leading to an explosion. **PBD skips the middleman and directly manipulates the Position.**

## 2. The PBD Loop
1. **Predict:** Use the current velocity and gravity to guess where the particle will be in the next frame (`projectedPos`).
2. **Resolve Constraints:** This is the magic. You iterate through every constraint (like a rope segment) and **move the particles** so the constraint is satisfied perfectly.
3. **Update Velocity:** After all constraints are solved, you calculate the new velocity based on the displacement: `Velocity = (FinalPos - OldPos) / dt`.

## 3. Why PBD is "Unconditionally Stable"
Because you are directly moving the particles to their "correct" locations, the system can never accumulate infinite energy. If you pull a PBD rope too hard, it simply stays at its maximum length. It cannot "explode" because it is not relying on acceleration to fix its state.

## 4. Implementation (C# Snippet)
```csharp
void StepPBD(float dt) {
    // 1. Prediction
    foreach (var p in particles) {
        p.predictedPos = p.pos + (p.velocity * dt) + (gravity * dt * dt);
    }

    // 2. Solver Iterations
    for (int i = 0; i < solverIterations; i++) {
        foreach (var c in constraints) {
            c.Resolve(particles); // Directly shifts predictedPos
        }
    }

    // 3. Finalize
    foreach (var p in particles) {
        p.velocity = (p.predictedPos - p.pos) / dt;
        p.pos = p.predictedPos;
    }
}
```

## 5. Applications in Games
- **Cloth:** PBD is the best way to simulate clothing that doesn't "jitter" against the player's body.
- **Ropes:** Ideal for long, heavy ropes (like in *Uncharted*).
- **Soft Bodies:** PBD can handle volume-preserving constraints for "squishy" objects.

## 6. Summary
- **Direct Position Control:** No overshooting.
- **Extremely Stable:** Can handle large timesteps.
- **Intuitive:** Solving a constraint is just a matter of moving points to where they "should" be.
