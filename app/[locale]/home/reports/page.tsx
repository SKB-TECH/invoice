"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";

import { useRouter } from "@/i18n/routing";
import { SpecialAReportPanel } from "@/components/reports/special-a-report-panel";
import { SpecialXzReportPanel } from "@/components/reports/special-xz-report-panel";
import {
    ReportsPageFallback,
    ReportsPageShell,
    type ReportsMenuId,
} from "@/components/reports/reports-page-shell";

function isSpecialReportsMenuId(
    v: string | null,
): v is Exclude<ReportsMenuId, "invoiceEdition"> {
    return v === "reportXDaily" || v === "reportA";
}

function ReportsPageInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const menuQuery = searchParams.get("menu");

    useEffect(() => {
        if (menuQuery !== "invoiceEdition") return;

        const q = new URLSearchParams(searchParams.toString());
        q.delete("menu");
        q.delete("generate");
        const suffix = q.toString();
        router.replace(
            suffix ? `/home/reports/ordinary?${suffix}` : "/home/reports/ordinary",
        );
    }, [menuQuery, router, searchParams]);

    const activeMenu = useMemo((): Exclude<ReportsMenuId, "invoiceEdition"> => {
        return isSpecialReportsMenuId(menuQuery) ? menuQuery : "reportXDaily";
    }, [menuQuery]);

    if (menuQuery === "invoiceEdition") {
        return <ReportsPageFallback />;
    }

    return (
        <ReportsPageShell>
            {activeMenu === "reportXDaily" && <SpecialXzReportPanel />}
            {activeMenu === "reportA" && <SpecialAReportPanel />}
        </ReportsPageShell>
    );
}

export default function ReportsPage() {
    return (
        <Suspense fallback={<ReportsPageFallback />}>
            <ReportsPageInner />
        </Suspense>
    );
}
