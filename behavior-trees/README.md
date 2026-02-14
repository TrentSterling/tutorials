# Behavior Trees

Finite State Machines (FSMs) are great for simple logic (Mario), but for complex AI (Halo, Uncharted), they become a "spaghetti" mess of transitions. 

**Behavior Trees (BTs)** solve this by structuring AI as a hierarchy of tasks. They are modular, reusable, and easy to debug.

## 1. The Core Concept
A Behavior Tree is executed (Ticked) from the **Root** down. Every node returns one of three statuses:
1. **Success:** "I completed the task."
2. **Failure:** "I cannot complete the task."
3. **Running:** "I am still working on it. Check back next frame."

## 2. The Nodes
### Composites (Control Flow)
- **Selector ("The Fallback"):** Iterates through children. If a child **Succeeds**, the Selector stops and returns Success. If all fail, it returns Failure.
  - *Example:* "Try to Attack. If you can't, Chase. If you can't, Patrol."
- **Sequence ("The Checklist"):** Iterates through children. If a child **Fails**, the Sequence stops and returns Failure. If all succeed, it returns Success.
  - *Example:* "Is Enemy Visible? -> Is In Range? -> Fire Weapon."

### Decorators (Wrappers)
- **Inverter:** Turns Success to Failure (NOT gate).
- **Succeeder:** Always returns Success (useful for optional tasks).

### Leaves (Actions & Conditions)
- **Condition:** Checks world state (e.g., `HasAmmo?`). Returns Success/Failure immediately.
- **Action:** Performs logic (e.g., `MoveToTarget`). Often returns **Running** for multiple frames.

## 3. Implementation (C# Example)
```csharp
public enum Status { Success, Failure, Running }

public abstract class Node {
    public abstract Status Tick();
}

public class Selector : Node {
    List<Node> children;
    public override Status Tick() {
        foreach (var child in children) {
            Status s = child.Tick();
            if (s != Status.Failure) return s; // Success or Running
        }
        return Status.Failure;
    }
}
```

## 4. Why use BTs?
- **Decoupling:** A "Reload" behavior can be dropped into any AI agent without knowing the rest of the logic.
- **Reactiveness:** Because the tree is traversed frequently, the AI can interrupt a lower-priority task (Patrol) immediately if a higher-priority condition (EnemyVisible) becomes true.
