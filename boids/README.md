# Boids (Flocking Simulation)

Developed by Craig Reynolds in 1986, **Boids** is an artificial life program that simulates the flocking behavior of birds. The complexity of the flock emerges from just three simple steering rules applied locally to each agent.

## 1. The Three Core Rules

### 1. Separation (Avoid Crowding)
Steer to avoid crowding local flockmates. This prevents boids from overlapping and ensures they have "personal space."
- **Logic:** Calculate a vector pointing away from all neighbors that are too close.

### 2. Alignment (Match Velocity)
Steer towards the average heading of local flockmates.
- **Logic:** Find the average velocity of all neighbors and steer to match it.

### 3. Cohesion (Stay Together)
Steer to move toward the average position (center of mass) of local flockmates.
- **Logic:** Find the average position of neighbors and steer toward that point.

## 2. The Math of Steering
For each rule, we calculate a **Steering Force**:
`Steering = Desired_Velocity - Current_Velocity`

The final force applied to the boid is:
`Total_Force = (Separation * w1) + (Alignment * w2) + (Cohesion * w3)`
Where `w` are weights used to tune the behavior (e.g., more separation makes the flock "loose").

## 3. Implementation (C# Example)
```csharp
Vector2 ComputeSteerForce(Boid agent) {
    var neighbors = spatialHash.GetNeighbors(agent.position, viewRadius);
    
    Vector2 sep = Separation(agent, neighbors) * weightSep;
    Vector2 ali = Alignment(agent, neighbors) * weightAli;
    Vector2 coh = Cohesion(agent, neighbors) * weightCoh;

    return sep + ali + coh;
}
```

## 4. Performance: The O(n²) Trap
A naive implementation where every boid checks every other boid will lag at ~500 agents. 
- **The Optimization:** Use **Spatial Hashing**. By dividing the world into a grid, a boid only needs to check the 9 cells surrounding it. This allows for simulations of 10,000+ boids in real-time.

## 5. Summary
- **Local Rules:** No "leader" is required; the flock is self-organizing.
- **Emergence:** Complex group patterns arise from simple individual logic.
- **Applications:** Used in games for swarms of enemies, background birds, fish, and even simulating traffic or crowd panic.
