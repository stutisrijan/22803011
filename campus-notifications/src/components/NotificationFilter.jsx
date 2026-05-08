"use client";

import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import { logger } from "@/utils/logger";

const NOTIFICATION_TYPES = ["", "Placement", "Result", "Event"];

export default function NotificationFilter({ type, onTypeChange, topN, onTopNChange, showTopN = false }) {
  const handleTypeChange = (e) => {
    const val = e.target.value;
    logger.info("Filter type changed", { type: val });
    onTypeChange(val);
  };

  const handleTopNChange = (e, val) => {
    if (val !== null) {
      logger.info("Top N changed", { n: val });
      onTopNChange(val);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 2,
        alignItems: "center",
        mb: 2,
      }}
    >
      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel>Notification Type</InputLabel>
        <Select value={type} label="Notification Type" onChange={handleTypeChange}>
          <MenuItem value="">All Types</MenuItem>
          {NOTIFICATION_TYPES.filter(Boolean).map((t) => (
            <MenuItem key={t} value={t}>
              {t}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {showTopN && (
        <ToggleButtonGroup
          value={topN}
          exclusive
          onChange={handleTopNChange}
          size="small"
          color="primary"
        >
          <ToggleButton value={5}>Top 5</ToggleButton>
          <ToggleButton value={10}>Top 10</ToggleButton>
          <ToggleButton value={15}>Top 15</ToggleButton>
          <ToggleButton value={20}>Top 20</ToggleButton>
        </ToggleButtonGroup>
      )}
    </Box>
  );
}
