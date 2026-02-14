# Networking: Client-Side Prediction & Reconciliation

In multiplayer games, waiting for the server to confirm your movement makes the game feel sluggish and unplayable. **Client-Side Prediction (CSP)** allows the player to move instantly, while **Reconciliation** ensures the server remains the ultimate authority.

## 1. The Lag Problem
1. Player presses "Forward".
2. Input travels to Server (50ms).
3. Server processes it.
4. New position travels back to Client (50ms).
5. **Result:** The player sees their character move 100ms *after* pressing the button.

## 2. The Solution: Predict & Correct
Instead of waiting, the client applies the input **immediately** to their local simulation. They assume the server will agree.
- **Inputs:** Store every input in a circular buffer (Ring Buffer) with a `Tick` number.
- **State:** Store the resulting position/velocity for each tick.

## 3. Reconciliation (When the Server Disagrees)
Eventually, the server sends a packet: "At Tick 100, you were at Position (10, 0, 5)."
1. The client checks its history for Tick 100.
2. If the saved position matches the server's, do nothing.
3. If it **mismatches** (e.g., due to a collision the client missed):
   - **Snap** the player to the server's authoritative position.
   - **Re-simulate** all subsequent inputs from Tick 101 up to the current Tick.

This happens in a single frame. The player might see a "pop" or "rubber band," but the game state remains consistent.

## 4. Entity Interpolation (Remote Players)
CSP works for *your* character. For *other* players, you cannot predict their inputs.
Instead, you receive snapshots of their positions (e.g., at Tick 90 and Tick 95).
- **Strategy:** Render remote players slightly in the past (e.g., at Tick 92).
- **Interpolate:** Smoothly blend between the snapshot at Tick 90 and Tick 95.
- **Trade-off:** You see enemies slightly delayed, which necessitates **Lag Compensation** (rewinding time) for shooting.

## 5. Summary
- **Prediction:** Makes the game feel responsive (0ms latency feel).
- **Reconciliation:** Keeps the game fair and cheat-proof.
- **Interpolation:** Makes other players look smooth despite packet jitter.
