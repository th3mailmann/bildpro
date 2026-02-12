import type { Metadata } from 'next';
import { DM_Sans, JetBrains_Mono } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import '@/styles/globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = {
  title: 'Free AIA G702/G703 Pay Application Generator | BildPro',
  description:
    'Generate professional AIA-style G702 and G703 payment applications in minutes. Free for up to 2 projects. No Excel headaches, no math errors, no rejected pay apps.',
  keywords: [
    'AIA G702',
    'AIA G703',
    'pay application',
    'construction billing',
    'schedule of values',
    'retainage',
    'subcontractor billing',
  ],
  openGraph: {
    title: 'BildPro - AIA G702/G703 Pay Application Generator',
    description:
      'Stop losing money on rejected pay apps. Generate professional AIA-style payment applications in minutes.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${jetbrainsMono.variable} font-sans`}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1B2A4A',
              color: '#fff',
            },
            success: {
              iconTheme: {
                primary: '#22c55e',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
