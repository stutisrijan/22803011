"use client";

import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Badge,
} from "@mui/material";
import WorkIcon from "@mui/icons-material/Work";
import AssessmentIcon from "@mui/icons-material/Assessment";
import EventIcon from "@mui/icons-material/Event";
import FiberNewIcon from "@mui/icons-material/FiberNew";
import { logger } from "@/utils/logger";

const typeConfig = {
  Placement: {
    icon: <WorkIcon />,
    color: "#e53935",
    bgColor: "#ffebee",
    chipColor: "error",
    label: "Placement",
  },
  Result: {
    icon: <AssessmentIcon />,
    color: "#1565c0",
    bgColor: "#e3f2fd",
    chipColor: "primary",
    label: "Result",
  },
  Event: {
    icon: <EventIcon />,
    color: "#2e7d32",
    bgColor: "#e8f5e9",
    chipColor: "success",
    label: "Event",
  },
};

export default function NotificationCard({ notification, isViewed, onView, rank }) {
  const config = typeConfig[notification.Type] || typeConfig.Event;

  const handleClick = () => {
    if (!isViewed) {
      logger.info("Notification viewed", { id: notification.ID, type: notification.Type });
      onView(notification.ID);
    }
  };

  const formattedTime = (() => {
    try {
      const d = new Date(notification.Timestamp);
      return d.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return notification.Timestamp;
    }
  })();

  return (
    <Card
      onClick={handleClick}
      sx={{
        mb: 1.5,
        cursor: "pointer",
        borderLeft: `4px solid ${config.color}`,
        bgcolor: isViewed ? "#fafafa" : config.bgColor,
        opacity: isViewed ? 0.75 : 1,
        transition: "all 0.2s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: 3,
        },
      }}
    >
      <CardContent sx={{ py: 1.5, px: 2, "&:last-child": { pb: 1.5 } }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
          {rank && (
            <Typography
              variant="caption"
              sx={{
                bgcolor: config.color,
                color: "white",
                borderRadius: "50%",
                width: 24,
                height: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "0.7rem",
                flexShrink: 0,
              }}
            >
              {rank}
            </Typography>
          )}
          <Box sx={{ color: config.color, display: "flex", alignItems: "center" }}>
            {config.icon}
          </Box>
          <Chip
            label={config.label}
            size="small"
            color={config.chipColor}
            variant={isViewed ? "outlined" : "filled"}
            sx={{ fontWeight: 600, fontSize: "0.7rem" }}
          />
          {!isViewed && (
            <Badge>
              <FiberNewIcon sx={{ color: "#ff6f00", fontSize: 20 }} />
            </Badge>
          )}
          <Box sx={{ flexGrow: 1 }} />
          <Typography variant="caption" color="text.secondary">
            {formattedTime}
          </Typography>
        </Box>

        <Typography
          variant="body1"
          sx={{
            fontWeight: isViewed ? 400 : 600,
            ml: rank ? 4.5 : 0,
            color: isViewed ? "text.secondary" : "text.primary",
          }}
        >
          {notification.Message}
        </Typography>
      </CardContent>
    </Card>
  );
}
