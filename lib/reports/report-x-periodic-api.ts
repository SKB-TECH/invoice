import type { ReportPreviewDisplay } from "@/core/types/reports";
import {
    buildReportXzSnapshotPreviewDisplay,
    parseReportXzSnapshotApiResponse,
    type ReportXzSnapshotApiResponse,
} from "@/lib/reports/report-xz-snapshot-api";

export const MOCK_REPORT_X_PERIODIC_API_RESPONSE: ReportXzSnapshotApiResponse = {
    session_id: 12,
    type: "XP",
    period_start: "2026-04-01",
    period_end: "2026-04-30",
    snapshot: {
        invoice_count: 48,
        total_ht: 72000,
        total_tva: 11520,
        total_ttc: 83520,
        total_paid: 60000,
        total_balance: 23520,
    },
    pdf_url: "https://cloud.ikwook.com/reports/42/XP_20260501_ghi789.pdf",
};

export function parseReportXPeriodicApiResponse(
    raw: unknown,
): ReportXzSnapshotApiResponse | null {
    return parseReportXzSnapshotApiResponse(raw, "XP");
}

export function buildReportXPeriodicPreviewDisplayFromApi(
    response: ReportXzSnapshotApiResponse,
    emitter?: {
        profile?: Record<string, unknown> | null;
        user?: Record<string, unknown> | null;
    },
): ReportPreviewDisplay {
    return buildReportXzSnapshotPreviewDisplay(response, "x-periodic", emitter);
}
