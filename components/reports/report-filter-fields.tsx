"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";

import { InputField } from "@/components/configuration/input-field";
import { SelectBox } from "@/components/configuration/select-box";
import { useClients } from "@/core/hooks/client/useClient";
import { useContracts } from "@/core/hooks/contrat/useContrat";
import { useInvoiceTypes } from "@/core/hooks/invoices/useInvoices";
import {
    INVOICE_WORKFLOW_STATUS_OPTIONS,
    PAYMENT_STATUS_OPTIONS,
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
