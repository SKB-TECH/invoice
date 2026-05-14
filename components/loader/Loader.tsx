// components/shared/Loader.tsx
'use client';

import React from 'react';
import Image from 'next/image';

interface LoaderProps {
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'page' | 'inline' | 'overlay';
    text?: string;
    className?: string;
}

export default function Loader({
                                   size = 'md',
                                   variant = 'default',
                                   text = 'Chargement...',
                                   className = '',
                               }: LoaderProps) {
    // Tailles
    const sizes = {
        sm: 'h-8 w-8',
        md: 'h-12 w-12',
        lg: 'h-16 w-16',
    };

    // Variantes
    if (variant === 'page') {
        return <PageLoader text={text} />;
    }

    if (variant === 'overlay') {
        return <OverlayLoader text={text} />;
    }

    if (variant === 'inline') {
        return <InlineLoader className={className} />;
    }

    // Loader par défaut
    return (
        <div
            className={`flex flex-col items-center justify-center gap-3 ${className}`}
        >
            <div className={`${sizes[size]} relative`}>
                {/* Logo animé */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <BankLogoLoader />
                </div>
                {/* Cercle tournant */}
                <svg className="animate-spin h-full w-full" viewBox="0 0 50 50">
                    <circle
                        className="stroke-current text-[#045089]/20"
                        cx="25"
                        cy="25"
                        r="20"
                        fill="none"
                        strokeWidth="3"
                    />
                    <circle
                        className="stroke-current text-[#045089]"
                        cx="25"
                        cy="25"
                        r="20"
                        fill="none"
                        strokeWidth="3"
                        strokeDasharray="90, 150"
                        strokeDashoffset="0"
                        strokeLinecap="round"
                    />
                </svg>
            </div>
            {text && (
                <p className="text-sm font-medium text-gray-500 animate-pulse">
                    {text}
                </p>
            )}
        </div>
    );
}

// ============================================
// Variantes de Loaders
// ============================================

// Loader pleine page
function PageLoader({
                        text = 'Chargement du Core Banking System...',
                    }: {
    text?: string;
}) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#045089] via-[#0369a1] to-[#0284c7] flex items-center justify-center">
            <div className="text-center">
                {/* Logo */}
                <div className="mb-8">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl animate-pulse">
                        <Image
                            src="/images/invoiceb.png"
                            alt="invoice"
                            width={180}
                            height={180}
                            priority
                            className="object-contain"
                        />
                    </div>
                </div>

                {/* Cercles animés */}
                <div className="flex items-center justify-center gap-2 mb-6">
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            className="w-3 h-3 rounded-full bg-white animate-bounce"
                            style={{
                                animationDelay: `${i * 0.15}s`,
                                opacity: 1 - i * 0.3,
                            }}
                        />
                    ))}
                </div>

                {/* Texte */}
                <div>
                    <p className="text-white/70 text-sm animate-pulse">{text}</p>
                </div>

                {/* Barre de progression */}
                <div className="mt-8 w-64 h-1 bg-white/20 rounded-full overflow-hidden mx-auto">
                    <div className="h-full bg-white rounded-full animate-loading-bar" />
                </div>
            </div>

            <style jsx>{`
        @keyframes loading-bar {
          0% {
            width: 0%;
          }
          50% {
            width: 70%;
          }
          100% {
            width: 100%;
          }
        }
        .animate-loading-bar {
          animation: loading-bar 2s ease-in-out infinite;
        }
      `}</style>
        </div>
    );
}

// Loader overlay (par-dessus le contenu)
function OverlayLoader({ text = 'Chargement...' }: { text?: string }) {
    return (
        <div className="fixed inset-0 z-[9998] bg-white/80 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-overlay rounded-2xl shadow-xl border border-gray-200 p-8 flex flex-col items-center gap-4">
                <div className="relative h-14 w-14">
                    <div className="absolute inset-0 rounded-full border-4 border-gray-100" />
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#045089] animate-spin" />
                    <div className="absolute inset-2 rounded-full bg-[#045089]/10 flex items-center justify-center">
                        <Image
                            src="/invoiceb.png"
                            alt="invoice"
                            width={180}
                            height={180}
                            priority
                            className="object-contain"
                        />
                    </div>
                </div>
                <p className="text-sm font-medium text-gray-700">{text}</p>
            </div>
        </div>
    );
}

// Petit loader inline
function InlineLoader({ className = '' }: { className?: string }) {
    return (
        <span className={`inline-flex items-center gap-1 ${className}`}>
      <span className="w-1.5 h-1.5 bg-[#045089] rounded-full animate-pulse" />
      <span
          className="w-1.5 h-1.5 bg-[#045089] rounded-full animate-pulse"
          style={{ animationDelay: '0.2s' }}
      />
      <span
          className="w-1.5 h-1.5 bg-[#045089] rounded-full animate-pulse"
          style={{ animationDelay: '0.4s' }}
      />
    </span>
    );
}

// Logo banque miniature pour le loader
function BankLogoLoader() {
    return (
        <svg
            className="w-6 h-6 text-[#045089]"
            viewBox="0 0 24 24"
            fill="currentColor"
        >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" opacity="0.7" />
            <path d="M2 12l10 5 10-5" opacity="0.4" />
        </svg>
    );
}
