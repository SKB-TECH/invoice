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
    period_type?: string;
};

export type InvoicePaymentsReportFilters = {
    client_id?: number;
    contract_id?: number;
    period_start?: string;
    period_end?: string;
};

export type VatCollectionReportFilters = ReportPeriodFilter & {
    payment_status?: string;
    invoice_type_code?: string;
    client_id?: number;
    period_type?: string;
};

export type ToolUsageReportFilters = ReportPeriodFilter & {
    user_name?: string;
    action_type?: string;
    period_type?: string;
};

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

export type ReportAHistoryItem = {
    id: number;
    generatedAt: string;
    dateFrom: string;
    dateTo: string;
    isf: string;
    pointOfSale: string;
};

export type ReportAHistoryListResult = {
    items: ReportAHistoryItem[];
    meta: { total: number };
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

export type ReportACurrency = "USD" | "CDF";

export type ReportALineItem = {
    code: string;
    designation: string;
    unitPrice: number;
    currency: ReportACurrency;
    tax: string;
    qtySold: number;
    qtyReturned: number;
    fiscalStock: number;
};

export type ReportAPreviewContent = {
    generatedAt: string;
    dateFrom: string;
    dateTo: string;
    isf: string;
    companyName: string;
    logoUrl?: string;
    nif: string;
    lineItems: ReportALineItem[];
    totals: {
        qtySold: number;
        qtyReturned: number;
        fiscalStock: number;
    };
};

export type InvoicePaymentReportApiRow = {
    id: number;
    date: string;
    status: string;
    invoice_id: number;
    client_id: number;
    amount: number;
    currency: string;
    reference: string;
    channel_id: number;
    method_id: number;
    exchange_rate: number;
    base_currency: string;
    confirmed: boolean;
};

export type InvoicePaymentsReportLineItem = {
    reference: string;
    clientName: string;
    amount: string;
    date: string;
};

export type InvoicePaymentsPreviewContent = {
    generatedAt: string;
    dateFrom: string;
    dateTo: string;
    companyName: string;
    logoUrl?: string;
    nif: string;
    isf: string;
    lineItems: InvoicePaymentsReportLineItem[];
};

export type ReportPreviewDisplay =
    | {
          variant: "generic";
          reportTitle: string;
          reportKind: string;
          generatedAt: string;
      emitterName?: string;
      logoUrl?: string;
          filterRows: ReportFilterRow[];
      }
    | {
          variant: "a";
          content: ReportAPreviewContent;
      }
    | {
          variant: "payments";
          content: InvoicePaymentsPreviewContent;
      };

export type ReportBlobResult = {
    filename: string;
    display: ReportPreviewDisplay;
};
