"use client";

import { type RegisterFormDto, registerFormSchema } from "@gympal/shared";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { TextField, InputAdornment, IconButton, Button } from "@mui/material";
import { AxiosError } from "axios";
import { useTranslations } from "next-intl";
import { useState } from "react";

import {
  AuthCard,
  AuthFormLayout,
  AuthSubmitButton,
} from "@/features/auth/components";
import { useRegister } from "@/features/auth/mutations/useRegister";
import { Link } from "@/i18n/navigation";
import { useZodForm } from "@/shared/hooks/useZodForm";

export default function RegisterForm() {
  const t = useTranslations("auth.register");
  const { mutate, isPending, error } = useRegister();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useZodForm(registerFormSchema);

  const apiError = error
    ? error instanceof AxiosError && error.response?.status === 401
      ? t("errorInvalid")
      : t("errorGeneral")
    : null;

  const onSubmit = ({ confirmPassword, ...data }: RegisterFormDto) => {
    mutate(data);
  };

  return (
    <AuthCard>
      <AuthFormLayout onSubmit={handleSubmit(onSubmit)} error={apiError}>
        <TextField
          label={t("email")}
          type="email"
          required
          disabled={isPending}
          variant="outlined"
          error={!!errors.email}
          helperText={errors.email?.message}
          {...register("email")}
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
          type={showPassword ? "text" : "password"}
          required
          disabled={isPending}
          variant="outlined"
          error={!!errors.password}
          helperText={errors.password?.message}
          {...register("password")}
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
          label={t("confirmPassword")}
          type={showConfirmPassword ? "text" : "password"}
          required
          disabled={isPending}
          variant="outlined"
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword?.message}
          {...register("confirmPassword")}
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
        <TextField
          label={t("firstName")}
          type="text"
          required
          disabled={isPending}
          variant="outlined"
          error={!!errors.firstName}
          helperText={errors.firstName?.message}
          {...register("firstName")}
        />
        <TextField
          label={t("lastName")}
          type="text"
          required
          disabled={isPending}
          variant="outlined"
          error={!!errors.lastName}
          helperText={errors.lastName?.message}
          {...register("lastName")}
        />

        <AuthSubmitButton label={t("submit")} loading={isPending} />
        <Button
          component={Link}
          href="/login"
          color="primary"
          variant="text"
          size="small"
        >
          {t("backToLogin")}
        </Button>
      </AuthFormLayout>
    </AuthCard>
  );
}
