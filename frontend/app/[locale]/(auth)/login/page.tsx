import { Typography } from "@mui/material";
import { useTranslations } from "next-intl";

import { PageWrapper } from "@/shared/components/page-wrapper/PageWrapper";

import LoginForm from "./components/LoginForm";

export default function LoginPage() {
  const t = useTranslations("auth.login");

  return (
    <PageWrapper>
      <Typography variant="h2">{t("title")}</Typography>
      <LoginForm />
    </PageWrapper>
  );
}
