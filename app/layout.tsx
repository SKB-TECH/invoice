import type { Metadata } from 'next';
import './globals.css';
import {Providers} from "@/core/config/providers/providers";;

export const metadata: Metadata = {
  title: 'invoice',
  description: 'iKwook invoice',
    icons:{
      icon:"/invoiceb.png"
    }
};

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="fr" suppressHydrationWarning>
      <body className="font-sans">
          <Providers>
              {children}
          </Providers>
      </body>
      </html>
  );
}
