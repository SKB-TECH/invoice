import type { ReportFilterRow, ReportPreviewDisplay } from "@/core/types/reports";
import { extractReportEmitter } from "@/lib/reports/extract-report-emitter";

const FILTER_LABELS: Record<string, string> = {
    date_from: "Date de début",
    date_to: "Date de fin",
    report_date: "Date du rapport",
    client_id: "Client (ID)",
    contract_id: "Contrat (ID)",
    point_of_sale: "Point de vente",
    workflow_status: "Statut de la facture",
    invoice_type_code: "Type de facture",
    payment_status: "Statut du paiement",
    isf: "ISF",
};

export function buildFilterRows(
    filters: Record<string, unknown>,
): ReportFilterRow[] {
    return Object.entries(filters)
        .filter(
            ([, value]) =>
                value !== undefined && value !== null && value !== "",
        )
        .map(([key, value]) => ({
            label: FILTER_LABELS[key] ?? key,
            value: String(value),
        }));
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
