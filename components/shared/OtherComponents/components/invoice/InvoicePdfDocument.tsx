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
    groupType?: string;
    unit?: string;
    designation: string;
    quantity: number;
    unitPrice: number;
    taxRate?: number;
    subtotal?: number;
    taxAmount?: number;
    lineTotal?: number;
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
    number?: string;

    senderName?: string;
    senderLegalName?: string;
    senderAddress?: string;
    senderPhone?: string;
    senderEmail?: string;
    senderNif?: string;
    senderRccm?: string;
    senderIdnat?: string;

    client: string;
    clientAddress: string;
    telephone: string;
    clientEmail?: string;
    clientType?: string;
    clientNif?: string;
    clientRccm?: string;
    clientIdnat?: string;

    currency: "CDF" | "USD";
    createdAt: string;
    dueDate: string;

    invoiceTypeCode?: string;
    invoiceTypeTitle?: string;
    fiscalRegime?: string;
    isDuplicate?: boolean;
    isf?: string;
    defMcf?: string;

    contractReference?: string;
    paymentMethod?: string;
    paymentBankName?: string;
    paymentAccountNumber?: string;

    amountHT?: number;
    taxAmount?: number;
    totalAmount?: number;

    comments?: InvoicePdfComments;
    lines: InvoicePdfLine[];
};

function formatAmount(amount: number, currency?: string) {
    const value = Number(amount || 0);

    return `${currency ? `${currency} ` : ""}${new Intl.NumberFormat("fr-FR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    })
        .format(value)
        .replace(/\s/g, ".")}`;
}

function safe(value?: any, fallback = "-") {
    if (value === null || value === undefined) return fallback;
    if (String(value).trim() === "") return fallback;
    return String(value);
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
        paddingTop: 36,
        paddingBottom: 32,
        paddingHorizontal: 36,
        fontFamily: "Helvetica",
        fontSize: 8,
        color: "#111111",
        backgroundColor: "#ffffff",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 24,
    },
    brand: {
        fontSize: 22,
        fontWeight: 900,
        color: "#0f172a",
    },
    brandSub: {
        marginTop: 3,
        fontSize: 7,
        letterSpacing: 3,
        textTransform: "uppercase",
        color: "#334155",
    },
    titleBox: {
        alignItems: "flex-end",
    },
    title: {
        fontSize: 34,
        fontWeight: 900,
        textTransform: "uppercase",
        color: "#000000",
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
        fontSize: 8,
        fontWeight: 800,
        lineHeight: 1.4,
        textTransform: "uppercase",
    },
    contractText: {
        fontSize: 10,
        fontWeight: 900,
        textTransform: "uppercase",
        marginTop: 36,
    },
    parties: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 14,
        marginBottom: 28,
    },
    partyLeft: {
        width: "46%",
    },
    partyRight: {
        width: "46%",
        textAlign: "right",
    },
    partyTitle: {
        fontSize: 9,
        fontWeight: 900,
        marginBottom: 8,
        textTransform: "uppercase",
    },
    partyText: {
        fontSize: 8,
        fontWeight: 700,
        lineHeight: 1.35,
    },
    tableHeader: {
        flexDirection: "row",
        backgroundColor: "#e5e7eb",
        paddingVertical: 7,
        paddingHorizontal: 6,
        fontWeight: 900,
    },
    tableRow: {
        flexDirection: "row",
        borderBottomWidth: 0.7,
        borderBottomColor: "#cbd5e1",
        paddingVertical: 8,
        paddingHorizontal: 6,
    },
    colNo: { width: "4%" },
    colCode: { width: "8%" },
    colDesignation: { width: "25%" },
    colGroup: { width: "10%" },
    colPu: { width: "11%", textAlign: "right" },
    colQtyUnit: { width: "10%", textAlign: "center" },
    colHt: { width: "11%", textAlign: "right" },
    colTva: { width: "10%", textAlign: "right" },
    colTtc: { width: "11%", textAlign: "right" },
    th: {
        fontSize: 7,
        fontWeight: 900,
        color: "#334155",
    },
    cell: {
        fontSize: 8,
        fontWeight: 700,
        color: "#334155",
    },
    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 26,
    },
    payment: {
        width: "45%",
    },
    paymentTitle: {
        fontSize: 12,
        fontWeight: 900,
        marginBottom: 12,
        textTransform: "uppercase",
    },
    paymentText: {
        fontSize: 8,
        lineHeight: 1.45,
    },
    totals: {
        width: "38%",
    },
    totalRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    totalLabel: {
        fontSize: 11,
        fontWeight: 900,
    },
    totalValue: {
        fontSize: 11,
        fontWeight: 900,
    },
    totalLine: {
        borderTopWidth: 0.8,
        borderTopColor: "#111111",
        paddingTop: 10,
    },
    securityBlock: {
        marginTop: 28,
        borderWidth: 1,
        borderColor: "#cbd5e1",
        backgroundColor: "#f8fafc",
        padding: 10,
    },
    securityTitle: {
        fontSize: 8,
        fontWeight: 900,
        textTransform: "uppercase",
        marginBottom: 8,
    },
    securityGrid: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    securityCol: {
        width: "48%",
    },
    securityText: {
        fontSize: 7.5,
        lineHeight: 1.45,
        color: "#334155",
    },
    warningText: {
        marginTop: 10,
        fontSize: 7.5,
        color: "#dc2626",
        fontStyle: "italic",
    },
    commentsTitle: {
        marginTop: 24,
        marginBottom: 7,
        fontSize: 9,
        fontWeight: 900,
        textTransform: "uppercase",
    },
    commentsBlock: {
        borderWidth: 1,
        borderColor: "#94a3b8",
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
        width: "10%",
        padding: 5,
        fontSize: 7,
    },
    commentLabel: {
        width: "25%",
        padding: 5,
        fontSize: 7,
    },
    commentValue: {
        width: "65%",
        padding: 5,
        fontSize: 7,
    },
});

export function InvoicePdfDocument({ invoice }: { invoice: InvoicePdfData }) {
    const amountHT =
        typeof invoice.amountHT === "number"
            ? invoice.amountHT
            : invoice.lines.reduce(
                (sum, line) =>
                    sum +
                    Number(line.subtotal ?? line.quantity * line.unitPrice),
                0,
            );

    const taxAmount =
        typeof invoice.taxAmount === "number"
            ? invoice.taxAmount
            : invoice.lines.reduce((sum, line) => {
                const rate = Number(line.taxRate ?? 0);
                return (
                    sum +
                    Number(
                        line.taxAmount ??
                        line.quantity * line.unitPrice * (rate / 100),
                    )
                );
            }, 0);

    const totalAmount =
        typeof invoice.totalAmount === "number"
            ? invoice.totalAmount
            : amountHT + taxAmount;

    const invoiceTypeCode = invoice.invoiceTypeCode || "FV";
    const invoiceTypeTitle = invoice.invoiceTypeTitle || "FACTURE DE VENTE";
    const fiscalRegime = invoice.fiscalRegime || "TTC";
    const isf = invoice.isf || "En attente DGI";
    const defMcf = invoice.defMcf || "En attente de normalisation";

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.brand}>iKwook</Text>
                        <Text style={styles.brandSub}>Invoice</Text>
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
                        <Text style={styles.metaText}>
                            DATE : {safe(invoice.createdAt)}
                        </Text>
                        <Text style={styles.metaText}>
                            ÉCHÉANCE : {safe(invoice.dueDate)}
                        </Text>
                        <Text style={styles.metaText}>
                            N° FACTURE : {safe(invoice.number || invoice.invoice)}
                        </Text>
                        <Text style={styles.metaText}>
                            RÉGIME : {fiscalRegime}
                        </Text>
                    </View>

                    <Text style={styles.contractText}>
                        CONTRAT : {safe(invoice.contractReference)}
                    </Text>
                </View>

                <View style={styles.parties}>
                    <View style={styles.partyLeft}>
                        <Text style={styles.partyTitle}>Émetteur :</Text>
                        <Text style={styles.partyText}>
                            {safe(invoice.senderLegalName || invoice.senderName)}
                            {"\n"}
                            NIF : {safe(invoice.senderNif)}
                            {"\n"}
                            RCCM : {safe(invoice.senderRccm)}
                            {"\n"}
                            ID Nat : {safe(invoice.senderIdnat)}
                            {"\n"}
                            {safe(invoice.senderEmail)}
                            {"\n"}
                            {safe(invoice.senderPhone)}
                            {"\n"}
                            {safe(invoice.senderAddress)}
                        </Text>
                    </View>

                    <View style={styles.partyRight}>
                        <Text style={styles.partyTitle}>Destinataire :</Text>
                        <Text style={styles.partyText}>
                            Type : {safe(invoice.clientType)}
                            {"\n"}
                            {safe(invoice.client)}
                            {"\n"}
                            NIF : {safe(invoice.clientNif)}
                            {"\n"}
                            RCCM : {safe(invoice.clientRccm)}
                            {"\n"}
                            ID Nat : {safe(invoice.clientIdnat)}
                            {"\n"}
                            {safe(invoice.clientEmail)}
                            {"\n"}
                            {safe(invoice.telephone)}
                            {"\n"}
                            {safe(invoice.clientAddress)}
                        </Text>
                    </View>
                </View>

                <View>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.colNo, styles.th]}>#</Text>
                        <Text style={[styles.colCode, styles.th]}>Code</Text>
                        <Text style={[styles.colDesignation, styles.th]}>
                            Désignation
                        </Text>
                        <Text style={[styles.colGroup, styles.th]}>
                            Grp/Type
                        </Text>
                        <Text style={[styles.colPu, styles.th]}>P.U.</Text>
                        <Text style={[styles.colQtyUnit, styles.th]}>
                            Qté/Unité
                        </Text>
                        <Text style={[styles.colHt, styles.th]}>H.T.</Text>
                        <Text style={[styles.colTva, styles.th]}>TVA</Text>
                        <Text style={[styles.colTtc, styles.th]}>TTC</Text>
                    </View>

                    {invoice.lines.map((line, index) => {
                        const rate = Number(line.taxRate ?? 0);
                        const subtotal = Number(
                            line.subtotal ?? line.quantity * line.unitPrice,
                        );
                        const tax = Number(
                            line.taxAmount ?? subtotal * (rate / 100),
                        );
                        const total = Number(line.lineTotal ?? subtotal + tax);

                        return (
                            <View key={line.id} style={styles.tableRow}>
                                <Text style={[styles.colNo, styles.cell]}>
                                    {index + 1}
                                </Text>
                                <Text style={[styles.colCode, styles.cell]}>
                                    {safe(line.code, "BIE")}
                                </Text>
                                <Text
                                    style={[
                                        styles.colDesignation,
                                        styles.cell,
                                    ]}
                                >
                                    {safe(line.designation)}
                                </Text>
                                <Text style={[styles.colGroup, styles.cell]}>
                                    {safe(line.groupType)}
                                </Text>
                                <Text style={[styles.colPu, styles.cell]}>
                                    {formatAmount(line.unitPrice)}
                                </Text>
                                <Text
                                    style={[styles.colQtyUnit, styles.cell]}
                                >
                                    {line.quantity}
                                    {safe(line.unit, "")}
                                </Text>
                                <Text style={[styles.colHt, styles.cell]}>
                                    {formatAmount(subtotal)}
                                </Text>
                                <Text style={[styles.colTva, styles.cell]}>
                                    {formatAmount(tax)}
                                </Text>
                                <Text style={[styles.colTtc, styles.cell]}>
                                    {formatAmount(total)}
                                </Text>
                            </View>
                        );
                    })}
                </View>

                <View style={styles.footer}>
                    <View style={styles.payment}>
                        <Text style={styles.paymentTitle}>Règlement :</Text>
                        <Text style={styles.paymentText}>
                            Mode : {safe(invoice.paymentMethod)}
                            {"\n"}
                            Banque : {safe(invoice.paymentBankName)}
                            {"\n"}
                            Compte : {safe(invoice.paymentAccountNumber)}
                        </Text>
                    </View>

                    <View style={styles.totals}>
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Sous-total :</Text>
                            <Text style={styles.totalValue}>
                                {formatAmount(amountHT, invoice.currency)}
                            </Text>
                        </View>

                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>TVA :</Text>
                            <Text style={styles.totalValue}>
                                {formatAmount(taxAmount, invoice.currency)}
                            </Text>
                        </View>

                        <View style={[styles.totalRow, styles.totalLine]}>
                            <Text style={styles.totalLabel}>Total TTC :</Text>
                            <Text style={styles.totalValue}>
                                {formatAmount(totalAmount, invoice.currency)}
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
                                Type facture : {invoiceTypeCode} -{" "}
                                {invoiceTypeTitle}
                            </Text>
                            <Text style={styles.securityText}>
                                Régime facture : {fiscalRegime}
                            </Text>
                            <Text style={styles.securityText}>
                                ISF : {isf}
                            </Text>
                            <Text style={styles.securityText}>
                                DEF / MCF : {defMcf}
                            </Text>
                        </View>

                        <View style={styles.securityCol}>
                            <Text style={styles.securityText}>
                                QR Code DGI : À générer après normalisation
                            </Text>
                            <Text style={styles.securityText}>
                                Duplicata :{" "}
                                {invoice.isDuplicate ? "OUI" : "NON"}
                            </Text>
                            <Text style={styles.securityText}>
                                Date émission : {safe(invoice.createdAt)}
                            </Text>
                            <Text style={styles.securityText}>
                                N° série facture : {safe(invoice.invoice)}
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.warningText}>
                        Cette facture devient normalisée uniquement après
                        validation par le dispositif fiscal agréé DGI.
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
