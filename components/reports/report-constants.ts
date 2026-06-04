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

export const PERIOD_FILTER_OPTIONS = [
    { value: "", labelKey: "filters.all" },
    { value: "day", labelKey: "filters.periodOptions.day" },
    { value: "month", labelKey: "filters.periodOptions.month" },
    { value: "quarter", labelKey: "filters.periodOptions.quarter" },
] as const;

export const VAT_PERIOD_OPTIONS = [
    { value: "", labelKey: "filters.all" },
    { value: "monthly", labelKey: "filters.vatPeriodOptions.monthly" },
    { value: "quarterly", labelKey: "filters.vatPeriodOptions.quarterly" },
] as const;

export const TOOL_ACTION_TYPE_OPTIONS = [
    { value: "", labelKey: "filters.all" },
    { value: "create", labelKey: "filters.actionTypes.create" },
    { value: "update", labelKey: "filters.actionTypes.update" },
    { value: "delete", labelKey: "filters.actionTypes.delete" },
    { value: "validate", labelKey: "filters.actionTypes.validate" },
] as const;
