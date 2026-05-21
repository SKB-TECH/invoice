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
    tax_rate?: number;
    unit_price?: number;
    people_apply?: boolean;
    days_apply?: boolean;
    quantity_apply?: boolean;
    billing_type?: number;
    category_id?: number;
    business_sector?: string;
    notes?: string;
    external_id?: string;
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
