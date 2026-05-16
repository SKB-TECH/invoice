export type InvoiceStatus = "draft" | "issued" | "paid" | "cancelled";

export interface InvoiceIssuer {
    legal_name: string;
    nif: string;
    rccm: string;
    bank_info: string;
}

export interface InvoiceClient {
    id: number;
    client_name: string;
    legal_name: string;
    nif: string;
}

export interface InvoiceLineItem {
    service_id: number;
    service_name: string;
    quantity: number;
    unit_price: number;
    tax_rate: number;
    total: number;
    tax_amount: number;
    line_total: number;
}

export interface InvoiceItem {
    id: number;
    invoice_number: string;
    account_id: number;
    client_id: number;
    issuer: InvoiceIssuer;
    client: InvoiceClient;
    line_items: InvoiceLineItem[];
    subtotal: number;
    tax_total: number;
    total: number;
    currency: string;
    status: InvoiceStatus;
    invoice_date: string;
    due_date: string;
    created_at: string;
}

export interface InvoiceMeta {
    account_id: number;
    page: number;
    perPage: number;
    total: number;
}

export interface GetInvoicesResponse {
    items: InvoiceItem[];
    meta: InvoiceMeta;
}

export interface GetInvoicesParams {
    page?: number;
    perPage?: number;
    status?: InvoiceStatus;
}

/* ================================
   Création facture
================================ */

export type InvoiceLineItemInput = {
    service_id: number;
    quantity: number;
    unit_price: number;
    tax_rate: number;
};

export type InvoiceCreateRequest = {
    number: string;
    currency: string;
    client_id: number;
    payment_info: Record<string, unknown>;
    items: InvoiceLineItemInput[];

    paid_amount?: number;
    due_date?: string;
    normalization?: Record<string, unknown>;
    validation_info?: Record<string, unknown>;
    validator_id?: number;
    discount_info?: Record<string, unknown>;
    contract_id?: number;
    pdf_file?: string;
    comment?: string;
    type?: number;
    reminder_count?: number;
    last_reminder?: string;
    template_id?: number;
    external_id?: string;
    notes?: string;
};

export type CreateInvoiceResponse = {
    message?: string;
    data?: InvoiceItem;
    invoice?: InvoiceItem;
};

/* ================================
   Contrats disponibles pour facture
================================ */

export interface InvoiceContract {
    id: number;
    status: number;
    account_id: number;
    client_id: number;
    title: string;
    reference: string;
    ikwook_id: number;
    starting: string;
    ending: string;
    auto_renew: number;
    renew_count: number;
    contract_id: number;
    total: number;
    monthly: number;
    currency: string;
    paid: number;
    payable: number;
    file: string;
    notice: string;
    description: string;
    type: number;
    billing_cycle: number;
    next_invoice: string;
    items_template: Array<Record<string, unknown>>;
    notes: string;
    external_id: string;
    created_at: string;
    updated_at: string;
}

export interface GetInvoiceContractsParams {
    page?: number;
    perPage?: number;
}

export interface GetInvoiceContractsResponse {
    items: InvoiceContract[];
    meta: InvoiceMeta;
}

export type InvoiceFourniture = {
    id: number;
    account_id: number;
    status: number;
    name: string;
    description: string;
    code: string;
    price_before: number;
    price_after: number;
    currency: string;
    tax_group: number;
    special_price: number;
    category_id: number;
    group_id: number;
    unit_id: number;
    supplier_id: number;
    barcode: string;
    stock_min: number;
    stock_current: number;
    images: unknown[];
    external_id: string;
    notes: string;
    created_at: string;
    updated_at: string;
};

export type GetInvoiceFournituresParams = {
    page?: number;
    perPage?: number;
};

export type GetInvoiceFournituresResponse = {
    items: InvoiceFourniture[];
    meta: {
        accountId: number;
        page: number;
        perPage: number;
        total: number;
    };
};
