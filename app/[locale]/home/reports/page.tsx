"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";

import { useRouter } from "@/i18n/routing";
import { ReportsPageFallback } from "@/components/reports/reports-page-shell";

const MENU_REDIRECTS: Record<string, string> = {
    invoiceEdition: "/home/reports/ordinary",
    reportXDaily: "/home/reports/type-xz",
    reportA: "/home/reports/type-a",
};

function ReportsPageInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const menuQuery = searchParams.get("menu");

    useEffect(() => {
        const q = new URLSearchParams(searchParams.toString());
        q.delete("menu");

        const target =
            (menuQuery && MENU_REDIRECTS[menuQuery]) ?? "/home/reports/type-xz";
        const suffix = q.toString();

        router.replace(suffix ? `${target}?${suffix}` : target);
    }, [menuQuery, router, searchParams]);

    return <ReportsPageFallback />;
}

export default function ReportsPage() {
    return (
        <Suspense fallback={<ReportsPageFallback />}>
            <ReportsPageInner />
        </Suspense>
    );
}
