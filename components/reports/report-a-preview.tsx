"use client";

import { useTranslations } from "next-intl";

import { formatReportAUnitPrice } from "@/lib/reports/format-report-a-unit-price";
import { REPORT_A_TABLE_GRID_CLASS } from "@/lib/reports/report-a-table-layout";
import type { ReportAPreviewContent } from "@/core/types/reports";

type Props = {
    content: ReportAPreviewContent;
};

const TABLE_GRID = REPORT_A_TABLE_GRID_CLASS;
const HEADER_CELL = "whitespace-nowrap leading-none";

export function ReportAPreview({ content }: Props) {
    const t = useTranslations("reports.specialA.preview");
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
                    className={`${TABLE_GRID} items-center bg-slate-100 px-2 py-3 text-xs font-black uppercase text-black`}
                >
                    <div className={HEADER_CELL}>{t("columns.code")}</div>
                    <div className={HEADER_CELL}>{t("columns.designation")}</div>
                    <div className={`${HEADER_CELL} text-right`}>
                        {t("columns.unitPrice")}
                    </div>
                    <div className={`${HEADER_CELL} text-right`}>
                        {t("columns.tax")}
                    </div>
                    <div className={`${HEADER_CELL} text-right`}>
                        {t("columns.qtySold")}
                    </div>
                    <div className={`${HEADER_CELL} text-right`}>
                        {t("columns.qtyReturned")}
                    </div>
                    <div className={`${HEADER_CELL} text-right`}>
                        {t("columns.fiscalStock")}
                    </div>
                </div>

                {p.lineItems.map((row) => (
                    <div
                        key={row.code}
                        className={`${TABLE_GRID} border-b border-slate-300 px-2 py-3 text-sm font-semibold text-slate-700`}
                    >
                        <div>{row.code}</div>
                        <div>{row.designation}</div>
                        <div className="text-right">
                            {formatReportAUnitPrice(
                                row.unitPrice,
                                row.currency,
                            )}
                        </div>
                        <div className="text-right">{row.tax}</div>
                        <div className="text-right">{row.qtySold}</div>
                        <div className="text-right">{row.qtyReturned}</div>
                        <div className="text-right">{row.fiscalStock}</div>
                    </div>
                ))}

                <div
                    className={`${TABLE_GRID} bg-[#eff6ff] px-2 py-3 text-sm font-black text-[#1e4d7b]`}
                >
                    <div className="col-span-4 uppercase">{t("total")}</div>
                    <div className="text-right">{p.totals.qtySold}</div>
                    <div className="text-right">{p.totals.qtyReturned}</div>
                    <div className="text-right">{p.totals.fiscalStock}</div>
                </div>
            </div>

            <p className="mt-10 text-right text-xs text-slate-500">
                {t("page", { current: 1, total: 1 })}
            </p>
        </div>
    );
}
