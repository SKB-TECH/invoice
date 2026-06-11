"use client";

import { Suspense } from "react";

import { SpecialAReportPanel } from "@/components/reports/special-a-report-panel";
import {
    ReportsPageFallback,
    ReportsPageShell,
} from "@/components/reports/reports-page-shell";

function TypeAReportsPageInner() {
    return (
        <ReportsPageShell contentClassName="min-h-0 w-full min-w-0 flex-1 overflow-visible lg:pb-10">
            <SpecialAReportPanel />
        </ReportsPageShell>
    );
}

export default function TypeAReportsPage() {
    return (
        <Suspense fallback={<ReportsPageFallback />}>
            <TypeAReportsPageInner />
        </Suspense>
    );
}
