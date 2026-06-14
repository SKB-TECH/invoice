"use client";

import React from "react";
import { useTranslations } from "next-intl";
import "chart.js/auto";
import { Chart, Doughnut } from "react-chartjs-2";
import type { ChartData, ChartOptions } from "chart.js";
import {
    AlertTriangle,
    CircleDollarSign,
    FileCheck2,
    HandCoins,
    TrendingUp,
    X,
} from "lucide-react";
import {useInvoiceDashboardOverview} from "@/core/hooks/useInvoiceDashboard";
import {DashboardSkeleton} from "@/components/dashboard/DashboardResponse";
import {useRouter} from "next/navigation";

const MONTH_COLORS = ["#0B83D8", "#18B85D", "#EAB53B", "#F04444"];

function formatNumber(value?: number) {
    return Number(value ?? 0).toLocaleString("fr-FR");
}

function formatCurrency(value?: number, currency?: string) {
    return `${currency ?? "CDF"} ${formatNumber(value)}`;
}

function normalizeText(value?: string) {
    return (value ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}


export default function InvoiceDashboard() {
    const t = useTranslations("invoiceDashboard");
    const [view, setView] = React.useState(true);
    const router = useRouter();
    const {
        data: dashboardResponse,
        isLoading,
        isError,
    } = useInvoiceDashboardOverview();

    if (isLoading) {
        return <DashboardSkeleton />;
    }

    if (isError || !dashboardResponse?.data) {
        return (
            <div className="flex min-h-[250px] items-center justify-center border border-red-100 bg-red-50 text-[14px] font-semibold text-red-600">
                {t("errors.loadingDashboard")}
            </div>
        );
    }
    const dashboard = dashboardResponse.data;

    const reminder = dashboard.rappel;

    const previousYearCard = dashboard.cards.find(
        (card) => card.key === "annee_passee"
    );

    const currentMonthCard = dashboard.cards.find(
        (card) => card.key === "mois_encours"
    );

    const normalizationCard = dashboard.cards.find(
        (card) => card.key === "normalisation_facture"
    );

    const normalizationValue =
        normalizationCard &&
        typeof normalizationCard.value === "object" &&
        normalizationCard.value !== null
            ? normalizationCard.value
            : {
                normalisees: 0,
                en_attente: 0,
            };

    const treasurySeries = dashboard.suivi_tresorerie?.series ?? [];

    const treasuryData: ChartData<"bar" | "line", number[], string> = {
        labels: treasurySeries.map((item) => item.month),
        datasets: [
            {
                type: "line" as const,
                label: t("charts.issuedInvoices"),
                data: treasurySeries.map(
                    (item) => item.total_facture_emise ?? 0
                ),
                borderColor: "#E9B63B",
                backgroundColor: "rgba(233, 182, 59, 0.12)",
                pointBackgroundColor: "#E9B63B",
                pointBorderColor: "#E9B63B",
                pointRadius: 3,
                pointHoverRadius: 4,
                borderWidth: 1,
                fill: true,
                tension: 0.45,
                order: 1,
            },
            {
                type: "bar" as const,
                label: t("charts.totalRevenue"),
                data: treasurySeries.map((item) => item.total_revenu ?? 0),
                backgroundColor: "#19B95A",
                borderRadius: 0,
                barThickness: 10,
                order: 2,
            },
            {
                type: "bar" as const,
                label: t("charts.totalDebt"),
                data: treasurySeries.map((item) => item.total_dette ?? 0),
                backgroundColor: "#F44747",
                borderRadius: 0,
                barThickness: 10,
                order: 2,
            },
        ],
    };

    const maxTreasuryValue = Math.max(
        ...treasurySeries.flatMap((item) => [
            item.total_facture_emise ?? 0,
            item.total_revenu ?? 0,
            item.total_dette ?? 0,
        ]),
        2500
    );

    const treasuryOptions: ChartOptions<"bar" | "line"> = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: "index" as const,
            intersect: false,
        },
        plugins: {
            legend: {
                position: "bottom" as const,
                labels: {
                    usePointStyle: true,
                    pointStyle: "circle",
                    boxWidth: 7,
                    boxHeight: 7,
                    padding: 24,
                    color: "#5D6675",
                    font: {
                        size: 10,
                        weight: 600 as const,
                    },
                },
            },
            tooltip: {
                enabled: true,
            },
        },
        scales: {
            x: {
                grid: {
                    color: "#F1F3F5",
                    drawTicks: false,
                },
                border: {
                    display: false,
                },
                ticks: {
                    color: "#7B8494",
                    font: {
                        size: 10,
                    },
                },
            },
            y: {
                min: 0,
                max: maxTreasuryValue,
                ticks: {
                    color: "#5D6675",
                    font: {
                        size: 10,
                    },
                    callback: (value: string | number) => {
                        const numericValue = Number(value);

                        if (numericValue === 0) return "0.00";

                        return numericValue.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        });
                    },
                },
                grid: {
                    display: false,
                },
                border: {
                    display: false,
                },
            },
        },
    };

    const currentMonthItems = dashboard.mois_en_cours?.items ?? [];

    const issuedItem = currentMonthItems[0];
    const paidItem = currentMonthItems[1];
    const pendingItem = currentMonthItems[2];
    const cancelledItem = currentMonthItems[3];

    const monthlyStats = [
        {
            label: t("monthlyStats.issued"),
            count: issuedItem?.count ?? 0,
            amount: formatCurrency(
                issuedItem?.amount,
                issuedItem?.currency ?? "CDF"
            ),
            color: MONTH_COLORS[0],
        },
        {
            label: t("monthlyStats.paid"),
            count: paidItem?.count ?? 0,
            amount: formatCurrency(
                paidItem?.amount,
                paidItem?.currency ?? "CDF"
            ),
            color: MONTH_COLORS[1],
        },
        {
            label: t("monthlyStats.pending"),
            count: pendingItem?.count ?? 0,
            amount: formatCurrency(
                pendingItem?.amount,
                pendingItem?.currency ?? "CDF"
            ),
            color: MONTH_COLORS[2],
        },
        {
            label: t("monthlyStats.cancelled"),
            count: cancelledItem?.count ?? 0,
            amount: formatCurrency(
                cancelledItem?.amount,
                cancelledItem?.currency ?? "CDF"
            ),
            color: MONTH_COLORS[3],
        },
    ];

    const monthlyData = {
        labels: monthlyStats.map((item) => item.label),
        datasets: [
            {
                data: monthlyStats.map((item) => item.count),
                backgroundColor: monthlyStats.map((item) => item.color),
                borderWidth: 0,
                cutout: "73%",
            },
        ],
    };

    const monthlyOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                enabled: true,
            },
        },
    };

    const translateTrackingStatus = (status?: string) => {
        const normalized = normalizeText(status);

        if (normalized === "paye" || normalized === "payee") {
            return t("status.paid");
        }

        if (
            normalized === "non paye" ||
            normalized === "non payee" ||
            normalized === "impaye"
        ) {
            return t("status.unpaid");
        }

        return status ?? "-";
    };

    const translateNormalizationStatus = (status?: string) => {
        const normalized = normalizeText(status);

        if (normalized === "paye" || normalized === "payee") {
            return t("status.paidMasculine");
        }

        if (
            normalized === "non paye" ||
            normalized === "non payee" ||
            normalized === "impaye"
        ) {
            return t("status.unpaid");
        }

        return status ?? "-";
    };

    const invoiceRows = dashboard.tables?.suivi_facture ?? [];
    const normalizationRows =
        dashboard.tables?.normalisation_facture ?? [];

    const StatusBadge = ({ status }: { status: string }) => {
        const normalized = normalizeText(status);
        const paidStatus = normalizeText(t("status.paid"));
        const paidMasculineStatus = normalizeText(t("status.paidMasculine"));

        const isPaid =
            normalized === paidStatus || normalized === paidMasculineStatus;

        return (
            <span
                className={`inline-flex items-center px-2 py-1 text-[10px] font-semibold ${
                    isPaid
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-amber-100 text-amber-600"
                }`}
            >
                {status}
            </span>
        );
    };


    return (
        <div className="min-h-full w-full text-[#4E5866]">
            <div className="mx-auto w-full">
                {view && Number(reminder?.amount ?? 0) > 0 && (
                    <div className="mb-4 flex min-h-[58px] items-center justify-between border border-[#F3B35E] bg-[#FFF3E3] px-5">
                        <div className="flex items-center gap-4">
                            <AlertTriangle className="h-5 w-5 text-[#F39A23]" />

                            <p className="text-[13px] font-semibold text-[#F07A00]">
                                {t("alert.message")}{" "}
                                <span className="font-bold">
                    {formatNumber(reminder?.amount)}{" "}
                                    {reminder?.currency ?? "CDF"}
                </span>
                            </p>
                        </div>

                        <button
                            type="button"
                            className="flex h-7 w-7 items-center justify-center text-[#F39A23]"
                            onClick={() => setView(false)}
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-12 gap-4">
                    {/* CARD 1 */}
                    <div className="col-span-12 border border-[#E2E5E9] bg-white xl:col-span-3">
                        <div className="flex h-[140px] items-center justify-center px-5">
                            <div className="grid w-full grid-cols-[42px_1fr] items-center gap-5">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EDF4FF]">
                                    <CircleDollarSign className="h-5 w-5 text-[#5D94E5]" />
                                </div>

                                <div>
                                    <h3 className="text-[15px] font-bold uppercase leading-none text-[#0074C8]">
                                        {t("cards.previousYear")}
                                    </h3>

                                    <p className="mt-4 text-[22px] font-bold leading-none text-[#49515C]">
                                        <span className="mr-2 text-[13px] font-bold text-[#5D6675]">
                                            CDF
                                        </span>
                                        {formatNumber(
                                            typeof previousYearCard?.value ===
                                            "number"
                                                ? previousYearCard.value
                                                : 0
                                        )}
                                    </p>

                                    <p className="mt-5 text-[9px] font-bold uppercase leading-none text-[#0074C8]">
                                        {t("cards.totalVatCollected")}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CARD 2 */}
                    <div className="col-span-12 border border-[#E2E5E9] bg-white xl:col-span-3">
                        <div className="flex h-[140px] items-center justify-center px-5">
                            <div className="grid w-full grid-cols-[42px_1fr] items-center gap-5">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EDF4FF]">
                                    <HandCoins className="h-5 w-5 text-[#5D94E5]" />
                                </div>

                                <div>
                                    <h3 className="text-[15px] font-bold uppercase leading-none text-[#0074C8]">
                                        {t("cards.currentMonth")}
                                    </h3>

                                    <p className="mt-4 text-[22px] font-bold leading-none text-[#49515C]">
                                        <span className="mr-2 text-[13px] font-bold text-[#5D6675]">
                                            CDF
                                        </span>
                                        {formatNumber(
                                            typeof currentMonthCard?.value ===
                                            "number"
                                                ? currentMonthCard.value
                                                : 0
                                        )}
                                    </p>

                                    <p className="mt-5 text-[9px] font-bold uppercase leading-none text-[#0074C8]">
                                        {t("cards.totalVatReversed")}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CARD 3 */}
                    <div className="col-span-12 border border-[#E2E5E9] bg-white xl:col-span-3">
                        <div className="flex h-[140px] items-center justify-center px-5">
                            <div className="grid w-full grid-cols-[42px_1fr] items-center gap-5">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EDF4FF]">
                                    <FileCheck2 className="h-5 w-5 text-[#5D94E5]" />
                                </div>

                                <div>
                                    <h3 className="text-[15px] font-bold uppercase leading-none text-[#0074C8]">
                                        {t("cards.invoiceNormalization")}
                                    </h3>

                                    <div className="mt-4 grid grid-cols-[1fr_1px_1fr] items-start">
                                        <div className="text-left">
                                            <p className="text-[22px] font-bold leading-none text-[#49515C]">
                                                {formatNumber(
                                                    normalizationValue.normalisees
                                                )}
                                            </p>

                                            <p className="mt-5 text-[9px] font-bold uppercase leading-[12px] text-[#0074C8]">
                                                {t(
                                                    "cards.totalNormalizedInvoice"
                                                )}
                                            </p>
                                        </div>

                                        <div className="mx-auto h-[55px] w-px bg-[#D7DDE4]" />

                                        <div className="pl-5 text-left">
                                            <p className="text-[22px] font-bold leading-none text-[#49515C]">
                                                {formatNumber(
                                                    normalizationValue.en_attente
                                                )}
                                            </p>

                                            <p className="mt-5 text-[9px] font-bold uppercase leading-[12px] text-[#0074C8]">
                                                {t(
                                                    "cards.pendingNormalization"
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CARD 4 */}
                    <div className="col-span-12 border border-[#E2E5E9] bg-white xl:col-span-3">
                        <div className="flex h-[140px] items-center justify-center px-5">
                            <div className="grid w-full grid-cols-[42px_1fr] items-center gap-5">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF3D7]">
                                    <TrendingUp className="h-5 w-5 text-[#EAB53B]" />
                                </div>

                                <div>
                                    <h3 className="text-[15px] font-bold uppercase leading-none text-[#EAB53B]">
                                        {t("cards.invoiceStatistics")}
                                    </h3>

                                    <div className="mt-4 grid grid-cols-[1fr_1px_1fr] items-start">
                                        <div className="text-left">
                                            <p className="text-[22px] font-bold leading-none text-[#49515C]">
                                                {formatNumber(
                                                    paidItem?.count ?? 0
                                                )}
                                            </p>

                                            <p className="mt-5 text-[9px] font-bold uppercase leading-[12px] text-[#EAB53B]">
                                                {t("cards.paidInvoices")}
                                            </p>
                                        </div>

                                        <div className="mx-auto h-[55px] w-px bg-[#D7DDE4]" />

                                        <div className="pl-5 text-left">
                                            <p className="text-[22px] font-bold leading-none text-[#49515C]">
                                                {formatNumber(
                                                    pendingItem?.count ?? 0
                                                )}
                                            </p>

                                            <p className="mt-5 text-[9px] font-bold uppercase leading-[12px] text-[#EAB53B]">
                                                {t("cards.unpaidInvoices")}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SUIVI DE TRESORERIE */}
                    <div className="col-span-12 border border-[#E2E5E9] bg-white xl:col-span-7">
                        <div className="border-b border-[#E7EBEF] px-5 py-5">
                            <h2 className="text-[15px] font-bold uppercase text-[#4D5662]">
                                {t("sections.cashFlowTracking")}
                            </h2>
                        </div>

                        <div className="grid grid-cols-3 border-b border-[#E7EBEF] px-8 py-5 text-center">
                            <div className="text-[12px] font-semibold text-[#4D5662]">
                                {formatNumber(
                                    treasurySeries.reduce(
                                        (total, item) =>
                                            total +
                                            (item.total_facture_emise ?? 0),
                                        0
                                    )
                                )}{" "}
                                USD
                            </div>

                            <div className="text-[12px] font-semibold text-[#4D5662]">
                                {formatNumber(
                                    treasurySeries.reduce(
                                        (total, item) =>
                                            total + (item.total_revenu ?? 0),
                                        0
                                    )
                                )}{" "}
                                USD
                            </div>

                            <div className="text-[12px] font-semibold text-[#16B95B]">
                                {formatNumber(
                                    treasurySeries.reduce(
                                        (total, item) =>
                                            total + (item.total_dette ?? 0),
                                        0
                                    )
                                )}{" "}
                                USD
                            </div>
                        </div>

                        <div className="h-[315px] px-4 pb-4 pt-6">
                            <Chart
                                type="bar"
                                data={treasuryData}
                                options={treasuryOptions}
                            />
                        </div>
                    </div>

                    {/* MOIS EN COURS */}
                    <div className="col-span-12 border border-[#E2E5E9] bg-white xl:col-span-5">
                        <div className="border-b border-[#E7EBEF] px-5 py-5">
                            <h2 className="text-[15px] font-bold uppercase text-[#4D5662]">
                                {t("sections.currentMonth")}
                            </h2>
                        </div>

                        <div className="flex justify-center px-5 pb-5 pt-4">
                            <div className="h-[180px] w-[180px]">
                                <Doughnut
                                    data={monthlyData}
                                    options={monthlyOptions}
                                />
                            </div>
                        </div>

                        <div className="px-8 pb-6">
                            {monthlyStats.map((item) => (
                                <div
                                    key={item.label}
                                    className="grid grid-cols-[1fr_55px_95px] items-center border-b border-[#EEF1F4] py-3 text-[11px]"
                                >
                                    <div className="flex items-center gap-4">
                                        <span
                                            className="h-3.5 w-3.5 rounded-full"
                                            style={{
                                                backgroundColor: item.color,
                                            }}
                                        />

                                        <span className="font-medium text-[#5D6675]">
                                            {item.label}
                                        </span>
                                    </div>

                                    <span className="text-center font-semibold text-[#4D5662]">
                                        {formatNumber(item.count)}
                                    </span>

                                    <span className="text-right font-semibold text-[#4D5662]">
                                        {item.amount}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* SUIVI FACTURE */}
                    <div className="col-span-12 border border-[#E2E5E9] bg-white xl:col-span-7">
                        <div className="flex items-center justify-between border-b border-[#E7EBEF] px-5 py-5">
                            <h2 className="text-[15px] font-bold uppercase text-[#4D5662]">
                                {t("sections.invoiceTracking")}
                            </h2>

                            <button
                                type="button"
                                className="text-[14px] font-semibold text-[#4D5662]"
                                onClick={() => router.push("/home/factures")}
                            >

                                {t("actions.viewMore")}
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left">
                                <thead>
                                <tr className="border-b border-[#E7EBEF] bg-[#FAFBFC] text-[12px] font-bold text-[#838C9A]">
                                    <th className="px-5 py-4">
                                        {t("table.date")}
                                    </th>
                                    <th className="px-5 py-4">
                                        {t("table.client")}
                                    </th>
                                    <th className="px-5 py-4">
                                        {t("table.reference")}
                                    </th>
                                    <th className="px-5 py-4">
                                        {t("table.amount")}
                                    </th>
                                    <th className="px-5 py-4">
                                        {t("table.status")}
                                    </th>
                                    <th className="px-5 py-4">
                                        {t("table.creation")}
                                    </th>
                                </tr>
                                </thead>

                                <tbody>
                                {invoiceRows.map((invoice, index) => {
                                    const status =
                                        translateTrackingStatus(
                                            invoice.statut
                                        );

                                    return (
                                        <tr
                                            key={`${invoice.ref}-${invoice.client}-${index}`}
                                            className="border-b border-[#E7EBEF] text-[11px] font-semibold text-[#4D5662]"
                                        >
                                            <td className="px-5 py-5">
                                                {invoice.date}
                                            </td>

                                            <td className="px-5 py-5">
                                                {invoice.client}
                                            </td>

                                            <td className="px-5 py-5">
                                                {invoice.ref}
                                            </td>

                                            <td className="px-5 py-5">
                                                {formatNumber(
                                                    invoice.montant
                                                )}
                                            </td>

                                            <td className="px-5 py-5">
                                                <StatusBadge
                                                    status={status}
                                                />
                                            </td>

                                            <td className="px-5 py-5">
                                                {invoice.creation}
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* NORMALISATION FACTURE */}
                    <div className="col-span-12 border border-[#E2E5E9] bg-white xl:col-span-5">
                        <div className="border-b border-[#E7EBEF] px-5 py-5">
                            <h2 className="text-[15px] font-bold uppercase text-[#4D5662]">
                                {t("sections.invoiceNormalization")}
                            </h2>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left">
                                <thead>
                                <tr className="border-b border-[#E7EBEF] bg-[#FAFBFC] text-[12px] font-bold text-[#838C9A]">
                                    <th className="px-4 py-4">
                                        {t("table.date")}
                                    </th>
                                    <th className="px-4 py-4">
                                        {t("table.client")}
                                    </th>
                                    <th className="px-4 py-4">
                                        {t("table.amount")}
                                    </th>
                                    <th className="px-4 py-4">
                                        {t("table.status")}
                                    </th>
                                </tr>
                                </thead>

                                <tbody>
                                {normalizationRows.map((item, index) => {
                                    const status =
                                        translateNormalizationStatus(
                                            item.statut
                                        );

                                    return (
                                        <tr
                                            key={`${item.client}-${item.date}-${index}`}
                                            className="border-b border-[#E7EBEF] text-[11px] font-semibold text-[#4D5662]"
                                        >
                                            <td className="px-4 py-5">
                                                {item.date}
                                            </td>

                                            <td className="px-4 py-5">
                                                {item.client}
                                            </td>

                                            <td className="px-4 py-5">
                                                {formatNumber(
                                                    item.montant
                                                )}
                                            </td>

                                            <td className="px-4 py-5">
                                                {status}
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
