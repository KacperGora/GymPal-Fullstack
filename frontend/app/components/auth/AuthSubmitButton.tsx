"use client";

import { Button, CircularProgress } from "@mui/material";

type Props = {
  label: string;
  loading: boolean;
};

export function AuthSubmitButton({ label, loading }: Props) {
  return (
    <Button type="submit" variant="contained" fullWidth disabled={loading}>
      {loading ? <CircularProgress size={24} color="inherit" /> : label}
    </Button>
  );
}
