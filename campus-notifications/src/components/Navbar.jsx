"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import { logger } from "@/utils/logger";

const navItems = [
  { label: "All Notifications", path: "/", icon: <NotificationsIcon /> },
  { label: "Priority Inbox", path: "/priority", icon: <PriorityHighIcon /> },
];

export default function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleNav = (path) => {
    logger.info("Navigation", { from: pathname, to: path });
    router.push(path);
    setDrawerOpen(false);
  };

  return (
    <>
      <AppBar position="sticky" sx={{ bgcolor: "#1a237e" }}>
        <Toolbar>
          {isMobile && (
            <IconButton edge="start" color="inherit" onClick={() => setDrawerOpen(true)} sx={{ mr: 1 }}>
              <MenuIcon />
            </IconButton>
          )}
          <NotificationsIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Campus Notifications
          </Typography>
          {!isMobile &&
            navItems.map((item) => (
              <Button
                key={item.path}
                color="inherit"
                onClick={() => handleNav(item.path)}
                sx={{
                  mx: 0.5,
                  borderBottom: pathname === item.path ? "2px solid white" : "none",
                  borderRadius: 0,
                  fontWeight: pathname === item.path ? 700 : 400,
                }}
                startIcon={item.icon}
              >
                {item.label}
              </Button>
            ))}
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 260 }}>
          <Box sx={{ p: 2, bgcolor: "#1a237e", color: "white" }}>
            <Typography variant="h6" fontWeight={700}>
              Campus Notifications
            </Typography>
          </Box>
          <List>
            {navItems.map((item) => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  selected={pathname === item.path}
                  onClick={() => handleNav(item.path)}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
}
