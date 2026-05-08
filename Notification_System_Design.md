# Stage 1

## Notification System Design — Priority Inbox

### Problem Statement

Users of the campus notification platform are overwhelmed by high volumes of notifications (Placements, Events, Results). They lose track of important updates. We need a **Priority Inbox** that always displays the top **N** most important unread notifications, determined by a combination of **type weight** and **recency**.

---

### Approach

#### Priority Score Calculation

Each notification is assigned a composite priority score:

```
score = type_weight × 10^12 + unix_timestamp_seconds
```

| Type      | Weight | Rationale                        |
|-----------|--------|----------------------------------|
| Placement | 3      | Career-critical, highest urgency |
| Result    | 2      | Academic importance              |
| Event     | 1      | General campus activity          |

The large multiplier (`10^12`) ensures type weight is the **primary** sorting criterion, while the unix timestamp acts as a **tiebreaker** — more recent notifications rank higher within the same type.

#### Data Structure: Min-Heap (Size N)

To efficiently maintain the top N notifications, I use a **Min-Heap of fixed size N**:

1. **Insert** each notification into the heap.
2. If the heap size exceeds N, **remove the minimum** (lowest priority).
3. At the end, the heap contains exactly the top N highest-priority notifications.

**Why a Min-Heap?**

| Operation                | Time Complexity |
|--------------------------|-----------------|
| Insert                   | O(log N)        |
| Remove min               | O(log N)        |
| Process all M notifications | O(M log N)   |
| Naive sort approach      | O(M log M)      |

Since `N << M` (e.g., N=10 vs M=1000+), the heap approach is significantly faster. When new notifications stream in, we only need O(log N) per new notification to update the top N — **no re-sorting required**.

#### Handling New Incoming Notifications

When a new notification arrives:

1. Compute its priority score.
2. Compare with the heap's minimum (peek).
3. If the new score > minimum, replace the min and re-heapify — **O(log N)**.
4. Otherwise, discard — **O(1)**.

This makes the solution **ideal for real-time streaming** scenarios.

---

### Architecture Diagram

```
┌─────────────────────┐
│  Notification API   │
│  (GET /notifications)│
└────────┬────────────┘
         │ Fetch
         ▼
┌─────────────────────┐
│  Fetch & Parse JSON  │
│  (with Auth Header)  │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  For each notification│
│  Compute Priority    │
│  Score               │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  Min-Heap (size N)   │
│  ┌───┐ ┌───┐ ┌───┐  │
│  │ 3 │ │ 5 │ │ 7 │  │
│  └───┘ └───┘ └───┘  │  ← Maintains top N
│  Insert if score >   │
│  heap minimum        │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  Extract & Sort      │
│  (Descending)        │
│  → Top N Results     │
└─────────────────────┘
```

---

### File Structure

```
stage1/
├── priority-inbox.js       # Main implementation with MinHeap
logging-middleware/
├── logger.js               # Custom logging middleware (no console.log)
logs/
├── app.log                 # Structured JSON log output
```

---

### How to Run

```bash
# Set auth token (if available)
export AUTH_TOKEN="your-token-here"

# Run the priority inbox
node stage1/priority-inbox.js
```

---

### Key Design Decisions

1. **Min-Heap over Sorting**: O(M log N) vs O(M log M) — better for large datasets and streaming.
2. **Composite Score**: Single numeric value avoids complex multi-field comparisons.
3. **Logging Middleware**: All operations logged to `logs/app.log` in structured JSON format — no `console.log` used.
4. **Graceful Fallback**: If the API is unreachable, sample data is used for demonstration.
5. **Configurable N**: The `TOP_N` parameter can be changed to 10, 15, 20, etc. as needed.

---

### Output Screenshot Reference

The program outputs a formatted priority inbox showing:
- Rank (#1 - #10)
- Type icon and label (💼 Placement, 📊 Result, 🎉 Event)
- Priority level (HIGH / MEDIUM / LOW)
- Message, timestamp, ID, and computed score

It also demonstrates handling of new incoming notifications, showing the updated top 10 after new Placement and Event notifications arrive.
