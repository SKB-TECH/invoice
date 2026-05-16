import React from "react";
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
} from "@react-pdf/renderer";
import {InvoicePdfData} from "@/core/types/pdf/types";


function formatAmount(amount: number) {
    return new Intl.NumberFormat("fr-FR")
        .format(amount)
        .replace(/\s/g, " ");
}

const styles = StyleSheet.create({
    page: {
        paddingTop: 44,
        paddingBottom: 40,
        paddingHorizontal: 46,
        fontFamily: "Helvetica",
        fontSize: 9,
        color: "#222222",
        backgroundColor: "#ffffff",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 34,
    },
    issuer: {
        width: "48%",
    },
    issuerTitle: {
        fontSize: 13,
        fontWeight: 900,
        marginBottom: 6,
        letterSpacing: 1,
    },
    issuerLine: {
        fontSize: 9,
        lineHeight: 1.45,
        fontWeight: 700,
    },
    clientBox: {
        width: "45%",
        borderWidth: 1,
        borderColor: "#a3a3a3",
    },
    clientHeader: {
        backgroundColor: "#737373",
        color: "#ffffff",
        paddingVertical: 4,
        paddingHorizontal: 6,
        fontSize: 9,
        fontWeight: 900,
    },
    clientBody: {
        paddingVertical: 6,
        paddingHorizontal: 8,
    },
    clientRow: {
        flexDirection: "row",
        marginBottom: 3,
    },
    clientLabel: {
        width: "34%",
        fontSize: 8,
        fontStyle: "italic",
    },
    clientValue: {
        width: "66%",
        fontSize: 9,
        fontWeight: 700,
    },
    documentTitle: {
        textAlign: "center",
        marginBottom: 26,
    },
    documentTitleMain: {
        fontSize: 15,
        fontWeight: 900,
    },
    documentTitleSub: {
        marginTop: 3,
        fontSize: 11,
    },
    thanks: {
        marginBottom: 8,
        fontSize: 9,
    },
    table: {
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: "#a3a3a3",
    },
    tableHeader: {
        flexDirection: "row",
        backgroundColor: "#d4d4d4",
        borderBottomWidth: 1,
        borderBottomColor: "#a3a3a3",
        paddingVertical: 4,
    },
    row: {
        flexDirection: "row",
        borderBottomWidth: 0.5,
        borderBottomColor: "#d4d4d4",
        paddingVertical: 4,
    },
    colIndex: {
        width: "6%",
        textAlign: "center",
    },
    colDesignation: {
        width: "42%",
    },
    colUnit: {
        width: "18%",
        textAlign: "right",
    },
    colQty: {
        width: "14%",
        textAlign: "right",
    },
    colAmount: {
        width: "20%",
        textAlign: "right",
    },
    th: {
        fontSize: 8,
        fontWeight: 900,
        paddingHorizontal: 4,
    },
    cell: {
        fontSize: 8.5,
        paddingHorizontal: 4,
    },
    recap: {
        marginTop: 14,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    recapLeft: {
        width: "28%",
    },
    recapCenter: {
        width: "40%",
    },
    recapRight: {
        width: "28%",
    },
    recapText: {
        fontSize: 8.5,
        lineHeight: 1.35,
    },
    recapStrong: {
        fontSize: 8.5,
        fontWeight: 900,
        lineHeight: 1.35,
    },
    taxRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 2,
    },
    totalTtc: {
        marginTop: 16,
        borderBottomWidth: 1.2,
        borderBottomColor: "#222222",
        paddingBottom: 4,
        flexDirection: "row",
        justifyContent: "flex-end",
    },
    totalTtcText: {
        fontSize: 14,
        fontWeight: 900,
        letterSpacing: 2,
    },
    securityTitle: {
        marginTop: 24,
        paddingTop: 5,
        borderTopWidth: 1,
        borderTopColor: "#bdbdbd",
        flexDirection: "row",
        justifyContent: "space-between",
    },
    securityText: {
        fontSize: 8,
        fontStyle: "italic",
    },
    securityCode: {
        fontSize: 8,
        fontWeight: 900,
    },
    notNormalizedBox: {
        marginTop: 8,
        paddingVertical: 18,
        borderWidth: 1,
        borderColor: "#e5b6b6",
        backgroundColor: "#f8e1e1",
        alignItems: "center",
    },
    notNormalizedText: {
        fontSize: 13,
        fontWeight: 700,
        color: "#b44444",
    },
});

export function InvoicePdfTemplateTwo({
                                          invoice,
                                      }: {
    invoice: InvoicePdfData;
}) {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <View style={styles.issuer}>
                        <Text style={styles.issuerTitle}>
                            IKWOK EXPRESS SARL
                        </Text>
                        <Text style={styles.issuerLine}>
                            Point de vente : IKWOK EXPRESS SARL
                        </Text>
                        <Text style={styles.issuerLine}>NIF : A1801326M</Text>
                        <Text style={styles.issuerLine}>76 AV. JUSTICE</Text>
                        <Text style={styles.issuerLine}>
                            IMM.HAMDAM, No 76 av. de la JUSTICE,
                        </Text>
                        <Text style={styles.issuerLine}>C/GOMBE</Text>
                        <Text style={styles.issuerLine}>KINSHASA</Text>
                        <Text style={styles.issuerLine}>0820191921</Text>
                        <Text style={styles.issuerLine}>FINANCE@IKWOOK.COM</Text>
                    </View>

                    <View style={styles.clientBox}>
                        <Text style={styles.clientHeader}>CLIENT</Text>

                        <View style={styles.clientBody}>
                            <View style={styles.clientRow}>
                                <Text style={styles.clientLabel}>Type</Text>
                                <Text style={styles.clientValue}>
                                    [PM] Personne morale
                                </Text>
                            </View>

                            <View style={styles.clientRow}>
                                <Text style={styles.clientLabel}>Nom</Text>
                                <Text style={styles.clientValue}>
                                    {invoice.client}
                                </Text>
                            </View>

                            <View style={styles.clientRow}>
                                <Text style={styles.clientLabel}>NIF</Text>
                                <Text style={styles.clientValue}>
                                    {invoice.clientNif || "-"}
                                </Text>
                            </View>

                            <View style={styles.clientRow}>
                                <Text style={styles.clientLabel}>Adresse</Text>
                                <Text style={styles.clientValue}>
                                    {invoice.clientAddress}
                                </Text>
                            </View>

                            <View style={styles.clientRow}>
                                <Text style={styles.clientLabel}>Contact</Text>
                                <Text style={styles.clientValue}>
                                    {invoice.telephone}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.documentTitle}>
                    <Text style={styles.documentTitleMain}>
                        FACTURE DE VENTE
                    </Text>
                    <Text style={styles.documentTitleSub}>
                        Facture n° {invoice.invoice || "N/A"}
                    </Text>
                </View>

                <Text style={styles.thanks}>Merci pour la confiance!</Text>

                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.colIndex, styles.th]}>#</Text>
                        <Text style={[styles.colDesignation, styles.th]}>
                            Designation
                        </Text>
                        <Text style={[styles.colUnit, styles.th]}>
                            Prix unitaire (HT)
                        </Text>
                        <Text style={[styles.colQty, styles.th]}>
                            Quantité
                        </Text>
                        <Text style={[styles.colAmount, styles.th]}>
                            Montant (HT)
                        </Text>
                    </View>

                    {invoice.lines.map((line, index) => (
                        <View key={line.id} style={styles.row}>
                            <Text style={[styles.colIndex, styles.cell]}>
                                {index + 1}
                            </Text>

                            <Text style={[styles.colDesignation, styles.cell]}>
                                {line.designation}
                            </Text>

                            <Text style={[styles.colUnit, styles.cell]}>
                                {formatAmount(line.unitPrice)}
                            </Text>

                            <Text style={[styles.colQty, styles.cell]}>
                                {line.quantity}
                            </Text>

                            <Text style={[styles.colAmount, styles.cell]}>
                                {formatAmount(line.subtotal)}
                            </Text>
                        </View>
                    ))}
                </View>

                <View style={styles.recap}>
                    <View style={styles.recapLeft}>
                        <Text style={styles.recapStrong}>
                            Nombre d’articles: {invoice.lines.length}
                        </Text>
                    </View>

                    <View style={styles.recapCenter}>
                        {invoice.taxGroups.map((group) => (
                            <React.Fragment key={group.rate}>
                                <View style={styles.taxRow}>
                                    <Text style={styles.recapText}>
                                        H.T. Taxable {group.rate}%
                                    </Text>
                                    <Text style={styles.recapText}>
                                        {formatAmount(group.subtotal)}
                                    </Text>
                                </View>

                                <View style={styles.taxRow}>
                                    <Text style={styles.recapText}>
                                        TVA Taxable {group.rate}%
                                    </Text>
                                    <Text style={styles.recapText}>
                                        {formatAmount(group.taxAmount)}
                                    </Text>
                                </View>
                            </React.Fragment>
                        ))}

                        <View style={styles.taxRow}>
                            <Text style={styles.recapStrong}>TOTAL TVA</Text>
                            <Text style={styles.recapStrong}>
                                {formatAmount(invoice.taxTotal)}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.recapRight}>
                        <Text style={styles.recapStrong}>
                            Mode de paiement : VIREMENT
                        </Text>
                        <Text style={styles.recapText}>
                            Banque Centrale du Congo
                        </Text>
                        <Text style={styles.recapStrong}>
                            Montant en USD : -
                        </Text>
                    </View>
                </View>

                <View style={styles.totalTtc}>
                    <Text style={styles.totalTtcText}>
                        Total TTC: {invoice.currency} {formatAmount(invoice.total)}
                    </Text>
                </View>

                <View style={styles.securityTitle}>
                    <Text style={styles.securityText}>
                        --- ELEMENTS DE SECURITE DE LA FACTURE NORMALISEE ---
                    </Text>

                    <Text style={styles.securityCode}>ISF: DGI-RDC-01</Text>
                </View>

                <View style={styles.notNormalizedBox}>
                    <Text style={styles.notNormalizedText}>
                        La facture n&apos;est pas normalisée !
                    </Text>
                </View>
            </Page>
        </Document>
    );
}
