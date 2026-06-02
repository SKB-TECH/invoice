"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { SectionCard } from "@/components/configuration/section-card";
import { ReportFiltersGrid } from "@/components/reports/report-filters-grid";
import { ReportGenerateBar } from "@/components/reports/report-generate-bar";
import {
    ReportClientSelect,
    ReportContractSelect,
    ReportInvoiceTypeSelect,
    ReportPaymentStatusSelect,
    ReportPeriodFields,
    ReportPointOfSaleField,
    ReportWorkflowStatusSelect,
} from "@/components/reports/report-filter-fields";
import { useOrdinaryReportGenerate } from "@/core/hooks/reports/useReportGenerate";
import type {
    InvoiceEditionReportFilters,
    InvoiceNormalizationReportFilters,
    InvoicePaymentsReportFilters,
    OrdinaryReportKind,
    ToolUsageReportFilters,
    VatCollectionReportFilters,
} from "@/core/types/reports";
import { getAxiosErrorMessage } from "@/core/utils/axiosErrorMessage";

export type OrdinaryReportPanelId =
    | "invoiceEdition"
    | "invoiceNormalization"
    | "invoicePayments"
    | "vatCollection"
    | "toolUsage";

const PANEL_TO_KIND: Record<OrdinaryReportPanelId, OrdinaryReportKind> = {
    invoiceEdition: "invoice-edition",
    invoiceNormalization: "invoice-normalization",
    invoicePayments: "invoice-payments",
    vatCollection: "vat-collection",
    toolUsage: "tool-usage",
};

type Props = {
    panelId: OrdinaryReportPanelId;
};

function parseOptionalId(raw: string): number | undefined {
    const n = Number.parseInt(raw.trim(), 10);
    return Number.isFinite(n) && n > 0 ? n : undefined;
}

export function OrdinaryReportPanel({ panelId }: Props) {
    const t = useTranslations("reports");
    const kind = PANEL_TO_KIND[panelId];
    const generateMutation = useOrdinaryReportGenerate();

    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [clientId, setClientId] = useState("");
    const [contractId, setContractId] = useState("");
    const [pointOfSale, setPointOfSale] = useState("");
    const [workflowStatus, setWorkflowStatus] = useState("");
    const [invoiceTypeCode, setInvoiceTypeCode] = useState("");
    const [paymentStatus, setPaymentStatus] = useState("");

    const buildFilters = ():
        | InvoiceEditionReportFilters
        | InvoiceNormalizationReportFilters
        | InvoicePaymentsReportFilters
        | VatCollectionReportFilters
        | ToolUsageReportFilters => {
        const period = {
            date_from: dateFrom.trim() || undefined,
            date_to: dateTo.trim() || undefined,
        };

        switch (panelId) {
            case "invoiceEdition":
                return {
                    ...period,
                    client_id: parseOptionalId(clientId),
                    contract_id: parseOptionalId(contractId),
                    point_of_sale: pointOfSale.trim() || undefined,
                    workflow_status: workflowStatus.trim() || undefined,
                };
            case "invoiceNormalization":
                return {
                    ...period,
                    point_of_sale: pointOfSale.trim() || undefined,
                    invoice_type_code: invoiceTypeCode.trim() || undefined,
                };
            case "invoicePayments":
                return {
                    ...period,
                    client_id: parseOptionalId(clientId),
                    payment_status: paymentStatus.trim() || undefined,
                };
            case "vatCollection":
                return {
                    ...period,
                    payment_status: paymentStatus.trim() || undefined,
                    invoice_type_code: invoiceTypeCode.trim() || undefined,
                    client_id: parseOptionalId(clientId),
                };
            case "toolUsage":
                return period;
        }
    };

    const handleGenerate = () => {
        generateMutation.mutate(
            {
                kind,
                filters: buildFilters(),
                filename: `${kind}.pdf`,
            },
            {
                onSuccess: () => toast.success(t("toast.generated")),
                onError: (err) =>
                    toast.error(
                        getAxiosErrorMessage(err, t("toast.generateError")),
                    ),
            },
        );
    };

    return (
        <SectionCard title={t(`ordinary.${panelId}.title`)}>
            <p className="mb-5 max-w-3xl text-[13px] leading-relaxed text-slate-500">
                {t(`ordinary.${panelId}.description`)}
            </p>

            <ReportFiltersGrid>
                <ReportPeriodFields
                    dateFrom={dateFrom}
                    dateTo={dateTo}
                    onDateFromChange={setDateFrom}
                    onDateToChange={setDateTo}
                />

                {panelId === "invoiceEdition" ? (
                    <>
                        <ReportClientSelect
                            value={clientId}
                            onChange={setClientId}
                        />
                        <ReportContractSelect
                            value={contractId}
                            onChange={setContractId}
                            clientId={clientId}
                        />
                        <ReportPointOfSaleField
                            value={pointOfSale}
                            onChange={setPointOfSale}
                        />
                        <ReportWorkflowStatusSelect
                            value={workflowStatus}
                            onChange={setWorkflowStatus}
                        />
                    </>
                ) : null}

                {panelId === "invoiceNormalization" ? (
                    <>
                        <ReportPointOfSaleField
                            value={pointOfSale}
                            onChange={setPointOfSale}
                        />
                        <ReportInvoiceTypeSelect
                            value={invoiceTypeCode}
                            onChange={setInvoiceTypeCode}
                        />
                    </>
                ) : null}

                {panelId === "invoicePayments" ? (
                    <>
                        <ReportClientSelect
                            value={clientId}
                            onChange={setClientId}
                        />
                        <ReportPaymentStatusSelect
                            value={paymentStatus}
                            onChange={setPaymentStatus}
                        />
                    </>
                ) : null}

                {panelId === "vatCollection" ? (
                    <>
                        <ReportClientSelect
                            value={clientId}
                            onChange={setClientId}
                        />
                        <ReportPaymentStatusSelect
                            value={paymentStatus}
                            onChange={setPaymentStatus}
                        />
                        <ReportInvoiceTypeSelect
                            value={invoiceTypeCode}
                            onChange={setInvoiceTypeCode}
                        />
                    </>
                ) : null}
            </ReportFiltersGrid>

            <ReportGenerateBar
                onGenerate={handleGenerate}
                isPending={generateMutation.isPending}
            />
        </SectionCard>
    );
}
