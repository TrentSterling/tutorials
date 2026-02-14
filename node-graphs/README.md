# Node-Graph Architecture (DIY Houdini)

How do you build a system where users can link nodes to create complex meshes, shaders, or logic? This is the heart of Houdini, Unreal's Blueprints, and Blender's Geometry Nodes. This tutorial covers the backend architecture of a high-performance node-based tool.

## 1. The Core: The DAG (Directed Acyclic Graph)
A node graph is a collection of nodes where data flows from "Source" to "Sink." 
- **Directed:** Data moves in a specific direction (Input $\rightarrow$ Output).
- **Acyclic:** No loops allowed. A node cannot depend on its own future output, as this would create an infinite calculation loop.

## 2. Execution Engine: Pull vs. Push

### Pull-Based (Lazy Evaluation)
You request data from the "Output" node. It checks if its inputs are "dirty" (changed). If so, it asks the parent nodes to re-calculate. 
- **Pros:** Only calculates exactly what is needed for the current frame.
- **Used by:** Houdini, Nuke.

### Push-Based (Eager Evaluation)
Whenever a node is modified, it immediately pushes its new data to every connected downstream node.
- **Pros:** Simpler to implement, instant UI feedback.
- **Used by:** Most simple game logic graphs.

## 3. Data Flow & Port Types
Every connection must represent a specific data type. In a procedural art tool, your types might be:
- **Float/Vector:** Simple math.
- **MeshBuffer:** The raw vertex/index data.
- **SDFVolume:** A 3D grid of distance values.

## 4. Implementation Pattern (C#)
```csharp
public class Node {
    public Guid ID;
    public List<Port> Inputs;
    public List<Port> Outputs;

    public virtual void OnProcess() {
        // Implementation for adding, subdividing, etc.
    }
}

public class SubdivideNode : Node {
    public override void OnProcess() {
        Mesh mesh = Inputs[0].Get<Mesh>();
        Mesh result = CatmullClark.Process(mesh);
        Outputs[0].Set(result);
    }
}
```

## 5. From Graph to Mesh
The final node in your graph (the "Sink") is what actually sends data to the GPU. In a "DIY Houdini," this node takes the final `MeshBuffer` and updates a standard `MeshFilter` or `Vertex Buffer` in your game engine.

## 6. Summary
- Graphs are **DAGs**.
- Use **Pull-based** logic for heavy geometry processing.
- Type-safety at the Port level is essential.
