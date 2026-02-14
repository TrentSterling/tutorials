# A* Pathfinding

A* (A-Star) is the industry standard for pathfinding in games. It combines the strengths of Dijkstra’s Algorithm (guaranteed shortest path) and Greedy Best-First Search (fast, goal-oriented) using a heuristic.

## 1. The Core Formula
Every node `n` is evaluated using:
`f(n) = g(n) + h(n)`

- **g(n):** The exact cost to move from the start node to node `n`.
- **h(n):** The heuristic—an estimated cost from node `n` to the goal.
- **f(n):** The total estimated cost. We always expand the node with the **lowest f**.

## 2. Heuristics
The heuristic must be **admissible** (it never overestimates the cost) to ensure the shortest path.
- **Manhattan Distance:** Used for grids with 4-way movement. `abs(dx) + abs(dy)`.
- **Euclidean Distance:** Used for any-angle movement. `sqrt(dx^2 + dy^2)`.
- **Octile Distance:** Used for 8-way grids (including diagonals).

## 3. The Workflow
1. **Open Set:** Nodes to be visited (Priority Queue).
2. **Closed Set:** Nodes already visited.
3. **Iteration:**
   - Pop node with lowest `f` from Open Set.
   - If Goal reached, backtrack via `parent` pointers.
   - Otherwise, evaluate neighbors, update their scores, and add them to the Open Set.

## 4. Implementation (C# Example)
```csharp
public List<Node> FindPath(Node start, Node goal) {
    var openSet = new PriorityQueue<Node>();
    var closedSet = new HashSet<Node>();

    start.g = 0;
    start.f = Heuristic(start, goal);
    openSet.Enqueue(start);

    while (openSet.Count > 0) {
        Node current = openSet.Dequeue();
        if (current == goal) return ReconstructPath(current);

        closedSet.Add(current);

        foreach (var neighbor in current.Neighbors) {
            if (closedSet.Contains(neighbor)) continue;

            float tentativeG = current.g + Distance(current, neighbor);
            if (tentativeG < neighbor.g) {
                neighbor.parent = current;
                neighbor.g = tentativeG;
                neighbor.f = neighbor.g + Heuristic(neighbor, goal);

                if (!openSet.Contains(neighbor))
                    openSet.Enqueue(neighbor);
            }
        }
    }
    return null; // No path found
}
```

## 5. Performance Considerations
- **Binary Heap:** Always use a Min-Heap for the Open Set. A simple list/array will make the search $O(n^2)$.
- **Grids vs. Graphs:** A* works on any graph (Waypoints, Navmesh, Grids).
- **HPA* (Hierarchical Pathfinding):** For massive maps, break the world into chunks and pathfind between chunk portals first.
