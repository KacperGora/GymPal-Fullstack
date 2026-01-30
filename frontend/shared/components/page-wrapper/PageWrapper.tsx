import { Box, Container } from "@mui/material";

interface PageWrapperProps {
  children: React.ReactNode;
}

export const PageWrapper = ({ children }: PageWrapperProps) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        py: 8,
        px: 2,
        minHeight: "calc(100vh - 64px)",
      }}
    >
      <Container maxWidth="xs">{children}</Container>
    </Box>
  );
};
