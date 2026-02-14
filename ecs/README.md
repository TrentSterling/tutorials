# ECS (Entity Component System)

ECS is a software architectural pattern that follows the **Composition over Inheritance** principle. It is the heart of high-performance engines like Unity DOTS and Bevy, allowing games to handle hundreds of thousands of active objects.

## 1. The Core Trio
- **Entity:** A simple unique ID (integer). It has no data and no logic.
- **Component:** Pure data (structs). It contains no logic. (e.g., `Position`, `Velocity`, `Health`).
- **System:** The "Global" logic that filters entities by their components and processes them in bulk.

## 2. The Power of Data-Oriented Design
In standard OOP (`List<GameObject>`), objects are scattered in memory. When the CPU tries to update them, it constantly "misses" the cache because it has to jump around.

In ECS, components of the same type are stored in **contiguous arrays** (Archetypes). The CPU can prefetch this data efficiently, leading to 10x-100x performance gains.

## 3. Implementation Example (C# / Unity DOTS)
```csharp
// 1. Component Data
public struct Velocity : IComponentData {
    public float3 Value;
}

// 2. The System
public partial struct MovementSystem : ISystem {
    [BurstCompile] // Compiles to highly optimized machine code
    public void OnUpdate(ref SystemState state) {
        float dt = SystemAPI.Time.DeltaTime;

        // Query all entities that have both LocalTransform AND Velocity
        foreach (var (transform, velocity) in 
                 SystemAPI.Query<RefRW<LocalTransform>, RefRO<Velocity>>()) {
            transform.ValueRW.Position += velocity.ValueRO.Value * dt;
        }
    }
}
```

## 4. When to use ECS?
- **Massive Simulations:** Thousands of units, projectiles, or particles.
- **Complex Interconnected Systems:** Where inheritance hierarchies become a "Diamond of Death."
- **Mobile/Web:** Where CPU and Battery efficiency are critical.

## 5. Summary
- **OOP:** Focuses on "What an object is."
- **ECS:** Focuses on "What an object has" and "What data needs processing."
- **Result:** Code that is naturally parallelizable and extremely fast.
