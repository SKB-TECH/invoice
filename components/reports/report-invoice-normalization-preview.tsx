"use client";

import { useTranslations } from "next-intl";

import { REPORT_INVOICE_EDITION_TABLE_GRID_CLASS } from "@/lib/reports/report-invoice-edition-table-layout";
import type { InvoiceNormalizationPreviewContent } from "@/core/types/reports";

type Props = {
    content: InvoiceNormalizationPreviewContent;
};

const TABLE_GRID = REPORT_INVOICE_EDITION_TABLE_GRID_CLASS;
const HEADER_CELL = "whitespace-nowrap leading-none";

export function ReportInvoiceNormalizationPreview({ content }: Props) {
    const t = useTranslations("reports.preview.invoiceNormalization");
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
                            <span className="font-black text-black">{t("company")} :</span>{" "}
                            {p.companyName}
                        </p>
                        <p>
                            <span className="font-black text-black">{t("nif")} :</span> {p.nif}
                        </p>
                        <p>
                            <span className="font-black text-black">{t("isf")} :</span> {p.isf}
                        </p>
                    </div>
                </div>

                <div className="md:text-right">
                    <p className="mb-3 text-sm font-black uppercase text-black">
                        {t("periodSection")}
                    </p>
                    <div className="space-y-1 text-sm font-semibold text-slate-800">
                        <p>
                            <span className="font-black text-black">{t("generatedAt")} :</span>{" "}
                            {p.generatedAt}
                        </p>
                        <p>
                            <span className="font-black text-black">{t("dateFrom")} :</span> {p.dateFrom}
                        </p>
                        <p>
                            <span className="font-black text-black">{t("dateTo")} :</span> {p.dateTo}
                        </p>
                    </div>
                </div>
            </div>

            <p className="mb-4 text-sm font-black uppercase text-black">{t("tableTitle")}</p>

            <div className="overflow-x-auto">
                <div
                    className={`${TABLE_GRID} items-center bg-slate-100 px-2 py-3 text-xs font-black uppercase text-black`}
                >
                    <div className={HEADER_CELL}>{t("columns.clientName")}</div>
                    <div className={`${HEADER_CELL} text-right`}>{t("columns.invoiceAmount")}</div>
                    <div className={`${HEADER_CELL} text-right`}>{t("columns.taxAmount")}</div>
                    <div className={`${HEADER_CELL} text-right`}>{t("columns.paidAmount")}</div>
                    <div className={`${HEADER_CELL} text-right`}>{t("columns.totalAmount")}</div>
                    <div className={HEADER_CELL}>{t("columns.currency")}</div>
                    <div className={HEADER_CELL}>{t("columns.invoiceType")}</div>
                    <div className={`${HEADER_CELL} text-right`}>{t("columns.dueDate")}</div>
                </div>

                {p.lineItems.length > 0 ? (
                    p.lineItems.map((row) => (
                        <div
                            key={`${row.clientName}-${row.invoiceType}-${row.dueDate}`}
                            className={`${TABLE_GRID} border-b border-slate-300 px-2 py-3 text-sm font-semibold text-slate-700`}
                        >
                            <div>{row.clientName}</div>
                            <div className="text-right">{row.invoiceAmount}</div>
                            <div className="text-right">{row.taxAmount}</div>
                            <div className="text-right">{row.paidAmount}</div>
                            <div className="text-right">{row.totalAmount}</div>
                            <div>{row.currency}</div>
                            <div>{row.invoiceType}</div>
                            <div className="text-right">{row.dueDate}</div>
                        </div>
                    ))
                ) : (
                    <p className="py-6 text-sm font-semibold text-slate-500">{t("empty")}</p>
                )}
            </div>

            <p className="mt-10 text-right text-xs text-slate-500">
                {t("page", { current: 1, total: 1 })}
            </p>
        </div>
    );
}
