import type { ReportAFilters, ReportPreviewDisplay } from "@/core/types/reports";
import {
    MOCK_REPORT_A_API_RESPONSE,
    buildReportAPreviewDisplayFromApi,
} from "@/lib/reports/report-a-api";

export function toReportAFilters(
    filters: Record<string, unknown>,
): ReportAFilters {
    return {
        period_start:
            typeof filters.period_start === "string"
                ? filters.period_start
                : typeof filters.date_from === "string"
                  ? filters.date_from
                  : undefined,
        period_end:
            typeof filters.period_end === "string"
                ? filters.period_end
                : typeof filters.date_to === "string"
                  ? filters.date_to
                  : undefined,
    };
}

export function buildReportAPreviewDisplay(
    filters: ReportAFilters,
    emitter?: {
        profile?: Record<string, unknown> | null;
        user?: Record<string, unknown> | null;
    },
): ReportPreviewDisplay {
    const response = {
        ...MOCK_REPORT_A_API_RESPONSE,
        period_start: filters.period_start ?? MOCK_REPORT_A_API_RESPONSE.period_start,
        period_end: filters.period_end ?? MOCK_REPORT_A_API_RESPONSE.period_end,
    };

    return buildReportAPreviewDisplayFromApi(response, emitter);
}
