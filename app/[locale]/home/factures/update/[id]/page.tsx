"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { AlertTriangle, ChevronRight, House, Loader2 } from "lucide-react";

import { initialForm } from "@/components/invoices/create/constants";
import { InvoiceStepper } from "@/components/invoices/create/InvoiceStepper";
import { StepCatalog } from "@/components/invoices/create/StepCatalog";
import { StepClient } from "@/components/invoices/create/StepClient";
import { StepPreviewUpdate } from "@/components/invoices/create/StepPreviewUpdate";
import {
    hasErrors,
    validateStepCatalog,
    validateStepClient,
} from "@/components/invoices/create/validation";

import { useInvoiceById } from "@/core/hooks/invoices/useInvoices";

import type {
    InvoiceForm,
    InvoiceFormErrors,
    InvoiceItem,
    ItemKind,
    Step,
} from "@/components/invoices/create/types";
import type { InvoiceDetailResponse } from "@/core/types/invoice";

type EditInitialState = {
    form: InvoiceForm;
    items: InvoiceItem[];
};

function safeText(value: unknown, fallback = "") {
    if (typeof value === "string" && value.trim()) return value;
    if (typeof value === "number") return String(value);
    return fallback;
}

function resolveCurrency(value?: string | null): "CDF" | "USD" {
    return value === "USD" ? "USD" : "CDF";
}

function resolveTemplateId(value?: number | null): 1 | 2 | null {
    if (value === 1 || value === 2) return value;
    return null;
}

function mapInvoiceDetailToEditState(
    invoice: InvoiceDetailResponse
): EditInitialState {
    const clientInfo =
        (invoice.client_info ?? {}) as Record<string, unknown>;
    const receiverInfo =
        (invoice.receiver_info ?? {}) as Record<string, unknown>;
    const client = (invoice.client ?? {}) as Record<string, unknown>;
    const contract = (invoice.contract ?? {}) as Record<string, unknown>;

    const defaultItemKind: ItemKind = "Article";

    const form: InvoiceForm = {
        ...initialForm,

        clientId: Number(invoice.client_id ?? client.id ?? 0) || null,
        clientName:
            safeText(clientInfo.legal_name) ||
            safeText(clientInfo.name) ||
            safeText(receiverInfo.legal_name) ||
            safeText(receiverInfo.name) ||
            safeText(client.name),

        nif:
            safeText(clientInfo.nif) ||
            safeText(clientInfo.vat_num) ||
            safeText(client.nif),

        rccm:
            safeText(clientInfo.rccm) ||
            safeText(clientInfo.registration_id) ||
            safeText(client.rccm),

        idNat: safeText(clientInfo.idnat),
        address:
            safeText(clientInfo.address) ||
            safeText(receiverInfo.address),

        phone:
            safeText(clientInfo.phone) ||
            safeText(receiverInfo.phone) ||
            safeText(client.phone),

        email:
            safeText(clientInfo.email) ||
            safeText(receiverInfo.email) ||
            safeText(client.email),

        contractId: Number(invoice.contract_id ?? contract.id ?? 0) || null,
        contractReference: safeText(contract.reference),

        invoiceType: invoice.type ? String(invoice.type) : "",
        itemKind: defaultItemKind,

        currency: resolveCurrency(invoice.currency),
        dueDate: safeText(invoice.due_date),
        templateId: resolveTemplateId(invoice.template_id),
    };

    const items: InvoiceItem[] = (invoice.items ?? []).map((item, index) => ({
        id: index + 1,
        catalogId: index + 1,
        name: safeText(item.description, `Ligne ${index + 1}`),
        type: defaultItemKind,
        quantity: Number(item.quantity ?? 1),
        tax: Number(item.tax_rate ?? 0),
        priceHT: Number(item.unit_price ?? 0),

        /**
         * Ces champs existent déjà dans ton flow actuel.
         * La devise est utile dans StepCatalog.
         */
        currency: resolveCurrency(invoice.currency),
        priceTTC: Number(item.line_total ?? 0),
    }));

    return {
        form,
        items,
    };
}

function UpdateInvoiceEditor({
                                 invoiceId,
                                 invoiceData,
                             }: {
    invoiceId: string;
    invoiceData: InvoiceDetailResponse;
}) {
    const t = useTranslations("createInvoice");

    const initialState = useMemo(
        () => mapInvoiceDetailToEditState(invoiceData),
        [invoiceData]
    );

    const [currentStep, setCurrentStep] = useState<Step>(1);
    const [items, setItems] = useState<InvoiceItem[]>(initialState.items);
    const [form, setForm] = useState<InvoiceForm>(initialState.form);
    const [errors, setErrors] = useState<InvoiceFormErrors>({});

    const visibleItems = useMemo(() => {
        return items.filter((item) => item.type === form.itemKind);
    }, [items, form.itemKind]);

    const canGoBack = currentStep > 1;

    const nextStep = () => {
        if (currentStep === 1) {
            const stepErrors = validateStepClient(form);

            if (hasErrors(stepErrors)) {
                setErrors(stepErrors);
                return;
            }

            setErrors({});
            setCurrentStep(2);
            return;
        }

        if (currentStep === 2) {
            const stepErrors = validateStepCatalog(visibleItems);

            if (hasErrors(stepErrors)) {
                setErrors((prev) => ({
                    ...prev,
                    ...stepErrors,
                }));
                return;
            }

            setErrors({});
            setCurrentStep(3);
        }
    };

    const prevStep = () => {
        setErrors({});
        setCurrentStep((prev) => Math.max(prev - 1, 1) as Step);
    };

    return (
        <main className="w-full text-slate-700">
            <div className="mb-3 flex flex-wrap items-center gap-1 text-[13px] font-medium text-slate-400">
                <Link href="/home">
                    <House className="size-4" />
                </Link>

                <ChevronRight className="size-4" />

                <Link href="/home/factures" className="hover:text-slate-600">
                    {t("breadcrumb.createInvoice")}
                </Link>

                <ChevronRight className="size-4" />

                <span className="font-semibold text-slate-600">
                    Modifier la facture
                </span>
            </div>

            <h1 className="text-[40px] font-bold tracking-tight text-slate-700">
                Modifier la facture
            </h1>

            <InvoiceStepper
                currentStep={currentStep}
                itemKind={form.itemKind}
            />

            <div className="mt-4 min-h-[500px]">
                {currentStep === 1 && (
                    <StepClient
                        form={form}
                        errors={errors}
                        setForm={setForm}
                        setItems={setItems}
                        setErrors={setErrors}
                    />
                )}

                {currentStep === 2 && (
                    <StepCatalog
                        itemKind={form.itemKind}
                        items={visibleItems}
                        errors={errors}
                        setItems={setItems}
                        setErrors={setErrors}
                    />
                )}

                {currentStep === 3 && (
                    <StepPreviewUpdate
                        invoiceId={invoiceId}
                        form={form}
                        setForm={setForm}
                        items={visibleItems}
                        errors={errors}
                        setErrors={setErrors}
                        setCurrentStep={setCurrentStep}
                    />
                )}
            </div>

            {currentStep !== 3 && (
                <div className="mt-0 flex justify-end gap-5 bg-white px-3 py-3">
                    <button
                        type="button"
                        onClick={canGoBack ? prevStep : undefined}
                        className="h-12 w-52 rounded bg-slate-400 text-[14px] font-semibold text-white hover:bg-slate-500"
                    >
                        {canGoBack ? t("common.previous") : t("common.cancel")}
                    </button>

                    <button
                        type="button"
                        onClick={nextStep}
                        className="h-12 w-52 rounded bg-[#0879bd] text-[20px] font-semibold text-white hover:bg-[#076ca8]"
                    >
                        {t("common.next")}
                    </button>
                </div>
            )}
        </main>
    );
}

export default function UpdateInvoicePage() {
    const params = useParams<{ id: string }>();
    const invoiceId = params?.id;

    const {
        data: invoiceData,
        isLoading,
        isError,
    } = useInvoiceById(invoiceId);

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center gap-2 text-sm font-medium text-slate-500">
                <Loader2 className="size-5 animate-spin" />
                Chargement de la facture...
            </div>
        );
    }

    if (isError || !invoiceData) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center text-sm font-medium text-red-500">
                Impossible de charger la facture.
            </div>
        );
    }

    if (invoiceData.workflow_status !== "brouillon") {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="w-full max-w-xl border border-amber-200 bg-amber-50 p-6 text-center">
                    <AlertTriangle className="mx-auto size-8 text-amber-500" />

                    <h2 className="mt-4 text-lg font-bold text-slate-800">
                        Modification indisponible
                    </h2>

                    <p className="mt-2 text-sm font-medium text-slate-600">
                        Seules les factures ayant le statut brouillon peuvent
                        être modifiées.
                    </p>

                    <Link
                        href="/home/factures"
                        className="mt-5 inline-flex h-11 items-center justify-center rounded bg-[#0879bd] px-6 text-sm font-semibold text-white hover:bg-[#076ca8]"
                    >
                        Retour aux factures
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <UpdateInvoiceEditor
            key={invoiceData.id}
            invoiceId={String(invoiceData.id)}
            invoiceData={invoiceData}
        />
    );
}
