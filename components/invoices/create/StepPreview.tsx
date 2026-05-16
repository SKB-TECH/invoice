"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

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
import { generateInvoicePdf } from "./pdf/generateInvoicePdf";

import type {
    InvoiceForm,
    InvoiceFormErrors,
    InvoiceItem,
    SetInvoiceErrors,
    SetInvoiceForm,
    Step,
} from "./types";
import type { InvoiceCreateRequest } from "@/core/types/invoice";
import type { Dispatch, SetStateAction } from "react";

type ActionMode = "submit" | "save" | "draft" | "normalize";

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

    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    const createInvoice = useCreateInvoice({
        onSuccess: (_data, variables) => {
            const workflowStatus = variables.payload.workflow_status;

            if (workflowStatus === "brouillon") {
                toast.success("Facture enregistrée en brouillon.");
            } else {
                toast.success("Facture enregistrée avec succès.");
            }

            router.push("/home/factures");
        },

        onError: () => {
            toast.error("La création de la facture a échoué.");

            setErrors((prev) => ({
                ...prev,
                submit: "La création de la facture a échoué.",
            }));
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
    const isProcessing = createInvoice.isPending || isGeneratingPdf;

    const buildInvoicePayload = (
        mode: ActionMode
    ): InvoiceCreateRequest => {
        const payload: InvoiceCreateRequest = {
            currency: form.currency,
            client_id: form.clientId as number,

            payment_info: {
                method: "bank_transfer",
                bank_name: "Rawbank",
                account_number: "1234567890",
            },

            due_date: form.dueDate,

            items: items.map((item) => ({
                description: item.name,
                quantity:
                    item.type === "Article"
                        ? item.quantity
                        : (item.men ?? 1) * (item.days ?? 1),
                unit_price:
                    item.type === "Article"
                        ? item.priceHT
                        : item.dailyPrice ?? 0,
                tax_rate: item.tax,
                discount_rate: 0,
            })),

            contract_id: form.contractId ?? undefined,
            type: form.invoiceType ? Number(form.invoiceType) : undefined,
            template_id: form.templateId ?? undefined,
            workflow_status:
                mode === "draft" ? "brouillon" : "enregistrer",
        };

        if (mode === "normalize") {
            payload.normalization = {
                mode: "mcf",
            };
        }

        return payload;
    };

    const runAction = async (mode: ActionMode) => {
        const templateErrors = validateTemplate(form);

        if (hasErrors(templateErrors)) {
            setErrors((prev) => ({
                ...prev,
                ...templateErrors,
            }));

            toast.error("Veuillez choisir un modèle PDF.");
            return;
        }

        const loadingToastId = toast.loading(
            "Génération du PDF et enregistrement de la facture..."
        );

        try {
            setErrors((prev) => ({
                ...prev,
                submit: undefined,
            }));

            setIsGeneratingPdf(true);

            const pdfFile = await generateInvoicePdf({
                form,
                items,
                subtotal,
                tax,
                total,
                taxGroups,
            });

            const payload = buildInvoicePayload(mode);

            toast.dismiss(loadingToastId);

            createInvoice.mutate({
                payload,
                pdfFile,
            });
        } catch (error) {
            console.error("Erreur génération PDF :", error);

            toast.dismiss(loadingToastId);
            toast.error("Impossible de générer le PDF de la facture.");

            setErrors((prev) => ({
                ...prev,
                submit: "Impossible de générer le PDF de la facture.",
            }));
        } finally {
            setIsGeneratingPdf(false);
        }
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
                        disabled={isProcessing}
                        className="h-12 rounded border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {t("preview.editClient")}
                    </button>

                    <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        disabled={isProcessing}
                        className="h-12 rounded border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
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
                        disabled={isProcessing}
                        className="h-12 w-52 rounded bg-[#0879bd] text-sm font-semibold text-white hover:bg-[#076ca8] disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                        {isProcessing ? (
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
                        onClick={() => runAction("save")}
                        disabled={isProcessing}
                        className="h-12 w-52 rounded bg-slate-700 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                        Enregistrer
                    </button>

                    <button
                        type="button"
                        onClick={() => runAction("draft")}
                        disabled={isProcessing}
                        className="h-12 w-52 rounded bg-amber-500 text-sm font-semibold text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                        Brouillon
                    </button>

                    {/*<button*/}
                    {/*    type="button"*/}
                    {/*    onClick={() => runAction("normalize")}*/}
                    {/*    disabled={isProcessing}*/}
                    {/*    className="h-12 w-52 rounded bg-white text-sm font-semibold text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100"*/}
                    {/*>*/}
                    {/*    Normaliser*/}
                    {/*</button>*/}

                    <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        disabled={isProcessing}
                        className="h-12 w-52 rounded bg-red-600 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        Annuler
                    </button>
                </div>
            </section>
        </div>
    );
}
