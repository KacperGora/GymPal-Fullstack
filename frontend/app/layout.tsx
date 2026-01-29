import type { Metadata } from 'next';
import ThemeRegistry from './ThemeRegistry';
import './globals.css';

export const metadata: Metadata = {
  title: 'GymPal',
  description: 'Your fitness companion',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='pl'>
      <body>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
