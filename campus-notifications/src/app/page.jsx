"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Container,
  Typography,
  Box,
  Pagination,
  Alert,
  CircularProgress,
  Chip,
  Paper,
} from "@mui/material";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import NotificationCard from "@/components/NotificationCard";
import NotificationFilter from "@/components/NotificationFilter";
import { fetchNotifications } from "@/utils/api";
import { logger } from "@/utils/logger";

const ITEMS_PER_PAGE = 10;

export default function AllNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("");
  const [viewedIds, setViewedIds] = useState(new Set());
  const [fromFallback, setFromFallback] = useState(false);

  // Load viewed IDs from localStorage
  useEffect(() => {
    logger.info("AllNotificationsPage mounted");
    try {
      const stored = localStorage.getItem("viewedNotifications");
      if (stored) {
        setViewedIds(new Set(JSON.parse(stored)));
        logger.info("Loaded viewed notifications from storage", { count: JSON.parse(stored).length });
      }
    } catch (e) {
      logger.error("Failed to load viewed notifications", { error: e.message });
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    logger.info("Loading notifications", { page, type: typeFilter });

    try {
      const result = await fetchNotifications({
        page,
        limit: ITEMS_PER_PAGE,
        type: typeFilter,
      });
      setNotifications(result.notifications);
      setFromFallback(result.fromFallback);
      logger.info("Notifications loaded", { count: result.notifications.length });
    } catch (err) {
      logger.error("Failed to load notifications", { error: err.message });
      setError("Failed to load notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, typeFilter]);

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
      logger.info("Notification marked as viewed", { id });
      return next;
    });
  };

  const handleTypeChange = (type) => {
    setTypeFilter(type);
    setPage(1);
    logger.info("Type filter changed", { type });
  };

  const unviewedCount = notifications.filter((n) => !viewedIds.has(n.ID)).length;

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Paper elevation={0} sx={{ p: 2, mb: 2, bgcolor: "#e8eaf6", borderRadius: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <NotificationsActiveIcon sx={{ color: "#1a237e", fontSize: 28 }} />
          <Typography variant="h5" fontWeight={700} color="primary">
            All Notifications
          </Typography>
          {unviewedCount > 0 && (
            <Chip
              label={`${unviewedCount} new`}
              color="secondary"
              size="small"
              sx={{ fontWeight: 700 }}
            />
          )}
        </Box>
        <Typography variant="body2" color="text.secondary">
          Browse all campus notifications. Click on a notification to mark it as read.
        </Typography>
      </Paper>

      {fromFallback && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Showing sample data — API is currently unavailable. Set your auth token in .env.local to connect.
        </Alert>
      )}

      <NotificationFilter type={typeFilter} onTypeChange={handleTypeChange} />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : notifications.length === 0 ? (
        <Alert severity="info">No notifications found.</Alert>
      ) : (
        <>
          {notifications.map((notif) => (
            <NotificationCard
              key={notif.ID}
              notification={notif}
              isViewed={viewedIds.has(notif.ID)}
              onView={handleView}
            />
          ))}

          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <Pagination
              count={10}
              page={page}
              onChange={(e, val) => {
                setPage(val);
                logger.info("Page changed", { page: val });
              }}
              color="primary"
              shape="rounded"
            />
          </Box>
        </>
      )}
    </Container>
  );
}
