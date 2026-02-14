# VR Physics Hands & Climbing (The Configurable Joint Masterclass)

Making hands that physically interact with the world is easy. Making hands that feel "tight," don't jitter, and allow for climbing without custom physics code is the real challenge. This tutorial covers using Unity's **Configurable Joint** as a high-performance PD controller.

## 1. Why Joints instead of PID?
While you can write a manual PID (Proportional-Integral-Derivative) loop to set velocities, it’s often overkill and hard to tune. We use a **PD Controller** (Skipping the 'I' because we don't want integral wind-up in VR) which Unity's `ConfigurableJoint` implements natively via `JointDrives`.

## 2. Setting Up the Rigidbodies
- **Body:** Mass ~65 (Human weight).
- **Hands:** Mass ~2 (Enough to have presence, light enough not to jitter).
- **The Joint:** Add a `ConfigurableJoint` to the Hand, and set the `Connected Body` to your Player Body.

## 3. The "Secret Sauce": Target Velocities
Standard joint drives use `targetPosition` and `targetRotation`. But if you want them to be rock-solid, you must provide **Target Velocity**.

- **Target Velocity (P):** The difference in position between frames.
- **Target Angular Velocity (D):** The rate of rotation change.

By providing these, the physics solver knows not just *where* the hand wants to be, but *how fast* it’s moving to get there.

## 4. Implementation (C#)
```csharp
public class PhysicsHand : MonoBehaviour {
    public Rigidbody body;
    public Transform target; // The Controller
    private ConfigurableJoint joint;

    void FixedUpdate() {
        // 1. Position tracking
        joint.targetPosition = body.transform.InverseTransformPoint(target.position);

        // 2. Velocity (The "D" in PD)
        // High-school physics: Velocity = Change in Position / Time
        Vector3 worldVelocity = (target.position - lastPosition) / Time.fixedDeltaTime;
        joint.targetVelocity = body.transform.InverseTransformVector(worldVelocity);

        // 3. Rotational tracking (Shortest path)
        Quaternion rotationDiff = target.rotation * Quaternion.Inverse(body.rotation);
        joint.targetRotation = Quaternion.Inverse(rotationDiff);

        lastPosition = target.position;
    }
}
```

## 5. From Hands to Climbing
The beauty of using a `ConfigurableJoint` is **Newton’s Third Law**. 
- When your hand moves freely, the joint pulls the hand to the controller.
- When your hand **grabs a static wall** (setting the hand to Kinematic or using another joint), the body's joint will now pull the **Body** toward the hand.

**Result:** You get climbing for free. No "ClimbingState" logic needed—the physics engine handles the inverse force naturally.

## 6. Optimization Tips (Tront's Additions)
- **Inertia Tensor:** If your hands jitter when twisting, force a spherical inertia tensor: `rb.inertiaTensor = Vector3.one * 0.01f;`.
- **Soft Limits:** Use `Linear Limit` to prevent the hand from stretching like Inspector Gadget.
- **Solver Iterations:** Increase `Physics.defaultSolverIterations` to 10+ for a "tighter" feel in VR.

## Summary
1. Use **ConfigurableJoints** connected to the body.
2. Convert targets to **Joint Space** (Local to the body).
3. Feed **Target Velocity** for snappy tracking.
4. Let Newton's 3rd Law handle the climbing forces.
