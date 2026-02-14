# PD & SPD Controllers (Stable Physics Tracking)

Controlling physics objects with raw forces often leads to jitter, overshoot, and "explosions." **PD Controllers** (Proportional-Derivative) and their advanced cousin **SPD** (Stable Proportional Derivative) are the industry standard for making physics bodies follow targets—essential for VR hands, active ragdolls, and networked physics.

## 1. The PD Controller Formula
A PD controller is a feedback loop that calculates the necessary force to reach a target:
`Force = (PositionError * kP) + (VelocityError * kD)`

- **kP (Proportional):** The "Spring" strength. How hard the object is pulled toward the target.
- **kD (Derivative):** The "Damper" strength. It resists motion to prevent the object from overshooting and oscillating forever.

## 2. SPD: The "Black Magic" of Stability
Traditional PD controllers can become unstable at high spring strengths or low framerates. **SPD (Stable Proportional Derivative)**, introduced by Jie Tan, makes the controller implicit. It effectively calculates the force based on the *predicted* state of the next frame, making it nearly impossible to "explode."

## 3. VR Physics Hands
This is the core of high-end VR interaction (like *Boneworks* or *Half-Life: Alyx*).
- **The Setup:** The "Physical Hand" is a Rigidbody driven by a PD controller toward the "Ghost Hand" (the actual VR controller position).
- **Two-Way Force:** Because it's physics-based, if the hand is blocked by a wall, the PD controller applies a force to the **Body**. This gives you "Climbing" and "Physics Presence" for free.

## 4. Networking: Physics Syncing
Instead of teleporting a player's position (which breaks physics and causes jitter), you can sync the **Target Transform** and use a PD controller locally to drive the actual Rigidbody.
- **Result:** Smooth movement that still reacts to local collisions and physics-based impulses.

## 5. Implementation (C# Example)
```csharp
public class PDController : MonoBehaviour {
    public float kP = 1000f; // Spring
    public float kD = 100f;  // Damper
    public Transform target;
    private Rigidbody rb;

    void FixedUpdate() {
        Vector3 posError = target.position - transform.position;
        Vector3 velError = (target.position - lastTargetPos) / Time.fixedDeltaTime - rb.linearVelocity;
        
        Vector3 force = (posError * kP) + (velError * kD);
        rb.AddForce(force);

        lastTargetPos = target.position;
    }
}
```

## 6. References & Deep Dives
- [Digital Opus: Controlling Objects with Forces](https://digitalopus.ca/site/controlling-objects-with-forces-and-torques-part-2/)
- [Stable Proportional Derivative Control (Jie Tan et al.)](https://www.jie-tan.net/project/spd.pdf)

## Summary
- **PD Controllers** turn your "Move" commands into "Physics" commands.
- **kP** gets you there; **kD** stops you from vibrating.
- Use **SPD** for high-precision character controllers that must never explode.
