import type { Metadata, Viewport } from 'next';
import './globals.css';
import { PwaProvider } from '../components/pwa/PwaProvider';

export const metadata: Metadata = {
  title: 'CodeType | Developer Typing Benchmark',
  description:
    'Minimal, high-performance developer-centric typing platform with adaptive Keybr weak-key learning and low-latency audio synthesis.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'CodeType',
  },
};

export const viewport: Viewport = {
  themeColor: '#0e0f12',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="antialiased selection:bg-[var(--accent)] selection:text-[var(--bg)]" suppressHydrationWarning>
        <PwaProvider>{children}</PwaProvider>
      </body>
    </html>
  );
}


