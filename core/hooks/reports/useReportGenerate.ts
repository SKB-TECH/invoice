"use client";

import { useMutation } from "@tanstack/react-query";

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
};

type SpecialPdfPayload = {
    kind: SpecialPdfReportKind;
    filters:
        | ReportXDailyFilters
        | ReportZFilters
        | ReportXPeriodicFilters
        | ReportAFilters;
    filename: string;
};

export function useOrdinaryReportGenerate() {
    return useMutation({
        mutationFn: (payload: OrdinaryPayload) =>
            reportsService.downloadOrdinaryReport(
                payload.kind,
                payload.filters,
                payload.filename,
            ),
    });
}

export function useSpecialPdfReportGenerate() {
    return useMutation({
        mutationFn: (payload: SpecialPdfPayload) =>
            reportsService.downloadSpecialPdfReport(
                payload.kind,
                payload.filters,
                payload.filename,
            ),
    });
}
