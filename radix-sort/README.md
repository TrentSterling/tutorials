# Radix Sort

Radix sort is a non-comparative sorting algorithm. While comparison-based sorts like QuickSort or MergeSort are limited to $O(n \log n)$, Radix Sort can achieve $O(n \cdot k)$ performance (where $k$ is the number of bits/digits), making it one of the fastest ways to sort large datasets in games.

## 1. How it Works
Radix sort avoids comparisons by grouping keys by individual digits that share the same position and value. It typically uses **Counting Sort** as a stable subroutine to process each "digit" or "byte."

- **LSD (Least Significant Digit):** Sorts from the smallest bit/digit to the largest. This is the standard for fixed-size integers.
- **MSD (Most Significant Digit):** Sorts from the largest to the smallest. Often used for lexicographical sorting (strings).

## 2. Visualizing LSD Radix Sort
Array: `[170, 45, 75, 90, 802, 24, 2, 66]`

1. **Sort by 1s:** `[170, 90, 802, 2, 24, 45, 75, 66]`
2. **Sort by 10s:** `[802, 2, 24, 45, 66, 170, 75, 90]`
3. **Sort by 100s:** `[2, 24, 45, 66, 75, 90, 170, 802]`

## 3. Implementation (C++)
```cpp
void CountingSort(std::vector<int>& arr, int exp) {
    int n = arr.size();
    std::vector<int> output(n);
    int count[10] = {0};

    for (int i = 0; i < n; i++)
        count[(arr[i] / exp) % 10]++;

    for (int i = 1; i < 10; i++)
        count[i] += count[i - 1];

    for (int i = n - 1; i >= 0; i--) {
        int digit = (arr[i] / exp) % 10;
        output[count[digit] - 1] = arr[i];
        count[digit]--;
    }
    arr = output;
}

void RadixSort(std::vector<int>& arr) {
    int m = *std::max_element(arr.begin(), arr.end());
    for (int exp = 1; m / exp > 0; exp *= 10)
        CountingSort(arr, exp);
}
```

## 4. Real-World Game Dev Uses
- **GPU Particle Sorting:** Sorting 100,000+ particles by depth for transparent rendering.
- **Multi-Draw Indirect:** Sorting draw calls by material or texture ID to minimize state changes.
- **Sweep and Prune:** Sorting object bounds on an axis for broad-phase collision.

## 5. Trade-offs
- **Memory:** Requires $O(n)$ extra space for the temporary output buffer.
- **Key Types:** Works natively on integers. Sorting floats requires a bit-flipping trick to maintain order for negative numbers and exponents.
