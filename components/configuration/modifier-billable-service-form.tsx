"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import Loader from "@/components/loader/Loader";
import {
    CreateFormFooter,
    FieldLabel,
    InputField,
    NativeSelectField,
    SelectField,
    TextareaField,
} from "@/components/invoices/create/Fields";
import { useUpdateBillableService } from "@/core/hooks/billable-services/useBillableServices";
import { useInvoiceTaxGroups } from "@/core/hooks/invoices/useInvoiceTaxGroups";
import type {
    BillableServiceItem,
    UpdateBillableServicePayload,
} from "@/core/types/billable-service";
import { getAxiosErrorMessage } from "@/core/utils/axiosErrorMessage";
import { useRouter } from "@/i18n/routing";
import {
    formatInvoiceTaxGroupSelectLabel,
    formatPriceAfterTaxDisplay,
    pickDefaultInvoiceTaxGroupId,
} from "@/lib/tax-groups/invoice-tax-group-label";

function parseDecimal(raw: string): number | null {
    const t = raw.trim().replace(/\s/g, "").replace(",", ".");
    if (t === "") return null;
    const n = Number(t);
    return Number.isFinite(n) ? n : null;
}

function formatDecimalInput(n: number): string {
    return new Intl.NumberFormat("fr-FR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 4,
    }).format(n);
}

type ServiceEditFormState = {
    service_name: string;
    description: string;
    code: string;
    business_sector: string;
    unit_price: string;
    currency: string;
    tax_group_id: string;
};

function serviceToFormState(service: BillableServiceItem): ServiceEditFormState {
    const unitPrice = service.unit_price ?? service.price_before;
    const taxGroupId =
        service.tax_group ?? service.tax_group_info?.id ?? undefined;

    return {
        service_name: service.name.trim(),
        description: (service.description ?? "").trim(),
        code: service.code.trim(),
        business_sector: (service.business_sector ?? "").trim(),
        unit_price:
            unitPrice !== undefined ? formatDecimalInput(unitPrice) : "",
        currency: service.currency.trim().toUpperCase() || "USD",
        tax_group_id: taxGroupId !== undefined ? String(taxGroupId) : "",
    };
}

type Props = {
    service: BillableServiceItem;
};

export function ModifierBillableServiceForm({ service }: Props) {
    const router = useRouter();
    const t = useTranslations("configuration.services");
    const tEdit = useTranslations("configuration.services.edit");

    const [form, setForm] = useState<ServiceEditFormState>(() =>
        serviceToFormState(service),
    );

    const {
        data: taxGroups = [],
        isPending: taxGroupsPending,
        isError: taxGroupsError,
        refetch: refetchTaxGroups,
    } = useInvoiceTaxGroups();

    const updateMutation = useUpdateBillableService(service.id, {
        onSuccess: () => {
            toast.success(tEdit("toastSaved"));
            router.push(
                `/home/services/${encodeURIComponent(String(service.id))}/visualiser`,
            );
        },
        onError: (err) =>
            toast.error(
                getAxiosErrorMessage(err, tEdit("toastSaveError")),
            ),
    });

    const selectedTaxGroupId =
        form.tax_group_id || pickDefaultInvoiceTaxGroupId(taxGroups);

    const selectedTaxGroup = useMemo(
        () =>
            taxGroups.find(
                (group) => String(group.id) === selectedTaxGroupId.trim(),
            ),
        [taxGroups, selectedTaxGroupId],
    );

    const unitPriceParsed = useMemo(
        () => parseDecimal(form.unit_price),
        [form.unit_price],
    );

    const priceAfterDisplay = useMemo(
        () =>
            formatPriceAfterTaxDisplay(
                unitPriceParsed,
                selectedTaxGroup?.rate,
            ),
        [unitPriceParsed, selectedTaxGroup],
    );

    const updateField = <K extends keyof ServiceEditFormState>(
        key: K,
        value: ServiceEditFormState[K],
    ) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = () => {
        if (
            updateMutation.isPending ||
            taxGroupsPending ||
            taxGroupsError
        ) {
            return;
        }

        const service_name = form.service_name.trim();
        const code = form.code.trim();
        const business_sector = form.business_sector.trim();
        const unit_price = unitPriceParsed;

        if (
            !service_name ||
            !code ||
            !business_sector ||
            unit_price === null ||
            !selectedTaxGroup
        ) {
            toast.error(t("invalidForm"));
            return;
        }

        const payload: UpdateBillableServicePayload = {
            service_name,
            description: form.description.trim() || service_name,
            code,
            business_sector,
            unit_price,
            tax_rate: selectedTaxGroup.rate,
            currency: form.currency.trim().toUpperCase() || "USD",
            tax_group: selectedTaxGroup.id,
        };

        updateMutation.mutate(payload);
    };

    const taxGroupsReady =
        !taxGroupsPending && !taxGroupsError && taxGroups.length > 0;

    const requiredStar = (
        <span className="text-red-500" aria-hidden>
            {" "}
            *
        </span>
    );

    return (
        <>
            {updateMutation.isPending ? (
                <Loader variant="overlay" text={tEdit("saving")} />
            ) : null}

            <div className="mt-4 bg-white p-8">
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
                            {t("fields.unitPrice")}
                            {requiredStar}
                        </FieldLabel>
                        <InputField
                            value={form.unit_price}
                            onChange={(v) => updateField("unit_price", v)}
                            placeholder={t("placeholders.unitPrice")}
                            inputMode="decimal"
                        />
                    </div>
                    <div>
                        <FieldLabel>{t("fields.priceInclTax")}</FieldLabel>
                        <InputField
                            readOnly
                            inputMode="decimal"
                            value={priceAfterDisplay}
                            placeholder={
                                selectedTaxGroup && unitPriceParsed !== null
                                    ? undefined
                                    : "—"
                            }
                        />
                    </div>

                    <div className="lg:col-span-2">
                        <FieldLabel>
                            {t("fields.taxGroup")}
                            {requiredStar}
                        </FieldLabel>
                        <NativeSelectField
                            required
                            value={selectedTaxGroupId}
                            disabled={
                                taxGroupsPending ||
                                taxGroupsError ||
                                taxGroups.length === 0
                            }
                            onChange={(v) => updateField("tax_group_id", v)}
                            aria-label={t("fields.taxGroup")}
                        >
                            <option value="">
                                {taxGroupsPending
                                    ? t("taxGroupsLoading")
                                    : t("taxGroupsPlaceholder")}
                            </option>
                            {!taxGroupsPending &&
                                taxGroups.map((group) => (
                                    <option
                                        key={group.id}
                                        value={String(group.id)}
                                    >
                                        {formatInvoiceTaxGroupSelectLabel(group)}
                                    </option>
                                ))}
                        </NativeSelectField>
                        {taxGroupsError ? (
                            <div className="mt-2 flex flex-wrap gap-2 text-sm font-medium text-red-500">
                                <span>{t("taxGroupsLoadError")}</span>
                                <button
                                    type="button"
                                    className="underline underline-offset-2 hover:text-red-600"
                                    onClick={() => void refetchTaxGroups()}
                                >
                                    {t("retryTaxGroups")}
                                </button>
                            </div>
                        ) : null}
                    </div>

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
                    cancelLabel={t("actions.cancelBack")}
                    submitLabel={
                        updateMutation.isPending
                            ? tEdit("saving")
                            : tEdit("saveChanges")
                    }
                    onCancel={() =>
                        router.push(
                            `/home/services/${encodeURIComponent(String(service.id))}/visualiser`,
                        )
                    }
                    onSubmit={handleSubmit}
                    submitDisabled={
                        updateMutation.isPending ||
                        !taxGroupsReady ||
                        !selectedTaxGroupId
                    }
                />
            </div>
        </>
    );
}
