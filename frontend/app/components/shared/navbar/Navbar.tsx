"use client";

import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";

export const Navbar = () => {
  const theme = useTheme();

  return (
    <AppBar
      position="static"
      color="transparent"
      sx={{ backgroundColor: theme.palette.background.paper }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h6">GymPal</Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button color="primary">Home</Button>
          <Button color="primary">Workouts</Button>
          <Button color="primary">Profile</Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
