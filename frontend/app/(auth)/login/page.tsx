import { Typography } from "@mui/material";

import { PageWrapper } from "@/app/components/shared/page-wrapper/PageWrapper";

import LoginForm from "./components/LoginForm";

export default function LoginPage() {
  return (
    <PageWrapper>
      <Typography variant="h2">Logowanie</Typography>
      <LoginForm />
    </PageWrapper>
  );
}
