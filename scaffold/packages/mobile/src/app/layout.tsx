import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Scaffold Mobile',
  description: 'Scaffold mobile frontend',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
