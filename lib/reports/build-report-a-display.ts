import type {
    ReportAFilters,
    ReportALineItem,
    ReportAPreviewContent,
    ReportPreviewDisplay,
} from "@/core/types/reports";
import { formatReportGeneratedAt } from "@/lib/reports/build-report-display";

const MOCK_LINE_ITEMS: ReportALineItem[] = [
    {
        code: "ART-15",
        designation: "Cartouche d'encre standard",
        unitPrice: 10,
        currency: "USD",
        tax: "16%",
        qtySold: 22,
        qtyReturned: 1,
        fiscalStock: 150,
    },
];

function formatReportDateLabel(value?: string): string {
    if (!value?.trim()) return "—";

    const parsed = new Date(`${value.trim()}T12:00:00`);
    if (Number.isNaN(parsed.getTime())) return value;

    return new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    }).format(parsed);
}

function sumField(items: ReportALineItem[], key: keyof ReportALineItem): number {
    return items.reduce((sum, item) => sum + Number(item[key]), 0);
}

export function buildReportAPreviewDisplay(
    filters: ReportAFilters,
): ReportPreviewDisplay {
    const lineItems = MOCK_LINE_ITEMS;

    const content: ReportAPreviewContent = {
        generatedAt: formatReportGeneratedAt(),
        dateFrom: formatReportDateLabel(filters.date_from),
        dateTo: formatReportDateLabel(filters.date_to),
        isf: filters.isf?.trim() || "IKW-SYS-998877",
        companyName: "iKwook S.A.",
        nif: "NIF-123456789-CD",
        lineItems,
        totals: {
            qtySold: sumField(lineItems, "qtySold"),
            qtyReturned: sumField(lineItems, "qtyReturned"),
            fiscalStock: sumField(lineItems, "fiscalStock"),
        },
    };

    return { variant: "a", content };
}
