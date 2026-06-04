import type { ReportAHistoryItem } from "@/core/types/reports";

export const MOCK_REPORT_A_HISTORY: ReportAHistoryItem[] = [
    {
        id: 3,
        generatedAt: "01/06/2026 14:32",
        dateFrom: "01/05/2026",
        dateTo: "31/05/2026",
        isf: "IKW-SYS-998877",
        pointOfSale: "Point principal",
    },
    {
        id: 2,
        generatedAt: "15/05/2026 09:15",
        dateFrom: "01/04/2026",
        dateTo: "30/04/2026",
        isf: "IKW-SYS-998877",
        pointOfSale: "Point principal",
    },
    {
        id: 1,
        generatedAt: "02/04/2026 16:48",
        dateFrom: "01/03/2026",
        dateTo: "31/03/2026",
        isf: "IKW-TERM-002",
        pointOfSale: "Annexe Gombe",
    },
];
