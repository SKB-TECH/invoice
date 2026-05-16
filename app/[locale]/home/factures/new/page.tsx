"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import { initialForm, initialItems } from "@/components/invoices/create/constants";
import { InvoiceStepper } from "@/components/invoices/create/InvoiceStepper";
import { StepCatalog } from "@/components/invoices/create/StepCatalog";
import { StepClient } from "@/components/invoices/create/StepClient";
import { StepPreview } from "@/components/invoices/create/StepPreview";
import {
    hasErrors,
    validateStepCatalog,
    validateStepClient,
} from "@/components/invoices/create/validation";
import type {
    InvoiceFormErrors,
    InvoiceItem,
    Step,
} from "@/components/invoices/create/types";

export default function CreateInvoicePage() {
    const t = useTranslations("createInvoice");

    const [currentStep, setCurrentStep] = useState<Step>(1);
    const [items, setItems] = useState<InvoiceItem[]>(initialItems);
    const [form, setForm] = useState(initialForm);
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
            <div className="mb-3 text-[13px] font-medium text-slate-400">
                {t("breadcrumb.home")} /{" "}
                <span className="font-semibold text-slate-600">
                    {t("breadcrumb.createInvoice")}
                </span>
            </div>

            <h1 className="text-[40px] font-bold tracking-tight text-slate-700">
                {t("title")}
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
                    <StepPreview
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
