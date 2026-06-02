export type ReportPeriodFilter = {
    date_from?: string;
    date_to?: string;
};

export type InvoiceEditionReportFilters = ReportPeriodFilter & {
    client_id?: number;
    contract_id?: number;
    point_of_sale?: string;
    workflow_status?: string;
};

export type InvoiceNormalizationReportFilters = ReportPeriodFilter & {
    point_of_sale?: string;
    invoice_type_code?: string;
};

export type InvoicePaymentsReportFilters = ReportPeriodFilter & {
    client_id?: number;
    payment_status?: string;
};

export type VatCollectionReportFilters = ReportPeriodFilter & {
    payment_status?: string;
    invoice_type_code?: string;
    client_id?: number;
};

export type ToolUsageReportFilters = ReportPeriodFilter;

export type ReportXDailyFilters = {
    report_date?: string;
    point_of_sale?: string;
    isf?: string;
};

export type ReportZFilters = ReportXDailyFilters;

export type ReportXPeriodicFilters = ReportPeriodFilter & {
    point_of_sale?: string;
    isf?: string;
};

export type ReportAFilters = ReportPeriodFilter & {
    point_of_sale?: string;
    isf?: string;
};

export type OrdinaryReportKind =
    | "invoice-edition"
    | "invoice-normalization"
    | "invoice-payments"
    | "vat-collection"
    | "tool-usage";

export type SpecialPdfReportKind =
    | "x-daily"
    | "z"
    | "x-periodic"
    | "a";

export type ReportFilterRow = {
    label: string;
    value: string;
};

export type ReportPreviewDisplay = {
    reportTitle: string;
    reportKind: string;
    generatedAt: string;
    filterRows: ReportFilterRow[];
    isSimulated: boolean;
};

export type ReportBlobResult = {
    blob: Blob;
    filename: string;
    display: ReportPreviewDisplay;
};
