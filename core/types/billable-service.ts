export type BillableServiceReferentialInfo = {
    id?: number;
    referentiel?: string;
    title?: string;
    code?: string;
    value?: string;
    parent_id?: number;
};

export type BillableServiceTaxGroupInfo = {
    id: number;
    code?: string;
    title?: string;
    rate?: number;
    mention?: string;
};

export type BillableServiceItem = {
    id: number;
    account_id?: number;
    status?: number;
    name: string;
    description?: string;
    code: string;
    price_before?: number;
    price_after?: number;
    currency: string;
    tax_group?: number;
    tax_group_info?: BillableServiceTaxGroupInfo | null;
    tax_rate?: number;
    unit_price?: number;
    people_apply?: boolean;
    days_apply?: boolean;
    quantity_apply?: boolean;
    billing_type?: number;
    billing_type_info?: BillableServiceReferentialInfo | null;
    category_id?: number;
    category_info?: BillableServiceReferentialInfo | null;
    business_sector?: string;
    notes?: string;
    external_id?: string;
    created_at?: string;
    updated_at?: string;
};

export type BillableServicesListMeta = {
    page?: number;
    perPage?: number;
    total?: number;
};

export type BillableServicesListResult = {
    items: BillableServiceItem[];
    meta: BillableServicesListMeta;
};

export type CreateBillableServicePayload = {
    service_name: string;
    description: string;
    code: string;
    business_sector: string;
    unit_price: number;
    price_before: number;
    price_after: number;
    tax_rate: number;
    currency: string;
    tax_group: number;
    people_apply: boolean;
    quantity_apply: boolean;
    category_id: number;
    notes: string;
    billing_type?: number;
};

export type UpdateBillableServicePayload = {
    service_name: string;
    description: string;
    code: string;
    business_sector: string;
    unit_price: number;
    tax_rate: number;
    currency: string;
    tax_group: number;
};
