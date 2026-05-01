'use client';

import { ThemeProvider } from 'next-themes';
import { useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

import { AppProvider } from '@/context/AppContext';
import { AuthProvider } from '@/context/AuthContext';

function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                refetchOnWindowFocus: false,
                retry: (count, error: unknown) => {
                    const status =
                        error != null &&
                        typeof error === 'object' &&
                        'response' in error &&
                        error.response != null &&
                        typeof error.response === 'object' &&
                        'status' in error.response
                            ? (error.response as { status: number }).status
                            : undefined;
                    if (status === 401 || status === 403) return false;
                    return count < 2;
                },
            },
            mutations: {
                retry: false,
            },
        },
    });
}

export function Providers({ children }: { children: ReactNode }) {
    const [queryClient] = useState(() => makeQueryClient());

    return (
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <AppProvider>{children}</AppProvider>
                </AuthProvider>
                <Toaster
                    position="top-right"
                    richColors
                    closeButton
                    duration={4000}
                />
            </QueryClientProvider>
        </ThemeProvider>
    );
}
