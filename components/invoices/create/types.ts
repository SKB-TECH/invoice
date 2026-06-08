import type { Dispatch, SetStateAction } from "react";
import {InvoiceDgiComments} from "@/core/types/invoice-comment";

export type Step = 1 | 2 | 3 | 4;
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
    code?: string;
    description?: string;
    type: ItemKind;
    tax: number;
    taxGroupId?: number;
    taxGroupCode?: string;
    taxGroupTitle?: string;
    taxGroupMention?: string;
    priceHT: number;
    priceTTC?: number;
    currency?: "CDF" | "USD";
};

export type InvoiceItem = {
    id: number;
    catalogId: number;
    code?: string;
    name: string;
    type: ItemKind;
    quantity: number;
    tax: number;
    taxGroupId?: number;
    taxGroupCode?: string;
    taxGroupTitle?: string;
    taxGroupMention?: string;
    priceHT: number;
    priceTTC?: number;
    currency?: "CDF" | "USD";
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
    invoiceType: string;
    itemKind: ItemKind;
    currency: "CDF" | "USD";
    dueDate: string;
    contractId: number | null;
    contractReference: string;
    templateId: InvoiceTemplateId | null;

    comments: InvoiceDgiComments;
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
    comments?: string;
    submit?: string;
};

export type SetInvoiceForm = Dispatch<SetStateAction<InvoiceForm>>;
export type SetInvoiceItems = Dispatch<SetStateAction<InvoiceItem[]>>;
export type SetInvoiceErrors = Dispatch<SetStateAction<InvoiceFormErrors>>;
