import {
    Document,
    Image,
    Page,
    StyleSheet,
    Text,
    View,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontSize: 10,
        color: "#334155",
        fontFamily: "Helvetica",
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 48,
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
    reportTitle: {
        fontSize: 36,
        fontWeight: 700,
        color: "#000",
        textTransform: "uppercase",
    },
    metaRule: {
        borderBottomWidth: 2,
        borderBottomColor: "#000",
        paddingBottom: 8,
        marginBottom: 20,
    },
    metaLine: {
        fontSize: 10,
        fontWeight: 700,
        textTransform: "uppercase",
        marginBottom: 4,
        color: "#000",
    },
    objectLabel: {
        fontSize: 10,
        fontWeight: 700,
        textTransform: "uppercase",
        marginBottom: 12,
        color: "#000",
    },
    objectValue: {
        fontSize: 14,
        fontWeight: 700,
        color: "#1e293b",
        marginBottom: 40,
    },
    tableHeader: {
        flexDirection: "row",
        borderBottomWidth: 2,
        borderBottomColor: "#000",
        paddingBottom: 10,
        marginBottom: 0,
    },
    tableHeaderCell: {
        width: "50%",
        fontSize: 10,
        fontWeight: 700,
        color: "#000",
    },
    tableHeaderCellRight: {
        width: "50%",
        fontSize: 10,
        fontWeight: 700,
        color: "#000",
        textAlign: "right",
    },
    tableRow: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#94a3b8",
        paddingVertical: 14,
    },
    tableCell: {
        width: "50%",
        fontSize: 10,
        fontWeight: 600,
        color: "#334155",
    },
    tableCellRight: {
        width: "50%",
        fontSize: 10,
        fontWeight: 600,
        color: "#334155",
        textAlign: "right",
    },
    emptyMessage: {
        paddingVertical: 24,
        fontSize: 10,
        fontWeight: 600,
        color: "#64748b",
    },
    footer: {
        marginTop: 40,
        borderTopWidth: 1,
        borderTopColor: "#000",
        paddingTop: 24,
    },
    footerText: {
        fontSize: 10,
        color: "#475569",
        lineHeight: 1.4,
    },
});

type FilterRow = { label: string; value: string };

type Props = {
    reportTitle: string;
    reportKind: string;
    generatedAt: string;
    emitterName?: string;
    logoUrl?: string;
    filterRows: FilterRow[];
};

export function ReportDocumentPdfDocument({
    reportTitle,
    reportKind,
    generatedAt,
    logoUrl,
    filterRows,
}: Props) {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.headerRow}>
                    <View style={styles.brandRow}>
                        {logoUrl ? (
                            <Image
                                src={logoUrl}
                                style={styles.logo}
                            />
                        ) : null}
                    </View>
                    <Text style={styles.reportTitle}>Rapport</Text>
                </View>

                <View style={styles.metaRule}>
                    <Text style={styles.metaLine}>
                        Généré le : {generatedAt}
                    </Text>
                    <Text style={styles.metaLine}>Type : {reportKind}</Text>
                </View>

                <Text style={styles.objectLabel}>Objet du rapport :</Text>
                <Text style={styles.objectValue}>{reportTitle}</Text>

                <View style={styles.tableHeader}>
                    <Text style={styles.tableHeaderCell}>Critère</Text>
                    <Text style={styles.tableHeaderCellRight}>Valeur</Text>
                </View>

                {filterRows.length > 0 ? (
                    filterRows.map((row) => (
                        <View key={row.label} style={styles.tableRow}>
                            <Text style={styles.tableCell}>{row.label}</Text>
                            <Text style={styles.tableCellRight}>
                                {row.value}
                            </Text>
                        </View>
                    ))
                ) : (
                    <Text style={styles.emptyMessage}>
                        Aucun filtre. Toutes les données de la période sont
                        incluses.
                    </Text>
                )}

                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Document généré selon les critères ci-dessus.
                    </Text>
                </View>
            </Page>
        </Document>
    );
}
