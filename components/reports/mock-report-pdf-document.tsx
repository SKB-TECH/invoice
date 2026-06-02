import {
    Document,
    Page,
    StyleSheet,
    Text,
    View,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontSize: 10,
        color: "#1e293b",
        fontFamily: "Helvetica",
    },
    badge: {
        marginBottom: 20,
        padding: 8,
        backgroundColor: "#eff6ff",
        borderWidth: 1,
        borderColor: "#0073C5",
    },
    badgeText: {
        fontSize: 9,
        color: "#0073C5",
    },
    title: {
        fontSize: 18,
        fontWeight: 700,
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 10,
        color: "#64748b",
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: 700,
        marginBottom: 8,
        color: "#0073C5",
    },
    row: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#e2e8f0",
        paddingVertical: 6,
    },
    label: {
        width: "40%",
        color: "#64748b",
    },
    value: {
        width: "60%",
    },
    footer: {
        position: "absolute",
        bottom: 32,
        left: 40,
        right: 40,
        fontSize: 8,
        color: "#94a3b8",
        textAlign: "center",
    },
});

type FilterRow = { label: string; value: string };

type Props = {
    reportTitle: string;
    reportKind: string;
    generatedAt: string;
    filterRows: FilterRow[];
};

export function MockReportPdfDocument({
    reportTitle,
    reportKind,
    generatedAt,
    filterRows,
}: Props) {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>APERÇU SIMULÉ</Text>
                </View>

                <Text style={styles.title}>{reportTitle}</Text>
                <Text style={styles.subtitle}>
                    Type : {reportKind} · Généré le {generatedAt}
                </Text>

                <Text style={styles.sectionTitle}>Filtres appliqués</Text>
                {filterRows.length > 0 ? (
                    filterRows.map((row) => (
                        <View key={row.label} style={styles.row}>
                            <Text style={styles.label}>{row.label}</Text>
                            <Text style={styles.value}>{row.value}</Text>
                        </View>
                    ))
                ) : (
                    <Text style={styles.value}>Aucun filtre (toutes les données)</Text>
                )}

                <Text style={styles.footer}>iKwook Invoice</Text>
            </Page>
        </Document>
    );
}
