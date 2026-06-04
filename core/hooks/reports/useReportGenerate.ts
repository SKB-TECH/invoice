"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { reportAListKeys } from "@/core/hooks/reports/useReportAList";
import { reportsService } from "@/core/services/reports.service";
import type {
    InvoiceEditionReportFilters,
    InvoiceNormalizationReportFilters,
    InvoicePaymentsReportFilters,
    OrdinaryReportKind,
    ReportAFilters,
    ReportXDailyFilters,
    ReportXPeriodicFilters,
    ReportZFilters,
    SpecialPdfReportKind,
    ToolUsageReportFilters,
    VatCollectionReportFilters,
} from "@/core/types/reports";

type OrdinaryPayload = {
    kind: OrdinaryReportKind;
    filters:
        | InvoiceEditionReportFilters
        | InvoiceNormalizationReportFilters
        | InvoicePaymentsReportFilters
        | VatCollectionReportFilters
        | ToolUsageReportFilters;
    filename: string;
    reportTitle: string;
};

type SpecialPdfPayload = {
    kind: SpecialPdfReportKind;
    filters:
        | ReportXDailyFilters
        | ReportZFilters
        | ReportXPeriodicFilters
        | ReportAFilters;
    filename: string;
    reportTitle: string;
};

export function useOrdinaryReportPreview() {
    return useMutation({
        mutationFn: (payload: OrdinaryPayload) =>
            reportsService.fetchOrdinaryReport(
                payload.kind,
                payload.filters,
                payload.filename,
                { reportTitle: payload.reportTitle },
            ),
    });
}

export function useSpecialPdfReportPreview() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (payload: SpecialPdfPayload) =>
            reportsService.fetchSpecialPdfReport(
                payload.kind,
                payload.filters,
                payload.filename,
                { reportTitle: payload.reportTitle },
            ),
        onSuccess: async (_data, variables) => {
            if (variables.kind === "a") {
                await qc.invalidateQueries({ queryKey: reportAListKeys.all });
            }
        },
    });
}
