"use client";

import { useTranslations } from "next-intl";

import { REPORT_X_PERIODIC_TABLE_GRID_CLASS } from "@/lib/reports/report-x-periodic-table-layout";
import type { ReportXPeriodicPreviewContent } from "@/core/types/reports";

type Props = {
    content: ReportXPeriodicPreviewContent;
    scope: "reportXDaily" | "reportZ" | "reportXPeriodic";
};

const TABLE_GRID = REPORT_X_PERIODIC_TABLE_GRID_CLASS;
const HEADER_CELL = "whitespace-nowrap leading-none";

export function ReportXzSnapshotPreview({ content, scope }: Props) {
    const t = useTranslations(`reports.specialXz.${scope}.preview`);
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
                    <div className={HEADER_CELL}>
                        {t("columns.invoiceCount")}
                    </div>
                    <div className={`${HEADER_CELL} text-right`}>
                        {t("columns.totalHt")}
                    </div>
                    <div className={`${HEADER_CELL} text-right`}>
                        {t("columns.totalTva")}
                    </div>
                    <div className={`${HEADER_CELL} text-right`}>
                        {t("columns.totalTtc")}
                    </div>
                    <div className={`${HEADER_CELL} text-right`}>
                        {t("columns.totalPaid")}
                    </div>
                    <div className={`${HEADER_CELL} text-right`}>
                        {t("columns.totalBalance")}
                    </div>
                </div>

                <div
                    className={`${TABLE_GRID} border-b border-slate-300 px-2 py-3 text-sm font-semibold text-slate-700`}
                >
                    <div>{p.invoiceCount}</div>
                    <div className="text-right">{p.totalHt}</div>
                    <div className="text-right">{p.totalTva}</div>
                    <div className="text-right">{p.totalTtc}</div>
                    <div className="text-right">{p.totalPaid}</div>
                    <div className="text-right">{p.totalBalance}</div>
                </div>
            </div>

            <p className="mt-10 text-right text-xs text-slate-500">
                {t("page", { current: 1, total: 1 })}
            </p>
        </div>
    );
}
