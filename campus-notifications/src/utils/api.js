import { logger } from "./logger";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://4.224.186.213/evaluation-service";
const AUTH_TOKEN = process.env.NEXT_PUBLIC_AUTH_TOKEN || "";

export async function fetchNotifications({ page = 1, limit = 10, type = "" } = {}) {
  const params = new URLSearchParams();
  if (page) params.append("page", String(page));
  if (limit) params.append("limit", String(limit));
  if (type) params.append("notification_type", type);

  const url = `${API_BASE}/notifications?${params.toString()}`;
  logger.info("Fetching notifications", { url, page, limit, type });

  try {
    const headers = {};
    if (AUTH_TOKEN) {
      headers["Authorization"] = `Bearer ${AUTH_TOKEN}`;
    }

    const response = await fetch(url, { headers, cache: "no-store" });

    if (!response.ok) {
      logger.error("API request failed", { status: response.status });
      return { notifications: getFallbackNotifications(), fromFallback: true };
    }

    const data = await response.json();
    logger.info("Fetched notifications successfully", { count: data.notifications?.length });
    return { notifications: data.notifications || [], fromFallback: false };
  } catch (error) {
    logger.error("Network error fetching notifications", { error: error.message });
    return { notifications: getFallbackNotifications(), fromFallback: true };
  }
}

function getFallbackNotifications() {
  logger.warn("Using fallback notification data");
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
    { ID: "a1b2c3d4-0001-4a34-9e69-3900a14576bc", Type: "Placement", Message: "Google hiring", Timestamp: "2026-04-22 17:49:30" },
    { ID: "b2c3d4e5-0002-4a34-9e69-3900a14576bc", Type: "Event", Message: "hackathon", Timestamp: "2026-04-22 17:49:18" },
    { ID: "c3d4e5f6-0003-4a34-9e69-3900a14576bc", Type: "Result", Message: "end-sem", Timestamp: "2026-04-22 17:49:06" },
    { ID: "d4e5f6a7-0004-4a34-9e69-3900a14576bc", Type: "Event", Message: "workshop", Timestamp: "2026-04-22 17:48:54" },
    { ID: "e5f6a7b8-0005-4a34-9e69-3900a14576bc", Type: "Placement", Message: "Microsoft hiring", Timestamp: "2026-04-22 17:48:42" },
    { ID: "f6a7b8c9-0006-4a34-9e69-3900a14576bc", Type: "Result", Message: "lab-exam", Timestamp: "2026-04-22 17:48:30" },
    { ID: "a7b8c9d0-0007-4a34-9e69-3900a14576bc", Type: "Event", Message: "sports-day", Timestamp: "2026-04-22 17:48:18" },
    { ID: "b8c9d0e1-0008-4a34-9e69-3900a14576bc", Type: "Placement", Message: "Amazon hiring drive", Timestamp: "2026-04-22 17:48:06" },
    { ID: "c9d0e1f2-0009-4a34-9e69-3900a14576bc", Type: "Result", Message: "assignment-grades", Timestamp: "2026-04-22 17:47:54" },
    { ID: "d0e1f2a3-0010-4a34-9e69-3900a14576bc", Type: "Event", Message: "orientation", Timestamp: "2026-04-22 17:47:42" },
  ];
}

// Priority scoring (same as Stage 1)
const TYPE_WEIGHT = { Placement: 3, Result: 2, Event: 1 };

export function computePriorityScore(notification) {
  const weight = TYPE_WEIGHT[notification.Type] || 0;
  const timestamp = new Date(notification.Timestamp).getTime();
  return weight * 1e12 + timestamp / 1000;
}

export function getTopNPriority(notifications, n = 10) {
  logger.info("Computing top N priority", { total: notifications.length, n });

  const scored = notifications.map((notif) => ({
    ...notif,
    score: computePriorityScore(notif),
  }));

  scored.sort((a, b) => b.score - a.score);
  const topN = scored.slice(0, n);

  logger.info("Top N computed", { count: topN.length });
  return topN;
}
