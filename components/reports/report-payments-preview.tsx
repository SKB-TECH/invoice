"use client";

import { useTranslations } from "next-intl";

import { REPORT_PAYMENTS_TABLE_GRID_CLASS } from "@/lib/reports/report-payments-table-layout";
import type { InvoicePaymentsPreviewContent } from "@/core/types/reports";

type Props = {
    content: InvoicePaymentsPreviewContent;
};

const TABLE_GRID = REPORT_PAYMENTS_TABLE_GRID_CLASS;
const HEADER_CELL = "whitespace-nowrap leading-none";

export function ReportPaymentsPreview({ content }: Props) {
    const t = useTranslations("reports.preview.payments");
    const p = content;

    return (
        <div className="w-full rounded border border-slate-300 bg-white p-10">
            <div className="mb-8 flex items-start justify-between gap-6">
                <div>
                    <p className="text-3xl font-black tracking-tight text-slate-900">
                        iKwook
                    </p>
                    <p className="mt-1 text-xs font-bold uppercase tracking-[0.3em] text-slate-600">
                        Reports
                    </p>
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
                    className={`${TABLE_GRID} items-center bg-slate-100 px-2 py-3 text-xs font-black uppercase text-black`}
                >
                    <div className={HEADER_CELL}>{t("columns.reference")}</div>
                    <div className={HEADER_CELL}>{t("columns.clientName")}</div>
                    <div className={`${HEADER_CELL} text-right`}>
                        {t("columns.amount")}
                    </div>
                    <div className={`${HEADER_CELL} text-right`}>
                        {t("columns.date")}
                    </div>
                </div>

                {p.lineItems.length > 0 ? (
                    p.lineItems.map((row) => (
                        <div
                            key={row.reference + row.date}
                            className={`${TABLE_GRID} border-b border-slate-300 px-2 py-3 text-sm font-semibold text-slate-700`}
                        >
                            <div>{row.reference}</div>
                            <div>{row.clientName}</div>
                            <div className="text-right">{row.amount}</div>
                            <div className="text-right">{row.date}</div>
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
