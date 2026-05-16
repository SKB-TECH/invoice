import {
    Document,
    Page,
    StyleSheet,
    Text,
    View,
} from "@react-pdf/renderer";

import type { InvoiceForm, InvoiceItem } from "../types";
import {
    formatMoney,
    getLineSubtotal,
    getTaxGroups,
} from "../utils";

type Props = {
    form: InvoiceForm;
    items: InvoiceItem[];
    subtotal: number;
    tax: number;
    total: number;
    taxGroups: ReturnType<typeof getTaxGroups>;
};

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontSize: 9,
        color: "#111111",
        fontFamily: "Helvetica",
    },

    top: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 22,
    },

    issuer: {
        width: "48%",
    },

    issuerTitle: {
        fontSize: 13,
        fontWeight: 700,
        marginBottom: 6,
    },

    infoLine: {
        marginBottom: 3,
    },

    clientBox: {
        width: "48%",
        borderWidth: 1,
        borderColor: "#6B7280",
    },

    clientHeader: {
        backgroundColor: "#6B7280",
        color: "#FFFFFF",
        paddingVertical: 5,
        paddingHorizontal: 8,
        fontWeight: 700,
    },

    clientBody: {
        padding: 8,
    },

    clientRow: {
        flexDirection: "row",
        marginBottom: 5,
    },

    clientLabel: {
        width: "28%",
        fontStyle: "italic",
    },

    clientValue: {
        width: "72%",
        fontWeight: 700,
    },

    centerTitle: {
        alignItems: "center",
        marginBottom: 18,
    },

    title: {
        fontSize: 18,
        fontWeight: 700,
    },

    subtitle: {
        marginTop: 4,
        fontSize: 11,
    },

    thanks: {
        marginBottom: 8,
    },

    tableHeader: {
        flexDirection: "row",
        backgroundColor: "#E5E7EB",
        paddingVertical: 6,
        paddingHorizontal: 6,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: "#9CA3AF",
    },

    tableRow: {
        flexDirection: "row",
        paddingVertical: 7,
        paddingHorizontal: 6,
        borderBottomWidth: 0.5,
        borderBottomColor: "#D1D5DB",
    },

    cIndex: {
        width: "7%",
    },

    cDesignation: {
        width: "35%",
    },

    cPrice: {
        width: "22%",
        textAlign: "right",
    },

    cQty: {
        width: "14%",
        textAlign: "right",
    },

    cAmount: {
        width: "22%",
        textAlign: "right",
    },

    detailsGrid: {
        flexDirection: "row",
        marginTop: 18,
        justifyContent: "space-between",
    },

    leftBlock: {
        width: "25%",
    },

    centerBlock: {
        width: "40%",
    },

    rightBlock: {
        width: "30%",
    },

    amountRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 4,
    },

    bold: {
        fontWeight: 700,
    },

    totalBar: {
        marginTop: 18,
        borderBottomWidth: 1.5,
        borderBottomColor: "#111111",
        alignItems: "flex-end",
        paddingBottom: 6,
    },

    totalText: {
        fontSize: 14,
        fontWeight: 700,
        letterSpacing: 2,
    },

    security: {
        flexDirection: "row",
        justifyContent: "space-between",
        borderTopWidth: 0.5,
        borderTopColor: "#D1D5DB",
        marginTop: 20,
        paddingTop: 6,
        fontSize: 8,
        fontStyle: "italic",
    },

    warning: {
        marginTop: 10,
        borderWidth: 1,
        borderColor: "#FCA5A5",
        backgroundColor: "#FEF2F2",
        paddingVertical: 16,
        alignItems: "center",
    },

    warningText: {
        color: "#EF4444",
        fontSize: 12,
        fontWeight: 700,
    },
});

export function InvoiceTemplateBPdf({
                                        form,
                                        items,
                                        tax,
                                        total,
                                        taxGroups,
                                    }: Props) {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.top}>
                    <View style={styles.issuer}>
                        <Text style={styles.issuerTitle}>
                            IKWOK EXPRESS SARL
                        </Text>
                        <Text style={styles.infoLine}>
                            Point de vente : IKWOK EXPRESS SARL
                        </Text>
                        <Text style={styles.infoLine}>NIF : A1801326M</Text>
                        <Text style={styles.infoLine}>76 AV. JUSTICE</Text>
                        <Text style={styles.infoLine}>
                            IMM. HAMDAM, No 76 av. de la JUSTICE
                        </Text>
                        <Text style={styles.infoLine}>C/GOMBE</Text>
                        <Text style={styles.infoLine}>KINSHASA</Text>
                        <Text style={styles.infoLine}>0820191921</Text>
                        <Text style={styles.infoLine}>
                            FINANCE@IKWOOK.COM
                        </Text>
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
                                    {form.clientName || "-"}
                                </Text>
                            </View>

                            <View style={styles.clientRow}>
                                <Text style={styles.clientLabel}>NIF</Text>
                                <Text style={styles.clientValue}>
                                    {form.nif || "-"}
                                </Text>
                            </View>

                            <View style={styles.clientRow}>
                                <Text style={styles.clientLabel}>Adresse</Text>
                                <Text style={styles.clientValue}>
                                    {form.address || "-"}
                                </Text>
                            </View>

                            <View style={styles.clientRow}>
                                <Text style={styles.clientLabel}>Contact</Text>
                                <Text style={styles.clientValue}>
                                    {form.phone || "-"}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.centerTitle}>
                    <Text style={styles.title}>FACTURE DE VENTE</Text>
                    <Text style={styles.subtitle}>Facture n° N/A</Text>
                </View>

                <Text style={styles.thanks}>Merci pour la confiance !</Text>

                <View style={styles.tableHeader}>
                    <Text style={styles.cIndex}>#</Text>
                    <Text style={styles.cDesignation}>Désignation</Text>
                    <Text style={styles.cPrice}>Prix unitaire HT</Text>
                    <Text style={styles.cQty}>Quantité</Text>
                    <Text style={styles.cAmount}>Montant HT</Text>
                </View>

                {items.map((item, index) => (
                    <View key={item.id} style={styles.tableRow}>
                        <Text style={styles.cIndex}>{index + 1}</Text>

                        <Text style={styles.cDesignation}>{item.name}</Text>

                        <Text style={styles.cPrice}>
                            {formatMoney(
                                item.type === "Article"
                                    ? item.priceHT
                                    : item.dailyPrice ?? 0
                            )}
                        </Text>

                        <Text style={styles.cQty}>
                            {item.type === "Article"
                                ? item.quantity
                                : `${item.men ?? 1} × ${item.days ?? 1}`}
                        </Text>

                        <Text style={styles.cAmount}>
                            {formatMoney(getLineSubtotal(item))}
                        </Text>
                    </View>
                ))}

                <View style={styles.detailsGrid}>
                    <View style={styles.leftBlock}>
                        <Text style={styles.bold}>
                            Nombre d’articles : {items.length}
                        </Text>
                    </View>

                    <View style={styles.centerBlock}>
                        {taxGroups.map((group) => (
                            <View key={group.rate}>
                                <View style={styles.amountRow}>
                                    <Text>H.T. Taxable {group.rate}%</Text>
                                    <Text>{formatMoney(group.subtotal)}</Text>
                                </View>

                                <View style={styles.amountRow}>
                                    <Text>TVA Taxable {group.rate}%</Text>
                                    <Text>{formatMoney(group.taxAmount)}</Text>
                                </View>
                            </View>
                        ))}

                        <View style={styles.amountRow}>
                            <Text style={styles.bold}>TOTAL TVA</Text>
                            <Text style={styles.bold}>
                                {formatMoney(tax)}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.rightBlock}>
                        <Text style={styles.infoLine}>
                            Mode de paiement : VIREMENT
                        </Text>
                        <Text style={styles.infoLine}>
                            Banque Centrale du Congo
                        </Text>
                        <Text style={styles.infoLine}>Montant en USD : -</Text>
                    </View>
                </View>

                <View style={styles.totalBar}>
                    <Text style={styles.totalText}>
                        Total TTC : {form.currency} {formatMoney(total)}
                    </Text>
                </View>

                <View style={styles.security}>
                    <Text>
                        --- ÉLÉMENTS DE SÉCURITÉ DE LA FACTURE NORMALISÉE ---
                    </Text>
                    <Text>ISF: DGI-RDC-01</Text>
                </View>

                <View style={styles.warning}>
                    <Text style={styles.warningText}>
                        La facture n&apos;est pas normalisée !
                    </Text>
                </View>
            </Page>
        </Document>
    );
}
