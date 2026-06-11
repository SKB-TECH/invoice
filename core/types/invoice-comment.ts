export type InvoiceComment = {
    id: number;
    invoice_id: number;
    user_id: number;
    reply_to_id: number | null;
    comment: string;
    created_at: string;
};

export type CreateInvoiceCommentPayload = {
    comment: string;
    reply_to_id?: number | null;
};

export type InvoiceCommentCode = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H";

export type InvoiceDgiComments = Record<InvoiceCommentCode, string>;
