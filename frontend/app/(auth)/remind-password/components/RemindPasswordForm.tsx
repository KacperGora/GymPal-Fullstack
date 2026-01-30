"use client";

import { Button, TextField } from "@mui/material";
import Link from "next/link";
import { useState } from "react";

import {
  AuthCard,
  AuthFormLayout,
  AuthSubmitButton,
} from "@/features/auth/components";

export default function RemindPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
        />
        <AuthSubmitButton label="Wyślij email" loading={loading} />
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
