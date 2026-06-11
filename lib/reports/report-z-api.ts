import type { ReportPreviewDisplay } from "@/core/types/reports";
import {
    buildReportXzSnapshotPreviewDisplay,
    parseReportXzSnapshotApiResponse,
    type ReportXzSnapshotApiResponse,
} from "@/lib/reports/report-xz-snapshot-api";

export const MOCK_REPORT_Z_API_RESPONSE: ReportXzSnapshotApiResponse = {
    session_id: 11,
    type: "Z",
    period_start: "2026-05-19",
    period_end: "2026-05-19",
    snapshot: {
        invoice_count: 15,
        total_ht: 11200,
        total_tva: 1792,
        total_ttc: 12992,
        total_paid: 9000,
        total_balance: 3992,
    },
    pdf_url: "https://cloud.ikwook.com/reports/42/Z_20260519_abc456.pdf",
};

export function parseReportZApiResponse(
    raw: unknown,
): ReportXzSnapshotApiResponse | null {
    return parseReportXzSnapshotApiResponse(raw, "Z");
}

export function buildReportZPreviewDisplayFromApi(
    response: ReportXzSnapshotApiResponse,
    emitter?: {
        profile?: Record<string, unknown> | null;
        user?: Record<string, unknown> | null;
    },
): ReportPreviewDisplay {
    return buildReportXzSnapshotPreviewDisplay(response, "z", emitter);
}
