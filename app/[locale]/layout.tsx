import type { Metadata } from "next";
import "./globals.css";

import { NextIntlClientProvider } from "next-intl";
import { getMessages, getLocale } from "next-intl/server";
import { ThemeProvider } from "next-themes";

import { Providers } from "@/core/config/providers/providers";

export const metadata: Metadata = {
    title: "invoice",
    description: "iKwook invoice",
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
        <body className="min-h-screen font-sans antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
            <ThemeProvider
                attribute="class"
                defaultTheme="light"
                enableSystem={false}
                disableTransitionOnChange
            >
                <Providers>{children}</Providers>
            </ThemeProvider>
        </NextIntlClientProvider>
        </body>
        </html>
    );
}
