"use client";

import React from "react";
import {
    Bar,
    Line,
    Doughnut,
} from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";
import {
    FileText,
    Wallet,
    ClipboardList,
} from "lucide-react";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Tooltip,
    Legend,
    Filler
);

const cards = [
    {
        title: "TOTAL TVA COLLECTÉE",
        value: "11,000",
        subtitle: "Année en cours",
        icon: FileText,
        color: "text-yellow-500",
        bg: "bg-yellow-50",
    },
    {
        title: "TOTAL TVA COLLECTÉE",
        value: "5,000",
        subtitle: "Mois encours",
        icon: Wallet,
        color: "text-green-500",
        bg: "bg-green-50",
    },
    {
        title: "TOTAL TVA VERSÉE",
        value: "6,000",
        subtitle: "Mois en cours",
        icon: ClipboardList,
        color: "text-blue-500",
        bg: "bg-blue-50",
    },
];

const pendingPayments = [
    ["Rawbank", "00-2001-PMO", "10,000 $", "Non payée", "12-05-2026"],
    ["Castilo", "00-2001-PMO", "10,000 $", "Payée", "12-05-2026"],
    ["EquityBCDC", "00-2001-PMO", "10,000 $", "Payée", "12-05-2026"],
    ["Standard bank", "00-2001-PMO", "10,000 $", "Payée", "12-05-2026"],
    ["Access Bank", "00-2001-PMO", "10,000 $", "Payée", "12-05-2026"],
];

const paidPayments = [
    ["Rawbank", "00-2001-PMO", "10,000 $", "Payé"],
    ["Castilo", "00-2001-PMO", "10,000 $", "Payé"],
    ["EquityBCDC", "00-2001-PMO", "10,000 $", "Payé"],
    ["Standard bank", "00-2001-PMO", "10,000 $", "Payé"],
    ["Access Bank", "00-2001-PMO", "10,000 $", "Payé"],
];

const months = ["Ja", "Fe", "Ma", "Av", "Ma", "Jn", "Ju", "Ao", "Sep", "Oct", "Nov", "Dec"];

const barData = {
    labels: months,
    datasets: [
        {
            type: "bar" as const,
            label: "Total factures payées",
            data: [40, 34, 22, 45, 33, 20, 25, 30, 45, 23, 34, 52],
            backgroundColor: "#5b8ee6",
            borderWidth: 0,
            barThickness: 9,
            order: 2,
        },
        {
            type: "bar" as const,
            label: "Total factures non payées",
            data: [15, 15, 13, 15, 12, 14, 12, 14, 15, 14, 15, 15],
            backgroundColor: "#16c784",
            borderWidth: 0,
            barThickness: 9,
            order: 2,
        },
        {
            type: "line" as const,
            label: "Total factures à payer",
            data: [28, 32, 43, 25, 26, 24, 24, 33, 46, 47, 47, 46],
            borderColor: "#f1c15b",
            backgroundColor: "rgba(241,193,91,0.25)",
            fill: true,
            tension: 0.45,
            pointRadius: 0,
            borderWidth: 0,
            order: 1,
        },
    ],
};

const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: "bottom" as const,
            labels: {
                usePointStyle: true,
                boxWidth: 6,
                boxHeight: 6,
                padding: 18,
                font: {
                    size: 10,
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
                display: false,
            },
            ticks: {
                color: "#64748b",
                font: {
                    size: 10,
                },
            },
            border: {
                display: false,
            },
        },
        y: {
            display: false,
            grid: {
                display: false,
            },
        },
    },
};

const doughnutData = {
    labels: [
        "Factures émises",
        "Factures payés",
        "Factures en attente",
        "Factures annulés",
        "Contrat encours",
    ],
    datasets: [
        {
            data: [122, 12, 12, 12, 12],
            backgroundColor: [
                "#13c784",
                "#e7b63f",
                "#f3c55d",
                "#5b8ee6",
                "#13c784",
            ],
            borderWidth: 0,
            cutout: "72%",
        },
    ],
};

const doughnutOptions = {
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

export default function InvoiceDashboard() {
    return (
        <div className="min-h-screen text-slate-700">
            <div className="grid grid-cols-12 gap-5">
                <div className="col-span-12 lg:col-span-7">
                    <div className="grid grid-cols-3 gap-5">
                        {cards.map((card) => {
                            const Icon = card.icon;
                            return (
                                <div
                                    key={card.title + card.value}
                                    className="border border-slate-200 bg-white px-5 py-4"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`flex h-8 w-8 items-center justify-center ${card.bg}`}>
                                            <Icon className={`h-4 w-4 ${card.color}`} />
                                        </div>

                                        <div>
                                            <p className="text-[10px] font-semibold uppercase text-slate-400">
                                                {card.title}
                                            </p>
                                            <h3 className="mt-1 text-lg font-bold text-slate-800">
                                                {card.value}
                                            </h3>
                                            <p className="mt-1 text-[10px] text-slate-400">
                                                {card.subtitle}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-6 border border-slate-200 bg-white">
                        <div className="border-b border-slate-200 px-5 py-4">
                            <h2 className="text-[13px] font-semibold text-slate-700">
                                Projects Overview
                            </h2>
                        </div>

                        <div className="flex justify-around border-b border-slate-100 px-8 py-5 text-[10px] font-semibold text-slate-500">
                            <span>825.25</span>
                            <span>825.25</span>
                            <span>825.25</span>
                            <span className="text-green-500">825.25</span>
                        </div>

                        <div className="h-[260px] px-6 py-4">
                            <Bar data={barData as any} options={barOptions as any} />
                        </div>
                    </div>
                </div>

                <div className="col-span-12 border border-slate-200 bg-white lg:col-span-5">
                    <div className="border-b border-slate-200 px-5 py-4">
                        <h2 className="text-[13px] font-semibold text-slate-700">
                            Mois encours
                        </h2>
                    </div>

                    <div className="flex justify-center py-8">
                        <div className="h-[190px] w-[190px]">
                            <Doughnut data={doughnutData} options={doughnutOptions} />
                        </div>
                    </div>

                    <div className="px-8 pb-8">
                        {doughnutData.labels.map((label, index) => (
                            <div
                                key={label}
                                className="grid grid-cols-[1fr_40px_80px] items-center gap-3 border-b border-slate-100 py-3 text-[11px]"
                            >
                                <div className="flex items-center gap-2">
                  <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{
                          backgroundColor:
                              doughnutData.datasets[0].backgroundColor[index],
                      }}
                  />
                                    <span className="text-slate-600">{label}</span>
                                </div>

                                <span className="text-right text-slate-700">
                  {doughnutData.datasets[0].data[index]}
                </span>

                                <span className="text-right font-semibold text-green-500">
                  10,000 $
                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="col-span-12 border border-slate-200 bg-white lg:col-span-7">
                    <div className="border-b border-slate-200 px-5 py-4">
                        <h2 className="text-[13px] font-semibold text-slate-700">
                            Derniers paiements des factures en attente
                        </h2>
                    </div>

                    <table className="w-full border-collapse text-left text-[11px]">
                        <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                            <th className="px-5 py-3 font-semibold">Cliens</th>
                            <th className="px-5 py-3 font-semibold">Référence</th>
                            <th className="px-5 py-3 font-semibold">Montant</th>
                            <th className="px-5 py-3 font-semibold">Statut</th>
                            <th className="px-5 py-3 font-semibold">Date</th>
                        </tr>
                        </thead>

                        <tbody>
                        {pendingPayments.map((row, index) => (
                            <tr key={index} className="border-b border-slate-100">
                                <td className="px-5 py-4">{row[0]}</td>
                                <td className="px-5 py-4">{row[1]}</td>
                                <td className="px-5 py-4">{row[2]}</td>
                                <td className="px-5 py-4">
                    <span
                        className={`px-2 py-1 text-[10px] font-semibold ${
                            row[3] === "Non payée"
                                ? "bg-yellow-50 text-yellow-600"
                                : "bg-green-50 text-green-600"
                        }`}
                    >
                      {row[3]}
                    </span>
                                </td>
                                <td className="px-5 py-4">{row[4]}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                <div className="col-span-12 border border-slate-200 bg-white lg:col-span-5">
                    <div className="border-b border-slate-200 px-5 py-4">
                        <h2 className="text-[13px] font-semibold text-slate-700">
                            Derniers paiements des factures en attente
                        </h2>
                    </div>

                    <table className="w-full border-collapse text-left text-[11px]">
                        <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                            <th className="px-5 py-3 font-semibold">Cliens</th>
                            <th className="px-5 py-3 font-semibold">Référence</th>
                            <th className="px-5 py-3 font-semibold">Montant</th>
                            <th className="px-5 py-3 font-semibold">Statut</th>
                        </tr>
                        </thead>

                        <tbody>
                        {paidPayments.map((row, index) => (
                            <tr key={index} className="border-b border-slate-100">
                                <td className="px-5 py-4">{row[0]}</td>
                                <td className="px-5 py-4">{row[1]}</td>
                                <td className="px-5 py-4">{row[2]}</td>
                                <td className="px-5 py-4 font-semibold text-slate-700">
                                    {row[3]}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>


        </div>
    );
}
