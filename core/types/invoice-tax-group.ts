export type InvoiceTaxGroup = {
    id: number;
    account_id?: number;
    code: string;
    title: string;
    description?: string;
    mention?: string;
    value?: string;
    sort?: number;
    is_default?: boolean;
    rate: number;
    requires_certificate?: boolean;
    requires_line_comment?: boolean;
    is_out_of_scope?: boolean;
};
