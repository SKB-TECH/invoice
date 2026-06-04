"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { ReportKindRadioGrid } from "@/components/reports/report-kind-radio-grid";
import { ReportFiltersGrid } from "@/components/reports/report-filters-grid";
import { ReportPreviewSection } from "@/components/reports/report-preview-section";
import {
    ReportClientAutocomplete,
    ReportContractAutocomplete,
    ReportInvoiceTypeSelect,
    ReportPaymentStatusSelect,
    ReportPeriodFields,
    ReportPeriodTypeSelect,
    ReportPointOfSaleField,
    ReportToolActionTypeSelect,
    ReportToolUserField,
    ReportVatPeriodSelect,
    ReportWorkflowStatusSelect,
} from "@/components/reports/report-filter-fields";
import { useOrdinaryReportPreview, useInvoicePaymentsReportPreview } from "@/core/hooks/reports/useReportGenerate";
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

type InvoiceEditionFilterKind =
    | "invoiceEdition"
    | "invoiceNormalization"
    | "vatCollection"
    | "invoicePayments"
    | "toolUsage";

const KIND_TO_ORDINARY: Record<InvoiceEditionFilterKind, OrdinaryReportKind> = {
    invoiceEdition: "invoice-edition",
    invoiceNormalization: "invoice-normalization",
    vatCollection: "vat-collection",
    invoicePayments: "invoice-payments",
    toolUsage: "tool-usage",
};

function parseOptionalId(raw: string): number | undefined {
    const n = Number.parseInt(raw.trim(), 10);
    return Number.isFinite(n) && n > 0 ? n : undefined;
}

type Props = {
    onBack: () => void;
};

export function InvoiceEditionGeneratePanel({ onBack }: Props) {
    const t = useTranslations("reports");
    const tFlow = useTranslations("reports.invoiceEditionFlow");
    const previewMutation = useOrdinaryReportPreview();
    const paymentsPreviewMutation = useInvoicePaymentsReportPreview();
    const {
        previewDisplay,
        isShowingPreview,
        applyPreview,
        clearPreview,
        downloadPreview,
    } = useReportPreview();

    const [kind, setKind] = useState<InvoiceEditionFilterKind>("invoiceEdition");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [clientId, setClientId] = useState("");
    const [contractId, setContractId] = useState("");
    const [pointOfSale, setPointOfSale] = useState("");
    const [workflowStatus, setWorkflowStatus] = useState("");
    const [invoiceTypeCode, setInvoiceTypeCode] = useState("");
    const [paymentStatus, setPaymentStatus] = useState("");
    const [periodType, setPeriodType] = useState("");
    const [toolUser, setToolUser] = useState("");
    const [toolActionType, setToolActionType] = useState("");

    const buildFilters = ():
        | InvoiceEditionReportFilters
        | InvoiceNormalizationReportFilters
        | InvoicePaymentsReportFilters
        | VatCollectionReportFilters
        | ToolUsageReportFilters => {
        switch (kind) {
            case "invoiceEdition":
                return {
                    date_from: dateFrom.trim() || undefined,
                    date_to: dateTo.trim() || undefined,
                    client_id: parseOptionalId(clientId),
                    contract_id: parseOptionalId(contractId),
                    workflow_status: workflowStatus.trim() || undefined,
                };
            case "invoiceNormalization":
                return {
                    point_of_sale: pointOfSale.trim() || undefined,
                    invoice_type_code: invoiceTypeCode.trim() || undefined,
                    period_type: periodType.trim() || undefined,
                };
            case "vatCollection":
                return {
                    period_type: periodType.trim() || undefined,
                    payment_status: paymentStatus.trim() || undefined,
                    invoice_type_code: invoiceTypeCode.trim() || undefined,
                    client_id: parseOptionalId(clientId),
                };
            case "invoicePayments":
                return {
                    client_id: parseOptionalId(clientId),
                    period_start: dateFrom.trim() || undefined,
                    period_end: dateTo.trim() || undefined,
                };
            case "toolUsage":
                return {
                    user_name: toolUser.trim() || undefined,
                    action_type: toolActionType.trim() || undefined,
                    period_type: periodType.trim() || undefined,
                };
        }
    };

    const handleClientChange = (nextClientId: string) => {
        setClientId(nextClientId);
        setContractId("");
    };

    const handleGeneratePreview = () => {
        if (kind === "invoicePayments") {
            paymentsPreviewMutation.mutate(
                {
                    filters: buildFilters() as InvoicePaymentsReportFilters,
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
                kind: KIND_TO_ORDINARY[kind],
                filters: buildFilters(),
                filename: `${KIND_TO_ORDINARY[kind]}.pdf`,
                reportTitle: t(`ordinary.${kind}.title`),
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
        previewMutation.isPending || paymentsPreviewMutation.isPending;

    if (isShowingPreview && previewDisplay) {
        return (
            <ReportPreviewSection
                display={previewDisplay}
                onBack={clearPreview}
                onDownload={handleDownload}
                disabled={isGenerating}
            />
        );
    }

    return (
        <>
            <p className="mb-5 max-w-3xl text-[13px] leading-relaxed text-slate-500">
                {tFlow("generate.intro")}
            </p>

            <ReportKindRadioGrid
                title={tFlow("generate.radioTitle")}
                value={kind}
                onChange={(v) => setKind(v as InvoiceEditionFilterKind)}
                options={[
                    {
                        value: "invoiceEdition",
                        label: tFlow("reportKinds.invoiceEdition"),
                    },
                    {
                        value: "invoiceNormalization",
                        label: tFlow("reportKinds.invoiceNormalization"),
                    },
                    {
                        value: "vatCollection",
                        label: tFlow("reportKinds.vatCollection"),
                    },
                    {
                        value: "invoicePayments",
                        label: tFlow("reportKinds.invoicePayments"),
                    },
                    {
                        value: "toolUsage",
                        label: tFlow("reportKinds.toolUsage"),
                    },
                ]}
            />

            <div className="mt-6 border-t border-slate-100 pt-5">
                {kind === "invoiceEdition" ? (
                    <div className="space-y-5">
                        <div className="grid gap-5 md:grid-cols-2">
                            <ReportClientAutocomplete
                                value={clientId}
                                onChange={handleClientChange}
                            />
                            <ReportContractAutocomplete
                                value={contractId}
                                onChange={setContractId}
                                clientId={clientId}
                            />
                        </div>
                        <div className="grid gap-5 md:grid-cols-3">
                            <ReportPeriodFields
                                dateFrom={dateFrom}
                                dateTo={dateTo}
                                onDateFromChange={setDateFrom}
                                onDateToChange={setDateTo}
                            />
                            <ReportWorkflowStatusSelect
                                value={workflowStatus}
                                onChange={setWorkflowStatus}
                            />
                        </div>
                    </div>
                ) : null}

                {kind === "invoiceNormalization" ? (
                    <div className="grid gap-5 md:grid-cols-3">
                        <ReportPointOfSaleField
                            value={pointOfSale}
                            onChange={setPointOfSale}
                        />
                        <ReportInvoiceTypeSelect
                            value={invoiceTypeCode}
                            onChange={setInvoiceTypeCode}
                        />
                        <ReportPeriodTypeSelect
                            value={periodType}
                            onChange={setPeriodType}
                        />
                    </div>
                ) : null}

                {kind === "vatCollection" ? (
                    <ReportFiltersGrid>
                        <ReportVatPeriodSelect
                            value={periodType}
                            onChange={setPeriodType}
                        />
                        <ReportPaymentStatusSelect
                            value={paymentStatus}
                            onChange={setPaymentStatus}
                        />
                        <ReportInvoiceTypeSelect
                            value={invoiceTypeCode}
                            onChange={setInvoiceTypeCode}
                        />
                        <ReportClientAutocomplete
                            value={clientId}
                            onChange={handleClientChange}
                        />
                    </ReportFiltersGrid>
                ) : null}

                {kind === "invoicePayments" ? (
                    <div className="grid gap-5 md:grid-cols-3">
                        <ReportClientAutocomplete
                            value={clientId}
                            onChange={handleClientChange}
                        />
                        <ReportPeriodFields
                            dateFrom={dateFrom}
                            dateTo={dateTo}
                            onDateFromChange={setDateFrom}
                            onDateToChange={setDateTo}
                        />
                    </div>
                ) : null}

                {kind === "toolUsage" ? (
                    <div className="grid gap-5 md:grid-cols-3">
                        <ReportToolUserField
                            value={toolUser}
                            onChange={setToolUser}
                        />
                        <ReportToolActionTypeSelect
                            value={toolActionType}
                            onChange={setToolActionType}
                        />
                        <ReportPeriodTypeSelect
                            value={periodType}
                            onChange={setPeriodType}
                        />
                    </div>
                ) : null}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-end gap-4 border-t border-slate-100 pt-5">
                <button
                    type="button"
                    disabled={isGenerating}
                    onClick={onBack}
                    className="h-12 w-52 rounded border border-slate-300 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {t("actions.back")}
                </button>
                <button
                    type="button"
                    disabled={isGenerating}
                    onClick={handleGeneratePreview}
                    className="h-12 w-52 rounded bg-[#0879bd] text-sm font-semibold text-white hover:bg-[#076ca8] disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                    {isGenerating ? (
                        <span className="inline-flex items-center justify-center gap-2">
                            <Loader2 className="size-4 animate-spin" aria-hidden />
                            {t("actions.generating")}
                        </span>
                    ) : (
                        t("actions.generate")
                    )}
                </button>
            </div>
        </>
    );
}
