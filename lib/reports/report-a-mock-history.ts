import type { ReportAHistoryItem } from "@/core/types/reports";
import {
    MOCK_REPORT_A_API_RESPONSE,
    mapReportAApiToHistoryItem,
} from "@/lib/reports/report-a-api";

export const MOCK_REPORT_A_HISTORY: ReportAHistoryItem[] = [
    mapReportAApiToHistoryItem(MOCK_REPORT_A_API_RESPONSE),
    {
        id: 19,
        periodStart: "19/05/2026",
        periodEnd: "31/05/2026",
        itemCount: 4,
        pdfUrl: "https://cloud.ikwook.com/reports/41/A_20260531_abc123.pdf",
    },
    {
        id: 18,
        periodStart: "01/04/2026",
        periodEnd: "30/04/2026",
        itemCount: 12,
        pdfUrl: "https://cloud.ikwook.com/reports/40/A_20260430_def456.pdf",
    },
];
