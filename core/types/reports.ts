export type ReportPeriodFilter = {
    date_from?: string;
    date_to?: string;
};

export type InvoiceEditionReportFilters = {
    periode_date?: string;
    period_end?: string;
    client_id?: number;
    contrat_id?: number;
    invoice_type?: number;
};

export type InvoiceNormalizationReportFilters = {
    period_start?: string;
    period_end?: string;
    client_id?: number;
};

export type InvoicePaymentsReportFilters = {
    client_id?: number;
    contract_id?: number;
    period_start?: string;
    period_end?: string;
};

export type VatCollectionReportFilters = {
    period_start?: string;
    period_end?: string;
    client_id?: number;
};

export type ToolUsageReportFilters = {
    period_start?: string;
    period_end?: string;
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
    labelKey?: string;
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

export type InvoiceEditionReportApiRow = Record<string, unknown>;
export type InvoiceNormalizationReportApiRow = Record<string, unknown>;

export type InvoiceEditionReportLineItem = {
    clientName: string;
    invoiceType: string;
    invoiceAmount: string;
    taxAmount: string;
    paidAmount: string;
    totalAmount: string;
    currency: string;
    dueDate: string;
};

export type InvoiceEditionPreviewContent = {
    generatedAt: string;
    dateFrom: string;
    dateTo: string;
    companyName: string;
    logoUrl?: string;
    nif: string;
    isf: string;
    lineItems: InvoiceEditionReportLineItem[];
};

export type InvoiceNormalizationReportLineItem = {
    clientName: string;
    invoiceType: string;
    invoiceAmount: string;
    taxAmount: string;
    paidAmount: string;
    totalAmount: string;
    currency: string;
    dueDate: string;
};

export type InvoiceNormalizationPreviewContent = {
    generatedAt: string;
    dateFrom: string;
    dateTo: string;
    companyName: string;
    logoUrl?: string;
    nif: string;
    isf: string;
    lineItems: InvoiceNormalizationReportLineItem[];
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

export type VatCollectionReportLineItem = {
    date: string;
    reference: string;
    amount: string;
    taxAmount: string;
    currency: string;
    totalAmount: string;
    clientName: string;
    invoiceType: string;
    workflowStatus: string;
    paidAmount: string;
};

export type VatCollectionPreviewContent = {
    generatedAt: string;
    dateFrom: string;
    dateTo: string;
    companyName: string;
    logoUrl?: string;
    nif: string;
    isf: string;
    lineItems: VatCollectionReportLineItem[];
};

export type ToolUsageReportLineItem = {
    userName: string;
    invoiceCount: string;
    totalAmount: string;
    totalTva: string;
    firstInvoice: string;
    lastInvoice: string;
};

export type ToolUsagePreviewContent = {
    generatedAt: string;
    dateFrom: string;
    dateTo: string;
    companyName: string;
    logoUrl?: string;
    nif: string;
    isf: string;
    lineItems: ToolUsageReportLineItem[];
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
      }
    | {
          variant: "invoice-edition";
          content: InvoiceEditionPreviewContent;
      }
    | {
          variant: "invoice-normalization";
          content: InvoiceNormalizationPreviewContent;
      }
    | {
          variant: "vat-collection";
          content: VatCollectionPreviewContent;
      }
    | {
          variant: "tool-usage";
          content: ToolUsagePreviewContent;
      };

export type ReportBlobResult = {
    filename: string;
    display: ReportPreviewDisplay;
};
