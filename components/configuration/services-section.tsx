"use client";

import { useMemo, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { useTranslations } from "next-intl";

import { SectionCard } from "@/components/configuration/section-card";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { useBillableServicesList } from "@/core/hooks/billable-services/useBillableServices";

const LIMIT = 10;

/** Taux indicatif si l’API ne renvoie pas tax_rate mais indique tax_group. */
const REFERENCE_PERCENT_BY_TAX_GROUP: Record<number, number> = {
    1: 0,
    2: 16,
    3: 5,
};

function formatMoney(n: number): string {
    return new Intl.NumberFormat("fr-FR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
    }).format(n);
}

export function ServicesSection() {
    const t = useTranslations("configuration.services");
    const [page, setPage] = useState(1);
    const [sectorDraft, setSectorDraft] = useState("");
    const [sectorFilter, setSectorFilter] = useState("");

    const listParams = useMemo(
        () => ({
            page,
            perPage: LIMIT,
            business_sector:
                sectorFilter.trim() !== "" ? sectorFilter.trim() : undefined,
        }),
        [page, sectorFilter],
    );

    const {
        data: listData,
        isPending,
        isError,
    } = useBillableServicesList(listParams);

    const items = listData?.items ?? [];
    const total = listData?.meta.total ?? items.length;
    const totalPages = Math.max(1, Math.ceil(total / LIMIT));

    return (
        <SectionCard title={t("listSectionTitle")}>
            <div className="mb-5 flex w-full min-w-full flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end md:max-w-xl">
                    <div className="relative min-w-0 flex-1">
                        <input
                            type="text"
                            value={sectorDraft}
                            onChange={(e) =>
                                setSectorDraft(e.target.value)
                            }
                            placeholder={t("filterSectorPlaceholder")}
                            className="h-9 w-full border border-slate-200 bg-white px-3 pr-10 text-sm text-slate-700 shadow-none outline-none placeholder:text-slate-400 focus-visible:border-[#0879bd]"
                        />
                        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            setSectorFilter(sectorDraft.trim());
                            setPage(1);
                        }}
                        className="h-9 shrink-0 border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                        {t("filterApply")}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setSectorDraft("");
                            setSectorFilter("");
                            setPage(1);
                        }}
                        className="h-9 shrink-0 border border-transparent px-2 text-sm text-[#0073C5] underline-offset-4 hover:underline"
                    >
                        {t("filterReset")}
                    </button>
                </div>
                <Button
                    asChild
                    className="h-9 w-full shrink-0 rounded-none! bg-[#0879bd] px-4 text-sm font-medium text-white shadow-none hover:bg-[#0879bd]/90 sm:w-auto"
                >
                    <Link href="/home/configuration/services/nouveau">
                        {t("createButton")}
                    </Link>
                </Button>
            </div>

            <div className="overflow-hidden border border-slate-200">
                <div className="overflow-x-auto">
                    <div className="min-w-[880px]">
                        <div className="grid grid-cols-[minmax(0,140px)_1fr_minmax(0,120px)_minmax(0,100px)_minmax(0,90px)_minmax(0,90px)_minmax(0,90px)_minmax(0,100px)] gap-px bg-slate-200 px-5 py-3 text-[13px] font-semibold text-slate-600">
                            <span>{t("columns.code")}</span>
                            <span>{t("columns.name")}</span>
                            <span>{t("columns.sector")}</span>
                            <span>{t("columns.unitPrice")}</span>
                            <span>{t("columns.currency")}</span>
                            <span>{t("columns.taxRate")}</span>
                            <span>{t("columns.taxGroup")}</span>
                            <span>{t("columns.billingType")}</span>
                        </div>

                        {isPending ? (
                            <div className="flex h-40 items-center justify-center gap-2 bg-white text-[14px] text-slate-500">
                                <Loader2 className="size-4 animate-spin" />
                                {t("loading")}
                            </div>
                        ) : isError ? (
                            <div className="flex h-40 items-center justify-center bg-white px-4 text-[14px] text-red-500">
                                {t("loadError")}
                            </div>
                        ) : items.length === 0 ? (
                            <div className="flex h-40 items-center justify-center bg-white text-[14px] text-slate-500">
                                {t("empty")}
                            </div>
                        ) : (
                            items.map((row) => {
                                const displayPrice =
                                    row.unit_price ??
                                    row.price_before ??
                                    row.price_after;
                                const displayRate =
                                    row.tax_rate ??
                                    (typeof row.tax_group ===
                                        "number" &&
                                    REFERENCE_PERCENT_BY_TAX_GROUP[
                                        row.tax_group
                                    ] !== undefined
                                        ? REFERENCE_PERCENT_BY_TAX_GROUP[
                                              row.tax_group!
                                          ]
                                        : undefined);
                                return (
                                    <div
                                        key={`${row.id}-${row.code}`}
                                        className="grid grid-cols-[minmax(0,140px)_1fr_minmax(0,120px)_minmax(0,100px)_minmax(0,90px)_minmax(0,90px)_minmax(0,90px)_minmax(0,100px)] gap-px border-t border-slate-200 bg-white px-5 py-3 text-[13px] text-slate-700 hover:bg-slate-50"
                                    >
                                        <span className="font-medium text-slate-900">
                                            {row.code}
                                        </span>
                                        <span className="truncate">
                                            {row.name}
                                        </span>
                                        <span className="truncate text-slate-600">
                                            {row.business_sector ?? "—"}
                                        </span>
                                        <span>
                                            {displayPrice !== undefined
                                                ? formatMoney(
                                                      displayPrice,
                                                  )
                                                : "—"}
                                        </span>
                                        <span>{row.currency}</span>
                                        <span>
                                            {displayRate !== undefined
                                                ? `${new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 4 }).format(displayRate)}\u202f%`
                                                : "—"}
                                        </span>
                                        <span>{row.tax_group ?? "—"}</span>
                                        <span>
                                            {row.billing_type ?? "—"}
                                        </span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-5 flex flex-col items-center justify-between gap-4 sm:flex-row">
                <p className="text-[13px] text-slate-500">
                    {t("pageOfTotal", {
                        page,
                        totalPages,
                    })}
                </p>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        disabled={page <= 1 || isPending}
                        onClick={() =>
                            setPage((p) => Math.max(1, p - 1))
                        }
                        className="h-10 border border-slate-200 px-4 text-[13px] font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {t("paginationPrev")}
                    </button>

                    <button
                        type="button"
                        disabled={
                            page >= totalPages ||
                            isPending ||
                            total === 0
                        }
                        onClick={() =>
                            setPage((p) =>
                                Math.min(totalPages, p + 1),
                            )
                        }
                        className="h-10 border border-slate-200 px-4 text-[13px] font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {t("paginationNext")}
                    </button>
                </div>
            </div>
        </SectionCard>
    );
}
