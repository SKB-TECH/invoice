"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/routing";

export type ReportsMenuId = "invoiceEdition" | "reportXDaily" | "reportA";

const MENU_ITEMS: Array<{
    id: ReportsMenuId;
    href: string;
}> = [
    { id: "invoiceEdition", href: "/home/reports/ordinary" },
    { id: "reportXDaily", href: "/home/reports/type-xz" },
    { id: "reportA", href: "/home/reports/type-a" },
];

function getActiveMenu(pathname: string): ReportsMenuId {
    if (pathname === "/home/reports/ordinary") return "invoiceEdition";
    if (pathname === "/home/reports/type-a") return "reportA";
    if (pathname === "/home/reports/type-xz") return "reportXDaily";
    return "reportXDaily";
}

type Props = {
    children: ReactNode;
    contentClassName?: string;
};

export function ReportsPageShell({ children, contentClassName }: Props) {
    const t = useTranslations("reports");
    const pathname = usePathname();
    const activeMenu = getActiveMenu(pathname);

    return (
        <main className="min-h-0 bg-white px-6 py-8 text-slate-800">
            <div className="mx-auto w-full">
                <h1 className="mb-2 px-2 text-[28px] font-bold text-slate-900">
                    {t("pageTitle")}
                </h1>
                <p className="mb-8 px-2 text-[14px] text-slate-500">
                    {t("pageIntro")}
                </p>

                <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
                    <aside className="w-full shrink-0 lg:sticky lg:top-20 lg:z-10 lg:w-64 lg:self-start lg:bg-white xl:w-72">
                        <nav className="space-y-1 border border-slate-100 lg:border-0">
                            {MENU_ITEMS.map((item) => {
                                const isActive = activeMenu === item.id;

                                return (
                                    <Link
                                        key={item.id}
                                        href={item.href}
                                        className={`block w-full px-2 py-3 text-left text-[15px] font-medium ${
                                            isActive
                                                ? "bg-[#0073C5] font-bold text-white"
                                                : "text-slate-500 hover:text-slate-800"
                                        }`}
                                    >
                                        {t(`menu.${item.id}`)}
                                    </Link>
                                );
                            })}
                        </nav>
                    </aside>

                    <section
                        className={
                            contentClassName ??
                            "min-h-0 w-full flex-1 space-y-5 overflow-visible lg:pb-10 lg:pr-2"
                        }
                    >
                        {children}
                    </section>
                </div>
            </div>
        </main>
    );
}

export function ReportsPageFallback() {
    const t = useTranslations("reports");

    return (
        <main className="min-h-0 bg-white px-6 py-8 text-slate-800">
            <div className="mx-auto w-full animate-pulse">
                <div className="mb-8 h-9 rounded bg-slate-100 px-2" />
                <div className="flex flex-col gap-8 lg:flex-row">
                    <aside className="h-96 w-full max-w-xs rounded border border-slate-100 bg-slate-50 lg:sticky lg:top-20" />
                    <div className="min-h-[20rem] flex-1 rounded border border-dashed border-slate-200 bg-white" />
                </div>
                <span className="sr-only">{t("pageTitle")}</span>
            </div>
        </main>
    );
}
