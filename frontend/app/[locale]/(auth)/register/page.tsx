import { Typography } from "@mui/material";
import { useTranslations } from "next-intl";

import { PageWrapper } from "@/shared/components/page-wrapper/PageWrapper";

import RegisterForm from "./components/RegisterForm";

export default function RegisterPage() {
  const t = useTranslations("auth.register");

  return (
    <PageWrapper>
      <Typography variant="h2">{t("title")}</Typography>
      <RegisterForm />
    </PageWrapper>
  );
}
