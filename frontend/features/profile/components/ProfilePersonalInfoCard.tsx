import type { AuthResponseUser } from "@gympal/shared";
import { Box, Card, CardContent, Divider, Typography } from "@mui/material";
import { useTranslations } from "next-intl";

interface ProfilePersonalInfoCardProps {
  user?: AuthResponseUser | null;
}

export const ProfilePersonalInfoCard = ({
  user,
}: ProfilePersonalInfoCardProps) => {
  const t = useTranslations("profile");

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {t("personalInfo")}
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              {t("firstName")}
            </Typography>
            <Typography variant="body1">{user?.firstName || "-"}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              {t("lastName")}
            </Typography>
            <Typography variant="body1">{user?.lastName || "-"}</Typography>
          </Box>
          <Box sx={{ gridColumn: "1 / -1" }}>
            <Typography variant="body2" color="text.secondary">
              {t("email")}
            </Typography>
            <Typography variant="body1">{user?.email || "-"}</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
