import { Box, Container } from '@mui/material';

interface PageWrapperProps {
  children: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
}

export const PageWrapper = ({
  children,
  maxWidth = 'xs',
}: PageWrapperProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 2,
        minHeight: 'calc(100vh - 64px)',
      }}
    >
      <Container maxWidth={maxWidth}>{children}</Container>
    </Box>
  );
};
