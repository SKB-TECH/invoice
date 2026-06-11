import type {
    OrdinaryReportTableConfig,
    OrdinaryReportTablePdfLabels,
    OrdinaryReportTableVariant,
} from "@/lib/reports/ordinary-report-configs";
import { ORDINARY_REPORT_TABLE_CONFIGS } from "@/lib/reports/ordinary-report-configs";

type TranslationFn = (
    key: string,
    values?: Record<string, string | number>,
) => string;

export function buildOrdinaryReportTablePdfLabels(
    t: TranslationFn,
    variant: OrdinaryReportTableVariant,
): OrdinaryReportTablePdfLabels {
    const config = ORDINARY_REPORT_TABLE_CONFIGS[variant];
    const columns: Record<string, string> = {};

    for (const column of config.columns) {
        columns[column.key] = t(`columns.${column.key}`);
    }

    return {
        reportCode: t("reportCode"),
        emitter: t("emitter"),
        periodSection: t("periodSection"),
        company: t("company"),
        nif: t("nif"),
        isf: t("isf"),
        generatedAt: t("generatedAt"),
        dateFrom: t("dateFrom"),
        dateTo: t("dateTo"),
        tableTitle: t("tableTitle"),
        columns,
        empty: t("empty"),
        page: t("page", { current: 1, total: 1 }),
    };
}

export type { OrdinaryReportTableConfig, OrdinaryReportTablePdfLabels };
