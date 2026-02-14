# Platformer Pathfinding

Pathfinding in a platformer is uniquely challenging because movement is constrained by gravity and momentum. Agents cannot move freely; they must walk, jump, fall, or climb.

## 1. The Challenge: Non-Holonomic Movement
In a top-down game, if there is a path, you can usually just walk there. In a platformer:
- You might see a platform but be unable to jump high enough to reach it.
- You might be able to fall down to a platform, but not jump back up.
- **Result:** The navigation graph must be a **Directed Graph** (links only go one way).

## 2. Link Types
A platformer nav-graph consists of platforms (nodes) and different types of movement (edges):
1. **Walk:** Moving horizontally on a surface.
2. **Fall:** Dropping off an edge.
3. **Jump:** A parabolic arc from one platform to another.
4. **Ledge Grab:** Jumping to an edge and pulling up.

## 3. Physics-Based Edge Generation
To "bake" a jump link, the engine must simulate the agent's physics:
- **Trajectory:** Calculate the arc using the agent’s `jumpForce`, `gravity`, and `maxHorizontalSpeed`.
- **Validation:** Use raycasts or sweep-tests along that arc. If the agent hits a ceiling or a wall mid-jump, that link is deleted.

## 4. AI Execution (The Controller)
Finding a path is only half the battle. The AI must execute it:
- **Launch Point:** The exact X-coordinate where the AI must press the "Jump" button.
- **Air Control:** In many games (like Mario), you can move in the air. The AI must calculate if it needs to steer left/right mid-jump to land correctly.

## 5. Implementation Strategy
- **Grid-Based:** Simplest for tile-based games. Each tile is a node.
- **Platform-Based:** Better for modern games. Each flat surface is a single node, and "Jump Links" connect them.
- **Dynamic Jumps:** If the agent gets a "Speed Power-up," all jump links must be recalculated because they can now jump further.
