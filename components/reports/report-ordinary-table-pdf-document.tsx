import {
    Document,
    Page,
    StyleSheet,
    Text,
    View,
} from "@react-pdf/renderer";

import type {
    OrdinaryReportColumnConfig,
    OrdinaryReportTableConfig,
    OrdinaryReportTableContent,
    OrdinaryReportTablePdfLabels,
    OrdinaryReportTableRow,
} from "@/lib/reports/ordinary-report-configs";
import { sanitizePdfText } from "@/lib/reports/report-locale-format";

type CellAlign = "left" | "right";

type Props = {
    content: OrdinaryReportTableContent;
    config: OrdinaryReportTableConfig;
    labels: OrdinaryReportTablePdfLabels;
};

const DEFAULT_BODY_FONT_SIZE = 8;
const COMPACT_BODY_FONT_SIZE = 7.4;

function TableCell({
    width,
    align = "left",
    children,
    bold = false,
    fontSize,
    color = "#334155",
    compact = false,
    paddingRight,
    paddingLeft,
}: {
    width: number;
    align?: CellAlign;
    children: string;
    bold?: boolean;
    fontSize: number;
    color?: string;
    compact?: boolean;
    paddingRight?: number;
    paddingLeft?: number;
}) {
    const resolvedPaddingRight = paddingRight ?? (compact ? 5 : 3);
    const resolvedPaddingLeft = paddingLeft ?? 0;
    const textWidth = Math.max(
        0,
        width - resolvedPaddingLeft - resolvedPaddingRight,
    );

    return (
        <View
            style={{
                width,
                paddingRight: resolvedPaddingRight,
                paddingLeft: resolvedPaddingLeft,
                justifyContent: "center",
                overflow: "hidden",
            }}
        >
            <Text
                style={{
                    width: textWidth,
                    textAlign: align,
                    fontSize,
                    fontWeight: bold ? 700 : 600,
                    color,
                    lineHeight: compact ? fontSize : undefined,
                }}
            >
                {children}
            </Text>
        </View>
    );
}

function createStyles(compact: boolean) {
    return StyleSheet.create({
        page: compact
            ? {
                  paddingTop: 30,
                  paddingBottom: 30,
                  paddingHorizontal: 24,
                  fontSize: 9,
                  color: "#334155",
                  fontFamily: "Helvetica",
              }
            : {
                  paddingTop: 40,
                  paddingBottom: 40,
                  paddingHorizontal: 40,
                  fontSize: 9,
                  color: "#334155",
                  fontFamily: "Helvetica",
              },
        headerRow: {
            flexDirection: "row",
            justifyContent: "flex-end",
            alignItems: "flex-start",
            marginBottom: compact ? 22 : 32,
        },
        reportTitle: {
            fontSize: compact ? 28 : 32,
            fontWeight: 700,
            color: "#1e4d7b",
            textTransform: "uppercase",
        },
        rule: {
            borderBottomWidth: 2,
            borderBottomColor: "#000",
            marginBottom: compact ? 20 : 32,
        },
        metaRow: {
            flexDirection: "row",
            justifyContent: "flex-start",
            marginBottom: compact ? 18 : 40,
        },
        metaCol: { width: compact ? "43%" : "36%" },
        metaColSpaced: compact
            ? { width: "43%", marginLeft: 36 }
            : { width: "42%", marginLeft: 90 },
        sectionLabel: {
            fontSize: compact ? 8 : 9,
            fontWeight: 700,
            marginBottom: compact ? 6 : 10,
            textTransform: "uppercase",
            color: "#000",
        },
        metaLine: {
            marginBottom: compact ? 3 : 5,
            fontSize: compact ? 8 : 9,
            fontWeight: 600,
        },
        metaBold: { fontWeight: 700, color: "#000" },
        tableTitle: {
            fontSize: compact ? 8 : 9,
            fontWeight: 700,
            marginBottom: compact ? 8 : 12,
            textTransform: "uppercase",
            color: "#000",
        },
        tableHeader: {
            flexDirection: "row",
            alignItems: "center",
            width: "100%",
            backgroundColor: "#f1f5f9",
            paddingVertical: compact ? 4 : 8,
            paddingHorizontal: compact ? 5 : 6,
            minHeight: compact ? 12 : 24,
        },
        tableBodyRow: {
            flexDirection: "row",
            alignItems: "center",
            width: "100%",
            borderBottomWidth: 1,
            borderBottomColor: "#cbd5e1",
            paddingVertical: compact ? 2 : 8,
            paddingHorizontal: compact ? 5 : 6,
            minHeight: compact ? 12 : undefined,
        },
        empty: {
            paddingVertical: 24,
            fontSize: 9,
            fontWeight: 600,
            color: "#64748b",
        },
        footer: {
            position: "absolute",
            bottom: compact ? 20 : 32,
            right: compact ? 24 : 40,
            fontSize: 8,
            color: "#94a3b8",
        },
    });
}

const defaultStyles = createStyles(false);
const compactStyles = createStyles(true);

function formatPdfCell(
    row: OrdinaryReportTableRow,
    column: OrdinaryReportColumnConfig,
): string {
    const value = row[column.key] ?? "";
    const formatted = column.pdfFormat ? column.pdfFormat(value, row) : value;
    return sanitizePdfText(formatted);
}

function TableHeader({
    columns,
    columnWidthsPt,
    labels,
    bodyFontSize,
    compact,
}: {
    columns: OrdinaryReportColumnConfig[];
    columnWidthsPt: Record<string, number>;
    labels: OrdinaryReportTablePdfLabels;
    bodyFontSize: number;
    compact: boolean;
}) {
    return (
        <View style={compact ? compactStyles.tableHeader : defaultStyles.tableHeader}>
            {columns.map((column) => (
                <TableCell
                    key={column.key}
                    width={columnWidthsPt[column.key]}
                    align={column.align}
                    bold
                    fontSize={bodyFontSize}
                    compact={compact}
                    paddingRight={column.pdfPaddingRight}
                    paddingLeft={column.pdfPaddingLeft}
                >
                    {sanitizePdfText(labels.columns[column.key] ?? column.key)}
                </TableCell>
            ))}
        </View>
    );
}

export function ReportOrdinaryTablePdfDocument({
    content,
    config,
    labels,
}: Props) {
    const compact = config.pdfStyle === "compact";
    const styles = compact ? compactStyles : defaultStyles;
    const bodyFontSize =
        config.pdfTypography?.bodyFontSize ??
        (compact ? COMPACT_BODY_FONT_SIZE : DEFAULT_BODY_FONT_SIZE);
    const p = content;

    return (
        <Document>
            <Page
                size="A4"
                orientation={config.pdfOrientation ?? "portrait"}
                style={styles.page}
            >
                <View style={styles.headerRow}>
                    <Text style={styles.reportTitle}>{labels.reportCode}</Text>
                </View>

                <View style={styles.rule} />

                <View style={styles.metaRow}>
                    <View style={styles.metaCol}>
                        <Text style={styles.sectionLabel}>{labels.emitter}</Text>
                        <Text style={styles.metaLine}>
                            <Text style={styles.metaBold}>
                                {labels.company} :
                            </Text>{" "}
                            {p.companyName}
                        </Text>
                        <Text style={styles.metaLine}>
                            <Text style={styles.metaBold}>{labels.nif} :</Text>{" "}
                            {p.nif}
                        </Text>
                        <Text style={styles.metaLine}>
                            <Text style={styles.metaBold}>{labels.isf} :</Text>{" "}
                            {p.isf}
                        </Text>
                    </View>
                    <View style={styles.metaColSpaced}>
                        <Text style={styles.sectionLabel}>
                            {labels.periodSection}
                        </Text>
                        <Text style={styles.metaLine}>
                            <Text style={styles.metaBold}>
                                {labels.generatedAt} :
                            </Text>{" "}
                            {p.generatedAt}
                        </Text>
                        <Text style={styles.metaLine}>
                            <Text style={styles.metaBold}>
                                {labels.dateFrom} :
                            </Text>{" "}
                            {p.dateFrom}
                        </Text>
                        <Text style={styles.metaLine}>
                            <Text style={styles.metaBold}>
                                {labels.dateTo} :
                            </Text>{" "}
                            {p.dateTo}
                        </Text>
                    </View>
                </View>

                <Text style={styles.tableTitle}>{labels.tableTitle}</Text>

                <TableHeader
                    columns={config.columns}
                    columnWidthsPt={config.columnWidthsPt}
                    labels={labels}
                    bodyFontSize={bodyFontSize}
                    compact={compact}
                />

                {p.lineItems.length > 0 ? (
                    p.lineItems.map((row) => (
                        <View
                            key={config.rowKey(row)}
                            style={styles.tableBodyRow}
                        >
                            {config.columns.map((column) => (
                                <TableCell
                                    key={column.key}
                                    width={config.columnWidthsPt[column.key]}
                                    align={column.align}
                                    fontSize={bodyFontSize}
                                    compact={compact}
                                    paddingRight={column.pdfPaddingRight}
                                    paddingLeft={column.pdfPaddingLeft}
                                >
                                    {formatPdfCell(row, column)}
                                </TableCell>
                            ))}
                        </View>
                    ))
                ) : (
                    <Text style={styles.empty}>{labels.empty}</Text>
                )}

                <Text style={styles.footer}>{labels.page}</Text>
            </Page>
        </Document>
    );
}
