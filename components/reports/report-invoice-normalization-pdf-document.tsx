import {
    Document,
    Page,
    StyleSheet,
    Text,
    View,
} from "@react-pdf/renderer";

import type { InvoiceNormalizationPreviewContent } from "@/core/types/reports";
import { REPORT_INVOICE_EDITION_TABLE_PT } from "@/lib/reports/report-invoice-edition-table-layout";

const COL = REPORT_INVOICE_EDITION_TABLE_PT;

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
    tableTitle: "NORMALISATION DES FACTURES",
    columns: {
        clientName: "Nom client",
        invoiceAmount: "Montant facture",
        taxAmount: "Montant taxe",
        paidAmount: "Montant payé",
        totalAmount: "Montant total",
        currency: "Devise",
        invoiceType: "Type facture",
        dueDate: "Date échéance",
    },
    empty: "Aucune facture trouvée pour les critères sélectionnés.",
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
    content: InvoiceNormalizationPreviewContent;
};

function TableHeader() {
    return (
        <View style={styles.tableHeader}>
            <TableCell width={COL.clientName} bold fontSize={HEADER_FONT_SIZE}>
                {labels.columns.clientName}
            </TableCell>
            <TableCell width={COL.invoiceAmount} align="right" bold fontSize={HEADER_FONT_SIZE}>
                {labels.columns.invoiceAmount}
            </TableCell>
            <TableCell width={COL.taxAmount} align="right" bold fontSize={HEADER_FONT_SIZE}>
                {labels.columns.taxAmount}
            </TableCell>
            <TableCell width={COL.paidAmount} align="right" bold fontSize={HEADER_FONT_SIZE}>
                {labels.columns.paidAmount}
            </TableCell>
            <TableCell width={COL.totalAmount} align="right" bold fontSize={HEADER_FONT_SIZE}>
                {labels.columns.totalAmount}
            </TableCell>
            <TableCell width={COL.currency} bold fontSize={HEADER_FONT_SIZE}>
                {labels.columns.currency}
            </TableCell>
            <TableCell width={COL.invoiceType} bold fontSize={HEADER_FONT_SIZE}>
                {labels.columns.invoiceType}
            </TableCell>
            <TableCell width={COL.dueDate} align="right" bold fontSize={HEADER_FONT_SIZE}>
                {labels.columns.dueDate}
            </TableCell>
        </View>
    );
}

export function ReportInvoiceNormalizationPdfDocument({ content }: Props) {
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
                            key={`${row.clientName}-${row.invoiceType}-${row.dueDate}`}
                            style={styles.tableBodyRow}
                        >
                            <TableCell width={COL.clientName}>{row.clientName}</TableCell>
                            <TableCell width={COL.invoiceAmount} align="right">
                                {row.invoiceAmount}
                            </TableCell>
                            <TableCell width={COL.taxAmount} align="right">{row.taxAmount}</TableCell>
                            <TableCell width={COL.paidAmount} align="right">{row.paidAmount}</TableCell>
                            <TableCell width={COL.totalAmount} align="right">{row.totalAmount}</TableCell>
                            <TableCell width={COL.currency}>{row.currency}</TableCell>
                            <TableCell width={COL.invoiceType}>{row.invoiceType}</TableCell>
                            <TableCell width={COL.dueDate} align="right">{row.dueDate}</TableCell>
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
