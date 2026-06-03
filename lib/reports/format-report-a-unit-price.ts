import type { ReportACurrency } from "@/core/types/reports";

export function formatReportAUnitPrice(
    amount: number,
    currency: ReportACurrency,
): string {
    return `${amount.toFixed(2)} ${currency}`;
}
