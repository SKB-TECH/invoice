"use client";

import { Suspense } from "react";

import { InvoiceEditionReportPanel } from "@/components/reports/invoice-edition-report-panel";
import {
    ReportsPageFallback,
    ReportsPageShell,
} from "@/components/reports/reports-page-shell";

function OrdinaryReportsPageInner() {
    return (
        <ReportsPageShell contentClassName="min-h-0 w-full min-w-0 flex-1 overflow-visible lg:pb-10">
            <InvoiceEditionReportPanel />
        </ReportsPageShell>
    );
}

export default function OrdinaryReportsPage() {
    return (
        <Suspense fallback={<ReportsPageFallback />}>
            <OrdinaryReportsPageInner />
        </Suspense>
    );
}
