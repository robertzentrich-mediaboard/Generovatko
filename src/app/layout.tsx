import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mediaboard – Generátor nabídek',
  description: 'Aplikace pro tvorbu cenových nabídek obchodního týmu Mediaboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs">
      <body>{children}</body>
    </html>
  );
}
