import { Typography } from "@mui/material";

import { PageWrapper } from "@/app/components/shared/page-wrapper/PageWrapper";

import RemindPasswordForm from "./components/RemindPasswordForm";

export default function RemindPassword() {
  return (
    <PageWrapper>
      <Typography variant="h2">Przypomnij hasło</Typography>
      <RemindPasswordForm />
    </PageWrapper>
  );
}
