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
    code?: string;
    designation: string;
    quantity: number;
    unitPrice: number;
    taxRate?: number;
};

type InvoicePdfComments = {
    A?: string;
    B?: string;
    C?: string;
    D?: string;
    E?: string;
    F?: string;
    G?: string;
    H?: string;
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

    clientType?: string;
    clientNif?: string;
    clientRccm?: string;
    clientIdnat?: string;
    invoiceTypeCode?: string;
    invoiceTypeTitle?: string;
    fiscalRegime?: string;
    isDuplicate?: boolean;
    isf?: string;
    defMcf?: string;
    comments?: InvoicePdfComments;
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

const COMMENT_FIELDS = [
    ["A", "Réf. Exo."],
    ["B", "Réf. Paiement"],
    ["C", "Réf. Contrat"],
    ["D", "Réf. Bon commande"],
    ["E", "Réf. Livraison"],
    ["F", "Note interne"],
    ["G", "Observation"],
    ["H", "Autre commentaire"],
] as const;

const styles = StyleSheet.create({
    page: {
        paddingTop: 42,
        paddingBottom: 36,
        paddingHorizontal: 42,
        fontFamily: "Helvetica",
        fontSize: 9,
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
        marginBottom: 28,
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
    titleBox: {
        alignItems: "flex-end",
    },
    title: {
        fontSize: 38,
        fontWeight: 900,
        textTransform: "uppercase",
    },
    invoiceType: {
        marginTop: 4,
        fontSize: 9,
        fontWeight: 900,
        textTransform: "uppercase",
    },
    meta: {
        flexDirection: "row",
        justifyContent: "space-between",
        borderBottomWidth: 1.5,
        borderBottomColor: "#111111",
        paddingBottom: 8,
        marginBottom: 14,
    },
    metaText: {
        fontSize: 9,
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
        marginBottom: 34,
    },
    partyLeft: {
        width: "44%",
    },
    partyRight: {
        width: "44%",
        textAlign: "right",
    },
    partyTitle: {
        fontSize: 10,
        fontWeight: 900,
        marginBottom: 8,
        textTransform: "uppercase",
    },
    partyText: {
        fontSize: 9,
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
        paddingVertical: 8,
    },
    numCol: {
        width: "7%",
    },
    codeCol: {
        width: "11%",
    },
    descriptionCol: {
        width: "34%",
    },
    unitCol: {
        width: "18%",
        textAlign: "right",
    },
    qtyCol: {
        width: "10%",
        textAlign: "right",
    },
    taxCol: {
        width: "9%",
        textAlign: "right",
    },
    totalCol: {
        width: "11%",
        textAlign: "right",
    },
    th: {
        fontSize: 8,
        fontWeight: 900,
    },
    cell: {
        fontSize: 9,
    },
    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 18,
    },
    payment: {
        width: "42%",
        marginTop: 26,
    },
    paymentTitle: {
        fontSize: 12,
        fontWeight: 900,
        marginBottom: 10,
        textTransform: "uppercase",
    },
    paymentText: {
        fontSize: 9,
        lineHeight: 1.35,
    },
    totals: {
        width: "40%",
    },
    totalRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 7,
    },
    totalLabel: {
        fontSize: 10,
        fontWeight: 900,
    },
    totalValue: {
        fontSize: 10,
        fontWeight: 900,
    },
    securityBlock: {
        marginTop: 18,
        borderWidth: 1,
        borderColor: "#cbd5e1",
        backgroundColor: "#f8fafc",
        padding: 9,
    },
    securityTitle: {
        fontSize: 9,
        fontWeight: 900,
        textTransform: "uppercase",
        marginBottom: 6,
    },
    securityGrid: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    securityCol: {
        width: "48%",
    },
    securityText: {
        fontSize: 8,
        lineHeight: 1.35,
    },
    warningText: {
        marginTop: 6,
        fontSize: 8,
        color: "#dc2626",
        fontStyle: "italic",
    },
    commentsBlock: {
        marginTop: 14,
        borderWidth: 1,
        borderColor: "#94a3b8",
    },
    commentsTitle: {
        marginBottom: 5,
        fontSize: 9,
        fontWeight: 900,
        textTransform: "uppercase",
    },
    commentsRow: {
        flexDirection: "row",
        borderBottomWidth: 0.6,
        borderBottomColor: "#cbd5e1",
    },
    commentsHeader: {
        backgroundColor: "#e2e8f0",
        fontWeight: 900,
    },
    commentCode: {
        width: "12%",
        padding: 4,
        fontSize: 7,
    },
    commentLabel: {
        width: "30%",
        padding: 4,
        fontSize: 7,
    },
    commentValue: {
        width: "58%",
        padding: 4,
        fontSize: 7,
    },
});

export function InvoicePdfDocument({ invoice }: { invoice: InvoicePdfData }) {
    const subtotal = invoice.lines.reduce(
        (sum, line) => sum + line.quantity * line.unitPrice,
        0
    );

    const tax = invoice.lines.reduce((sum, line) => {
        const rate = Number(line.taxRate ?? 16);
        return sum + line.quantity * line.unitPrice * (rate / 100);
    }, 0);

    const total = subtotal + tax;

    const invoiceTypeCode = invoice.invoiceTypeCode || "FV";
    const invoiceTypeTitle = invoice.invoiceTypeTitle || "FACTURE DE VENTE";
    const fiscalRegime = invoice.fiscalRegime || "TTC";
    const isf = invoice.isf || "En attente DGI";
    const defMcf = invoice.defMcf || "En attente de normalisation";
    const clientType = invoice.clientType || "PM - Personne Morale";

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

                    <View style={styles.titleBox}>
                        <Text style={styles.title}>FACTURE</Text>
                        <Text style={styles.invoiceType}>
                            {invoiceTypeCode} - {invoiceTypeTitle}
                        </Text>
                    </View>
                </View>

                <View style={styles.meta}>
                    <View>
                        <Text style={styles.metaText}>DATE : {invoice.createdAt}</Text>
                        <Text style={styles.metaText}>ÉCHÉANCE : {invoice.dueDate}</Text>
                        <Text style={styles.metaText}>RÉGIME : {fiscalRegime}</Text>
                        <Text style={styles.metaText}>
                            DUPLICATA : {invoice.isDuplicate ? "OUI" : "NON"}
                        </Text>
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
                            NIF : A1801326M{"\n"}
                            RCCM : CD/KIN/RCCM/XX-X-XXXXX{"\n"}
                            contact@ikwook.cd{"\n"}
                            +243 822 204 012{"\n"}
                            Kinshasa, RDC
                        </Text>
                    </View>

                    <View style={styles.partyRight}>
                        <Text style={styles.partyTitle}>Destinataire :</Text>
                        <Text style={styles.partyText}>
                            Type : {clientType}{"\n"}
                            {invoice.client}{"\n"}
                            NIF : {invoice.clientNif || "-"}{"\n"}
                            RCCM : {invoice.clientRccm || "-"}{"\n"}
                            ID Nat : {invoice.clientIdnat || "-"}{"\n"}
                            {invoice.telephone}{"\n"}
                            {invoice.clientAddress}
                        </Text>
                    </View>
                </View>

                <View>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.numCol, styles.th]}>#</Text>
                        <Text style={[styles.codeCol, styles.th]}>Code</Text>
                        <Text style={[styles.descriptionCol, styles.th]}>
                            Désignation
                        </Text>
                        <Text style={[styles.unitCol, styles.th]}>
                            Prix HT
                        </Text>
                        <Text style={[styles.qtyCol, styles.th]}>
                            Qté
                        </Text>
                        <Text style={[styles.taxCol, styles.th]}>
                            TVA
                        </Text>
                        <Text style={[styles.totalCol, styles.th]}>
                            Total
                        </Text>
                    </View>

                    {invoice.lines.map((line, index) => {
                        const rate = Number(line.taxRate ?? 16);
                        const lineTotal =
                            line.quantity * line.unitPrice * (1 + rate / 100);

                        return (
                            <View key={line.id} style={styles.tableRow}>
                                <Text style={[styles.numCol, styles.cell]}>
                                    {index + 1}
                                </Text>
                                <Text style={[styles.codeCol, styles.cell]}>
                                    {line.code || "BIE"}
                                </Text>
                                <Text style={[styles.descriptionCol, styles.cell]}>
                                    {line.designation}
                                </Text>
                                <Text style={[styles.unitCol, styles.cell]}>
                                    {formatAmount(line.unitPrice, invoice.currency)}
                                </Text>
                                <Text style={[styles.qtyCol, styles.cell]}>
                                    {line.quantity}
                                </Text>
                                <Text style={[styles.taxCol, styles.cell]}>
                                    {rate}%
                                </Text>
                                <Text style={[styles.totalCol, styles.cell]}>
                                    {formatAmount(lineTotal, invoice.currency)}
                                </Text>
                            </View>
                        );
                    })}
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
                            <Text style={styles.totalLabel}>TOTAL TVA :</Text>
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

                <View style={styles.securityBlock}>
                    <Text style={styles.securityTitle}>
                        Éléments de sécurité / Facture normalisée
                    </Text>

                    <View style={styles.securityGrid}>
                        <View style={styles.securityCol}>
                            <Text style={styles.securityText}>
                                Type facture : {invoiceTypeCode} - {invoiceTypeTitle}
                            </Text>
                            <Text style={styles.securityText}>
                                Régime facture : {fiscalRegime}
                            </Text>
                            <Text style={styles.securityText}>ISF : {isf}</Text>
                            <Text style={styles.securityText}>DEF / MCF : {defMcf}</Text>
                        </View>

                        <View style={styles.securityCol}>
                            <Text style={styles.securityText}>
                                QR Code DGI : À générer après normalisation
                            </Text>
                            <Text style={styles.securityText}>
                                Duplicata : {invoice.isDuplicate ? "OUI" : "NON"}
                            </Text>
                            <Text style={styles.securityText}>
                                Date émission : {invoice.createdAt}
                            </Text>
                            <Text style={styles.securityText}>
                                N° série facture : {invoice.invoice}
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.warningText}>
                        Cette facture devient normalisée uniquement après validation par le dispositif fiscal agréé DGI.
                    </Text>
                </View>

                <Text style={styles.commentsTitle}>
                    Lignes de commentaires facture
                </Text>

                <View style={styles.commentsBlock}>
                    <View style={[styles.commentsRow, styles.commentsHeader]}>
                        <Text style={styles.commentCode}>Code</Text>
                        <Text style={styles.commentLabel}>Étiqueté</Text>
                        <Text style={styles.commentValue}>Contenu</Text>
                    </View>

                    {COMMENT_FIELDS.map(([code, label]) => (
                        <View key={code} style={styles.commentsRow}>
                            <Text style={styles.commentCode}>{code}</Text>
                            <Text style={styles.commentLabel}>{label}</Text>
                            <Text style={styles.commentValue}>
                                {invoice.comments?.[code] || "-"}
                            </Text>
                        </View>
                    ))}
                </View>
            </Page>
        </Document>
    );
}
