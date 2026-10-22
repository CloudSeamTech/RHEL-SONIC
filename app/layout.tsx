import type { Metadata } from 'next';
import { JetBrains_Mono } from 'next/font/google';
import './globals.css';
import './sonic.css';

const geistMono = JetBrains_Mono({
  variable: '--font-ibm-plex-mono',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  style: ['normal'],
});

export const metadata: Metadata = {
  title: 'SONIC-Academy | Enterprise IT Learning Console',
  icons: { icon: '/favicon.svg' },
  description:
    'Practical Windows Server, Active Directory, SQL Server, Azure, migration, and Linux learning pathways.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

import './sonic-design-system.css';

import './terminal-typography.css';

import './full-workspace.css';
