import type { Metadata } from 'next';
import './globals.css';

import {NextIntlClientProvider} from 'next-intl';
import {getMessages, getLocale} from 'next-intl/server';

import {Providers} from '@/core/config/providers/providers';
import {ThemeProvider} from "next-themes";

export const metadata: Metadata = {
    title: 'invoice',
    description: 'iKwook invoice',
    icons: {
        icon: '/invoiceb.png',
    },
};

export default async function RootLayout({
                                             children,
                                         }: Readonly<{
    children: React.ReactNode;
}>) {
    const locale = await getLocale();
    const messages = await getMessages();

    return (
        <html lang={locale} suppressHydrationWarning>
        <body className="font-sans">
        <NextIntlClientProvider messages={messages}>
            <Providers>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="light"
                    enableSystem={false}
                >
                    {children}
                </ThemeProvider>
            </Providers>
        </NextIntlClientProvider>
        </body>
        </html>
    );
}
