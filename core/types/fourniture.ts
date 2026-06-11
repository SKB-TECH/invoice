export type FournitureImage = {
    path: string;
};

export type FournitureLinkedReferentialInfo = {
    id?: number;
    referentiel?: string;
    title?: string;
    code?: string;
    value?: string;
    parent_id?: number;
};

export type FournitureTaxGroupInfo = {
    id: number;
    code?: string;
    title?: string;
    rate?: number;
    mention?: string;
};

export type FournitureArticle = {
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
    tax_group_info?: FournitureTaxGroupInfo | null;
    special_price: number;
    category_id: number;
    category_info?: FournitureLinkedReferentialInfo | null;
    group_id: number;
    group_info?: FournitureLinkedReferentialInfo | null;
    unit_id: number;
    unit_info?: FournitureLinkedReferentialInfo | null;
    supplier_id: number;
    supplier?: unknown | null;
    barcode: string;
    stock_min: number;
    stock_current: number;
    images: FournitureImage[];
    external_id: string;
    notes: string;
    created_at: string;
    updated_at: string;
};

export type FournituresListMeta = {
    accountId: number;
    page: number;
    perPage: number;
    total: number;
};

export type FournituresListResponse = {
    items: FournitureArticle[];
    meta: FournituresListMeta;
};

/** Corps POST */
export type CreateFourniturePayload = {
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
    images: FournitureImage[];
    external_id: string;
    notes: string;
};

/** Corps PUT — même payload que POST */
export type UpdateFourniturePayload = CreateFourniturePayload;

export type ApiErrorBody = {
    status?: number;
    error?: string;
    message?: string;
};
