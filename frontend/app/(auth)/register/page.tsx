import { Typography } from "@mui/material";

import { PageWrapper } from "@/app/components/shared/page-wrapper/PageWrapper";

import RegisterForm from "./components/RegisterForm";

export default function RegisterPage() {
  return (
    <PageWrapper>
      <Typography variant="h2">Register</Typography>
      <RegisterForm />
    </PageWrapper>
  );
}
