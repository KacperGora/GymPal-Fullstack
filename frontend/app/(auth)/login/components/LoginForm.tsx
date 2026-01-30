"use client";

import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import {
  Button,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
} from "@mui/material";
import Link from "next/link";
import { useState } from "react";

import {
  AuthCard,
  AuthFormLayout,
  AuthSubmitButton,
} from "@/features/auth/components";
export default function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email")?.toString() || "";
    const password = formData.get("password")?.toString() || "";

    try {
      if (email === "admin@example.com" && password === "1234") {
        window.location.href = "/dashboard";
      } else {
        setError("Niepoprawne dane logowania");
      }
    } catch {
      setError("Wystąpił błąd podczas logowania");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard>
      <AuthFormLayout onSubmit={handleSubmit} error={error}>
        <TextField
          label="Email"
          name="email"
          type="email"
          required
          disabled={loading}
          variant="outlined"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon sx={{ mr: 1 }} />
                </InputAdornment>
              ),
            },
          }}
        />
        <TextField
          label="Hasło"
          name="password"
          type={showPassword ? "text" : "password"}
          required
          disabled={loading}
          variant="outlined"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />

        <AuthSubmitButton label="Zaloguj" loading={loading} />

        <Stack direction="row" justifyContent="space-between">
          <Button component={Link} href="/register" variant="text">
            Rejestracja
          </Button>
          <Button
            component={Link}
            href="/remind-password"
            color="secondary"
            variant="text"
            size="small"
          >
            Nie pamiętasz hasła?
          </Button>
        </Stack>
      </AuthFormLayout>
    </AuthCard>
  );
}
