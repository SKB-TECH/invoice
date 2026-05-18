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
