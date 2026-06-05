import {
    Document,
    Page,
    StyleSheet,
    Text,
    View,
} from "@react-pdf/renderer";

import { formatReportAUnitPrice } from "@/lib/reports/format-report-a-unit-price";
import {
    REPORT_A_TABLE_PT,
    REPORT_A_TABLE_TOTAL_LABEL_WIDTH_PT,
} from "@/lib/reports/report-a-table-layout";
import type { ReportAPreviewContent } from "@/core/types/reports";

const COL = REPORT_A_TABLE_PT;

const HEADER_FONT_SIZE = 6.5;
const BODY_FONT_SIZE = 8;

type CellAlign = "left" | "right";

function TableCell({
    width,
    align = "left",
    children,
    bold = false,
    fontSize = BODY_FONT_SIZE,
    color = "#1e293b",
}: {
    width: number;
    align?: CellAlign;
    children: string;
    bold?: boolean;
    fontSize?: number;
    color?: string;
}) {
    return (
        <View style={{ width, paddingRight: 3, justifyContent: "center" }}>
            <Text
                style={{
                    width,
                    textAlign: align,
                    fontSize,
                    fontWeight: bold ? 700 : 400,
                    color,
                }}
            >
                {children}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    page: {
        paddingTop: 36,
        paddingBottom: 36,
        paddingHorizontal: 30,
        fontSize: 9,
        color: "#1e293b",
        fontFamily: "Helvetica",
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "flex-start",
        marginBottom: 16,
    },
    reportTitle: {
        fontSize: 28,
        fontWeight: 700,
        color: "#1e4d7b",
    },
    rule: {
        borderBottomWidth: 2,
        borderBottomColor: "#000",
        marginBottom: 20,
    },
    metaRow: {
        flexDirection: "row",
        justifyContent: "flex-start",
        marginBottom: 20,
    },
    metaCol: { width: "36%" },
    metaColSpaced: { width: "42%", marginLeft: 90 },
    sectionLabel: {
        fontSize: 9,
        fontWeight: 700,
        marginBottom: 8,
        textTransform: "uppercase",
    },
    metaLine: { marginBottom: 4, fontSize: 9 },
    tableTitle: {
        fontSize: 9,
        fontWeight: 700,
        marginBottom: 8,
        textTransform: "uppercase",
    },
    tableHeader: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        backgroundColor: "#f1f5f9",
        paddingVertical: 7,
        paddingHorizontal: 4,
        minHeight: 24,
    },
    tableBodyRow: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        borderBottomWidth: 1,
        borderBottomColor: "#cbd5e1",
        paddingVertical: 6,
        paddingHorizontal: 4,
    },
    tableTotal: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        backgroundColor: "#eff6ff",
        paddingVertical: 6,
        paddingHorizontal: 4,
    },
    footer: {
        position: "absolute",
        bottom: 28,
        right: 30,
        fontSize: 8,
        color: "#94a3b8",
    },
});

export type ReportAPdfLabels = {
    reportCode: string;
    emitter: string;
    periodSection: string;
    company: string;
    nif: string;
    isf: string;
    generatedAt: string;
    dateFrom: string;
    dateTo: string;
    tableTitle: string;
    columns: {
        code: string;
        designation: string;
        unitPrice: string;
        tax: string;
        qtySold: string;
        qtyReturned: string;
        fiscalStock: string;
    };
    total: string;
    page: string;
};

type Props = {
    content: ReportAPreviewContent;
    labels: ReportAPdfLabels;
};

function TableHeader({ labels }: { labels: ReportAPdfLabels }) {
    return (
        <View style={styles.tableHeader}>
            <TableCell
                width={COL.code}
                bold
                fontSize={HEADER_FONT_SIZE}
            >
                {labels.columns.code}
            </TableCell>
            <TableCell
                width={COL.designation}
                bold
                fontSize={HEADER_FONT_SIZE}
            >
                {labels.columns.designation}
            </TableCell>
            <TableCell
                width={COL.unitPrice}
                align="right"
                bold
                fontSize={HEADER_FONT_SIZE}
            >
                {labels.columns.unitPrice}
            </TableCell>
            <TableCell
                width={COL.tax}
                align="right"
                bold
                fontSize={HEADER_FONT_SIZE}
            >
                {labels.columns.tax}
            </TableCell>
            <TableCell
                width={COL.qtySold}
                align="right"
                bold
                fontSize={HEADER_FONT_SIZE}
            >
                {labels.columns.qtySold}
            </TableCell>
            <TableCell
                width={COL.qtyReturned}
                align="right"
                bold
                fontSize={HEADER_FONT_SIZE}
            >
                {labels.columns.qtyReturned}
            </TableCell>
            <TableCell
                width={COL.fiscalStock}
                align="right"
                bold
                fontSize={HEADER_FONT_SIZE}
            >
                {labels.columns.fiscalStock}
            </TableCell>
        </View>
    );
}

export function ReportAPdfDocument({ content, labels }: Props) {
    const p = content;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.headerRow}>
                    <Text style={styles.reportTitle}>{labels.reportCode}</Text>
                </View>

                <View style={styles.rule} />

                <View style={styles.metaRow}>
                    <View style={styles.metaCol}>
                        <Text style={styles.sectionLabel}>{labels.emitter}</Text>
                        <Text style={styles.metaLine}>
                            {labels.company} : {p.companyName}
                        </Text>
                        <Text style={styles.metaLine}>
                            {labels.nif} : {p.nif}
                        </Text>
                        <Text style={styles.metaLine}>
                            {labels.isf} : {p.isf}
                        </Text>
                    </View>
                    <View style={styles.metaColSpaced}>
                        <Text style={styles.sectionLabel}>
                            {labels.periodSection}
                        </Text>
                        <Text style={styles.metaLine}>
                            {labels.generatedAt} : {p.generatedAt}
                        </Text>
                        <Text style={styles.metaLine}>
                            {labels.dateFrom} : {p.dateFrom}
                        </Text>
                        <Text style={styles.metaLine}>
                            {labels.dateTo} : {p.dateTo}
                        </Text>
                    </View>
                </View>

                <Text style={styles.tableTitle}>{labels.tableTitle}</Text>

                <TableHeader labels={labels} />

                {p.lineItems.map((row) => (
                    <View key={row.code} style={styles.tableBodyRow}>
                        <TableCell width={COL.code}>{row.code}</TableCell>
                        <TableCell width={COL.designation}>
                            {row.designation}
                        </TableCell>
                        <TableCell width={COL.unitPrice} align="right">
                            {formatReportAUnitPrice(
                                row.unitPrice,
                                row.currency,
                            )}
                        </TableCell>
                        <TableCell width={COL.tax} align="right">
                            {row.tax}
                        </TableCell>
                        <TableCell width={COL.qtySold} align="right">
                            {String(row.qtySold)}
                        </TableCell>
                        <TableCell width={COL.qtyReturned} align="right">
                            {String(row.qtyReturned)}
                        </TableCell>
                        <TableCell width={COL.fiscalStock} align="right">
                            {String(row.fiscalStock)}
                        </TableCell>
                    </View>
                ))}

                <View style={styles.tableTotal}>
                    <TableCell
                        width={REPORT_A_TABLE_TOTAL_LABEL_WIDTH_PT}
                        bold
                        color="#1e4d7b"
                    >
                        {labels.total}
                    </TableCell>
                    <TableCell
                        width={COL.qtySold}
                        align="right"
                        bold
                        color="#1e4d7b"
                    >
                        {String(p.totals.qtySold)}
                    </TableCell>
                    <TableCell
                        width={COL.qtyReturned}
                        align="right"
                        bold
                        color="#1e4d7b"
                    >
                        {String(p.totals.qtyReturned)}
                    </TableCell>
                    <TableCell
                        width={COL.fiscalStock}
                        align="right"
                        bold
                        color="#1e4d7b"
                    >
                        {String(p.totals.fiscalStock)}
                    </TableCell>
                </View>

                <Text style={styles.footer}>{labels.page}</Text>
            </Page>
        </Document>
    );
}
