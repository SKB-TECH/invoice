"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { SectionCard } from "@/components/configuration/section-card";
import { ReportFiltersGrid } from "@/components/reports/report-filters-grid";
import { ReportActionsBar } from "@/components/reports/report-generate-bar";
import { ReportPreviewSection } from "@/components/reports/report-preview-section";
import {
    ReportClientSelect,
    ReportContractSelect,
    ReportInvoiceTypeSelect,
    ReportPaymentStatusSelect,
    ReportPeriodFields,
} from "@/components/reports/report-filter-fields";
import {
    useInvoiceEditionReportPreview,
    useInvoiceNormalizationReportPreview,
    useOrdinaryReportPreview,
} from "@/core/hooks/reports/useReportGenerate";
import { useReportPreview } from "@/core/hooks/reports/useReportPreview";
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
    const previewMutation = useOrdinaryReportPreview();
    const invoiceEditionPreviewMutation = useInvoiceEditionReportPreview();
    const invoiceNormalizationPreviewMutation =
        useInvoiceNormalizationReportPreview();
    const {
        previewDisplay,
        isShowingPreview,
        applyPreview,
        clearPreview,
        downloadPreview,
    } = useReportPreview();

    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [clientId, setClientId] = useState("");
    const [contractId, setContractId] = useState("");
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
                    periode_date: dateFrom.trim() || undefined,
                    period_end: dateTo.trim() || undefined,
                    client_id: parseOptionalId(clientId),
                    contrat_id: parseOptionalId(contractId),
                    invoice_type: parseOptionalId(invoiceTypeCode),
                };
            case "invoiceNormalization":
                return {
                    period_start: dateFrom.trim() || undefined,
                    period_end: dateTo.trim() || undefined,
                    client_id: parseOptionalId(clientId),
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

    const handleGeneratePreview = () => {
        if (panelId === "invoiceEdition") {
            invoiceEditionPreviewMutation.mutate(
                {
                    filters: buildFilters() as InvoiceEditionReportFilters,
                },
                {
                    onSuccess: (result) => {
                        applyPreview(result);
                        toast.success(t("toast.previewReady"));
                    },
                    onError: (err) =>
                        toast.error(
                            getAxiosErrorMessage(err, t("toast.generateError")),
                        ),
                },
            );
            return;
        }

        if (panelId === "invoiceNormalization") {
            invoiceNormalizationPreviewMutation.mutate(
                {
                    filters: buildFilters() as InvoiceNormalizationReportFilters,
                },
                {
                    onSuccess: (result) => {
                        applyPreview(result);
                        toast.success(t("toast.previewReady"));
                    },
                    onError: (err) =>
                        toast.error(
                            getAxiosErrorMessage(err, t("toast.generateError")),
                        ),
                },
            );
            return;
        }

        previewMutation.mutate(
            {
                kind,
                filters: buildFilters(),
                filename: `${kind}.pdf`,
                reportTitle: t(`ordinary.${panelId}.title`),
            },
            {
                onSuccess: (result) => {
                    applyPreview(result);
                    toast.success(t("toast.previewReady"));
                },
                onError: (err) =>
                    toast.error(
                        getAxiosErrorMessage(err, t("toast.generateError")),
                    ),
            },
        );
    };

    const handleDownload = () => {
        downloadPreview();
        toast.success(t("toast.downloaded"));
    };

    const isGenerating =
        previewMutation.isPending ||
        invoiceEditionPreviewMutation.isPending ||
        invoiceNormalizationPreviewMutation.isPending;

    return (
        <SectionCard title={t(`ordinary.${panelId}.title`)}>
            {isShowingPreview && previewDisplay ? (
                <ReportPreviewSection
                    display={previewDisplay}
                    onBack={clearPreview}
                    onDownload={handleDownload}
                    disabled={isGenerating}
                />
            ) : (
                <>
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
                        <ReportInvoiceTypeSelect
                            value={invoiceTypeCode}
                            onChange={setInvoiceTypeCode}
                            valueField="id"
                        />
                    </>
                ) : null}

                {panelId === "invoiceNormalization" ? (
                    <>
                        <ReportClientSelect
                            value={clientId}
                            onChange={setClientId}
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

            <ReportActionsBar
                onGeneratePreview={handleGeneratePreview}
                isPreviewPending={isGenerating}
            />
                </>
            )}
        </SectionCard>
    );
}
