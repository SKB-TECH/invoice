"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Eye, Search } from "lucide-react";
import { useTranslations } from "next-intl";

import { BillableServicesTableSkeleton } from "@/components/configuration/billable-services-table-skeleton";
import { SectionCard } from "@/components/configuration/section-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Link, useRouter } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { useBillableServicesList } from "@/core/hooks/billable-services/useBillableServices";
import { useInvoiceTaxGroups } from "@/core/hooks/invoices/useInvoiceTaxGroups";
import {
    computePriceAfterTax,
    resolveBillableServiceTaxGroupLabel,
    resolveBillableServiceTaxRate,
} from "@/lib/tax-groups/invoice-tax-group-label";
import type { BillableServiceItem } from "@/core/types/billable-service";
import type { InvoiceTaxGroup } from "@/core/types/invoice-tax-group";

const LIMIT = 10;

const TABLE_HEAD_CLASS =
    "h-11 bg-slate-100 px-4 text-left text-sm font-semibold text-slate-700";

const TABLE_COLUMN_COUNT = 8;

function formatMoney(n: number): string {
    return new Intl.NumberFormat("fr-FR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
    }).format(n);
}

function resolveServicePrices(
    row: BillableServiceItem,
    taxGroups: InvoiceTaxGroup[],
) {
    const priceBefore = row.unit_price ?? row.price_before;
    const taxRate = resolveBillableServiceTaxRate(
        row.tax_rate,
        row.tax_group,
        taxGroups,
    );
    const priceAfter =
        row.price_after ??
        (priceBefore !== undefined && taxRate !== undefined
            ? computePriceAfterTax(priceBefore, taxRate)
            : undefined);

    return { priceBefore, priceAfter };
}

function matchesServiceSearch(
    row: BillableServiceItem,
    query: string,
    taxGroups: InvoiceTaxGroup[],
): boolean {
    const q = query.trim().toLowerCase();
    if (!q) return true;

    const { priceBefore, priceAfter } = resolveServicePrices(row, taxGroups);
    const taxGroupLabel = resolveBillableServiceTaxGroupLabel(
        row.tax_group,
        taxGroups,
    );

    const fields = [
        row.code,
        row.name,
        row.business_sector,
        row.currency,
        priceBefore !== undefined ? formatMoney(priceBefore) : "",
        priceAfter !== undefined ? formatMoney(priceAfter) : "",
        taxGroupLabel,
    ];

    return fields.some((field) =>
        String(field ?? "").toLowerCase().includes(q),
    );
}

type ServicesSectionProps = {
    suppressCardHeading?: boolean;
};

export function ServicesSection({
    suppressCardHeading = false,
}: ServicesSectionProps) {
    const router = useRouter();
    const t = useTranslations("configuration.services");
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");

    const listParams = useMemo(
        () => ({
            page,
            perPage: LIMIT,
        }),
        [page],
    );

    const {
        data: listData,
        isFetching,
        isError,
    } = useBillableServicesList(listParams);
    const { data: taxGroups = [] } = useInvoiceTaxGroups();

    const items = listData?.items;
    const filteredItems = useMemo(() => {
        const rows = items ?? [];
        return rows.filter((row) =>
            matchesServiceSearch(row, search, taxGroups),
        );
    }, [items, search, taxGroups]);
    const total = listData?.meta.total ?? items?.length ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / LIMIT));

    const showTableSkeleton = isFetching && listData === undefined;

    const toolbar = (
        <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
            <div className="relative min-w-0 flex-1 sm:w-80">
                <Search
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                    aria-hidden
                />
                <Input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t("searchPlaceholder")}
                    className="h-12 w-full rounded border-slate-200 pl-9 text-sm shadow-none focus-visible:ring-[#0879bd]/30"
                    aria-label={t("searchAriaLabel")}
                    autoComplete="off"
                />
            </div>
            <Button
                size="lg"
                className="h-12 w-full shrink-0 cursor-pointer rounded bg-[#0879bd] px-5 text-white hover:bg-[#076ca8] sm:w-52"
                asChild
            >
                <Link href="/home/services/nouveau">
                    {t("createButton")}
                </Link>
            </Button>
        </div>
    );

    const inner = (
        <>
            {suppressCardHeading ? (
                <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
                        {t("listSectionTitle")}
                    </h1>
                    {toolbar}
                </div>
            ) : (
                <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    {toolbar}
                </div>
            )}

            <div className="overflow-hidden border border-slate-200/80 bg-white">
                {showTableSkeleton ? (
                    <BillableServicesTableSkeleton />
                ) : (
                    <Table>
                        <TableHeader className="bg-[#F4F4F4BB]">
                            <TableRow className="border-slate-200 bg-[#F4F4F4BB] hover:bg-transparent">
                                <TableHead className={TABLE_HEAD_CLASS}>
                                    {t("columns.code")}
                                </TableHead>
                                <TableHead className={TABLE_HEAD_CLASS}>
                                    {t("columns.name")}
                                </TableHead>
                                <TableHead className={TABLE_HEAD_CLASS}>
                                    {t("columns.sector")}
                                </TableHead>
                                <TableHead className={TABLE_HEAD_CLASS}>
                                    {t("columns.unitPrice")}
                                </TableHead>
                                <TableHead className={TABLE_HEAD_CLASS}>
                                    {t("columns.priceInclTax")}
                                </TableHead>
                                <TableHead className={TABLE_HEAD_CLASS}>
                                    {t("columns.currency")}
                                </TableHead>
                                <TableHead className={TABLE_HEAD_CLASS}>
                                    {t("columns.taxGroup")}
                                </TableHead>
                                <TableHead
                                    className={cn(
                                        TABLE_HEAD_CLASS,
                                        "text-right",
                                    )}
                                >
                                    {t("action")}
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isError ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={TABLE_COLUMN_COUNT}
                                        className="h-40 text-center text-sm text-red-500"
                                    >
                                        {t("loadError")}
                                    </TableCell>
                                </TableRow>
                            ) : filteredItems.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={TABLE_COLUMN_COUNT}
                                        className="h-40 text-center text-sm text-slate-500"
                                    >
                                        {t("empty")}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredItems.map((row) => {
                                    const { priceBefore, priceAfter } =
                                        resolveServicePrices(row, taxGroups);
                                    const displayTaxGroup =
                                        resolveBillableServiceTaxGroupLabel(
                                            row.tax_group,
                                            taxGroups,
                                        );

                                    return (
                                        <TableRow
                                            key={`${row.id}-${row.code}`}
                                            className="border-slate-200 hover:bg-slate-50/80"
                                        >
                                            <TableCell className="px-4 py-3 text-sm font-semibold text-slate-800">
                                                {row.code}
                                            </TableCell>
                                            <TableCell className="max-w-[240px] truncate px-4 py-3 text-sm text-slate-800">
                                                {row.name}
                                            </TableCell>
                                            <TableCell className="max-w-[160px] truncate px-4 py-3 text-sm text-slate-800">
                                                {row.business_sector ?? "—"}
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-sm font-semibold text-slate-800">
                                                {priceBefore !== undefined
                                                    ? formatMoney(priceBefore)
                                                    : "—"}
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-sm font-semibold text-slate-800">
                                                {priceAfter !== undefined
                                                    ? formatMoney(priceAfter)
                                                    : "—"}
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-sm text-slate-800">
                                                {row.currency}
                                            </TableCell>
                                            <TableCell className="max-w-[220px] truncate px-4 py-3 text-sm text-slate-800">
                                                {displayTaxGroup ?? "—"}
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-right">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="cursor-pointer text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                                                    aria-label={t(
                                                        "viewServiceDetail",
                                                        { code: row.code },
                                                    )}
                                                    onClick={() =>
                                                        router.push(
                                                            `/home/services/${encodeURIComponent(String(row.id))}/visualiser`,
                                                        )
                                                    }
                                                >
                                                    <Eye className="size-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                )}
            </div>

            <div className="mt-5 flex flex-col items-center justify-between gap-4 sm:flex-row">
                <p className="text-sm text-slate-500">
                    {t("totalCount", { count: total })}
                </p>

                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1 || isFetching}
                        className="h-10 w-10 rounded"
                    >
                        <ChevronLeft className="size-4" />
                    </Button>

                    <div className="flex h-10 min-w-32 items-center justify-center border border-slate-200 px-4 text-sm font-medium text-slate-700">
                        {t("pageOfTotal", {
                            page,
                            totalPages,
                        })}
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() =>
                            setPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={
                            page >= totalPages || isFetching || total === 0
                        }
                        className="h-10 w-10 rounded"
                    >
                        <ChevronRight className="size-4" />
                    </Button>
                </div>
            </div>
        </>
    );

    if (suppressCardHeading) {
        return inner;
    }

    return (
        <SectionCard title={t("listSectionTitle")}>
            {inner}
        </SectionCard>
    );
}
