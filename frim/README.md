# Framerate Independent Smoothing (FRIM)

Standard `Lerp` is often used for smoothing, but it's famously framerate-dependent. If your game runs at 144Hz, your "smoothing" will be much faster than at 60Hz. FRIM (Framerate Independent Smoothing) solves this using the power of math.

## 1. The Problem with Standard Lerp
Most developers use this in an `Update` loop:
```csharp
// BAD: Speed varies with framerate!
position = Vector3.Lerp(position, target, smoothing * Time.deltaTime);
```
At higher framerates, `Time.deltaTime` is smaller, but the function is called *more often*. The result is **not** linear; the object will reach the target significantly faster at high FPS.

## 2. The Solution: Exponential Decay
To make smoothing identical across all framerates, we use the formula:
`actual_alpha = 1 - exp(-speed * dt)`

### The C# Implementation (Unity)
```csharp
public static float Damp(float source, float target, float smoothing, float dt) {
    return MathHelper.Lerp(source, target, 1f - MathF.Exp(-smoothing * dt));
}

// In your update loop:
transform.position = FRIM.Damp(transform.position, targetPosition, 10f, Time.deltaTime);
```

## 3. Why it Works
This formula ensures that the "half-life" of the smoothing remains constant. Whether you have 10 frames of `0.01s` or 1 frame of `0.1s`, the total progress toward the target will be exactly the same.

## 4. Practical Use Cases
- **Camera Follow:** Smoothly following a player without "jitter" or "lag" variation.
- **UI Transitions:** Making menus feel snappy regardless of hardware.
- **VR Interactors:** Smoothing hand positions for physics without introducing framerate-based latency.

## 5. Summary
- **Lerp(a, b, dt * speed)** is a lie.
- **Lerp(a, b, 1 - exp(-speed * dt))** is the truth.
- High `speed` values (e.g., 10-25) result in very snappy smoothing, while low values (1-5) feel "heavy."
