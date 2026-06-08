import {
    Document,
    Page,
    StyleSheet,
    Text,
    View,
} from "@react-pdf/renderer";

import { REPORT_X_PERIODIC_TABLE_PT } from "@/lib/reports/report-x-periodic-table-layout";
import type { ReportXPeriodicPreviewContent } from "@/core/types/reports";

const COL = REPORT_X_PERIODIC_TABLE_PT;

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
    footer: {
        position: "absolute",
        bottom: 28,
        right: 30,
        fontSize: 8,
        color: "#94a3b8",
    },
});

export type ReportXPeriodicPdfLabels = {
    reportCode: string;
    emitter: string;
    periodSection: string;
    company: string;
    nif: string;
    generatedAt: string;
    dateFrom: string;
    dateTo: string;
    tableTitle: string;
    columns: {
        invoiceCount: string;
        totalHt: string;
        totalTva: string;
        totalTtc: string;
        totalPaid: string;
        totalBalance: string;
    };
    page: string;
};

type Props = {
    content: ReportXPeriodicPreviewContent;
    labels: ReportXPeriodicPdfLabels;
};

function TableHeader({ labels }: { labels: ReportXPeriodicPdfLabels }) {
    return (
        <View style={styles.tableHeader}>
            <TableCell
                width={COL.invoiceCount}
                bold
                fontSize={HEADER_FONT_SIZE}
            >
                {labels.columns.invoiceCount}
            </TableCell>
            <TableCell
                width={COL.totalHt}
                align="right"
                bold
                fontSize={HEADER_FONT_SIZE}
            >
                {labels.columns.totalHt}
            </TableCell>
            <TableCell
                width={COL.totalTva}
                align="right"
                bold
                fontSize={HEADER_FONT_SIZE}
            >
                {labels.columns.totalTva}
            </TableCell>
            <TableCell
                width={COL.totalTtc}
                align="right"
                bold
                fontSize={HEADER_FONT_SIZE}
            >
                {labels.columns.totalTtc}
            </TableCell>
            <TableCell
                width={COL.totalPaid}
                align="right"
                bold
                fontSize={HEADER_FONT_SIZE}
            >
                {labels.columns.totalPaid}
            </TableCell>
            <TableCell
                width={COL.totalBalance}
                align="right"
                bold
                fontSize={HEADER_FONT_SIZE}
            >
                {labels.columns.totalBalance}
            </TableCell>
        </View>
    );
}

export function ReportXPeriodicPdfDocument({ content, labels }: Props) {
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

                <View style={styles.tableBodyRow}>
                    <TableCell width={COL.invoiceCount}>
                        {String(p.invoiceCount)}
                    </TableCell>
                    <TableCell width={COL.totalHt} align="right">
                        {p.totalHt}
                    </TableCell>
                    <TableCell width={COL.totalTva} align="right">
                        {p.totalTva}
                    </TableCell>
                    <TableCell width={COL.totalTtc} align="right">
                        {p.totalTtc}
                    </TableCell>
                    <TableCell width={COL.totalPaid} align="right">
                        {p.totalPaid}
                    </TableCell>
                    <TableCell width={COL.totalBalance} align="right">
                        {p.totalBalance}
                    </TableCell>
                </View>

                <Text style={styles.footer}>{labels.page}</Text>
            </Page>
        </Document>
    );
}
