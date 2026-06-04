"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";

import { InputField } from "@/components/configuration/input-field";
import { SelectBox } from "@/components/configuration/select-box";
import { ClientSearchSelect } from "@/components/invoices/create/ClientSearchSelect";
import {
    ContractSearchSelect,
    type ContractSearchOption,
} from "@/components/invoices/create/ContractSearchSelect";
import type { Client } from "@/components/invoices/create/types";
import { useClients } from "@/core/hooks/client/useClient";
import { useContracts } from "@/core/hooks/contrat/useContrat";
import { useInvoiceTypes } from "@/core/hooks/invoices/useInvoices";
import {
    INVOICE_WORKFLOW_STATUS_OPTIONS,
    PERIOD_FILTER_OPTIONS,
    PAYMENT_STATUS_OPTIONS,
    TOOL_ACTION_TYPE_OPTIONS,
    VAT_PERIOD_OPTIONS,
} from "@/components/reports/report-constants";

export function ReportPeriodFields({
    dateFrom,
    dateTo,
    onDateFromChange,
    onDateToChange,
}: {
    dateFrom: string;
    dateTo: string;
    onDateFromChange: (v: string) => void;
    onDateToChange: (v: string) => void;
}) {
    const t = useTranslations("reports");

    return (
        <div className="contents">
            <InputField
                label={t("filters.dateFrom")}
                type="date"
                value={dateFrom}
                onChange={onDateFromChange}
            />
            <InputField
                label={t("filters.dateTo")}
                type="date"
                value={dateTo}
                onChange={onDateToChange}
            />
        </div>
    );
}

export function ReportPointOfSaleField({
    value,
    onChange,
}: {
    value: string;
    onChange: (v: string) => void;
}) {
    const t = useTranslations("reports");

    return (
        <InputField
            label={t("filters.pointOfSale")}
            value={value}
            placeholder={t("filters.pointOfSalePlaceholder")}
            onChange={onChange}
        />
    );
}

export function ReportIsfField({
    value,
    onChange,
}: {
    value: string;
    onChange: (v: string) => void;
}) {
    const t = useTranslations("reports");

    return (
        <InputField
            label={t("filters.isf")}
            value={value}
            placeholder={t("filters.isfPlaceholder")}
            onChange={onChange}
        />
    );
}

export function ReportReportDateField({
    value,
    onChange,
}: {
    value: string;
    onChange: (v: string) => void;
}) {
    const t = useTranslations("reports");

    return (
        <InputField
            label={t("filters.reportDate")}
            type="date"
            value={value}
            onChange={onChange}
        />
    );
}

export function ReportClientSelect({
    value,
    onChange,
}: {
    value: string;
    onChange: (v: string) => void;
}) {
    const t = useTranslations("reports");
    const { data } = useClients({ per_page: 200 });

    const options = useMemo(() => {
        const items = data?.items ?? [];
        return [
            { value: "", label: t("filters.all") },
            ...items.map((client) => ({
                value: String(client.id),
                label: client.client_name?.trim() || String(client.id),
            })),
        ];
    }, [data?.items, t]);

    return (
        <SelectBox
            label={t("filters.client")}
            value={value}
            options={options}
            onChange={onChange}
        />
    );
}

export function ReportClientAutocomplete({
    value,
    onChange,
}: {
    value: string;
    onChange: (v: string) => void;
}) {
    const t = useTranslations("reports");
    const {
        data,
        isPending,
        isError,
    } = useClients({ per_page: 200 });

    const clients: Client[] = useMemo(() => {
        return (data?.items ?? []).map((client) => ({
            id: Number(client.id),
            name: String(
                client.client_name ||
                    client.company_name ||
                    client.legal_name ||
                    client.name ||
                    "",
            ),
            nif: String(client.nif || client.vat_num || ""),
            rccm: String(client.rccm || client.registration_id || ""),
            idNat: String(client.idnat || ""),
            address: String(client.address || ""),
            phone: String(client.phone || ""),
            email: String(client.email || ""),
        }));
    }, [data?.items]);

    const selectedClientDisplay = useMemo(() => {
        const id = Number.parseInt(value.trim(), 10);
        if (!Number.isFinite(id)) return "";
        return clients.find((client) => client.id === id)?.name ?? "";
    }, [clients, value]);

    return (
        <div>
            <label className="mb-1 block text-[13px] font-medium">
                {t("filters.client")}
            </label>
            <ClientSearchSelect
                key={value.trim() ? `client-${value}` : "client-none"}
                inputId="report-client-search"
                clients={clients}
                value={selectedClientDisplay}
                placeholder={
                    isPending
                        ? t("filters.clientLoading")
                        : t("filters.clientPlaceholder")
                }
                emptyLabel={t("filters.clientEmpty")}
                disabled={isPending || isError}
                onSelect={(client) => onChange(String(client.id))}
            />
            {isError ? (
                <p className="mt-1 text-xs text-red-500">
                    {t("filters.clientLoadError")}
                </p>
            ) : null}
        </div>
    );
}

export function ReportContractSelect({
    value,
    onChange,
    clientId,
}: {
    value: string;
    onChange: (v: string) => void;
    clientId?: string;
}) {
    const t = useTranslations("reports");
    const { data } = useContracts({ per_page: 200 });

    const options = useMemo(() => {
        const items = data?.items ?? [];
        const filtered = clientId
            ? items.filter(
                  (c) => String(c.client_id ?? "") === clientId.trim(),
              )
            : items;

        return [
            { value: "", label: t("filters.all") },
            ...filtered.map((contract) => ({
                value: String(contract.id),
                label:
                    contract.title?.trim() ||
                    contract.reference?.trim() ||
                    String(contract.id),
            })),
        ];
    }, [clientId, data?.items, t]);

    return (
        <SelectBox
            label={t("filters.contract")}
            value={value}
            options={options}
            onChange={onChange}
        />
    );
}

export function ReportContractAutocomplete({
    value,
    onChange,
    clientId,
}: {
    value: string;
    onChange: (v: string) => void;
    clientId?: string;
}) {
    const t = useTranslations("reports");
    const {
        data,
        isPending,
        isError,
    } = useContracts({ per_page: 200 });
    const items = data?.items ?? [];
    const filtered = clientId
        ? items.filter((c) => String(c.client_id ?? "") === clientId.trim())
        : items;

    const contracts: ContractSearchOption[] = useMemo(() => {
        return filtered.map((contract) => ({
            id: Number(contract.id),
            title: contract.title?.trim() || "",
            reference: contract.reference?.trim() || "",
        }));
    }, [filtered]);

    const selectedContractDisplay = useMemo(() => {
        const id = Number.parseInt(value.trim(), 10);
        if (!Number.isFinite(id)) return "";
        const selected = contracts.find((contract) => contract.id === id);
        if (!selected) return "";
        return (
            selected.reference.trim() ||
            selected.title.trim() ||
            String(selected.id)
        );
    }, [contracts, value]);

    const clientSelected = Boolean(clientId?.trim());

    return (
        <div>
            <label className="mb-1 block text-[13px] font-medium">
                {t("filters.contract")}
            </label>
            <ContractSearchSelect
                key={
                    value.trim()
                        ? `contract-${value}`
                        : `contract-none-${clientId ?? "all"}`
                }
                inputId="report-contract-search"
                contracts={contracts}
                value={selectedContractDisplay}
                placeholder={
                    !clientSelected
                        ? t("filters.contractSelectClientFirst")
                        : isPending
                          ? t("filters.contractLoading")
                          : contracts.length === 0
                            ? t("filters.contractEmpty")
                            : t("filters.contractPlaceholder")
                }
                emptyLabel={t("filters.contractSearchEmpty")}
                disabled={
                    !clientSelected || isPending || isError || contracts.length === 0
                }
                onSelect={(contract) => onChange(String(contract.id))}
            />
            {isError ? (
                <p className="mt-1 text-xs text-red-500">
                    {t("filters.contractLoadError")}
                </p>
            ) : null}
        </div>
    );
}

export function ReportInvoiceTypeSelect({
    value,
    onChange,
}: {
    value: string;
    onChange: (v: string) => void;
}) {
    const t = useTranslations("reports");
    const { data } = useInvoiceTypes();

    const options = useMemo(() => {
        const items = data?.items ?? [];
        return [
            { value: "", label: t("filters.all") },
            ...items.map((type) => ({
                value: type.code,
                label: `${type.code} — ${type.title}`,
            })),
        ];
    }, [data?.items, t]);

    return (
        <SelectBox
            label={t("filters.invoiceType")}
            value={value}
            options={options}
            onChange={onChange}
        />
    );
}

export function ReportPeriodTypeSelect({
    value,
    onChange,
}: {
    value: string;
    onChange: (v: string) => void;
}) {
    const t = useTranslations("reports");

    const options = PERIOD_FILTER_OPTIONS.map((opt) => ({
        value: opt.value,
        label: t(opt.labelKey),
    }));

    return (
        <SelectBox
            label={t("filters.period")}
            value={value}
            options={options}
            onChange={onChange}
        />
    );
}

export function ReportVatPeriodSelect({
    value,
    onChange,
}: {
    value: string;
    onChange: (v: string) => void;
}) {
    const t = useTranslations("reports");

    const options = VAT_PERIOD_OPTIONS.map((opt) => ({
        value: opt.value,
        label: t(opt.labelKey),
    }));

    return (
        <SelectBox
            label={t("filters.period")}
            value={value}
            options={options}
            onChange={onChange}
        />
    );
}

export function ReportToolUserField({
    value,
    onChange,
}: {
    value: string;
    onChange: (v: string) => void;
}) {
    const t = useTranslations("reports");

    return (
        <InputField
            label={t("filters.user")}
            value={value}
            placeholder={t("filters.userPlaceholder")}
            onChange={onChange}
        />
    );
}

export function ReportToolActionTypeSelect({
    value,
    onChange,
}: {
    value: string;
    onChange: (v: string) => void;
}) {
    const t = useTranslations("reports");

    const options = TOOL_ACTION_TYPE_OPTIONS.map((opt) => ({
        value: opt.value,
        label: t(opt.labelKey),
    }));

    return (
        <SelectBox
            label={t("filters.actionType")}
            value={value}
            options={options}
            onChange={onChange}
        />
    );
}

export function ReportWorkflowStatusSelect({
    value,
    onChange,
}: {
    value: string;
    onChange: (v: string) => void;
}) {
    const t = useTranslations("reports");

    const options = INVOICE_WORKFLOW_STATUS_OPTIONS.map((opt) => ({
        value: opt.value,
        label: t(opt.labelKey),
    }));

    return (
        <SelectBox
            label={t("filters.invoiceStatus")}
            value={value}
            options={options}
            onChange={onChange}
        />
    );
}

export function ReportPaymentStatusSelect({
    value,
    onChange,
}: {
    value: string;
    onChange: (v: string) => void;
}) {
    const t = useTranslations("reports");

    const options = PAYMENT_STATUS_OPTIONS.map((opt) => ({
        value: opt.value,
        label: t(opt.labelKey),
    }));

    return (
        <SelectBox
            label={t("filters.paymentStatus")}
            value={value}
            options={options}
            onChange={onChange}
        />
    );
}
