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
    getLineTotal,
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
        padding: 32,
        fontSize: 10,
        color: "#111827",
        fontFamily: "Helvetica",
    },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 28,
    },

    brand: {
        fontSize: 24,
        fontWeight: 700,
    },

    brandSub: {
        marginTop: 4,
        fontSize: 8,
        letterSpacing: 2,
    },

    title: {
        fontSize: 28,
        fontWeight: 700,
    },

    metaBar: {
        flexDirection: "row",
        justifyContent: "space-between",
        borderBottomWidth: 1.5,
        borderBottomColor: "#111827",
        paddingBottom: 8,
        marginBottom: 18,
    },

    metaText: {
        fontSize: 9,
        fontWeight: 700,
        marginBottom: 3,
    },

    parties: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 24,
    },

    partyBlock: {
        width: "48%",
    },

    partyRight: {
        width: "48%",
        alignItems: "flex-end",
    },

    sectionLabel: {
        fontSize: 10,
        fontWeight: 700,
        marginBottom: 8,
        textTransform: "uppercase",
    },

    line: {
        marginBottom: 3,
        fontSize: 9,
    },

    tableHeader: {
        flexDirection: "row",
        borderBottomWidth: 1.5,
        borderBottomColor: "#111827",
        paddingBottom: 8,
        marginBottom: 4,
    },

    tableRow: {
        flexDirection: "row",
        paddingVertical: 8,
        borderBottomWidth: 0.5,
        borderBottomColor: "#CBD5E1",
    },

    cIndex: {
        width: "6%",
    },

    cDesignation: {
        width: "38%",
    },

    cPrice: {
        width: "16%",
        textAlign: "right",
    },

    cQty: {
        width: "12%",
        textAlign: "right",
    },

    cTax: {
        width: "12%",
        textAlign: "right",
    },

    cTotal: {
        width: "16%",
        textAlign: "right",
    },

    summaryWrap: {
        marginTop: 24,
        flexDirection: "row",
        justifyContent: "space-between",
    },

    payment: {
        width: "48%",
    },

    totals: {
        width: "40%",
    },

    totalRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 7,
        fontSize: 10,
        fontWeight: 700,
    },

    grandTotal: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 6,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: "#111827",
        fontSize: 11,
        fontWeight: 700,
    },
});

export function InvoiceTemplateAPdf({
                                        form,
                                        items,
                                        subtotal,
                                        total,
                                        taxGroups,
                                    }: Props) {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.brand}>iKwook</Text>
                        <Text style={styles.brandSub}>INVOICE</Text>
                    </View>

                    <Text style={styles.title}>FACTURE</Text>
                </View>

                <View style={styles.metaBar}>
                    <View>
                        <Text style={styles.metaText}>
                            Date : {new Date().toLocaleDateString("fr-FR")}
                        </Text>
                        <Text style={styles.metaText}>
                            Échéance : {form.dueDate || "-"}
                        </Text>
                    </View>

                    <Text style={styles.metaText}>
                        Contrat : {form.contractReference || "-"}
                    </Text>
                </View>

                <View style={styles.parties}>
                    <View style={styles.partyBlock}>
                        <Text style={styles.sectionLabel}>Émetteur</Text>
                        <Text style={styles.line}>iKwook Sarl</Text>
                        <Text style={styles.line}>support.ikwook.cd</Text>
                        <Text style={styles.line}>+243 822 22 000</Text>
                        <Text style={styles.line}>
                            76, Avenue de Justice C/Gombe
                        </Text>
                    </View>

                    <View style={styles.partyRight}>
                        <Text style={styles.sectionLabel}>Destinataire</Text>
                        <Text style={styles.line}>
                            {form.clientName || "-"}
                        </Text>
                        <Text style={styles.line}>{form.email || "-"}</Text>
                        <Text style={styles.line}>{form.phone || "-"}</Text>
                        <Text style={styles.line}>{form.address || "-"}</Text>
                    </View>
                </View>

                <View style={styles.tableHeader}>
                    <Text style={styles.cIndex}>#</Text>
                    <Text style={styles.cDesignation}>Désignation</Text>
                    <Text style={styles.cPrice}>Prix HT</Text>
                    <Text style={styles.cQty}>Qté</Text>
                    <Text style={styles.cTax}>TVA</Text>
                    <Text style={styles.cTotal}>Total TTC</Text>
                </View>

                {items.map((item, index) => (
                    <View key={item.id} style={styles.tableRow}>
                        <Text style={styles.cIndex}>{index + 1}</Text>

                        <Text style={styles.cDesignation}>{item.name}</Text>

                        <Text style={styles.cPrice}>
                            {formatMoney(getLineSubtotal(item))}
                        </Text>

                        <Text style={styles.cQty}>
                            {item.type === "Article"
                                ? item.quantity
                                : `${item.men ?? 1} × ${item.days ?? 1}`}
                        </Text>

                        <Text style={styles.cTax}>{item.tax}%</Text>

                        <Text style={styles.cTotal}>
                            {formatMoney(getLineTotal(item))}
                        </Text>
                    </View>
                ))}

                <View style={styles.summaryWrap}>
                    <View style={styles.payment}>
                        <Text style={styles.sectionLabel}>Règlement</Text>
                        <Text style={styles.line}>Par virement bancaire</Text>
                        <Text style={styles.line}>Banque : Rawbank</Text>
                        <Text style={styles.line}>
                            Compte : 1234567890
                        </Text>
                    </View>

                    <View style={styles.totals}>
                        <View style={styles.totalRow}>
                            <Text>Sous-total</Text>
                            <Text>
                                {form.currency} {formatMoney(subtotal)}
                            </Text>
                        </View>

                        {taxGroups.map((group) => (
                            <View key={group.rate} style={styles.totalRow}>
                                <Text>TVA {group.rate}%</Text>
                                <Text>
                                    {form.currency}{" "}
                                    {formatMoney(group.taxAmount)}
                                </Text>
                            </View>
                        ))}

                        <View style={styles.grandTotal}>
                            <Text>Total TTC</Text>
                            <Text>
                                {form.currency} {formatMoney(total)}
                            </Text>
                        </View>
                    </View>
                </View>
            </Page>
        </Document>
    );
}
