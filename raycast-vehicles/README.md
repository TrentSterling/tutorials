# Raycast Vehicle Physics

Most beginners start with Unity's `WheelCollider`, but they quickly find it "floaty" and hard to tune for arcade or high-performance racing. **Raycast Vehicles** are the industry standard for games like *GTA*, *Mario Kart*, and *Trackmania*.

## 1. How it Works
Instead of using physical wheel rigidbodies and joints, we use 4 **Raycasts** (or Sphere-casts) pointing down from the corners of the car's body. 
- The suspension is a mathematical simulation.
- The forces are applied directly to the car's Rigidbody at the wheel positions.

## 2. The Three Core Forces

### 1. Suspension (The Spring)
The suspension is a simple **PD Controller** (Proportional-Derivative).
- **Proportional:** The more the "spring" is compressed, the harder it pushes back.
- **Derivative:** We subtract the velocity of the suspension to prevent it from bouncing forever (Damping).
`Force = (Compression * SpringStrength) - (CompressionVelocity * DamperStrength)`

### 2. Steering (Sideways Friction)
To make the car steer, we calculate how fast the wheel is moving **sideways** (relative to the wheel's right-axis).
`sideVel = Dot(WheelRight, CarVelocityAtWheel)`
We then apply an opposite force to counteract that velocity. This is where you can implement **Drifting** by capping the maximum friction force.

### 3. Acceleration (Forward Force)
Engine torque is simply a force applied along the wheel's forward axis:
`AccelForce = Input * EnginePower`

## 3. Implementation (C# Snippet)
```csharp
void UpdateWheel(Wheel w) {
    if (Physics.Raycast(w.pos, -transform.up, out RaycastHit hit, w.maxLength)) {
        Vector3 worldVel = rb.GetPointVelocity(w.pos);

        // 1. Suspension Force
        float offset = w.maxLength - hit.distance;
        float vel = Vector3.Dot(transform.up, worldVel);
        float force = (offset * spring) - (vel * damper);
        rb.AddForceAtPosition(transform.up * force, w.pos);

        // 2. Steering Force
        float sideVel = Vector3.Dot(w.right, worldVel);
        rb.AddForceAtPosition(-w.right * sideVel * friction, w.pos);

        // 3. Driving Force
        rb.AddForceAtPosition(w.forward * accelInput * enginePower, w.pos);
    }
}
```

## 4. Advanced: The Pacejka Magic
For realistic racing sims, the simple `sideVel * friction` isn't enough. Professional games use the **Pacejka Magic Formula**, which calculates the "Slip Angle" of the tire. This allows for a realistic transition where the tire has maximum grip at a small slip angle and then "breaks" into a slide as the angle increases.

## 5. Why use Raycast Vehicles?
- **Rock-Solid Stability:** They don't fall through the floor or jitter at high speeds.
- **Easy Tuning:** You can change gravity, spring strength, or grip on the fly without breaking the physics engine.
- **Performance:** Much lighter on the CPU than traditional multi-body physics.
