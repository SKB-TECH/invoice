"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { useCreateInvoice } from "@/core/hooks/invoices/useInvoices";

import { FieldError } from "./Fields";
import { TemplateAPreview } from "./TemplateAPreview";
import { TemplateBPreview } from "./TemplateBPreview";
import { TemplateSelector } from "./TemplateSelector";
import { validateTemplate, hasErrors } from "./validation";
import {
    getLineSubtotal,
    getLineTax,
    getTaxGroups,
} from "./utils";
import type {
    InvoiceForm,
    InvoiceFormErrors,
    InvoiceItem,
    SetInvoiceErrors,
    SetInvoiceForm,
    Step,
} from "./types";
import type { Dispatch, SetStateAction } from "react";

export function StepPreview({
                                form,
                                setForm,
                                items,
                                errors,
                                setErrors,
                                setCurrentStep,
                            }: {
    form: InvoiceForm;
    setForm: SetInvoiceForm;
    items: InvoiceItem[];
    errors: InvoiceFormErrors;
    setErrors: SetInvoiceErrors;
    setCurrentStep: Dispatch<SetStateAction<Step>>;
}) {
    const t = useTranslations("createInvoice");
    const router = useRouter();

    const createInvoice = useCreateInvoice({
        onSuccess: () => {
            router.push("/home/factures");
        },
    });

    const subtotal = items.reduce(
        (sum, item) => sum + getLineSubtotal(item),
        0
    );

    const tax = items.reduce((sum, item) => sum + getLineTax(item), 0);
    const total = subtotal + tax;
    const taxGroups = getTaxGroups(items);

    const isArticle = form.itemKind === "Article";

    const buildInvoicePayload = (
        mode: "submit" | "draft" | "normalize"
    ) => {
        return {
            number: `INV-${new Date().getFullYear()}-${Date.now()}`,
            currency: form.currency,
            client_id: form.clientId as number,
            contract_id: form.contractId as number,
            template_id: form.templateId as 1 | 2,
            payment_info: {},
            due_date: form.dueDate,
            comment:
                mode === "draft"
                    ? "Facture enregistrée en brouillon"
                    : undefined,
            normalization:
                mode === "normalize"
                    ? {
                        requested: true,
                        template_id: form.templateId,
                    }
                    : undefined,
            items: items.map((item) => ({
                service_id: item.catalogId,
                quantity:
                    item.type === "Article"
                        ? item.quantity
                        : (item.men ?? 1) * (item.days ?? 1),
                unit_price:
                    item.type === "Article"
                        ? item.priceHT
                        : item.dailyPrice ?? 0,
                tax_rate: item.tax,
            })),
        };
    };

    const runAction = (mode: "submit" | "draft" | "normalize") => {
        const templateErrors = validateTemplate(form);

        if (hasErrors(templateErrors)) {
            setErrors((prev) => ({
                ...prev,
                ...templateErrors,
            }));
            return;
        }

        createInvoice.mutate(buildInvoicePayload(mode));
    };

    return (
        <div className="bg-white p-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="text-[25px] font-semibold text-slate-700">
                        {t("steps.preview")}
                    </h2>

                    <p className="mt-1 text-sm font-medium text-slate-400">
                        Vérifiez les informations de la facture avant validation.
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="h-12 rounded border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                        {t("preview.editClient")}
                    </button>

                    <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="h-12 rounded border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                        {isArticle
                            ? t("preview.editArticles")
                            : t("preview.editServices")}
                    </button>
                </div>
            </div>

            <TemplateSelector
                selectedTemplate={form.templateId}
                error={errors.templateId}
                onSelect={(templateId) => {
                    setForm((prev) => ({
                        ...prev,
                        templateId,
                    }));

                    setErrors((prev) => ({
                        ...prev,
                        templateId: undefined,
                    }));
                }}
            />

            <FieldError message={errors.submit} />

            <section className="w-full">
                {form.templateId === 2 ? (
                    <TemplateBPreview
                        form={form}
                        items={items}
                        tax={tax}
                        total={total}
                        taxGroups={taxGroups}
                    />
                ) : (
                    <TemplateAPreview
                        form={form}
                        items={items}
                        subtotal={subtotal}
                        total={total}
                        taxGroups={taxGroups}
                    />
                )}

                <div className="mt-6 flex flex-wrap justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => runAction("submit")}
                        disabled={createInvoice.isPending}
                        className="h-12 w-52 rounded bg-[#0879bd] text-sm font-semibold text-white hover:bg-[#076ca8] disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                        {createInvoice.isPending ? (
                            <span className="inline-flex items-center gap-2">
                                <Loader2 className="size-4 animate-spin" />
                                Traitement...
                            </span>
                        ) : (
                            "Soumettre"
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => runAction("draft")}
                        disabled={createInvoice.isPending}
                        className="h-12 w-52 rounded bg-slate-700 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                        Enregistrer
                    </button>

                    <button
                        type="button"
                        onClick={() => runAction("normalize")}
                        disabled={createInvoice.isPending}
                        className="h-12 w-52 rounded bg-white text-sm font-semibold text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100"
                    >
                        Normaliser
                    </button>

                    <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="h-12 w-52 rounded bg-slate-400 text-sm font-semibold text-white hover:bg-slate-500"
                    >
                        Annuler
                    </button>
                </div>
            </section>
        </div>
    );
}
