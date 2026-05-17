"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { SectionCard } from "@/components/configuration/section-card";
import { FormActions } from "@/components/configuration/form-actions";
import { InputField } from "@/components/configuration/input-field";
import { useCreateBillableService } from "@/core/hooks/billable-services/useBillableServices";
import { useReferentielsCatalog } from "@/core/hooks/referentiels/useReferentielsCatalog";
import { getAxiosErrorMessage } from "@/core/utils/axiosErrorMessage";
import type { CreateBillableServicePayload } from "@/core/types/billable-service";
import { formatReferentielOptionLabel } from "@/lib/referentials/referential-option-label";

function parseDecimal(raw: string): number | null {
    const t = raw.trim().replace(/\s/g, "").replace(",", ".");
    if (t === "") return null;
    const n = Number(t);
    return Number.isFinite(n) ? n : null;
}

type ServiceFormState = {
    service_name: string;
    description: string;
    code: string;
    business_sector: string;
    unit_price: string;
    tax_rate: string;
    currency: string;
    tax_group: string;
    billing_type: string;
    category_id: string;
    notes: string;
    people_apply: boolean;
    quantity_apply: boolean;
};

const INITIAL_FORM: ServiceFormState = {
    service_name: "",
    description: "",
    code: "",
    business_sector: "",
    unit_price: "",
    tax_rate: "16",
    currency: "USD",
    tax_group: "2",
    billing_type: "1",
    category_id: "",
    notes: "",
    people_apply: true,
    quantity_apply: true,
};

type Props = {
    cancelLabel: string;
    onCancel: () => void;
    onCreated?: () => void;
};

export function CreateBillableServiceForm({
    cancelLabel,
    onCancel,
    onCreated,
}: Props) {
    const t = useTranslations("configuration.services");
    const [form, setForm] = useState<ServiceFormState>(INITIAL_FORM);

    const {
        items: referentialRows,
        isPending: referentialsPending,
        isError: referentialsError,
        refetch: refetchReferentials,
    } = useReferentielsCatalog(null);

    const createMutation = useCreateBillableService({
        onSuccess: () => {
            toast.success(t("toastCreated"));
            setForm(INITIAL_FORM);
            onCreated?.();
        },
        onError: (err) =>
            toast.error(
                getAxiosErrorMessage(err, t("toastCreateErrorFallback")),
            ),
    });

    const updateField = <K extends keyof ServiceFormState>(
        key: K,
        value: ServiceFormState[K],
    ) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = () => {
        if (createMutation.isPending || referentialsPending || referentialsError)
            return;

        const service_name = form.service_name.trim();
        const code = form.code.trim();
        const business_sector = form.business_sector.trim();

        const unit_price = parseDecimal(form.unit_price);
        const tax_rate = parseDecimal(form.tax_rate);

        const tax_group = Number.parseInt(form.tax_group.trim(), 10);
        const billing_type = Number.parseInt(form.billing_type.trim(), 10);
        const category_id = Number.parseInt(form.category_id.trim(), 10);

        if (
            !service_name ||
            !code ||
            !business_sector ||
            unit_price === null ||
            tax_rate === null
        ) {
            toast.error(t("invalidForm"));
            return;
        }
        if (
            !Number.isFinite(tax_group) ||
            tax_group < 1 ||
            !Number.isFinite(billing_type) ||
            billing_type < 0 ||
            !Number.isFinite(category_id) ||
            category_id < 1
        ) {
            toast.error(t("invalidForm"));
            return;
        }

        const payload: CreateBillableServicePayload = {
            service_name,
            description: form.description.trim() || service_name,
            code,
            business_sector,
            unit_price,
            tax_rate,
            currency: form.currency.trim().toUpperCase() || "USD",
            tax_group,
            people_apply: form.people_apply,
            quantity_apply: form.quantity_apply,
            billing_type,
            category_id,
            notes: form.notes.trim(),
        };

        createMutation.mutate(payload);
    };

    const catalogReady =
        !referentialsPending && !referentialsError && referentialRows.length > 0;

    return (
        <SectionCard title={t("createSectionTitle")}>
            <div className="grid gap-5 md:grid-cols-2">
                <InputField
                    label={`${t("fields.serviceName")} *`}
                    value={form.service_name}
                    onChange={(v) =>
                        updateField("service_name", v)
                    }
                    placeholder={t("placeholders.serviceName")}
                />
                <InputField
                    label={`${t("fields.code")} *`}
                    value={form.code}
                    onChange={(v) => updateField("code", v)}
                    placeholder={t("placeholders.code")}
                />

                <div className="md:col-span-2">
                    <label className="mb-1 block text-[13px] font-medium">
                        {t("fields.description")}
                    </label>
                    <textarea
                        value={form.description}
                        rows={3}
                        onChange={(e) =>
                            updateField(
                                "description",
                                e.target.value,
                            )
                        }
                        placeholder={t("placeholders.description")}
                        className="min-h-[5rem] w-full border border-slate-200 px-3 py-2 text-[13px] outline-none focus:border-[#1f6a9a]"
                    />
                </div>

                <InputField
                    label={`${t("fields.businessSector")} *`}
                    value={form.business_sector}
                    onChange={(v) =>
                        updateField("business_sector", v)
                    }
                    placeholder={t("placeholders.businessSector")}
                />
                <InputField
                    label={`${t("fields.unitPrice")} *`}
                    value={form.unit_price}
                    onChange={(v) =>
                        updateField("unit_price", v)
                    }
                    type="text"
                    placeholder={t("placeholders.unitPrice")}
                />

                <InputField
                    label={`${t("fields.taxRate")} *`}
                    value={form.tax_rate}
                    onChange={(v) =>
                        updateField("tax_rate", v)
                    }
                    type="text"
                    placeholder={t("placeholders.taxRate")}
                />
                <div>
                    <label className="mb-1 block text-[13px] font-medium">
                        {`${t("fields.taxGroup")} *`}
                    </label>
                    <input
                        type="number"
                        min={1}
                        value={form.tax_group}
                        onChange={(e) =>
                            updateField("tax_group", e.target.value)
                        }
                        className="h-11 w-full border border-slate-200 px-3 text-[13px] outline-none focus:border-[#1f6a9a]"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-[13px] font-medium">
                        {`${t("fields.currency")} *`}
                    </label>
                    <select
                        value={form.currency}
                        onChange={(e) =>
                            updateField("currency", e.target.value)
                        }
                        className="h-11 w-full border border-slate-200 bg-white px-3 text-[13px] outline-none focus:border-[#1f6a9a]"
                    >
                        <option value="USD">USD</option>
                        <option value="CDF">CDF</option>
                        <option value="EUR">EUR</option>
                    </select>
                </div>

                <InputField
                    label={`${t("fields.billingType")} *`}
                    value={form.billing_type}
                    onChange={(v) =>
                        updateField("billing_type", v)
                    }
                    type="text"
                    placeholder={t("placeholders.billingType")}
                />

                <div className="md:col-span-2">
                    <label className="mb-1 block text-[13px] font-medium">
                        {`${t("fields.categoryId")} *`}
                    </label>
                    <select
                        required
                        value={form.category_id}
                        disabled={
                            referentialsPending ||
                            referentialsError ||
                            referentialRows.length === 0
                        }
                        onChange={(e) =>
                            updateField("category_id", e.target.value)
                        }
                        className="h-11 w-full border border-slate-200 bg-white px-3 text-[13px] outline-none focus:border-[#1f6a9a] disabled:bg-slate-50"
                        aria-label={t("fields.categoryId")}
                    >
                        <option value="">
                            {referentialsPending
                                ? t("referentialsLoading")
                                : t("referentialsPlaceholder")}
                        </option>
                        {!referentialsPending &&
                            referentialRows.map((row) => (
                                <option
                                    key={row.id}
                                    value={String(row.id)}
                                    title={formatReferentielOptionLabel(
                                        row,
                                    )}
                                >
                                    {formatReferentielOptionLabel(row)}
                                </option>
                            ))}
                    </select>
                    {referentialsError ? (
                        <div className="mt-2 flex flex-wrap gap-2 text-[12px] text-red-600">
                            <span>{t("referentialsLoadError")}</span>
                            <button
                                type="button"
                                className="underline underline-offset-2 hover:text-red-700"
                                onClick={() =>
                                    void refetchReferentials()
                                }
                            >
                                {t("retryReferentials")}
                            </button>
                        </div>
                    ) : null}
                </div>

                <label className="flex cursor-pointer items-center gap-3 text-[13px] text-slate-700 md:col-span-1">
                    <input
                        type="checkbox"
                        checked={form.people_apply}
                        onChange={(e) =>
                            updateField("people_apply", e.target.checked)
                        }
                        className="size-4 rounded border border-slate-300"
                    />
                    {t("fields.peopleApply")}
                </label>
                <label className="flex cursor-pointer items-center gap-3 text-[13px] text-slate-700 md:col-span-1">
                    <input
                        type="checkbox"
                        checked={form.quantity_apply}
                        onChange={(e) =>
                            updateField(
                                "quantity_apply",
                                e.target.checked,
                            )
                        }
                        className="size-4 rounded border border-slate-300"
                    />
                    {t("fields.quantityApply")}
                </label>

                <div className="md:col-span-2">
                    <label className="mb-1 block text-[13px] font-medium">
                        {t("fields.notes")}
                    </label>
                    <textarea
                        value={form.notes}
                        rows={2}
                        onChange={(e) =>
                            updateField("notes", e.target.value)
                        }
                        placeholder={t("placeholders.notes")}
                        className="min-h-[3.5rem] w-full border border-slate-200 px-3 py-2 text-[13px] outline-none focus:border-[#1f6a9a]"
                    />
                </div>
            </div>

            <div className="mt-8">
                <FormActions
                    cancelLabel={cancelLabel}
                    submitLabel={
                        createMutation.isPending
                            ? t("actions.submitting")
                            : t("actions.submit")
                    }
                    submitDisabled={
                        createMutation.isPending || !catalogReady
                    }
                    onCancel={onCancel}
                    onSubmit={handleSubmit}
                />
            </div>
        </SectionCard>
    );
}
