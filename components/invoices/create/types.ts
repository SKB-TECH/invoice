import type { Dispatch, SetStateAction } from "react";

export type Step = 1 | 2 | 3;
export type ItemKind = "Article" | "Service";
export type InvoiceTemplateId = 1 | 2;

export type Client = {
    id: number;
    name: string;
    nif: string;
    rccm: string;
    idNat: string;
    address: string;
    phone: string;
    email: string;
};

export type CatalogItem = {
    id: number;
    name: string;
    type: ItemKind;
    tax: number;
    priceHT: number;
};

export type InvoiceItem = {
    id: number;
    catalogId: number;
    name: string;
    type: ItemKind;
    quantity: number;
    tax: number;
    priceHT: number;
    men?: number;
    days?: number;
    dailyPrice?: number;
};

export type InvoiceForm = {
    clientId: number | null;
    clientName: string;
    nif: string;
    rccm: string;
    idNat: string;
    address: string;
    phone: string;
    email: string;

    contractId: number | null;
    contractReference: string;

    invoiceType: string;
    itemKind: ItemKind;

    currency: "CDF" | "USD";
    dueDate: string;
    templateId: InvoiceTemplateId | null;
};

export type InvoiceFormErrors = {
    clientId?: string;
    contractId?: string;
    invoiceType?: string;
    itemKind?: string;
    currency?: string;
    dueDate?: string;
    items?: string;
    templateId?: string;
    submit?: string;
};

export type SetInvoiceForm = Dispatch<SetStateAction<InvoiceForm>>;
export type SetInvoiceItems = Dispatch<SetStateAction<InvoiceItem[]>>;
export type SetInvoiceErrors = Dispatch<SetStateAction<InvoiceFormErrors>>;
