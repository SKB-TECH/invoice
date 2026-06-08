"use client";

import type { CSSProperties } from "react";
import { useTranslations } from "next-intl";

import type {
    OrdinaryReportTableConfig,
    OrdinaryReportTableContent,
    OrdinaryReportTableRow,
} from "@/lib/reports/ordinary-report-configs";

type Props = {
    content: OrdinaryReportTableContent;
    config: OrdinaryReportTableConfig;
};

const HEADER_CELL = "whitespace-nowrap leading-none";

function formatPreviewCell(
    row: OrdinaryReportTableRow,
    key: string,
    previewFormat?: (value: string, row: OrdinaryReportTableRow) => string,
): string {
    const value = row[key] ?? "";
    return previewFormat ? previewFormat(value, row) : value;
}

function getPreviewCellStyle(column: {
    previewPaddingLeft?: number;
    previewPaddingRight?: number;
}): CSSProperties | undefined {
    if (!column.previewPaddingLeft && !column.previewPaddingRight) {
        return undefined;
    }

    return {
        paddingLeft: column.previewPaddingLeft,
        paddingRight: column.previewPaddingRight,
    };
}

function getPreviewCellClassName(
    column: { align?: "left" | "right" },
    isHeader = false,
): string {
    const classes = ["min-w-0 overflow-hidden"];

    if (column.align === "right") {
        classes.push("text-right");
    }

    if (!isHeader) {
        classes.push("break-words");
    } else {
        classes.push(HEADER_CELL);
    }

    return classes.join(" ");
}

export function ReportOrdinaryTablePreview({ content, config }: Props) {
    const t = useTranslations(config.translationNamespace);
    const p = content;

    return (
        <div className="w-full rounded border border-slate-300 bg-white p-10">
            <div className="mb-8 flex items-start justify-between gap-6">
                <div className="flex items-center gap-3">
                    {p.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={p.logoUrl}
                            alt="Logo"
                            className="max-h-14 max-w-[180px] object-contain"
                        />
                    ) : null}
                </div>
                <h2 className="text-4xl font-black uppercase tracking-tight text-[#1e4d7b] md:text-5xl">
                    {t("reportCode")}
                </h2>
            </div>

            <div className="mb-8 border-b-2 border-black" />

            <div className="mb-10 grid grid-cols-1 gap-10 md:grid-cols-2">
                <div>
                    <p className="mb-3 text-sm font-black uppercase text-black">
                        {t("emitter")}
                    </p>
                    <div className="space-y-1 text-sm font-semibold text-slate-800">
                        <p>
                            <span className="font-black text-black">
                                {t("company")} :
                            </span>{" "}
                            {p.companyName}
                        </p>
                        <p>
                            <span className="font-black text-black">
                                {t("nif")} :
                            </span>{" "}
                            {p.nif}
                        </p>
                        <p>
                            <span className="font-black text-black">
                                {t("isf")} :
                            </span>{" "}
                            {p.isf}
                        </p>
                    </div>
                </div>

                <div className="md:text-right">
                    <p className="mb-3 text-sm font-black uppercase text-black">
                        {t("periodSection")}
                    </p>
                    <div className="space-y-1 text-sm font-semibold text-slate-800">
                        <p>
                            <span className="font-black text-black">
                                {t("generatedAt")} :
                            </span>{" "}
                            {p.generatedAt}
                        </p>
                        <p>
                            <span className="font-black text-black">
                                {t("dateFrom")} :
                            </span>{" "}
                            {p.dateFrom}
                        </p>
                        <p>
                            <span className="font-black text-black">
                                {t("dateTo")} :
                            </span>{" "}
                            {p.dateTo}
                        </p>
                    </div>
                </div>
            </div>

            <p className="mb-4 text-sm font-black uppercase text-black">
                {t("tableTitle")}
            </p>

            <div className="overflow-x-auto">
                <div
                    className={`${config.tableGridClass} items-center bg-slate-100 px-2 py-3 text-xs font-black uppercase text-black`}
                >
                    {config.columns.map((column) => (
                        <div
                            key={column.key}
                            className={getPreviewCellClassName(column, true)}
                            style={getPreviewCellStyle(column)}
                        >
                            {t(`columns.${column.key}`)}
                        </div>
                    ))}
                </div>

                {p.lineItems.length > 0 ? (
                    p.lineItems.map((row) => (
                        <div
                            key={config.rowKey(row)}
                            className={`${config.tableGridClass} border-b border-slate-300 px-2 py-3 text-sm font-semibold text-slate-700`}
                        >
                            {config.columns.map((column) => (
                                <div
                                    key={column.key}
                                    className={getPreviewCellClassName(column)}
                                    style={getPreviewCellStyle(column)}
                                >
                                    {formatPreviewCell(
                                        row,
                                        column.key,
                                        column.previewFormat,
                                    )}
                                </div>
                            ))}
                        </div>
                    ))
                ) : (
                    <p className="py-6 text-sm font-semibold text-slate-500">
                        {t("empty")}
                    </p>
                )}
            </div>

            <p className="mt-10 text-right text-xs text-slate-500">
                {t("page", { current: 1, total: 1 })}
            </p>
        </div>
    );
}
