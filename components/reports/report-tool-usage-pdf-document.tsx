import {
    Document,
    Page,
    StyleSheet,
    Text,
    View,
} from "@react-pdf/renderer";

import type { ToolUsagePreviewContent } from "@/core/types/reports";
import { REPORT_TOOL_USAGE_TABLE_PT } from "@/lib/reports/report-tool-usage-table-layout";

const COL = REPORT_TOOL_USAGE_TABLE_PT;

const labels = {
    reportCode: "RAPPORT",
    emitter: "ÉMETTEUR",
    periodSection: "PÉRIODE & RESTITUTION",
    company: "Société",
    nif: "NIF",
    isf: "ISF",
    generatedAt: "Généré le",
    dateFrom: "Date Début",
    dateTo: "Date Fin",
    tableTitle: "UTILISATION DE L'OUTIL",
    columns: {
        userName: "Nom utilisateur",
        invoiceCount: "Nombre de factures",
        totalAmount: "Montant total",
        totalTva: "Total TVA",
        firstInvoice: "Date 1ere facture",
        lastInvoice: "Date derniere facture",
    },
    empty: "Aucune ligne trouvée pour les critères sélectionnés.",
    page: "Page 1 sur 1",
} as const;

const HEADER_FONT_SIZE = 6.5;
const BODY_FONT_SIZE = 8;
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
        justifyContent: "flex-end",
        alignItems: "flex-start",
        marginBottom: 32,
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
        justifyContent: "flex-start",
        marginBottom: 40,
    },
    metaCol: { width: "36%" },
    metaColSpaced: { width: "42%", marginLeft: 90 },
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
    content: ToolUsagePreviewContent;
};

function TableHeader() {
    return (
        <View style={styles.tableHeader}>
            <TableCell width={COL.userName} bold fontSize={HEADER_FONT_SIZE}>
                {labels.columns.userName}
            </TableCell>
            <TableCell width={COL.invoiceCount} align="right" bold fontSize={HEADER_FONT_SIZE}>
                {labels.columns.invoiceCount}
            </TableCell>
            <TableCell width={COL.totalAmount} align="right" bold fontSize={HEADER_FONT_SIZE}>
                {labels.columns.totalAmount}
            </TableCell>
            <TableCell width={COL.totalTva} align="right" bold fontSize={HEADER_FONT_SIZE}>
                {labels.columns.totalTva}
            </TableCell>
            <TableCell width={COL.firstInvoice} align="right" bold fontSize={HEADER_FONT_SIZE}>
                {labels.columns.firstInvoice}
            </TableCell>
            <TableCell width={COL.lastInvoice} align="right" bold fontSize={HEADER_FONT_SIZE}>
                {labels.columns.lastInvoice}
            </TableCell>
        </View>
    );
}

export function ReportToolUsagePdfDocument({ content }: Props) {
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
                            <Text style={styles.metaBold}>{labels.company} :</Text> {p.companyName}
                        </Text>
                        <Text style={styles.metaLine}>
                            <Text style={styles.metaBold}>{labels.nif} :</Text> {p.nif}
                        </Text>
                        <Text style={styles.metaLine}>
                            <Text style={styles.metaBold}>{labels.isf} :</Text> {p.isf}
                        </Text>
                    </View>
                    <View style={styles.metaColSpaced}>
                        <Text style={styles.sectionLabel}>{labels.periodSection}</Text>
                        <Text style={styles.metaLine}>
                            <Text style={styles.metaBold}>{labels.generatedAt} :</Text> {p.generatedAt}
                        </Text>
                        <Text style={styles.metaLine}>
                            <Text style={styles.metaBold}>{labels.dateFrom} :</Text> {p.dateFrom}
                        </Text>
                        <Text style={styles.metaLine}>
                            <Text style={styles.metaBold}>{labels.dateTo} :</Text> {p.dateTo}
                        </Text>
                    </View>
                </View>
                <Text style={styles.tableTitle}>{labels.tableTitle}</Text>
                <TableHeader />
                {p.lineItems.length > 0 ? (
                    p.lineItems.map((row) => (
                        <View
                            key={`${row.userName}-${row.firstInvoice}-${row.lastInvoice}`}
                            style={styles.tableBodyRow}
                        >
                            <TableCell width={COL.userName}>{row.userName}</TableCell>
                            <TableCell width={COL.invoiceCount} align="right">
                                {row.invoiceCount}
                            </TableCell>
                            <TableCell width={COL.totalAmount} align="right">{row.totalAmount}</TableCell>
                            <TableCell width={COL.totalTva} align="right">{row.totalTva}</TableCell>
                            <TableCell width={COL.firstInvoice} align="right">{row.firstInvoice}</TableCell>
                            <TableCell width={COL.lastInvoice} align="right">{row.lastInvoice}</TableCell>
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
