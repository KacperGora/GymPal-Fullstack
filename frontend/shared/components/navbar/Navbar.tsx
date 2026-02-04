"use client";

import LanguageIcon from "@mui/icons-material/Language";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  ListItemText,
  Skeleton,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useLocale, useTranslations } from "next-intl";
import { useState, type MouseEvent } from "react";

import { usePathname, useRouter } from "@/i18n/navigation";
import { useAuth } from "@/shared/hooks/useAuth";

const localeLabels: Record<string, string> = {
  pl: "Polski",
  en: "English",
};

export const Navbar = () => {
  const theme = useTheme();
  const t = useTranslations("navbar");
  const { isAuthenticated, isLoading, logout } = useAuth();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleLocaleChange = (newLocale: string) => {
    setAnchorEl(null);
    router.replace(pathname, { locale: newLocale });
  };

  if (isLoading) return <Skeleton />;

  return (
    <AppBar
      position="static"
      color="transparent"
      sx={{ backgroundColor: theme.palette.background.paper }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h6">GymPal</Typography>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Button color="primary">{t("home")}</Button>
          <Button color="primary">{t("workouts")}</Button>
          <Button href="/profile" color="primary">
            {t("profile")}
          </Button>
          <Button
            href={isAuthenticated ? undefined : "/login"}
            disabled={isAuthenticated}
            onClick={
              isAuthenticated
                ? async () => {
                    await logout();
                    router.refresh();
                  }
                : undefined
            }
            variant={isAuthenticated ? "outlined" : "contained"}
          >
            {isAuthenticated ? t("logout") : t("login")}
          </Button>
          <IconButton
            onClick={(e: MouseEvent<HTMLElement>) =>
              setAnchorEl(e.currentTarget)
            }
          >
            <LanguageIcon color="disabled" />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            {Object.entries(localeLabels).map(([key, label]) => (
              <MenuItem
                key={key}
                selected={key === locale}
                onClick={() => handleLocaleChange(key)}
              >
                <ListItemText>{label}</ListItemText>
              </MenuItem>
            ))}
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
