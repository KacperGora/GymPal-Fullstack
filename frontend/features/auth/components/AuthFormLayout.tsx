"use client";

import { Box, Alert } from "@mui/material";

type Props = {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  error?: string | null;
};

export function AuthFormLayout({ children, onSubmit, error }: Props) {
  return (
    <Box
      component="form"
      onSubmit={onSubmit}
      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
    >
      {children}
      {error && <Alert severity="error">{error}</Alert>}
    </Box>
  );
}
