import type { Metadata } from 'next';
import { Ubuntu } from 'next/font/google';
import './globals.css';
import {Providers} from "@/core/config/providers/providers";


const ubuntu = Ubuntu({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-ubuntu',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'iKwook invoice',
  description: 'iKwook invoice',
};

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="fr" suppressHydrationWarning className={ubuntu.variable}>
      <body className="antialiased font-sans">
      <Providers>
          {children}
      </Providers>
      </body>
      </html>
  );
}
