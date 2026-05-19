"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import {
    CreateFormFooter,
    FieldLabel,
    InputField,
    NativeSelectField,
    SelectField,
    TextareaField,
} from "@/components/invoices/create/Fields";
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
            notes: "",
        };

        createMutation.mutate(payload);
    };

    const catalogReady =
        !referentialsPending && !referentialsError && referentialRows.length > 0;

    const requiredStar = (
        <span className="text-red-500" aria-hidden>
            {" "}
            *
        </span>
    );

    return (
        <>
            <div className="bg-white p-8">
                <div className="grid grid-cols-1 gap-x-14 gap-y-4 lg:grid-cols-2">
                    <div>
                        <FieldLabel>
                            {t("fields.serviceName")}
                            {requiredStar}
                        </FieldLabel>
                        <InputField
                            value={form.service_name}
                            onChange={(v) => updateField("service_name", v)}
                            placeholder={t("placeholders.serviceName")}
                        />
                    </div>
                    <div>
                        <FieldLabel>
                            {t("fields.code")}
                            {requiredStar}
                        </FieldLabel>
                        <InputField
                            value={form.code}
                            onChange={(v) => updateField("code", v)}
                            placeholder={t("placeholders.code")}
                        />
                    </div>

                    <div>
                        <FieldLabel>
                            {t("fields.businessSector")}
                            {requiredStar}
                        </FieldLabel>
                        <InputField
                            value={form.business_sector}
                            onChange={(v) =>
                                updateField("business_sector", v)
                            }
                            placeholder={t("placeholders.businessSector")}
                        />
                    </div>
                    <div>
                        <FieldLabel>
                            {t("fields.unitPrice")}
                            {requiredStar}
                        </FieldLabel>
                        <InputField
                            value={form.unit_price}
                            onChange={(v) => updateField("unit_price", v)}
                            placeholder={t("placeholders.unitPrice")}
                        />
                    </div>

                    <div>
                        <FieldLabel>
                            {t("fields.taxRate")}
                            {requiredStar}
                        </FieldLabel>
                        <InputField
                            value={form.tax_rate}
                            onChange={(v) => updateField("tax_rate", v)}
                            placeholder={t("placeholders.taxRate")}
                        />
                    </div>
                    <div>
                        <FieldLabel>
                            {t("fields.taxGroup")}
                            {requiredStar}
                        </FieldLabel>
                        <InputField
                            type="number"
                            value={form.tax_group}
                            onChange={(v) => updateField("tax_group", v)}
                        />
                    </div>

                    <div>
                        <FieldLabel>
                            {t("fields.currency")}
                            {requiredStar}
                        </FieldLabel>
                        <SelectField
                            value={form.currency}
                            onChange={(v) => updateField("currency", v)}
                            options={[
                                { label: "USD", value: "USD" },
                                { label: "CDF", value: "CDF" },
                                { label: "EUR", value: "EUR" },
                            ]}
                        />
                    </div>

                    <div>
                        <FieldLabel>
                            {t("fields.billingType")}
                            {requiredStar}
                        </FieldLabel>
                        <InputField
                            value={form.billing_type}
                            onChange={(v) => updateField("billing_type", v)}
                            placeholder={t("placeholders.billingType")}
                        />
                    </div>

                    <div className="lg:col-span-2">
                        <FieldLabel>
                            {t("fields.categoryId")}
                            {requiredStar}
                        </FieldLabel>
                        <NativeSelectField
                            required
                            value={form.category_id}
                            disabled={
                                referentialsPending ||
                                referentialsError ||
                                referentialRows.length === 0
                            }
                            onChange={(v) => updateField("category_id", v)}
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
                        </NativeSelectField>
                        {referentialsError ? (
                            <div className="mt-2 flex flex-wrap gap-2 text-sm font-medium text-red-500">
                                <span>{t("referentialsLoadError")}</span>
                                <button
                                    type="button"
                                    className="underline underline-offset-2 hover:text-red-600"
                                    onClick={() => void refetchReferentials()}
                                >
                                    {t("retryReferentials")}
                                </button>
                            </div>
                        ) : null}
                    </div>

                    <label className="flex cursor-pointer items-center gap-3 text-[17px] font-medium text-slate-700">
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
                    <label className="flex cursor-pointer items-center gap-3 text-[17px] font-medium text-slate-700">
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

                    <div className="lg:col-span-2">
                        <FieldLabel>{t("fields.description")}</FieldLabel>
                        <TextareaField
                            value={form.description}
                            onChange={(v) => updateField("description", v)}
                            placeholder={t("placeholders.description")}
                        />
                    </div>
                </div>

                <CreateFormFooter
                    cancelLabel={cancelLabel}
                    submitLabel={
                        createMutation.isPending
                            ? t("actions.submitting")
                            : t("actions.submit")
                    }
                    onCancel={onCancel}
                    onSubmit={handleSubmit}
                    submitDisabled={createMutation.isPending || !catalogReady}
                />
            </div>
        </>
    );
}
