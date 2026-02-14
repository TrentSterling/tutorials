# Hysteresis (State Stability)

Hysteresis is the dependence of the state of a system on its history. In game development, it is the primary tool used to prevent "fluttering"—the annoying bug where a system rapidly toggles between two states due to minor fluctuations.

## 1. The "Fluttering" Problem
Imagine an AI that chases the player if they are closer than 10 units.
- Distance = 10.01: AI Idles.
- Distance = 9.99: AI Chases.

If the player stands right on that 10-unit boundary, the AI will jitter between Idle and Chase every frame, causing broken animations and logic loops.

## 2. The Solution: Dual Thresholds
Hysteresis solves this by using different values for **entering** and **exiting** a state. This creates a "buffer zone" (or deadband).

- **Condition to Enter Chase:** Distance < 10m.
- **Condition to Exit Chase:** Distance > 13m.

Now, once the AI starts chasing, the player has to move significantly further away (the extra 3m) for the AI to give up. This ensures the behavior is stable and intentional.

## 3. Implementation (C# Example)
```csharp
bool isChasing = false;

void Update() {
    float dist = Vector3.Distance(player.position, transform.position);

    if (!isChasing && dist < 10f) {
        isChasing = true;
        StartChasing();
    } 
    else if (isChasing && dist > 13f) {
        isChasing = false;
        ReturnToPatrol();
    }
}
```

## 4. Common Use Cases
- **AI Behavior:** Switching between aggressive and defensive modes.
- **Physics Triggers:** Prevents a player from "rapidly entering/exiting" a zone if they stand on the edge.
- **Audio:** Ducking music volume based on gameplay intensity.
- **LOD (Level of Detail):** Preventing a mesh from rapidly swapping between High and Low detail versions.

## 5. Summary
Hysteresis makes your game feel "confident." It ensures that once a decision is made, it sticks until a clear threshold is crossed in the opposite direction.
