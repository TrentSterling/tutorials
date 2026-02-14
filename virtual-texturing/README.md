# Virtual Texturing (Sparse Textures)

Virtual Texturing (often called "Megatextures") allows games to use textures much larger than what would fit in VRAM. It treats your GPU memory as a dynamic cache for a massive "Virtual" texture stored on disk.

## 1. The Three Components

### 1. The Virtual Texture
A massive, logical texture (e.g., $128,000 \times 128,000$ pixels). It is stored on disk, broken into small tiles (e.g., $128 \times 128$ px).

### 2. The Physical Atlas
A texture that actually lives in VRAM. It is a "pool" of tiles. At any given moment, it only contains the tiles that the camera is currently looking at.

### 3. The Indirection Table
A low-resolution texture used as a "map." When the shader wants to sample the Virtual Texture, it first looks at the Indirection Table to find where that tile is currently located in the **Physical Atlas**.

## 2. The Feedback Loop
How does the engine know which tiles to load?
1. **Shader Sampling:** The shader tries to sample a tile. 
2. **Miss:** If the tile isn't in the Indirection Table, the shader writes the "Missing Tile ID" to a small **Feedback Texture**.
3. **Streaming:** The CPU reads this texture, fetches the tile from disk, and uploads it to the Physical Atlas.
4. **Update:** The Indirection Table is updated, and the next frame the texture appears sharp.

## 3. Why use Virtual Texturing?
- **Unique Detail:** No more "tiling" patterns. Every square inch of your world can be uniquely painted (as seen in *DOOM 2016*).
- **Constant Memory:** VRAM usage is based on resolution and screen coverage, not the total amount of textures in your game.
- **Texture Painting:** It is the foundation for real-time 3D painting tools (Substance Painter style).

## 4. Summary
- Treat VRAM as a **Cache**.
- Use a **Map** (Indirection) to find data.
- **Stream** only what is visible.
