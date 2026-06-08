import type { ReportPreviewDisplay } from "@/core/types/reports";
import {
    buildReportXzSnapshotPreviewDisplay,
    parseReportXzSnapshotApiResponse,
    type ReportXzSnapshotApiResponse,
} from "@/lib/reports/report-xz-snapshot-api";

export const MOCK_REPORT_X_DAILY_API_RESPONSE: ReportXzSnapshotApiResponse = {
    session_id: 10,
    type: "X",
    period_start: "2026-05-19",
    period_end: "2026-05-19",
    snapshot: {
        invoice_count: 8,
        total_ht: 5400,
        total_tva: 864,
        total_ttc: 6264,
        total_paid: 4200,
        total_balance: 2064,
    },
    pdf_url: "https://cloud.ikwook.com/reports/42/X_20260519_def123.pdf",
};

export function parseReportXDailyApiResponse(
    raw: unknown,
): ReportXzSnapshotApiResponse | null {
    return parseReportXzSnapshotApiResponse(raw, "X");
}

export function buildReportXDailyPreviewDisplayFromApi(
    response: ReportXzSnapshotApiResponse,
    emitter?: {
        profile?: Record<string, unknown> | null;
        user?: Record<string, unknown> | null;
    },
): ReportPreviewDisplay {
    return buildReportXzSnapshotPreviewDisplay(response, "x-daily", emitter);
}
