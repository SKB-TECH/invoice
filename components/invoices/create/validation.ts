import type {
    InvoiceForm,
    InvoiceFormErrors,
    InvoiceItem,
} from "./types";

export function validateStepClient(form: InvoiceForm): InvoiceFormErrors {
    const errors: InvoiceFormErrors = {};

    if (!form.clientId) {
        errors.clientId = "Veuillez sélectionner un client.";
    }

    if (!form.contractId) {
        errors.contractId = "Veuillez sélectionner un contrat.";
    }

    if (!form.invoiceType) {
        errors.invoiceType = "Veuillez sélectionner le type de facture.";
    }

    if (!form.itemKind) {
        errors.itemKind = "Veuillez sélectionner Article ou Service.";
    }

    if (!form.currency) {
        errors.currency = "Veuillez sélectionner une devise.";
    }

    if (!form.dueDate) {
        errors.dueDate = "Veuillez choisir la date d’échéance.";
    }

    return errors;
}

export function validateStepCatalog(items: InvoiceItem[]): InvoiceFormErrors {
    const errors: InvoiceFormErrors = {};

    if (items.length === 0) {
        errors.items = "Veuillez ajouter au moins un élément.";
        return errors;
    }

    const hasInvalidItem = items.some((item) => {
        if (item.type === "Article") {
            return item.quantity < 1 || item.priceHT < 0;
        }

        return (
            (item.men ?? 0) < 1 ||
            (item.days ?? 0) < 1 ||
            (item.dailyPrice ?? 0) < 1
        );
    });

    if (hasInvalidItem) {
        errors.items = "Veuillez vérifier les quantités et les montants.";
    }

    return errors;
}

export function validateTemplate(form: InvoiceForm): InvoiceFormErrors {
    const errors: InvoiceFormErrors = {};

    if (!form.templateId) {
        errors.templateId = "Veuillez choisir un template.";
    }

    return errors;
}

export function hasErrors(errors: InvoiceFormErrors) {
    return Object.keys(errors).length > 0;
}
