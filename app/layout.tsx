import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CodeType | Developer Typing Benchmark',
  description: 'Minimal, high-performance developer-centric typing platform with adaptive Keybr weak-key learning and low-latency audio synthesis.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased selection:bg-[var(--accent)] selection:text-[var(--bg)]">
        {children}
      </body>
    </html>
  );
}

