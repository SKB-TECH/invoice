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

export type InvoiceContractClient = {
    id: number;
    name: string;
    email: string;
    phone: string;
    nif: string;
    rccm: string;
    reference: string;
    category: number;
};

export type InvoiceContract = {
    id: number;
    status: number;
    account_id: number;
    client_id: number;

    client: InvoiceContractClient;

    title: string;
    reference: string;
    ikwook_id: number;

    starting: string;
    ending: string;

    auto_renew: number;
    renew_count: number;

    contract_id: number;
    parent_contract: InvoiceContract | null;

    total: number;
    monthly: number;
    currency: string;
    paid: number;
    payable: number;

    file: string;
    notice: string | null;
    description: string;

    type: number;
    type_info: unknown | null;

    billing_cycle: number;
    billing_cycle_info: unknown | null;

    next_invoice: string | null;

    items_template: unknown[];

    notes: string;
    external_id: string;

    created_at: string;
    updated_at: string;
};

export type GetInvoiceContractsResponse = {
    items: InvoiceContract[];
    meta: {
        account_id: number;
        page: number;
        perPage: number;
        total: number;
    };
};

export type InvoiceTypeItem = {
    account_id: number;
    id: number;
    code: string;
    title: string;
    description: string;
    mention: string;
    value: string;
    sort: number;
    is_default: boolean;
    family: string;
};

export type GetInvoiceTypesResponse = {
    items: InvoiceTypeItem[];
};

export type GetInvoiceContractsParams = {
    page?: number;
    perPage?: number;
    status?: number;
    client_id?: number;
    contract_id?: number;
    type?: number;
    billing_cycle?: number;
};

export type InvoiceCreateItemInput = {
    description: string;
    quantity: number;
    unit_price: number;
    tax_rate: number;
    discount_rate: number;
};

export type InvoicePaymentInfo = {
    method: string;
    bank_name?: string;
    account_number?: string;
    reference?: string;
    due_days?: number;
};

export type InvoiceNormalizationInfo = {
    mode: string;
};

export type InvoiceCreateRequest = {
    currency: "CDF" | "USD";
    client_id: number;
    payment_info: InvoicePaymentInfo;
    due_date?: string;
    items: InvoiceCreateItemInput[];

    contract_id?: number;
    type?: number;
    template_id?: number;

    normalization?: InvoiceNormalizationInfo;
    workflow_status?: string;
};

export type CreateInvoiceSubmission = {
    payload: InvoiceCreateRequest;
    pdfFile: File;
};

export type CreateInvoiceResponse = {
    status?: string;
    message?: string;
    data?: unknown;
};

export type InvoiceDetailLineItem = {
    description: string;
    quantity: number;
    unit_price: number;
    tax_rate: number;
    discount_rate: number;
    discount_amount: number;
    subtotal: number;
    tax_amount: number;
    line_total: number;
};

export type InvoiceDetailResponse = {
    account_id: number;
    id: number;
    number: string;
    status: number;

    client_id: number;
    client_info: Record<string, unknown>;
    payment_info: Record<string, unknown>;

    items: InvoiceDetailLineItem[];

    invoice_amount: number;
    tax_amount: number;
    total_amount: number;
    paid_amount: number;
    balance: number;

    currency: string;

    sender_info: Record<string, unknown>;
    receiver_info: Record<string, unknown>;

    due_date: string;
    comment: string;
    notes: string;

    created_at: string;
    updated_at: string;

    workflow_status?: string;
    invoice_ref?: string;
    contract_id?: number;
    template_id?: number;
    type?: number;
};

export type NormalizeInvoicePayload = {
    id: number | string;
    invoice_sub_category?: string;
};

export type NormalizeInvoiceResponse = {
    account_id: number;
    id: number;
    number: string;
    status: number;

    client_id: number;
    client_info: Record<string, unknown>;
    payment_info: Record<string, unknown>;

    items: {
        description: string;
        quantity: number;
        unit_price: number;
        tax_rate: number;
        discount_rate: number;
        discount_amount: number;
        subtotal: number;
        tax_amount: number;
        line_total: number;
    }[];

    invoice_amount: number;
    tax_amount: number;
    total_amount: number;
    paid_amount: number;
    balance: number;

    currency: string;

    sender_info: Record<string, unknown>;
    receiver_info: Record<string, unknown>;

    due_date: string;
    comment: string;
    notes: string;

    created_at: string;
    updated_at: string;

    workflow_status?: string;
    invoice_ref?: string;
    contract_id?: number;
    template_id?: number;
    type?: number;
};
