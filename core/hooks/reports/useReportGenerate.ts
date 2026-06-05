"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/context/AuthContext";
import { useGetMe } from "@/core/hooks/auth/useGetMe";
import { useClients } from "@/core/hooks/client/useClient";
import { useInvoiceTypes } from "@/core/hooks/invoices/useInvoices";
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
    const { profile, user } = useAuth();
    const { data: meData } = useGetMe();

    const meUser =
        meData &&
        typeof meData === "object" &&
        "user" in meData &&
        meData.user &&
        typeof meData.user === "object"
            ? (meData.user as Record<string, unknown>)
            : null;

    return useMutation({
        mutationFn: (payload: OrdinaryPayload) => {
            if (payload.kind === "invoice-payments") {
                throw new Error(
                    "Use useInvoicePaymentsReportPreview for invoice payments reports.",
                );
            }

            return reportsService.fetchOrdinaryReport(
                payload.kind,
                payload.filters,
                payload.filename,
                {
                    reportTitle: payload.reportTitle,
                    profile,
                    user:
                        meUser ??
                        (user as Record<string, unknown> | null),
                },
            );
        },
    });
}

type InvoicePaymentsPayload = {
    filters: InvoicePaymentsReportFilters;
};

type InvoiceEditionPayload = {
    filters: InvoiceEditionReportFilters;
};

type InvoiceNormalizationPayload = {
    filters: InvoiceNormalizationReportFilters;
};

export function useInvoiceEditionReportPreview() {
    const { profile, user } = useAuth();
    const { data: meData } = useGetMe();
    const { data: clientsData } = useClients({ per_page: 200 });
    const { data: invoiceTypesData } = useInvoiceTypes();

    const meUser =
        meData &&
        typeof meData === "object" &&
        "user" in meData &&
        meData.user &&
        typeof meData.user === "object"
            ? (meData.user as Record<string, unknown>)
            : null;

    return useMutation({
        mutationFn: (payload: InvoiceEditionPayload) =>
            reportsService.fetchInvoiceEditionReport(payload.filters, {
                profile,
                user:
                    meUser ??
                    (user as Record<string, unknown> | null),
                clients: clientsData?.items ?? [],
                invoiceTypes: invoiceTypesData?.items ?? [],
            }),
    });
}

export function useInvoiceNormalizationReportPreview() {
    const { profile, user } = useAuth();
    const { data: meData } = useGetMe();
    const { data: clientsData } = useClients({ per_page: 200 });
    const { data: invoiceTypesData } = useInvoiceTypes();

    const meUser =
        meData &&
        typeof meData === "object" &&
        "user" in meData &&
        meData.user &&
        typeof meData.user === "object"
            ? (meData.user as Record<string, unknown>)
            : null;

    return useMutation({
        mutationFn: (payload: InvoiceNormalizationPayload) =>
            reportsService.fetchInvoiceNormalizationReport(payload.filters, {
                profile,
                user:
                    meUser ??
                    (user as Record<string, unknown> | null),
                clients: clientsData?.items ?? [],
                invoiceTypes: invoiceTypesData?.items ?? [],
            }),
    });
}

export function useInvoicePaymentsReportPreview() {
    const { profile, user } = useAuth();
    const { data: meData } = useGetMe();
    const { data: clientsData } = useClients({ per_page: 200 });

    const meUser =
        meData &&
        typeof meData === "object" &&
        "user" in meData &&
        meData.user &&
        typeof meData.user === "object"
            ? (meData.user as Record<string, unknown>)
            : null;

    return useMutation({
        mutationFn: (payload: InvoicePaymentsPayload) =>
            reportsService.fetchInvoicePaymentsReport(payload.filters, {
                profile,
                user:
                    meUser ??
                    (user as Record<string, unknown> | null),
                clients: clientsData?.items ?? [],
            }),
    });
}

export function useSpecialPdfReportPreview() {
    const qc = useQueryClient();
    const { profile, user } = useAuth();
    const { data: meData } = useGetMe();

    const meUser =
        meData &&
        typeof meData === "object" &&
        "user" in meData &&
        meData.user &&
        typeof meData.user === "object"
            ? (meData.user as Record<string, unknown>)
            : null;

    return useMutation({
        mutationFn: (payload: SpecialPdfPayload) =>
            reportsService.fetchSpecialPdfReport(
                payload.kind,
                payload.filters,
                payload.filename,
                {
                    reportTitle: payload.reportTitle,
                    profile,
                    user:
                        meUser ??
                        (user as Record<string, unknown> | null),
                },
            ),
        onSuccess: async (_data, variables) => {
            if (variables.kind === "a") {
                await qc.invalidateQueries({ queryKey: reportAListKeys.all });
            }
        },
    });
}
