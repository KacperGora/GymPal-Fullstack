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
import { useTranslations } from "next-intl";
import { useState } from "react";

import {
  AuthCard,
  AuthFormLayout,
  AuthSubmitButton,
} from "@/features/auth/components";
import { Link, useRouter } from "@/i18n/navigation";
export default function LoginForm() {
  const t = useTranslations("auth.login");
  const router = useRouter();
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
        router.push("/dashboard");
      } else {
        setError(t("errorInvalid"));
      }
    } catch {
      setError(t("errorGeneral"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard>
      <AuthFormLayout onSubmit={handleSubmit} error={error}>
        <TextField
          label={t("email")}
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
          label={t("password")}
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

        <AuthSubmitButton label={t("submit")} loading={loading} />

        <Stack direction="row" justifyContent="space-between">
          <Button component={Link} href="/register" variant="text">
            {t("register")}
          </Button>
          <Button
            component={Link}
            href="/remind-password"
            color="secondary"
            variant="text"
            size="small"
          >
            {t("forgotPassword")}
          </Button>
        </Stack>
      </AuthFormLayout>
    </AuthCard>
  );
}
