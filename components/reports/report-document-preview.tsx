import type { ReportPreviewDisplay } from "@/core/types/reports";

type Props = {
    display: Extract<ReportPreviewDisplay, { variant: "generic" }>;
};

export function ReportDocumentPreview({ display }: Props) {
    const { reportTitle, reportKind, generatedAt, filterRows, emitterName, logoUrl } = display;

    return (
        <div className="w-full rounded border border-slate-300 bg-white p-10">
            <div className="mb-12 flex items-start justify-between gap-8">
                <div className="flex items-center gap-3">
                    {logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={logoUrl}
                            alt={emitterName || "Logo"}
                            className="h-14 w-14 rounded object-cover"
                        />
                    ) : null}
                </div>

                <h2 className="text-right text-4xl font-black uppercase tracking-tight text-black md:text-5xl">
                    Rapport
                </h2>
            </div>

            <div className="mb-5 border-b-2 border-black pb-2">
                <div className="text-sm font-bold uppercase leading-5 text-black">
                    <p>Généré le : {generatedAt}</p>
                    <p>Type : {reportKind}</p>
                </div>
            </div>

            <div className="mb-10">
                <p className="mb-4 text-sm font-black uppercase text-black">
                    Objet du rapport :
                </p>
                <p className="text-lg font-bold leading-snug text-slate-800">
                    {reportTitle}
                </p>
            </div>

            <div className="overflow-x-auto">
                <div className="grid min-w-[520px] grid-cols-[1fr_1fr] border-b-2 border-black pb-3 text-sm font-black text-black">
                    <div>Critère</div>
                    <div className="text-right">Valeur</div>
                </div>

                {filterRows.length > 0 ? (
                    filterRows.map((row) => (
                        <div
                            key={row.label}
                            className="grid min-w-[520px] grid-cols-[1fr_1fr] border-b border-slate-400 py-4 text-sm font-semibold text-slate-700"
                        >
                            <div>{row.label}</div>
                            <div className="text-right">{row.value}</div>
                        </div>
                    ))
                ) : (
                    <p className="py-6 text-sm font-semibold text-slate-500">
                        Aucun filtre. Toutes les données de la période sont
                        incluses.
                    </p>
                )}
            </div>

            <div className="mt-10 border-t border-black pt-6">
                <p className="text-sm leading-5 text-slate-600">
                    Document généré selon les critères ci-dessus.
                </p>
            </div>
        </div>
    );
}
