import type {
    InvoicePaymentReportApiRow,
    InvoicePaymentsReportFilters,
} from "@/core/types/reports";

function paymentDateKey(value: string): string {
    const trimmed = value.trim();
    if (!trimmed) return "";

    const [datePart] = trimmed.split(/[ T]/);
    return datePart ?? trimmed;
}

export function filterInvoicePaymentsRows(
    rows: InvoicePaymentReportApiRow[],
    filters: InvoicePaymentsReportFilters,
): InvoicePaymentReportApiRow[] {
    const clientId = filters.client_id;
    const periodStart = filters.period_start?.trim();
    const periodEnd = filters.period_end?.trim();

    if (!clientId && !periodStart && !periodEnd) {
        return rows;
    }

    return rows.filter((row) => {
        if (clientId && row.client_id !== clientId) {
            return false;
        }

        const rowDate = paymentDateKey(row.date);

        if (periodStart && rowDate && rowDate < periodStart) {
            return false;
        }

        if (periodEnd && rowDate && rowDate > periodEnd) {
            return false;
        }

        return true;
    });
}
