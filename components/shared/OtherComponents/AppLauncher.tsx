"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
    CreditCard,
    FileText,
    Grid3X3,
    LayoutDashboard,
    Settings,
    Users,
} from "lucide-react";

type AppItem = {
    name: string;
    href: string;
    Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const APPS: readonly AppItem[] = [
    { name: "Tableau de bord", href: "#", Icon: LayoutDashboard },
    { name: "Factures", href: "#", Icon: FileText },
    { name: "Clients", href: "#", Icon: Users },
    { name: "Paiements", href: "#", Icon: CreditCard },
    { name: "Paramètres", href: "#", Icon: Settings },
];

export function AppLauncher({ className }: { className?: string }) {
    const [open, setOpen] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement | null>(null);
    const buttonRef = React.useRef<HTMLButtonElement | null>(null);

    React.useEffect(() => {
        if (!open) return;

        const onPointerDown = (e: PointerEvent) => {
            const target = e.target as Node | null;
            if (!target) return;
            if (containerRef.current?.contains(target)) return;
            setOpen(false);
        };

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };

        window.addEventListener("pointerdown", onPointerDown);
        window.addEventListener("keydown", onKeyDown);
        return () => {
            window.removeEventListener("pointerdown", onPointerDown);
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [open]);

    return (
        <div ref={containerRef} className={cn("relative inline-flex", className)}>
            <button
                ref={buttonRef}
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-haspopup="dialog"
                aria-expanded={open}
                className="inline-flex text-white/90 transition hover:text-white md:inline-flex"
            >
                <Grid3X3 className="h-5 w-5 cursor-pointer" />
                <span className="sr-only cursor-pointer">Ouvrir le lanceur d’applications</span>
            </button>

            <div
                role="dialog"
                aria-label="Applications"
                className={cn(
                    "absolute right-0 top-full mt-3 w-[240px] origin-top-right",
                    "rounded border border-slate-200 bg-white shadow-lg",
                    "transition duration-200 ease-out",
                    open
                        ? "pointer-events-auto scale-100 opacity-100"
                        : "pointer-events-none scale-95 opacity-0"
                )}
                style={{ zIndex: 9999 }}
            >
                <div className="p-3">
                    <div className="grid grid-cols-2 gap-1">
                        {APPS.map((app) => (
                            <Link
                                key={app.name}
                                href={app.href}
                                onClick={() => setOpen(false)}
                                className={cn(
                                    "group flex flex-col items-center gap-2 rounded-sm py-1 text-center",
                                    "transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0073C5]/40"
                                )}
                            >
                                <div
                                    className={cn(
                                        "flex h-11 w-11 items-center justify-center rounded-sm",
                                        "border border-slate-200 bg-white",
                                        "transition group-hover:border-[#0073C5]/30 group-hover:bg-[#0073C5]/5"
                                    )}
                                >
                                    <app.Icon className="h-5 w-5 text-slate-700 transition group-hover:text-[#0073C5]" />
                                </div>

                                <div className="max-w-full truncate text-xs font-semibold text-slate-700 group-hover:text-slate-900">
                                    {app.name}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

