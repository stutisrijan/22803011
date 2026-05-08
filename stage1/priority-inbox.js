const { logger } = require("../logging-middleware/logger");

// ─── Configuration ──────────────────────────────────────────
const API_URL = "http://4.224.186.213/evaluation-service/notifications";
const AUTH_TOKEN = process.env.AUTH_TOKEN || ""; // Set via environment
const TOP_N = 10;

// Priority weights: Placement > Result > Event
const TYPE_WEIGHT = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

// ─── MinHeap for efficient Top-N maintenance ────────────────
class MinHeap {
  constructor(compareFn) {
    this.heap = [];
    this.compareFn = compareFn;
  }

  size() {
    return this.heap.length;
  }

  peek() {
    return this.heap[0];
  }

  push(val) {
    this.heap.push(val);
    this._bubbleUp(this.heap.length - 1);
  }

  pop() {
    const top = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this._sinkDown(0);
    }
    return top;
  }

  _bubbleUp(i) {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.compareFn(this.heap[i], this.heap[parent]) < 0) {
        [this.heap[i], this.heap[parent]] = [this.heap[parent], this.heap[i]];
        i = parent;
      } else break;
    }
  }

  _sinkDown(i) {
    const n = this.heap.length;
    while (true) {
      let smallest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      if (left < n && this.compareFn(this.heap[left], this.heap[smallest]) < 0)
        smallest = left;
      if (right < n && this.compareFn(this.heap[right], this.heap[smallest]) < 0)
        smallest = right;
      if (smallest !== i) {
        [this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]];
        i = smallest;
      } else break;
    }
  }

  toSortedArray() {
    return [...this.heap].sort((a, b) => this.compareFn(b, a));
  }
}

// ─── Priority Score Calculation ─────────────────────────────
function computePriorityScore(notification) {
  const weight = TYPE_WEIGHT[notification.Type] || 0;
  const timestamp = new Date(notification.Timestamp).getTime();
  // Normalize timestamp to seconds since a reference point
  const recencyScore = timestamp / 1000;
  // Combined score: weight is primary, recency is tiebreaker
  return weight * 1e12 + recencyScore;
}

// ─── Fetch notifications from API ───────────────────────────
async function fetchNotifications() {
  logger.info("Fetching notifications from API", { url: API_URL });

  try {
    const response = await fetch(API_URL, {
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`,
      },
    });

    if (!response.ok) {
      logger.error("API request failed", {
        status: response.status,
        statusText: response.statusText,
      });
      // Fallback: use sample data for demonstration
      logger.warn("Using sample notification data for demonstration");
      return getSampleNotifications();
    }

    const data = await response.json();
    logger.info("Fetched notifications successfully", {
      count: data.notifications.length,
    });
    return data.notifications;
  } catch (error) {
    logger.error("Error fetching notifications", { error: error.message });
    logger.warn("Using sample notification data for demonstration");
    return getSampleNotifications();
  }
}

// ─── Sample data (from API documentation) ───────────────────
function getSampleNotifications() {
  return [
    { ID: "d146095a-0d86-4a34-9e69-3900a14576bc", Type: "Result", Message: "mid-sem", Timestamp: "2026-04-22 17:51:30" },
    { ID: "b283218f-ea5a-4b7c-93a9-1f2f240d64b0", Type: "Placement", Message: "CSX Corporation hiring", Timestamp: "2026-04-22 17:51:18" },
    { ID: "81589ada-0ad3-4f77-9554-f52fb558e09d", Type: "Event", Message: "farewell", Timestamp: "2026-04-22 17:51:06" },
    { ID: "0005513a-142b-4bbc-8678-eefec65e1ede", Type: "Result", Message: "mid-sem", Timestamp: "2026-04-22 17:50:54" },
    { ID: "ea836726-c25e-4f21-a72f-544a6af8a37f", Type: "Result", Message: "project-review", Timestamp: "2026-04-22 17:50:42" },
    { ID: "003cb427-8fc6-47f7-bb00-be228f6b0d2c", Type: "Result", Message: "external", Timestamp: "2026-04-22 17:50:30" },
    { ID: "e5c4ff20-31bf-4d40-8f02-72fda59e8918", Type: "Result", Message: "project-review", Timestamp: "2026-04-22 17:50:18" },
    { ID: "1cfce5ee-ad37-4894-8946-d707627176a5", Type: "Event", Message: "tech-fest", Timestamp: "2026-04-22 17:50:06" },
    { ID: "cf2885a6-45ac-4ba0-b548-6e9e9d4c52c8", Type: "Result", Message: "project-review", Timestamp: "2026-04-22 17:49:54" },
    { ID: "8a7412bd-6065-4d09-8501-a37f11cc848b", Type: "Placement", Message: "Advanced Micro Devices Inc. hiring", Timestamp: "2026-04-22 17:49:42" },
    { ID: "a1b2c3d4-e5f6-7890-abcd-ef1234567890", Type: "Placement", Message: "Google hiring", Timestamp: "2026-04-22 17:49:30" },
    { ID: "f9e8d7c6-b5a4-3210-fedc-ba9876543210", Type: "Event", Message: "hackathon", Timestamp: "2026-04-22 17:49:18" },
    { ID: "11223344-5566-7788-99aa-bbccddeeff00", Type: "Result", Message: "end-sem", Timestamp: "2026-04-22 17:49:06" },
    { ID: "aabbccdd-eeff-0011-2233-445566778899", Type: "Event", Message: "workshop", Timestamp: "2026-04-22 17:48:54" },
    { ID: "99887766-5544-3322-1100-ffeeddccbbaa", Type: "Placement", Message: "Microsoft hiring", Timestamp: "2026-04-22 17:48:42" },
  ];
}

// ─── Get Top N Priority Notifications using MinHeap ─────────
function getTopNPriority(notifications, n = TOP_N) {
  logger.info("Computing top priority notifications", {
    total: notifications.length,
    topN: n,
  });

  // MinHeap: element with LOWEST priority score at top
  const minHeap = new MinHeap((a, b) => a.score - b.score);

  for (const notification of notifications) {
    const score = computePriorityScore(notification);
    const entry = { ...notification, score };

    if (minHeap.size() < n) {
      minHeap.push(entry);
      logger.debug("Added to heap", { id: notification.ID, type: notification.Type, score });
    } else if (score > minHeap.peek().score) {
      const removed = minHeap.pop();
      minHeap.push(entry);
      logger.debug("Replaced in heap", {
        removedId: removed.ID,
        addedId: notification.ID,
        score,
      });
    }
  }

  // Extract sorted (highest priority first)
  const topN = minHeap.toSortedArray();
  logger.info("Top N priority notifications computed", { count: topN.length });
  return topN;
}

// ─── Display Results ────────────────────────────────────────
function displayNotifications(notifications) {
  logger.info("Displaying priority notifications");

  const separator = "─".repeat(80);
  const output = [];

  output.push("");
  output.push(separator);
  output.push("  🔔 TOP " + notifications.length + " PRIORITY NOTIFICATIONS (Priority Inbox)");
  output.push(separator);
  output.push("");

  notifications.forEach((n, index) => {
    const typeIcon =
      n.Type === "Placement" ? "💼" : n.Type === "Result" ? "📊" : "🎉";
    const priorityLabel =
      n.Type === "Placement"
        ? "HIGH"
        : n.Type === "Result"
        ? "MEDIUM"
        : "LOW";

    output.push(`  #${index + 1} ${typeIcon} [${n.Type.toUpperCase()}] - Priority: ${priorityLabel}`);
    output.push(`     Message:   ${n.Message}`);
    output.push(`     Timestamp: ${n.Timestamp}`);
    output.push(`     ID:        ${n.ID}`);
    output.push(`     Score:     ${n.score.toFixed(2)}`);
    output.push(`  ${separator}`);
  });

  const text = output.join("\n");
  // Write to stdout using process.stdout (not console.log)
  process.stdout.write(text + "\n");
  logger.info("Display complete", { count: notifications.length });
}

// ─── Main ───────────────────────────────────────────────────
async function main() {
  logger.info("Priority Inbox application started");

  const notifications = await fetchNotifications();
  logger.info("Total notifications received", { count: notifications.length });

  const topN = getTopNPriority(notifications, TOP_N);
  displayNotifications(topN);

  // Simulate new notifications arriving
  logger.info("Simulating new incoming notifications...");
  const newNotifications = [
    { ID: "new-001", Type: "Placement", Message: "Amazon hiring drive", Timestamp: "2026-04-22 17:55:00" },
    { ID: "new-002", Type: "Event", Message: "cultural-fest", Timestamp: "2026-04-22 17:54:30" },
  ];

  const allNotifications = [...notifications, ...newNotifications];
  logger.info("After new notifications", { total: allNotifications.length });

  const updatedTopN = getTopNPriority(allNotifications, TOP_N);

  process.stdout.write("\n\n  📨 AFTER NEW NOTIFICATIONS ARRIVED:\n\n");
  displayNotifications(updatedTopN);

  logger.info("Priority Inbox application completed");
}

main().catch((err) => {
  logger.error("Application error", { error: err.message });
  process.exit(1);
});
