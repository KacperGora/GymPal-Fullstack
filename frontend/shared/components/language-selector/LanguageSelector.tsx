import LanguageIcon from '@mui/icons-material/Language';
import { IconButton, ListItemText, Menu, MenuItem } from '@mui/material';
import { useLocale } from 'next-intl';
import { useState, type MouseEvent } from 'react';

import { usePathname, useRouter } from '@/i18n/navigation';

const localeLabels: Record<string, string> = {
  pl: 'Polski',
  en: 'English',
};

export function LanguageSelector() {
  const locale = useLocale();

  const router = useRouter();

  const pathname = usePathname();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleLocaleChange = (newLocale: string) => {
    setAnchorEl(null);
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <>
      <IconButton
        onClick={(e: MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget)}
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
    </>
  );
}
