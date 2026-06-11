import type { ReportFilterRow, ReportPreviewDisplay } from "@/core/types/reports";
import { extractReportEmitter } from "@/lib/reports/extract-report-emitter";

const FILTER_LABELS: Record<string, { fallback: string; key: string }> = {
    date_from: { fallback: "Date de début", key: "dateFrom" },
    date_to: { fallback: "Date de fin", key: "dateTo" },
    period_start: { fallback: "Date de début", key: "dateFrom" },
    period_end: { fallback: "Date de fin", key: "dateTo" },
    report_date: { fallback: "Date du rapport", key: "reportDate" },
    client_id: { fallback: "Client (ID)", key: "clientId" },
    contract_id: { fallback: "Contrat (ID)", key: "contractId" },
    point_of_sale: { fallback: "Point de vente", key: "pointOfSale" },
    workflow_status: { fallback: "Statut de la facture", key: "invoiceStatus" },
    invoice_type_code: { fallback: "Type de facture", key: "invoiceType" },
    payment_status: { fallback: "Statut du paiement", key: "paymentStatus" },
    isf: { fallback: "ISF", key: "isf" },
    periode_date: { fallback: "Date de début", key: "dateFrom" },
};

export function buildFilterRows(
    filters: Record<string, unknown>,
): ReportFilterRow[] {
    return Object.entries(filters)
        .filter(
            ([, value]) =>
                value !== undefined && value !== null && value !== "",
        )
        .map(([key, value]) => {
            const label = FILTER_LABELS[key];

            return {
                label: label?.fallback ?? key,
                labelKey: label?.key,
                value: String(value),
            };
        });
}

export function formatReportGeneratedAt(date = new Date()): string {
    return new Intl.DateTimeFormat("fr-FR", {
        dateStyle: "long",
        timeStyle: "short",
    }).format(date);
}

export function buildReportPreviewDisplay(
    reportTitle: string,
    reportKind: string,
    filters: Record<string, unknown>,
    emitter?: {
        profile?: Record<string, unknown> | null;
        user?: Record<string, unknown> | null;
    },
): ReportPreviewDisplay {
    const emitterIdentity = extractReportEmitter(
        emitter?.profile,
        emitter?.user,
    );

    return {
        variant: "generic",
        reportTitle,
        reportKind,
        generatedAt: formatReportGeneratedAt(),
        emitterName: emitterIdentity.companyName,
        logoUrl: emitterIdentity.logoUrl,
        filterRows: buildFilterRows(filters),
    };
}
