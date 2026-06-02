export const INVOICE_WORKFLOW_STATUS_OPTIONS = [
    { value: "", labelKey: "filters.all" },
    { value: "brouillon", labelKey: "filters.statuses.brouillon" },
    { value: "enregistrer", labelKey: "filters.statuses.enregistrer" },
    { value: "valider", labelKey: "filters.statuses.valider" },
    { value: "normaliser", labelKey: "filters.statuses.normaliser" },
    { value: "soumise", labelKey: "filters.statuses.soumise" },
    { value: "receptionner", labelKey: "filters.statuses.receptionner" },
    { value: "payer", labelKey: "filters.statuses.payer" },
    { value: "classer", labelKey: "filters.statuses.classer" },
] as const;

export const PAYMENT_STATUS_OPTIONS = [
    { value: "", labelKey: "filters.all" },
    { value: "paid", labelKey: "filters.paymentStatuses.paid" },
    { value: "partial", labelKey: "filters.paymentStatuses.partial" },
    { value: "unpaid", labelKey: "filters.paymentStatuses.unpaid" },
] as const;
