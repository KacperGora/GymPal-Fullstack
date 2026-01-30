"use client";

import { Box, Button, Typography } from "@mui/material";
import Link from "next/link";

export default function NotFound() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "calc(100vh - 64px)",
        gap: 2,
      }}
    >
      <Typography variant="h1">404</Typography>
      <Typography variant="body1" color="text.secondary">
        Strona nie istnieje
      </Typography>
      <Button component={Link} href="/" variant="contained">
        Wróć na stronę główną
      </Button>
    </Box>
  );
}
