import {
    Document,
    Image,
    Page,
    StyleSheet,
    Text,
    View,
} from "@react-pdf/renderer";

import type { InvoicePaymentsPreviewContent } from "@/core/types/reports";
import { REPORT_PAYMENTS_PDF_LABELS } from "@/lib/reports/report-payments-pdf-labels";
import { REPORT_PAYMENTS_TABLE_PT } from "@/lib/reports/report-payments-table-layout";

const COL = REPORT_PAYMENTS_TABLE_PT;
const labels = REPORT_PAYMENTS_PDF_LABELS;

const HEADER_FONT_SIZE = 7;
const BODY_FONT_SIZE = 9;

type CellAlign = "left" | "right";

function TableCell({
    width,
    align = "left",
    children,
    bold = false,
    fontSize = BODY_FONT_SIZE,
    color = "#334155",
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
                    fontWeight: bold ? 700 : 600,
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
        paddingTop: 40,
        paddingBottom: 40,
        paddingHorizontal: 40,
        fontSize: 9,
        color: "#334155",
        fontFamily: "Helvetica",
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 32,
    },
    brandRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    logo: {
        width: 56,
        height: 56,
        borderRadius: 4,
        objectFit: "cover",
    },
    brand: {
        fontSize: 24,
        fontWeight: 700,
        color: "#0f172a",
    },
    brandSub: {
        fontSize: 7,
        fontWeight: 700,
        letterSpacing: 3,
        marginTop: 4,
        color: "#475569",
    },
    reportTitle: {
        fontSize: 32,
        fontWeight: 700,
        color: "#1e4d7b",
        textTransform: "uppercase",
    },
    rule: {
        borderBottomWidth: 2,
        borderBottomColor: "#000",
        marginBottom: 32,
    },
    metaRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 40,
    },
    metaCol: { width: "48%" },
    sectionLabel: {
        fontSize: 9,
        fontWeight: 700,
        marginBottom: 10,
        textTransform: "uppercase",
        color: "#000",
    },
    metaLine: { marginBottom: 5, fontSize: 9, fontWeight: 600 },
    metaBold: { fontWeight: 700, color: "#000" },
    tableTitle: {
        fontSize: 9,
        fontWeight: 700,
        marginBottom: 12,
        textTransform: "uppercase",
        color: "#000",
    },
    tableHeader: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        backgroundColor: "#f1f5f9",
        paddingVertical: 8,
        paddingHorizontal: 6,
        minHeight: 24,
    },
    tableBodyRow: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        borderBottomWidth: 1,
        borderBottomColor: "#cbd5e1",
        paddingVertical: 8,
        paddingHorizontal: 6,
    },
    empty: {
        paddingVertical: 24,
        fontSize: 9,
        fontWeight: 600,
        color: "#64748b",
    },
    footer: {
        position: "absolute",
        bottom: 32,
        right: 40,
        fontSize: 8,
        color: "#94a3b8",
    },
});

type Props = {
    content: InvoicePaymentsPreviewContent;
};

function TableHeader() {
    return (
        <View style={styles.tableHeader}>
            <TableCell width={COL.reference} bold fontSize={HEADER_FONT_SIZE}>
                {labels.columns.reference}
            </TableCell>
            <TableCell width={COL.clientName} bold fontSize={HEADER_FONT_SIZE}>
                {labels.columns.clientName}
            </TableCell>
            <TableCell
                width={COL.amount}
                align="right"
                bold
                fontSize={HEADER_FONT_SIZE}
            >
                {labels.columns.amount}
            </TableCell>
            <TableCell
                width={COL.date}
                align="right"
                bold
                fontSize={HEADER_FONT_SIZE}
            >
                {labels.columns.date}
            </TableCell>
        </View>
    );
}

export function ReportPaymentsPdfDocument({ content }: Props) {
    const p = content;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.headerRow}>
                    <View style={styles.brandRow}>
                        {p.logoUrl ? (
                            <Image src={p.logoUrl} style={styles.logo} />
                        ) : null}
                        <View>
                            <Text style={styles.brand}>{p.companyName}</Text>
                            <Text style={styles.brandSub}>REPORTS</Text>
                        </View>
                    </View>
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
                    <View style={styles.metaCol}>
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

                <TableHeader />

                {p.lineItems.length > 0 ? (
                    p.lineItems.map((row) => (
                        <View
                            key={`${row.reference}-${row.date}`}
                            style={styles.tableBodyRow}
                        >
                            <TableCell width={COL.reference}>
                                {row.reference}
                            </TableCell>
                            <TableCell width={COL.clientName}>
                                {row.clientName}
                            </TableCell>
                            <TableCell width={COL.amount} align="right">
                                {row.amount}
                            </TableCell>
                            <TableCell width={COL.date} align="right">
                                {row.date}
                            </TableCell>
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
