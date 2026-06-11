"use client";

import { Suspense } from "react";

import { SpecialXzReportPanel } from "@/components/reports/special-xz-report-panel";
import {
    ReportsPageFallback,
    ReportsPageShell,
} from "@/components/reports/reports-page-shell";

function TypeXzReportsPageInner() {
    return (
        <ReportsPageShell contentClassName="min-h-0 w-full min-w-0 flex-1 overflow-visible lg:pb-10">
            <SpecialXzReportPanel />
        </ReportsPageShell>
    );
}

export default function TypeXzReportsPage() {
    return (
        <Suspense fallback={<ReportsPageFallback />}>
            <TypeXzReportsPageInner />
        </Suspense>
    );
}
