import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '../providers/theme-provider';
import { Toaster } from '@/components/ui/sonner';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    template: '%s | Ethereum Developer Toolkit',
    default: 'Ethereum Developer Toolkit',
  },
  description: 'Web-based utilities for Ethereum developers',
  keywords: ['ethereum', 'web3', 'blockchain', 'developer', 'tools', 'utilities'],
  openGraph: {
    title: 'Ethereum Developer Toolkit',
    description: 'Web-based utilities for Ethereum developers',
    url: 'https://eth-toolkit.vercel.app',
    siteName: 'Ethereum Developer Toolkit',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ethereum Developer Toolkit',
    description: 'Web-based utilities for Ethereum developers',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
