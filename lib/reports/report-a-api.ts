import type {
    ReportAApiResponse,
    ReportAHistoryItem,
    ReportALineItem,
    ReportAPreviewContent,
    ReportPreviewDisplay,
} from "@/core/types/reports";
import { formatReportGeneratedAt } from "@/lib/reports/build-report-display";
import { extractReportEmitter } from "@/lib/reports/extract-report-emitter";

export const MOCK_REPORT_A_API_RESPONSE: ReportAApiResponse = {
    session_id: 20,
    type: "A",
    period_start: "2026-05-19",
    period_end: "2026-06-02",
    snapshot: {
        item_count: 1,
        items: [
            {
                item_type: 2,
                item_id: 15,
                code: "ART-15",
                name: "Cartouche",
                unit_price: 10,
                tax_rate: 16,
                quantity_sold: 22,
                quantity_returned: 1,
                stock_quantity: 150,
            },
        ],
    },
    pdf_url: "https://cloud.ikwook.com/reports/42/A_20261231_xyz999.pdf",
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

function formatShortDateLabel(value?: string): string {
    if (!value?.trim()) return "—";

    const parsed = new Date(`${value.trim()}T12:00:00`);
    if (Number.isNaN(parsed.getTime())) return value;

    return new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(parsed);
}

function mapSnapshotItem(item: ReportAApiResponse["snapshot"]["items"][number]): ReportALineItem {
    return {
        code: item.code,
        designation: item.name,
        unitPrice: item.unit_price,
        currency: "USD",
        tax: `${item.tax_rate}%`,
        qtySold: item.quantity_sold,
        qtyReturned: item.quantity_returned,
        fiscalStock: item.stock_quantity,
    };
}

function sumField(items: ReportALineItem[], key: keyof ReportALineItem): number {
    return items.reduce((sum, item) => sum + Number(item[key]), 0);
}

export function filenameFromReportAPdfUrl(pdfUrl: string, fallback = "rapport-a.pdf"): string {
    try {
        const segment = new URL(pdfUrl).pathname.split("/").pop();
        return segment?.trim() ? segment : fallback;
    } catch {
        return fallback;
    }
}

export function parseReportAApiResponse(raw: unknown): ReportAApiResponse | null {
    if (!raw || typeof raw !== "object") return null;

    const body = raw as Record<string, unknown>;
    const nested =
        body.data && typeof body.data === "object"
            ? (body.data as Record<string, unknown>)
            : body;

    const sessionId = nested.session_id;
    const periodStart = nested.period_start;
    const periodEnd = nested.period_end;
    const pdfUrl = nested.pdf_url;
    const snapshot = nested.snapshot;

    if (
        typeof sessionId !== "number" ||
        typeof periodStart !== "string" ||
        typeof periodEnd !== "string" ||
        typeof pdfUrl !== "string" ||
        !snapshot ||
        typeof snapshot !== "object"
    ) {
        return null;
    }

    const snap = snapshot as Record<string, unknown>;
    const items = Array.isArray(snap.items) ? snap.items : [];

    const parsedItems = items
        .map((item) => {
            if (!item || typeof item !== "object") return null;
            const row = item as Record<string, unknown>;
            if (
                typeof row.code !== "string" ||
                typeof row.name !== "string" ||
                typeof row.unit_price !== "number" ||
                typeof row.tax_rate !== "number" ||
                typeof row.quantity_sold !== "number" ||
                typeof row.quantity_returned !== "number" ||
                typeof row.stock_quantity !== "number"
            ) {
                return null;
            }

            return {
                item_type:
                    typeof row.item_type === "number" ? row.item_type : 0,
                item_id: typeof row.item_id === "number" ? row.item_id : 0,
                code: row.code,
                name: row.name,
                unit_price: row.unit_price,
                tax_rate: row.tax_rate,
                quantity_sold: row.quantity_sold,
                quantity_returned: row.quantity_returned,
                stock_quantity: row.stock_quantity,
            };
        })
        .filter(
            (item): item is ReportAApiResponse["snapshot"]["items"][number] =>
                item !== null,
        );

    return {
        session_id: sessionId,
        type: typeof nested.type === "string" ? nested.type : "A",
        period_start: periodStart,
        period_end: periodEnd,
        snapshot: {
            item_count:
                typeof snap.item_count === "number"
                    ? snap.item_count
                    : parsedItems.length,
            items: parsedItems,
        },
        pdf_url: pdfUrl,
    };
}

export function buildReportAPreviewDisplayFromApi(
    response: ReportAApiResponse,
    emitter?: {
        profile?: Record<string, unknown> | null;
        user?: Record<string, unknown> | null;
    },
): ReportPreviewDisplay {
    const lineItems = response.snapshot.items.map(mapSnapshotItem);
    const emitterIdentity = extractReportEmitter(
        emitter?.profile,
        emitter?.user,
    );

    const content: ReportAPreviewContent = {
        generatedAt: formatReportGeneratedAt(),
        dateFrom: formatReportDateLabel(response.period_start),
        dateTo: formatReportDateLabel(response.period_end),
        companyName: emitterIdentity.companyName,
        logoUrl: emitterIdentity.logoUrl,
        nif: emitterIdentity.nif,
        lineItems,
        totals: {
            qtySold: sumField(lineItems, "qtySold"),
            qtyReturned: sumField(lineItems, "qtyReturned"),
            fiscalStock: sumField(lineItems, "fiscalStock"),
        },
    };

    return { variant: "a", content };
}

export function mapReportAApiToHistoryItem(
    response: ReportAApiResponse,
): ReportAHistoryItem {
    return {
        id: response.session_id,
        periodStart: formatShortDateLabel(response.period_start),
        periodEnd: formatShortDateLabel(response.period_end),
        itemCount: response.snapshot.item_count,
        pdfUrl: response.pdf_url,
    };
}

export function parseReportAHistoryList(raw: unknown): ReportAHistoryItem[] {
    if (Array.isArray(raw)) {
        return raw
            .map(parseReportAApiResponse)
            .filter((item): item is ReportAApiResponse => item !== null)
            .map(mapReportAApiToHistoryItem);
    }

    if (!raw || typeof raw !== "object") return [];

    const body = raw as Record<string, unknown>;
    const rows = Array.isArray(body.items)
        ? body.items
        : Array.isArray(body.data)
          ? body.data
          : [];

    return rows
        .map(parseReportAApiResponse)
        .filter((item): item is ReportAApiResponse => item !== null)
        .map(mapReportAApiToHistoryItem);
}
