export type FournitureImage = {
    path: string;
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

/** Corps POST — champs alignés sur la spec API. */
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

export type ApiErrorBody = {
    status?: number;
    error?: string;
    message?: string;
};
