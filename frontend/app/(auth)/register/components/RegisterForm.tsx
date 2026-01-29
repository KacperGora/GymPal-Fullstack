"use client";

import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { TextField, InputAdornment, IconButton, Button } from "@mui/material";
import Link from "next/link";
import { useState } from "react";

import { AuthCard, AuthFormLayout, AuthSubmitButton } from "@/app/components";

export default function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email")?.toString() || "";
    const password = formData.get("password")?.toString() || "";
    const confirmPassword = formData.get("confirmPassword")?.toString() || "";

    try {
      if (password !== confirmPassword) {
        setError("Hasła nie są zgodne");
      } else if (email === "admin@example.com" && password === "1234") {
        window.location.href = "/dashboard";
      } else {
        setError("Niepoprawne dane rejestracji");
      }
    } catch {
      setError("Wystąpił błąd podczas rejestracji");
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

        <TextField
          label="Potwierdź hasło"
          name="confirmPassword"
          type={showConfirmPassword ? "text" : "password"}
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
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                    size="small"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />

        <AuthSubmitButton label="Zarejestruj" loading={loading} />
        <Button
          component={Link}
          href="/login"
          color="primary"
          variant="text"
          size="small"
        >
          Wróć do logowania
        </Button>
      </AuthFormLayout>
    </AuthCard>
  );
}
