# Hierarchical State Machines (HSM)

Standard Finite State Machines (FSMs) work great for simple logic, but as your player character grows, you run into "State Explosion." **HSMs** solve this by allowing states to exist inside other states, inheriting logic from their parents.

## 1. The Problem: State Explosion
In a platformer, if you want to allow "Attacking" while "Jumping," "Falling," or "Running," you suddenly need states like `JumpAttack`, `FallAttack`, and `RunAttack`. This leads to a messy web of duplicate logic and complex transitions.

## 2. The Solution: Inheritance & Hierarchies
In an HSM, you define a parent state like `Airborne`.
- **Parent State:** `Airborne` (Handles gravity, air-drifting, and looking for ground).
- **Child States:** `Jumping`, `Falling`, `Gliding`.

If the player is in the `Jumping` state, they are **also** in the `Airborne` state. They automatically execute the `Airborne` logic first, then their specific `Jumping` logic.

## 3. Implementation (C# Pattern)
```csharp
public abstract class State {
    protected State parent;
    public virtual void Enter() {}
    public virtual void Update() { 
        // Execute parent logic first (up the hierarchy)
        parent?.Update(); 
    }
    public virtual void Exit() {}
}

public class AirborneState : State {
    public override void Update() {
        ApplyGravity(); // Shared logic for all airborne children
        if (IsGrounded()) TransitionTo(GroundedState);
    }
}

public class JumpingState : AirborneState {
    public override void Update() {
        base.Update(); // Runs Gravity from AirborneState
        if (velocity.y < 0) TransitionTo(FallingState);
    }
}
```

## 4. Why use HSM?
- **DRY (Don't Repeat Yourself):** Logic for shared states (like "Grounded" or "Combat") only exists in one place.
- **Maintainability:** Adding a new child state (e.g., `LedgeHang`) is trivial and inherits the safety of the parent.
- **Clean Transitions:** You can transition from the "Airborne" parent to "Grounded" without knowing which specific sub-state (`Falling` or `Jumping`) the player was in.

## 5. Summary
HSMs turn a "Spaghetti" FSM into a clean, logical tree. They are the backbone of professional character controllers in games like *Assassin's Creed* and *God of War*.
