export type InvoicePdfTaxGroup = {
    rate: number;
    subtotal: number;
    taxAmount: number;
    total: number;
};

export type InvoicePdfLine = {
    id: string;
    designation: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    subtotal: number;
    taxAmount: number;
    total: number;
};

export type InvoicePdfData = {
    invoice: string;
    contractReference?: string;
    client: string;
    clientAddress: string;
    clientNif?: string;
    telephone: string;
    email?: string;
    currency: "CDF" | "USD";
    createdAt: string;
    dueDate: string;
    lines: InvoicePdfLine[];
    taxGroups: InvoicePdfTaxGroup[];
    subtotal: number;
    taxTotal: number;
    total: number;
};
