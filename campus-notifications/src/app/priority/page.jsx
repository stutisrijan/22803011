"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Container,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Chip,
  Paper,
} from "@mui/material";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import NotificationCard from "@/components/NotificationCard";
import NotificationFilter from "@/components/NotificationFilter";
import { fetchNotifications, getTopNPriority } from "@/utils/api";
import { logger } from "@/utils/logger";

export default function PriorityInboxPage() {
  const [allNotifications, setAllNotifications] = useState([]);
  const [priorityNotifications, setPriorityNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [typeFilter, setTypeFilter] = useState("");
  const [topN, setTopN] = useState(10);
  const [viewedIds, setViewedIds] = useState(new Set());
  const [fromFallback, setFromFallback] = useState(false);

  // Load viewed IDs from localStorage
  useEffect(() => {
    logger.info("PriorityInboxPage mounted");
    try {
      const stored = localStorage.getItem("viewedNotifications");
      if (stored) {
        setViewedIds(new Set(JSON.parse(stored)));
        logger.info("Loaded viewed state", { count: JSON.parse(stored).length });
      }
    } catch (e) {
      logger.error("Failed to load viewed state", { error: e.message });
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    logger.info("Loading priority notifications", { topN, type: typeFilter });

    try {
      // Fetch a larger set to compute priority from
      const result = await fetchNotifications({ page: 1, limit: 100, type: typeFilter });
      setAllNotifications(result.notifications);
      setFromFallback(result.fromFallback);

      const prioritized = getTopNPriority(result.notifications, topN);
      setPriorityNotifications(prioritized);
      logger.info("Priority notifications computed", {
        total: result.notifications.length,
        topN: prioritized.length,
      });
    } catch (err) {
      logger.error("Failed to load priority notifications", { error: err.message });
      setError("Failed to load notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [topN, typeFilter]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleView = (id) => {
    setViewedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      try {
        localStorage.setItem("viewedNotifications", JSON.stringify([...next]));
      } catch (e) {
        logger.error("Failed to save viewed state", { error: e.message });
      }
      logger.info("Priority notification marked as viewed", { id });
      return next;
    });
  };

  const handleTypeChange = (type) => {
    setTypeFilter(type);
    logger.info("Priority filter type changed", { type });
  };

  const handleTopNChange = (n) => {
    setTopN(n);
    logger.info("Top N changed", { n });
  };

  const unviewedCount = priorityNotifications.filter((n) => !viewedIds.has(n.ID)).length;

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Paper elevation={0} sx={{ p: 2, mb: 2, bgcolor: "#fce4ec", borderRadius: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <PriorityHighIcon sx={{ color: "#c62828", fontSize: 28 }} />
          <Typography variant="h5" fontWeight={700} sx={{ color: "#c62828" }}>
            Priority Inbox
          </Typography>
          <Chip
            label={`Top ${topN}`}
            color="error"
            size="small"
            sx={{ fontWeight: 700 }}
          />
          {unviewedCount > 0 && (
            <Chip
              label={`${unviewedCount} new`}
              color="warning"
              size="small"
              sx={{ fontWeight: 700 }}
            />
          )}
        </Box>
        <Typography variant="body2" color="text.secondary">
          Most important unread notifications, ranked by type priority (Placement &gt; Result &gt; Event) and recency.
        </Typography>
      </Paper>

      {fromFallback && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Showing sample data — API is currently unavailable. Set your auth token in .env.local to connect.
        </Alert>
      )}

      <NotificationFilter
        type={typeFilter}
        onTypeChange={handleTypeChange}
        topN={topN}
        onTopNChange={handleTopNChange}
        showTopN={true}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress color="error" />
        </Box>
      ) : priorityNotifications.length === 0 ? (
        <Alert severity="info">No priority notifications found.</Alert>
      ) : (
        priorityNotifications.map((notif, index) => (
          <NotificationCard
            key={notif.ID}
            notification={notif}
            isViewed={viewedIds.has(notif.ID)}
            onView={handleView}
            rank={index + 1}
          />
        ))
      )}
    </Container>
  );
}
