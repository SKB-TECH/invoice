import type {
    ReportPreviewDisplay,
    ReportXPeriodicApiSnapshot,
    ReportXPeriodicPreviewContent,
} from "@/core/types/reports";
import { formatReportGeneratedAt } from "@/lib/reports/build-report-display";
import { extractReportEmitter } from "@/lib/reports/extract-report-emitter";

export type ReportXzSnapshotApiResponse = {
    session_id: number;
    type: string;
    period_start: string;
    period_end: string;
    snapshot: ReportXPeriodicApiSnapshot;
    pdf_url?: string;
};

function formatReportDateLabel(value?: string): string {
    if (!value?.trim()) return "—";

    const parsed = new Date(`${value.trim()}T12:00:00`);
    if (Number.isNaN(parsed.getTime())) return value;

    return new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    }).format(parsed);
}

function formatReportAmount(value: number): string {
    return new Intl.NumberFormat("fr-FR", {
        maximumFractionDigits: 2,
        minimumFractionDigits: 0,
    }).format(value);
}

export function parseReportXzSnapshotApiResponse(
    raw: unknown,
    defaultType: string,
): ReportXzSnapshotApiResponse | null {
    if (!raw || typeof raw !== "object") return null;

    const body = raw as Record<string, unknown>;
    const nested =
        body.data && typeof body.data === "object"
            ? (body.data as Record<string, unknown>)
            : body;

    const sessionId = nested.session_id;
    const periodStart = nested.period_start;
    const periodEnd = nested.period_end;
    const snapshot = nested.snapshot;

    if (
        typeof sessionId !== "number" ||
        typeof periodStart !== "string" ||
        typeof periodEnd !== "string" ||
        !snapshot ||
        typeof snapshot !== "object"
    ) {
        return null;
    }

    const snap = snapshot as Record<string, unknown>;
    const requiredNumbers = [
        "invoice_count",
        "total_ht",
        "total_tva",
        "total_ttc",
        "total_paid",
        "total_balance",
    ] as const;

    if (!requiredNumbers.every((key) => typeof snap[key] === "number")) {
        return null;
    }

    return {
        session_id: sessionId,
        type: typeof nested.type === "string" ? nested.type : defaultType,
        period_start: periodStart,
        period_end: periodEnd,
        snapshot: {
            invoice_count: snap.invoice_count as number,
            total_ht: snap.total_ht as number,
            total_tva: snap.total_tva as number,
            total_ttc: snap.total_ttc as number,
            total_paid: snap.total_paid as number,
            total_balance: snap.total_balance as number,
        },
        pdf_url:
            typeof nested.pdf_url === "string" ? nested.pdf_url : undefined,
    };
}

export function buildReportXzSnapshotPreviewContent(
    response: ReportXzSnapshotApiResponse,
    emitter?: {
        profile?: Record<string, unknown> | null;
        user?: Record<string, unknown> | null;
    },
): ReportXPeriodicPreviewContent {
    const emitterIdentity = extractReportEmitter(
        emitter?.profile,
        emitter?.user,
    );
    const snapshot = response.snapshot;

    return {
        generatedAt: formatReportGeneratedAt(),
        dateFrom: formatReportDateLabel(response.period_start),
        dateTo: formatReportDateLabel(response.period_end),
        companyName: emitterIdentity.companyName,
        logoUrl: emitterIdentity.logoUrl,
        nif: emitterIdentity.nif,
        invoiceCount: snapshot.invoice_count,
        totalHt: formatReportAmount(snapshot.total_ht),
        totalTva: formatReportAmount(snapshot.total_tva),
        totalTtc: formatReportAmount(snapshot.total_ttc),
        totalPaid: formatReportAmount(snapshot.total_paid),
        totalBalance: formatReportAmount(snapshot.total_balance),
    };
}

export function buildReportXzSnapshotPreviewDisplay(
    response: ReportXzSnapshotApiResponse,
    variant: "z" | "x-periodic" | "x-daily",
    emitter?: {
        profile?: Record<string, unknown> | null;
        user?: Record<string, unknown> | null;
    },
): ReportPreviewDisplay {
    return {
        variant,
        content: buildReportXzSnapshotPreviewContent(response, emitter),
    };
}
