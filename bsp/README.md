# BSP (Binary Space Partitioning)

Binary Space Partitioning is a fundamental spatial data structure used to recursively divide a 3D (or 2D) space into convex sets using hyperplanes. It was popularized by games like *DOOM* and *Quake* for rendering and collision detection.

## 1. What is BSP?
At its core, a BSP tree is a binary tree where each node represents a "partitioning plane." 
- One child represents the "front" of the plane.
- The other child represents the "back" of the plane.
- Leaves represent empty convex regions of space.

## 2. Building a BSP Tree
The process is recursive:
1. **Choose a partition plane:** Usually picked from the list of existing polygons or a predefined axis.
2. **Split Geometry:** For every polygon in the set, determine if it's in front of, behind, or crossing the plane.
3. **Handle Crossing:** If a polygon crosses the plane, split it into two smaller polygons.
4. **Recurse:** Repeat for the front and back sets until all polygons are processed.

### Pseudo-code (C++)
```cpp
struct Node {
    Plane partition;
    Node *front, *back;
    std::vector<Polygon> polygons;
};

Node* BuildBSPTree(std::vector<Polygon> polygons) {
    if (polygons.empty()) return nullptr;

    Plane plane = PickBestPlane(polygons);
    Node* node = new Node(plane);

    std::vector<Polygon> frontList, backList;

    for (auto& poly : polygons) {
        Side side = Classify(plane, poly);
        if (side == Side::FRONT) frontList.push_back(poly);
        else if (side == Side::BACK) backList.push_back(poly);
        else {
            auto [f, b] = SplitPolygon(plane, poly);
            frontList.push_back(f);
            backList.push_back(b);
        }
    }

    node->front = BuildBSPTree(frontList);
    node->back = BuildBSPTree(backList);
    return node;
}
```

## 3. Traversal for Rendering (Back-to-Front)
BSP trees allow you to render polygons in a perfect back-to-front order without a Z-buffer (Painter's Algorithm). This is how older engines achieved depth sorting.

1. If the camera is in **front** of the node's plane:
   - Recurse **BACK** child (farther away).
   - Render the node's polygons.
   - Recurse **FRONT** child (closer).
2. If the camera is in **back**:
   - Recurse **FRONT** child.
   - Render.
   - Recurse **BACK** child.

## 4. Collision Detection
To check if a point is in "solid" space:
- Start at the root.
- Check which side of the plane the point is on.
- Traverse down until you hit a leaf. 
- If the leaf is marked **Solid**, a collision occurred.

This is extremely fast because it reduces a complex 3D check into a series of simple dot products ( `dot(Point, PlaneNormal) - PlaneDistance` ).
