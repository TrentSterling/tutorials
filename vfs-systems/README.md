# VFS (Virtual File Systems)

A Virtual File System (VFS) abstracts the physical storage of your computer. Instead of the engine looking for a specific path like `C:/Games/Data/Textures/Grass.png`, it looks for a "Virtual Path" like `assets://textures/grass`.

## 1. Why every engine needs a VFS
- **Asset Packing:** Opening 50,000 tiny files is slow. A VFS allows you to pack them into one large `.pak` or `.wad` file, which is much faster for the OS to read.
- **Modding & Patching:** You can "mount" a patch folder with higher priority than the base game. If the VFS finds `grass.png` in the patch folder, it ignores the base version.
- **Encryption & Compression:** The VFS can decrypt or decompress files on-the-fly, so the rest of your code doesn't have to worry about it.

## 2. Mount Point Architecture
A VFS works by managing a list of **Mount Points**:
1. **Priority 0 (Mod):** `C:/Users/Mods/CoolSword/`
2. **Priority 1 (Patch):** `C:/Game/Patches/v1.1/`
3. **Priority 2 (Base):** `C:/Game/Data/base.pak`

When you call `VFS.Open("textures/sword.png")`, the system checks each mount point in order. The first one that contains the file wins.

## 3. Implementation (C++ Concept)
```cpp
class VirtualFileSystem {
    std::vector<IMount*> mounts;

    FileHandle Open(string path) {
        for (auto* m : mounts) {
            if (m->Exists(path)) {
                return m->Open(path); // Returns a stream from Disk or PAK
            }
        }
        return nullptr; // 404 Not Found
    }
};
```

## 4. Async Streaming
In modern open-world games, the VFS is usually **Thread-Safe**. You request a file, and the VFS returns a "Future" or "Task." The data is loaded on a background thread and delivered to you when it's ready, preventing "hitch" during gameplay.

## 5. Summary
- **Abstraction:** Decouples logic from the file system.
- **Performance:** Minimizes file handles and disk seeks.
- **Flexibility:** Makes modding and patching a core engine feature.
