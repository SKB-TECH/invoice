import React from "react";
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
} from "@react-pdf/renderer";

type InvoicePdfLine = {
    id: string;
    designation: string;
    quantity: number;
    unitPrice: number;
};

type InvoicePdfData = {
    invoice: string;
    client: string;
    clientAddress: string;
    telephone: string;
    currency: "CDF" | "USD";
    createdAt: string;
    dueDate: string;
    lines: InvoicePdfLine[];
};

function formatAmount(amount: number, currency: string) {
    if (amount >= 1_000_000) {
        const value = amount / 1_000_000;
        const formatted = Number.isInteger(value)
            ? value.toString()
            : value.toFixed(1);

        return `${currency} ${formatted}M`;
    }

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
        position: "relative",
    },
    topCorner: {
        position: "absolute",
        top: 0,
        left: 0,
        width: 18,
        height: 18,
        backgroundColor: "#0879bd",
    },
    leftBar: {
        position: "absolute",
        top: 34,
        left: 0,
        width: 18,
        height: 120,
        backgroundColor: "#e8f3fb",
    },
    bottomCorner: {
        position: "absolute",
        right: 28,
        bottom: 24,
        width: 34,
        height: 34,
        backgroundColor: "#e8f3fb",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 44,
    },
    logoRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    logoBox: {
        width: 40,
        height: 40,
        borderWidth: 4,
        borderColor: "#111111",
        alignItems: "center",
        justifyContent: "center",
    },
    logoText: {
        fontSize: 11,
        fontWeight: 900,
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
        fontSize: 48,
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
        fontSize: 13,
        fontWeight: 900,
        textTransform: "uppercase",
    },
    parties: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 14,
        marginBottom: 72,
    },
    partyLeft: {
        width: "42%",
    },
    partyRight: {
        width: "42%",
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
    tableRow: {
        flexDirection: "row",
        borderBottomWidth: 0.8,
        borderBottomColor: "#333333",
        paddingVertical: 11,
    },
    descriptionCol: {
        width: "45%",
    },
    unitCol: {
        width: "22%",
        textAlign: "right",
    },
    qtyCol: {
        width: "15%",
        textAlign: "right",
    },
    totalCol: {
        width: "18%",
        textAlign: "right",
    },
    th: {
        fontSize: 9,
        fontWeight: 900,
    },
    cell: {
        fontSize: 11,
    },
    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 22,
    },
    payment: {
        width: "44%",
        marginTop: 42,
    },
    paymentTitle: {
        fontSize: 14,
        fontWeight: 900,
        marginBottom: 16,
        textTransform: "uppercase",
    },
    paymentText: {
        fontSize: 10,
        lineHeight: 1.35,
    },
    totals: {
        width: "40%",
    },
    totalRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 9,
    },
    totalLabel: {
        fontSize: 13,
        fontWeight: 900,
    },
    totalValue: {
        fontSize: 13,
        fontWeight: 900,
    },
    notes: {
        position: "absolute",
        left: 54,
        bottom: 58,
        width: 310,
    },
    note: {
        fontSize: 7,
        lineHeight: 1.4,
        marginBottom: 16,
    },
});

export function InvoicePdfDocument({ invoice }: { invoice: InvoicePdfData }) {
    const subtotal = invoice.lines.reduce(
        (sum, line) => sum + line.quantity * line.unitPrice,
        0
    );

    const tax = Math.round(subtotal * 0.16);
    const total = subtotal + tax;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.topCorner} />
                <View style={styles.leftBar} />
                <View style={styles.bottomCorner} />

                <View style={styles.header}>
                    <View style={styles.logoRow}>
                        <View style={styles.logoBox}>
                            <Text style={styles.logoText}>IK</Text>
                        </View>
                        <View>
                            <Text style={styles.brand}>iKwook</Text>
                            <Text style={styles.brandSub}>Invoice</Text>
                        </View>
                    </View>

                    <Text style={styles.title}>FACTURE</Text>
                </View>

                <View style={styles.meta}>
                    <View>
                        <Text style={styles.metaText}>DATE : {invoice.createdAt}</Text>
                        <Text style={styles.metaText}>ÉCHÉANCE : {invoice.dueDate}</Text>
                    </View>

                    <Text style={styles.invoiceNumber}>
                        FACTURE N° : {invoice.invoice}
                    </Text>
                </View>

                <View style={styles.parties}>
                    <View style={styles.partyLeft}>
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
                            {invoice.telephone}{"\n"}
                            {invoice.clientAddress}
                        </Text>
                    </View>
                </View>

                <View>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.descriptionCol, styles.th]}>
                            Description :
                        </Text>
                        <Text style={[styles.unitCol, styles.th]}>
                            Prix Unitaire :
                        </Text>
                        <Text style={[styles.qtyCol, styles.th]}>
                            Quantité :
                        </Text>
                        <Text style={[styles.totalCol, styles.th]}>
                            Total :
                        </Text>
                    </View>

                    {invoice.lines.map((line) => (
                        <View key={line.id} style={styles.tableRow}>
                            <Text style={[styles.descriptionCol, styles.cell]}>
                                {line.designation}
                            </Text>
                            <Text style={[styles.unitCol, styles.cell]}>
                                {formatAmount(line.unitPrice, invoice.currency)}
                            </Text>
                            <Text style={[styles.qtyCol, styles.cell]}>
                                {line.quantity}
                            </Text>
                            <Text style={[styles.totalCol, styles.cell]}>
                                {formatAmount(
                                    line.quantity * line.unitPrice,
                                    invoice.currency
                                )}
                            </Text>
                        </View>
                    ))}

                    {Array.from({
                        length: Math.max(0, 5 - invoice.lines.length),
                    }).map((_, index) => (
                        <View key={`empty-${index}`} style={styles.tableRow}>
                            <Text style={[styles.descriptionCol, styles.cell]}>-</Text>
                            <Text style={[styles.unitCol, styles.cell]}>-</Text>
                            <Text style={[styles.qtyCol, styles.cell]}>-</Text>
                            <Text style={[styles.totalCol, styles.cell]}>-</Text>
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
                                {formatAmount(subtotal, invoice.currency)}
                            </Text>
                        </View>

                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>TVA 16% :</Text>
                            <Text style={styles.totalValue}>
                                {formatAmount(tax, invoice.currency)}
                            </Text>
                        </View>

                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>REMISE :</Text>
                            <Text style={styles.totalValue}>-</Text>
                        </View>

                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>TOTAL TTC :</Text>
                            <Text style={styles.totalValue}>
                                {formatAmount(total, invoice.currency)}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.notes}>
                    <Text style={styles.note}>
                        En cas de retard de paiement, une indemnité de retard peut être
                        appliquée conformément aux conditions générales.
                    </Text>

                    <Text style={styles.note}>
                        Conditions générales de vente consultables sur le site :
                        www.ikwook.cd
                    </Text>
                </View>
            </Page>
        </Document>
    );
}
