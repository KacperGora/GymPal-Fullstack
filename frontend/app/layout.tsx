import type { Metadata } from "next";

import { Navbar } from "@/shared/components/navbar/Navbar";
import ThemeRegistry from "@/shared/theme/ThemeRegistry";

import "./globals.css";
import { Providers } from "./providers";
export const metadata: Metadata = {
  title: "GymPal",
  description: "Your fitness companion",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl">
      <body>
        <ThemeRegistry>
          <Providers>
            <Navbar />
            {children}
          </Providers>
        </ThemeRegistry>
      </body>
    </html>
  );
}
