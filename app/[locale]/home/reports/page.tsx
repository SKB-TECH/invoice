"use client";

import React, { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { useRouter, usePathname } from "@/i18n/routing";
import { SpecialAReportPanel } from "@/components/reports/special-a-report-panel";
import { SpecialXzReportPanel } from "@/components/reports/special-xz-report-panel";
import { InvoiceEditionReportPanel } from "@/components/reports/invoice-edition-report-panel";

type ReportsMenuId =
    | "invoiceEdition"
    | "reportXDaily"
    | "reportA";

const MENU_IDS: ReportsMenuId[] = [
    "invoiceEdition",
    "reportXDaily",
    "reportA",
];

function isReportsMenuId(v: string | null): v is ReportsMenuId {
    return v !== null && (MENU_IDS as readonly string[]).includes(v);
}

function ReportsShell() {
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

function ReportsPageInner() {
    const t = useTranslations("reports");
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const menuQuery = searchParams.get("menu");

    const activeMenu = useMemo((): ReportsMenuId => {
        return isReportsMenuId(menuQuery) ? menuQuery : "invoiceEdition";
    }, [menuQuery]);

    const selectMenu = (id: ReportsMenuId) => {
        const q = new URLSearchParams(searchParams.toString());
        if (id === "invoiceEdition") q.delete("menu");
        else q.set("menu", id);
        q.delete("generate");
        const suffix = q.toString();
        router.replace(suffix ? `${pathname}?${suffix}` : pathname);
    };

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
                            {MENU_IDS.map((id) => {
                                const isActive = activeMenu === id;

                                return (
                                    <button
                                        key={id}
                                        type="button"
                                        onClick={() => selectMenu(id)}
                                        className={`block w-full cursor-pointer px-2 py-3 text-left text-[15px] font-medium ${
                                            isActive
                                                ? "bg-[#0073C5] font-bold text-white"
                                                : "text-slate-500 hover:text-slate-800"
                                        }`}
                                    >
                                        {t(`menu.${id}`)}
                                    </button>
                                );
                            })}
                        </nav>
                    </aside>

                    <section className="min-h-0 w-full flex-1 space-y-5 overflow-y-auto lg:max-h-[calc(100dvh-8.5rem)] lg:overflow-y-auto lg:pb-10 lg:pr-2">
                        {activeMenu === "invoiceEdition" && (
                            <InvoiceEditionReportPanel />
                        )}
                        {activeMenu === "reportXDaily" && <SpecialXzReportPanel />}
                        {activeMenu === "reportA" && <SpecialAReportPanel />}
                    </section>
                </div>
            </div>
        </main>
    );
}

export default function ReportsPage() {
    return (
        <Suspense fallback={<ReportsShell />}>
            <ReportsPageInner />
        </Suspense>
    );
}
