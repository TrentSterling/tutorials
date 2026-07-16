# Gamedev Hub

A single-page tutorial browser covering 90+ game dev algorithms and systems, from spatial partitioning to GPU compute fluids.

## What it is

`index.html` is a self-contained sidebar app: pick a topic on the left, it fetches that topic's `README.md` and renders it as markdown (with syntax-highlighted code blocks). No build step, no server-side code, just fetch + render.

Each topic lives in its own folder (`bsp/`, `astar/`, `boids/`, `pbr/`, etc.) with a `README.md` write-up. Some folders also ship a `demo.js` (Canvas2D) that the hub loads and runs live above the article, e.g. A*, Spatial Hash, SDF, PBR, Verlet, IK, FRIM, SAT, Boids.

Topics are grouped into categories in the sidebar:
- Meta & Research
- Procedural Art & DIY Tools (node graphs, terrain mesh, splatmaps, compute painting, WFC...)
- The 20 Games Challenge (Pong through a custom engine, 20 chapters, most still scaffolded stubs)
- Foundational Math & Physics
- Advanced Physics & Simulation (PD/SPD controllers, active ragdolls, SPH fluids, voronoi destruction...)
- AI & Pathfinding (A*, navmesh, flow fields, GOAP, utility AI, boids...)
- Graphics & Visuals (GPU grass, voxel GI, PBR, SDF rendering, mesh shaders...)
- Engine Architecture & Logic (ECS, HSM, threading, VFS, custom allocators...)
- Networking (prediction/reconciliation, rollback, interest management, NAT punchthrough)

Not every topic is a finished write-up — some are still `[STUB]` placeholders (see the 20 Games Challenge chapters). Check a folder's `README.md` to see if it's filled in.

## How to run

No build, no dependencies. Open `index.html` in a browser, or serve the folder locally so `fetch()` can pull the per-topic markdown:

```
npx serve .
```

(A plain `file://` open works in some browsers but `fetch` of local files is blocked in others — serving it avoids that.)

## Tech stack

- Vanilla HTML/JS, no framework
- Tailwind CSS (CDN)
- marked.js (CDN) for markdown rendering
- highlight.js (CDN) for code syntax highlighting
- Per-topic interactive demos are plain Canvas2D JS, loaded and `eval`'d at runtime
