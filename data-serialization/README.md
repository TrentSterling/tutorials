# Data Serialization (High-Speed Game State)

In professional game development, saving or syncing state needs to be nearly instantaneous. Standard JSON or XML is too slow and bulky for hot-path data. Professional engines use **Binary Serialization** and **Memory Mapping** to handle massive amounts of data with zero overhead.

## 1. Text vs. Binary
- **JSON/XML:** Human-readable, but slow. The CPU must perform expensive string manipulation to parse a simple float.
- **Binary:** A direct bit-for-bit representation of memory. It is incredibly fast to load because the CPU can often just "copy" the data directly into a struct.

## 2. Bit-Packing (The Minimalist Approach)
In networking or high-density save files, we don't waste 32 bits on a value that only ranges from 0 to 10.
- **The Concept:** We manually pack multiple variables into a single integer.
- **Example:** A player's `Level` (0-100), `IsAlive` (0-1), and `Ammo` (0-200) can all fit into a single 32-bit `uint`.

## 3. Memory-Mapped Files (Zero-Copy)
The fastest way to load data is to not "load" it at all. 
- **The Strategy:** You ask the Operating System to map a file directly into the application's address space. 
- **The Result:** The file on disk behaves like an array in RAM. You can access data using pointers instantly, and the OS handles the "loading" in the background as you access specific memory addresses.

## 4. Zero-Parsing Formats (FlatBuffers)
Standard binary formats still require a "deserialization" step. **FlatBuffers** (developed by Google for games) change this.
- Data is stored in a format that is "already ready" for the CPU.
- You can access any part of a 1GB save file without ever reading the whole thing or converting it into objects.

## 5. Implementation (C# Bit-Packing)
```csharp
public struct PackedState {
    public uint rawData;

    // Use bits 0-6 for Health (0-127)
    public int Health {
        get => (int)(rawData & 0x7F);
        set => rawData = (rawData & ~0x7Fu) | ((uint)value & 0x7F);
    }

    // Use bit 7 for IsPoisoned
    public bool IsPoisoned {
        get => (rawData & 0x80) != 0;
        set => rawData = value ? (rawData | 0x80) : (rawData & ~0x80u);
    }
}
```

## 6. Summary
- **Text is for Configs:** Use JSON for settings, never for gameplay state.
- **Bit-Pack for Scale:** Essential for sending data over the network.
- **Zero-Copy is the Goal:** Use Memory Mapping and FlatBuffers to eliminate "Loading Bars" entirely.
