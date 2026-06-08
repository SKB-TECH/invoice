import type { OrdinaryReportKind } from "@/core/types/reports";
import { sanitizePdfText } from "@/lib/reports/report-locale-format";

export type OrdinaryReportTableVariant =
    | "invoice-edition"
    | "invoice-normalization"
    | "payments"
    | "vat-collection"
    | "tool-usage";

export type OrdinaryReportTableRow = Record<string, string>;

export type OrdinaryReportTableContent = {
    generatedAt: string;
    dateFrom: string;
    dateTo: string;
    companyName: string;
    logoUrl?: string;
    nif: string;
    isf: string;
    lineItems: OrdinaryReportTableRow[];
};

export type OrdinaryReportColumnAlign = "left" | "right";

export type OrdinaryReportColumnConfig = {
    key: string;
    align?: OrdinaryReportColumnAlign;
    pdfPaddingRight?: number;
    pdfPaddingLeft?: number;
    previewPaddingRight?: number;
    previewPaddingLeft?: number;
    previewFormat?: (
        value: string,
        row: OrdinaryReportTableRow,
    ) => string;
    pdfFormat?: (value: string, row: OrdinaryReportTableRow) => string;
};

export type OrdinaryReportPdfStyle = "default" | "compact";

export type OrdinaryReportPdfTypography = {
    headerFontSize: number;
    bodyFontSize: number;
};

export type OrdinaryReportTableConfig = {
    translationNamespace:
        | "reports.preview.invoiceEdition"
        | "reports.preview.invoiceNormalization"
        | "reports.preview.payments"
        | "reports.preview.vatCollection"
        | "reports.preview.toolUsage";
    tableGridClass: string;
    columnWidthsPt: Record<string, number>;
    columns: OrdinaryReportColumnConfig[];
    rowKey: (row: OrdinaryReportTableRow) => string;
    pdfOrientation?: "portrait" | "landscape";
    pdfStyle?: OrdinaryReportPdfStyle;
    pdfTypography?: OrdinaryReportPdfTypography;
};

export type OrdinaryReportTablePdfLabels = {
    reportCode: string;
    emitter: string;
    periodSection: string;
    company: string;
    nif: string;
    isf: string;
    generatedAt: string;
    dateFrom: string;
    dateTo: string;
    tableTitle: string;
    columns: Record<string, string>;
    empty: string;
    page: string;
};

const INVOICE_TABLE_COLUMNS: OrdinaryReportColumnConfig[] = [
    { key: "clientName" },
    { key: "invoiceAmount", align: "right" },
    { key: "taxAmount", align: "right" },
    { key: "paidAmount", align: "right" },
    { key: "totalAmount", align: "right" },
    { key: "currency" },
    { key: "invoiceType" },
    { key: "dueDate", align: "right" },
];

const INVOICE_TABLE_GRID_CLASS =
    "grid min-w-[1180px] grid-cols-[1.1fr_0.9fr_0.8fr_0.8fr_0.9fr_0.45fr_1fr_0.75fr]";

const INVOICE_TABLE_PT = {
    clientName: 72,
    invoiceAmount: 62,
    taxAmount: 56,
    paidAmount: 58,
    totalAmount: 62,
    currency: 38,
    invoiceType: 76,
    dueDate: 58,
} as const;

const invoiceRowKey = (row: OrdinaryReportTableRow) =>
    `${row.clientName}-${row.invoiceType}-${row.dueDate}`;

const withCurrencyPrefix =
    () => (value: string, row: OrdinaryReportTableRow) =>
        `${row.currency} ${value}`;

const withCurrencyPrefixPdf =
    () => (value: string, row: OrdinaryReportTableRow) =>
        sanitizePdfText(`${row.currency} ${value}`);

export function clampTwoLinesWithEllipsis(
    value: string,
    maxCharsPerLine = 22,
): string {
    const text = value.trim();
    if (!text) return value;
    if (text.length <= maxCharsPerLine * 2) return text;

    const slice = text.slice(0, maxCharsPerLine * 2 - 1);
    const cut = slice.lastIndexOf(" ");
    const safe = cut > maxCharsPerLine ? slice.slice(0, cut) : slice;
    const first = safe.slice(0, maxCharsPerLine).trim();
    const second = safe.slice(maxCharsPerLine).trim();
    return `${first}\n${second}…`;
}

export const ORDINARY_REPORT_TABLE_CONFIGS: Record<
    OrdinaryReportTableVariant,
    OrdinaryReportTableConfig
> = {
    "invoice-edition": {
        translationNamespace: "reports.preview.invoiceEdition",
        tableGridClass: INVOICE_TABLE_GRID_CLASS,
        columnWidthsPt: INVOICE_TABLE_PT,
        columns: INVOICE_TABLE_COLUMNS,
        rowKey: invoiceRowKey,
    },
    "invoice-normalization": {
        translationNamespace: "reports.preview.invoiceNormalization",
        tableGridClass: INVOICE_TABLE_GRID_CLASS,
        columnWidthsPt: INVOICE_TABLE_PT,
        columns: INVOICE_TABLE_COLUMNS,
        rowKey: invoiceRowKey,
    },
    payments: {
        translationNamespace: "reports.preview.payments",
        tableGridClass:
            "grid min-w-[760px] grid-cols-[1.2fr_1fr_0.9fr_0.9fr]",
        columnWidthsPt: {
            reference: 155,
            clientName: 129,
            amount: 116,
            date: 116,
        },
        columns: [
            { key: "reference" },
            { key: "clientName" },
            { key: "amount", align: "right" },
            { key: "date", align: "right" },
        ],
        rowKey: (row) => `${row.reference}-${row.date}`,
        pdfTypography: { headerFontSize: 7, bodyFontSize: 9 },
    },
    "vat-collection": {
        translationNamespace: "reports.preview.vatCollection",
        tableGridClass:
            "grid min-w-[1200px] grid-cols-[0.9fr_1fr_0.85fr_0.85fr_1fr_1.05fr_1fr_0.85fr] gap-x-3",
        columnWidthsPt: {
            date: 78,
            reference: 92,
            amount: 68,
            taxAmount: 64,
            totalAmount: 92,
            clientName: 96,
            invoiceType: 100,
            workflowStatus: 72,
        },
        columns: [
            { key: "date" },
            { key: "reference" },
            {
                key: "amount",
                align: "right",
                previewFormat: withCurrencyPrefix(),
                pdfFormat: withCurrencyPrefixPdf(),
            },
            {
                key: "taxAmount",
                align: "right",
                previewFormat: withCurrencyPrefix(),
                pdfFormat: withCurrencyPrefixPdf(),
            },
            {
                key: "totalAmount",
                align: "right",
                pdfPaddingRight: 8,
                previewPaddingRight: 12,
                previewFormat: withCurrencyPrefix(),
                pdfFormat: withCurrencyPrefixPdf(),
            },
            {
                key: "clientName",
                pdfPaddingLeft: 12,
                previewPaddingLeft: 16,
            },
            {
                key: "invoiceType",
                pdfFormat: (value) =>
                    sanitizePdfText(clampTwoLinesWithEllipsis(value)),
            },
            { key: "workflowStatus" },
        ],
        rowKey: (row) => `${row.reference}-${row.date}-${row.clientName}`,
        pdfOrientation: "landscape",
    },
    "tool-usage": {
        translationNamespace: "reports.preview.toolUsage",
        tableGridClass:
            "grid min-w-[980px] grid-cols-[1.4fr_0.9fr_1fr_1fr_1.2fr_1.2fr]",
        columnWidthsPt: {
            userName: 135,
            invoiceCount: 84,
            totalAmount: 96,
            totalTva: 92,
            firstInvoice: 118,
            lastInvoice: 118,
        },
        columns: [
            { key: "userName" },
            { key: "invoiceCount", align: "right" },
            { key: "totalAmount", align: "right" },
            { key: "totalTva", align: "right" },
            { key: "firstInvoice", align: "right" },
            { key: "lastInvoice", align: "right" },
        ],
        rowKey: (row) =>
            `${row.userName}-${row.firstInvoice}-${row.lastInvoice}`,
    },
};

export const ORDINARY_REPORT_KIND_TO_VARIANT: Record<
    OrdinaryReportKind,
    OrdinaryReportTableVariant
> = {
    "invoice-edition": "invoice-edition",
    "invoice-normalization": "invoice-normalization",
    "invoice-payments": "payments",
    "vat-collection": "vat-collection",
    "tool-usage": "tool-usage",
};

export function isOrdinaryReportTableVariant(
    variant: string,
): variant is OrdinaryReportTableVariant {
    return variant in ORDINARY_REPORT_TABLE_CONFIGS;
}

export function getOrdinaryReportTableConfig(
    variant: OrdinaryReportTableVariant,
): OrdinaryReportTableConfig {
    return ORDINARY_REPORT_TABLE_CONFIGS[variant];
}
