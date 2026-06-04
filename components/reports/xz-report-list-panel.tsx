"use client";

import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useReportAList } from "@/core/hooks/reports/useReportAList";

const TABLE_HEAD_CLASS =
    "h-11 bg-slate-100 px-4 text-left text-sm font-semibold text-slate-700";

type Props = {
    onGenerate: () => void;
};

export function XzReportListPanel({ onGenerate }: Props) {
    const t = useTranslations("reports.xzFlow.list");
    const { data, isPending, isError, error, refetch } = useReportAList();
    const items = data?.items ?? [];
    const columnCount = 5;

    return (
        <>
            <p className="mb-5 max-w-3xl text-[13px] leading-relaxed text-slate-500">
                {t("intro")}
            </p>

            <div className="w-full min-w-full">
                {isPending ? (
                    <div className="flex h-40 items-center justify-center border border-slate-200/80 bg-white">
                        <Loader2
                            className="size-8 animate-spin text-[#0879bd]"
                            aria-hidden
                        />
                        <span className="sr-only">{t("loading")}</span>
                    </div>
                ) : isError ? (
                    <div className="overflow-hidden border border-slate-200/80 bg-white">
                        <Table>
                            <TableBody>
                                <TableRow>
                                    <TableCell
                                        colSpan={columnCount}
                                        className="h-40 px-4 text-center"
                                    >
                                        <p className="text-sm text-red-500">
                                            {t("loadError")}
                                        </p>
                                        <p className="mt-2 break-words text-xs text-slate-500">
                                            {error instanceof Error
                                                ? error.message
                                                : ""}
                                        </p>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="sm"
                                            className="mt-3"
                                            onClick={() => refetch()}
                                        >
                                            {t("retry")}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                ) : items.length === 0 ? (
                    <div className="overflow-hidden border border-slate-200/80 bg-white">
                        <Table>
                            <TableBody>
                                <TableRow>
                                    <TableCell
                                        colSpan={columnCount}
                                        className="h-40 text-center text-sm text-slate-500"
                                    >
                                        {t("empty")}
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className="overflow-hidden border border-slate-200/80 bg-white">
                        <Table>
                            <TableHeader className="bg-[#F4F4F4BB]">
                                <TableRow className="border-slate-200 bg-[#F4F4F4BB] hover:bg-transparent">
                                    <TableHead className={TABLE_HEAD_CLASS}>
                                        {t("columns.generatedAt")}
                                    </TableHead>
                                    <TableHead className={TABLE_HEAD_CLASS}>
                                        {t("columns.dateFrom")}
                                    </TableHead>
                                    <TableHead className={TABLE_HEAD_CLASS}>
                                        {t("columns.dateTo")}
                                    </TableHead>
                                    <TableHead className={TABLE_HEAD_CLASS}>
                                        {t("columns.isf")}
                                    </TableHead>
                                    <TableHead className={TABLE_HEAD_CLASS}>
                                        {t("columns.pointOfSale")}
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        className="border-slate-200 hover:bg-slate-50/80"
                                    >
                                        <TableCell className="px-4 py-3 text-sm text-slate-800">
                                            {row.generatedAt}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-sm text-slate-800">
                                            {row.dateFrom}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-sm text-slate-800">
                                            {row.dateTo}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-sm font-semibold text-slate-800">
                                            {row.isf}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-sm text-slate-800">
                                            {row.pointOfSale}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>

            {!isPending && !isError && data ? (
                <p className="mt-4 text-sm text-slate-500">
                    {t("totalCount", { count: data.meta.total })}
                </p>
            ) : null}

            <div className="mt-6 flex justify-end border-t border-slate-100 pt-5">
                <button
                    type="button"
                    onClick={onGenerate}
                    className="h-12 w-52 rounded bg-[#0879bd] text-sm font-semibold text-white hover:bg-[#076ca8]"
                >
                    {t("generateButton")}
                </button>
            </div>
        </>
    );
}
