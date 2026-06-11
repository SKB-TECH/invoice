import React from "react";
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
} from "@react-pdf/renderer";
import {InvoicePdfData} from "@/core/types/pdf/types";


function formatAmount(amount: number, currency: string) {
    return `${currency} ${new Intl.NumberFormat("fr-FR")
        .format(amount)
        .replace(/\s/g, ".")}`;
}

const styles = StyleSheet.create({
    page: {
        paddingTop: 52,
        paddingBottom: 42,
        paddingHorizontal: 54,
        fontFamily: "Helvetica",
        fontSize: 10,
        color: "#111111",
        backgroundColor: "#ffffff",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 44,
    },
    brand: {
        fontSize: 25,
        fontWeight: 900,
    },
    brandSub: {
        marginTop: 2,
        fontSize: 7,
        letterSpacing: 2,
        textTransform: "uppercase",
    },
    title: {
        fontSize: 40,
        fontWeight: 900,
        textTransform: "uppercase",
    },
    meta: {
        flexDirection: "row",
        justifyContent: "space-between",
        borderBottomWidth: 1.5,
        borderBottomColor: "#111111",
        paddingBottom: 8,
        marginBottom: 18,
    },
    metaText: {
        fontSize: 10,
        fontWeight: 800,
        lineHeight: 1.4,
        textTransform: "uppercase",
    },
    invoiceNumber: {
        fontSize: 12,
        fontWeight: 900,
        textTransform: "uppercase",
    },
    parties: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 14,
        marginBottom: 52,
    },
    party: {
        width: "44%",
    },
    partyRight: {
        width: "44%",
        textAlign: "right",
    },
    partyTitle: {
        fontSize: 11,
        fontWeight: 900,
        marginBottom: 12,
        textTransform: "uppercase",
    },
    partyText: {
        fontSize: 10,
        fontWeight: 700,
        lineHeight: 1.35,
    },
    tableHeader: {
        flexDirection: "row",
        borderBottomWidth: 1.2,
        borderBottomColor: "#111111",
        paddingBottom: 7,
    },
    row: {
        flexDirection: "row",
        borderBottomWidth: 0.8,
        borderBottomColor: "#333333",
        paddingVertical: 10,
    },
    designation: {
        width: "38%",
    },
    unit: {
        width: "18%",
        textAlign: "right",
    },
    qty: {
        width: "10%",
        textAlign: "right",
    },
    tax: {
        width: "12%",
        textAlign: "right",
    },
    total: {
        width: "22%",
        textAlign: "right",
    },
    th: {
        fontSize: 9,
        fontWeight: 900,
    },
    cell: {
        fontSize: 10,
    },
    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 24,
    },
    payment: {
        width: "42%",
        marginTop: 28,
    },
    paymentTitle: {
        fontSize: 13,
        fontWeight: 900,
        marginBottom: 14,
        textTransform: "uppercase",
    },
    paymentText: {
        fontSize: 10,
        lineHeight: 1.35,
    },
    totals: {
        width: "46%",
    },
    totalRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    totalLabel: {
        fontSize: 12,
        fontWeight: 900,
    },
    totalValue: {
        fontSize: 12,
        fontWeight: 900,
    },
    finalTotal: {
        marginTop: 4,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: "#111111",
    },
    note: {
        marginTop: 40,
        fontSize: 8,
        lineHeight: 1.5,
    },
});

export function InvoicePdfTemplateOne({
                                          invoice,
                                      }: {
    invoice: InvoicePdfData;
}) {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.brand}>iKwook</Text>
                        <Text style={styles.brandSub}>Invoice</Text>
                    </View>

                    <Text style={styles.title}>FACTURE</Text>
                </View>

                <View style={styles.meta}>
                    <View>
                        <Text style={styles.metaText}>
                            DATE : {invoice.createdAt}
                        </Text>
                        <Text style={styles.metaText}>
                            ÉCHÉANCE : {invoice.dueDate}
                        </Text>
                    </View>

                    <View>
                        <Text style={styles.invoiceNumber}>
                            FACTURE N° : {invoice.invoice}
                        </Text>
                        {invoice.contractReference && (
                            <Text style={styles.metaText}>
                                CONTRAT : {invoice.contractReference}
                            </Text>
                        )}
                    </View>
                </View>

                <View style={styles.parties}>
                    <View style={styles.party}>
                        <Text style={styles.partyTitle}>Émetteur :</Text>
                        <Text style={styles.partyText}>
                            iKwook Sarl{"\n"}
                            contact@ikwook.cd{"\n"}
                            +243 822 204 012{"\n"}
                            Kinshasa, RDC
                        </Text>
                    </View>

                    <View style={styles.partyRight}>
                        <Text style={styles.partyTitle}>Destinataire :</Text>
                        <Text style={styles.partyText}>
                            {invoice.client}{"\n"}
                            {invoice.email ? `${invoice.email}\n` : ""}
                            {invoice.telephone}{"\n"}
                            {invoice.clientAddress}
                        </Text>
                    </View>
                </View>

                <View>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.designation, styles.th]}>
                            Désignation
                        </Text>
                        <Text style={[styles.unit, styles.th]}>
                            Prix HT
                        </Text>
                        <Text style={[styles.qty, styles.th]}>
                            Qté
                        </Text>
                        <Text style={[styles.tax, styles.th]}>
                            TVA
                        </Text>
                        <Text style={[styles.total, styles.th]}>
                            Total TTC
                        </Text>
                    </View>

                    {invoice.lines.map((line) => (
                        <View key={line.id} style={styles.row}>
                            <Text style={[styles.designation, styles.cell]}>
                                {line.designation}
                            </Text>

                            <Text style={[styles.unit, styles.cell]}>
                                {formatAmount(line.unitPrice, invoice.currency)}
                            </Text>

                            <Text style={[styles.qty, styles.cell]}>
                                {line.quantity}
                            </Text>

                            <Text style={[styles.tax, styles.cell]}>
                                {line.taxRate}%
                            </Text>

                            <Text style={[styles.total, styles.cell]}>
                                {formatAmount(line.total, invoice.currency)}
                            </Text>
                        </View>
                    ))}
                </View>

                <View style={styles.footer}>
                    <View style={styles.payment}>
                        <Text style={styles.paymentTitle}>Règlement :</Text>
                        <Text style={styles.paymentText}>
                            Par virement bancaire :{"\n"}
                            Banque : Rawbank{"\n"}
                            Compte : 123-456-7890
                        </Text>
                    </View>

                    <View style={styles.totals}>
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>TOTAL HT :</Text>
                            <Text style={styles.totalValue}>
                                {formatAmount(invoice.subtotal, invoice.currency)}
                            </Text>
                        </View>

                        {invoice.taxGroups.map((group) => (
                            <View
                                key={group.rate}
                                style={styles.totalRow}
                            >
                                <Text style={styles.totalLabel}>
                                    TVA {group.rate}% :
                                </Text>

                                <Text style={styles.totalValue}>
                                    {formatAmount(
                                        group.taxAmount,
                                        invoice.currency
                                    )}
                                </Text>
                            </View>
                        ))}

                        <View
                            style={[
                                styles.totalRow,
                                styles.finalTotal,
                            ]}
                        >
                            <Text style={styles.totalLabel}>TOTAL TTC :</Text>

                            <Text style={styles.totalValue}>
                                {formatAmount(invoice.total, invoice.currency)}
                            </Text>
                        </View>
                    </View>
                </View>

                <Text style={styles.note}>
                    En cas de retard de paiement, une indemnité de retard peut
                    être appliquée conformément aux conditions générales.
                    {"\n"}
                    Conditions générales de vente consultables sur le site :
                    www.ikwook.cd
                </Text>
            </Page>
        </Document>
    );
}
