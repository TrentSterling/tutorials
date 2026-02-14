# Threading in Games

Modern CPUs have many cores, but games are notoriously difficult to parallelize because of tight data dependencies. Modern engines have moved away from "system-per-thread" (e.g., Audio Thread, Physics Thread) toward **Task-Based Job Systems**.

## 1. Task-Based Job Systems
Instead of long-lived threads, you break work into thousands of small "Jobs."
- **Worker Threads:** A pool of threads (usually `CPU Cores - 1`) that sleep when idle.
- **Job Queue:** A thread-safe queue where systems push tasks.
- **Work Stealing:** If a worker finishes its queue, it "steals" jobs from others to maximize CPU utilization.

## 2. Key Synchronization Concepts
Parallel programming is about managing state.
- **Atomics:** Use `std::atomic` for simple counters or flags. They are much faster than mutexes because they don't put the thread to sleep.
- **Mutex / Locks:** Necessary for complex data structures, but avoid them in hot loops (the "Main Loop").
- **Double Buffering:** A common pattern where you read from "Buffer A" and write to "Buffer B." At the end of the frame, you swap them. This eliminates the need for most locks.

## 3. The "False Sharing" Trap
This is a silent performance killer.
- **The Problem:** Two threads update different variables that happen to live on the same **64-byte cache line**.
- **The Result:** The CPU forces the threads to sync their caches constantly, making the code run slower than a single-threaded version.
- **The Fix:** Use padding or align your data to cache line boundaries (`alignas(64)`).

## 4. Simple Parallel Loop (C++)
```cpp
void ProcessParticles(std::vector<Particle>& particles) {
    // Split 10,000 particles across 8 cores
    const int numTasks = 8;
    const int chunkSize = particles.size() / numTasks;

    for (int i = 0; i < numTasks; ++i) {
        JobSystem::Execute([=, &particles]() {
            int start = i * chunkSize;
            int end = (i == numTasks - 1) ? particles.size() : (i + 1) * chunkSize;
            
            for (int j = start; j < end; ++j) {
                UpdateParticle(particles[j]);
            }
        });
    }
    JobSystem::WaitForAll(); // Barrier synchronization
}
```

## 5. Summary
- **Don't over-parallelize:** The overhead of creating a job can be more than the work itself.
- **Stay Cache-Friendly:** Threads are only as fast as the memory they can access.
- **Prefer Lock-Free:** Use atomic operations and double-buffering over heavy-weight mutexes.
