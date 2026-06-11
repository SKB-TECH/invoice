import type { InvoiceForm, InvoiceItem } from "./types";
import {
    formatMoney,
    getTaxGroups,
} from "./utils";

function getClientTypeLabel() {
    return "PM - Personne Morale";
}

function getInvoiceTypeLabel() {
    return "FV - FACTURE DE VENTE";
}

function getItemTypeCode(item: InvoiceItem) {
    if (item.type === "Service") return item.code || "SER";
    return item.code || "BIE";
}

function getItemQuantity(item: InvoiceItem) {
    if (item.type === "Article") {
        return item.quantity ?? 1;
    }

    return (item.men ?? 1) * (item.days ?? 1);
}

function getItemUnit(item: InvoiceItem) {
    return item.type === "Service" ? "Service" : "Article";
}

function getItemUnitPrice(item: InvoiceItem) {
    return item.type === "Service"
        ? item.dailyPrice ?? item.priceHT
        : item.priceHT;
}

function getItemHt(item: InvoiceItem) {
    return getItemQuantity(item) * getItemUnitPrice(item);
}

function getItemTva(item: InvoiceItem) {
    return getItemHt(item) * ((item.tax ?? 0) / 100);
}

function getItemTtc(item: InvoiceItem) {
    return getItemHt(item) + getItemTva(item);
}

function getGroupType(item: InvoiceItem) {
    const group = item.taxGroupMention || `[${item.taxGroupCode || "B"}]`;
    const type = `[${getItemTypeCode(item)}]`;

    return `${group}${type}`;
}

function DgiSecurityBlock() {
    return (
        <div className="mt-8 border border-slate-300 bg-slate-50 p-4 text-xs leading-5 text-slate-700">
            <p className="font-black uppercase text-black">
                ÉLÉMENTS DE SÉCURITÉ / FACTURE NORMALISÉE
            </p>

            <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                <div>
                    <p>Type facture : {getInvoiceTypeLabel()}</p>
                    <p>Régime facture : TTC</p>
                    <p>ISF : En attente de génération DGI</p>
                    <p>DEF / MCF : En attente de normalisation</p>
                </div>

                <div>
                    <p>QR Code DGI : À générer après normalisation</p>
                    <p>Duplicata : NON</p>
                    <p>Date émission : {new Date().toLocaleString("fr-FR")}</p>
                    <p>N° série facture : N/A</p>
                </div>
            </div>

            <p className="mt-3 italic text-red-600">
                Cette facture devient normalisée uniquement après validation par le dispositif fiscal agréé DGI.
            </p>
        </div>
    );
}

function InvoiceCommentsBlock({ form }: { form: InvoiceForm }) {
    const rows = [
        ["A", "Réf. Exo.", form.comments?.A],
        ["B", "Réf. Paiement", form.comments?.B],
        ["C", "Réf. Contrat", form.comments?.C],
        ["D", "Réf. Bon commande", form.comments?.D],
        ["E", "Réf. Livraison", form.comments?.E],
        ["F", "Note interne", form.comments?.F],
        ["G", "Observation", form.comments?.G],
        ["H", "Autre commentaire", form.comments?.H],
    ];

    return (
        <div className="mt-8">
            <p className="mb-2 text-sm font-black uppercase text-black">
                Lignes de commentaires facture
            </p>

            <div className="grid grid-cols-[60px_180px_1fr] border border-slate-400 text-xs">
                <div className="bg-slate-200 p-2 font-black">Code</div>
                <div className="bg-slate-200 p-2 font-black">Étiqueté</div>
                <div className="bg-slate-200 p-2 font-black">Contenu</div>

                {rows.map(([code, label, value]) => (
                    <div key={code} className="contents">
                        <div className="border-t border-slate-300 p-2">
                            {code}
                        </div>
                        <div className="border-t border-slate-300 p-2">
                            {label}
                        </div>
                        <div className="border-t border-slate-300 p-2">
                            {value || "-"}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function TemplateAPreview({
                                     form,
                                     items,
                                     subtotal,
                                     total,
                                     taxGroups,
                                 }: {
    form: InvoiceForm;
    items: InvoiceItem[];
    subtotal: number;
    total: number;
    taxGroups: ReturnType<typeof getTaxGroups>;
}) {
    return (
        <div className="w-full rounded border border-slate-300 bg-white p-10">
            <div className="mb-12 flex items-start justify-between gap-8">
                <div>
                    <p className="text-3xl font-black tracking-tight text-slate-900">
                        iKwook
                    </p>
                    <p className="mt-1 text-xs font-bold uppercase tracking-[0.3em] text-slate-600">
                        Invoice
                    </p>
                </div>

                <div className="text-right">
                    <h2 className="text-5xl font-black uppercase tracking-tight text-black">
                        FACTURE
                    </h2>
                    <p className="mt-2 text-sm font-black text-black">
                        {getInvoiceTypeLabel()}
                    </p>
                </div>
            </div>

            <div className="mb-5 flex items-end justify-between border-b-2 border-black pb-2">
                <div className="text-sm font-bold uppercase leading-5 text-black">
                    <p>Date : {new Date().toLocaleDateString("fr-FR")}</p>
                    <p>Échéance : {form.dueDate || "-"}</p>
                    <p>N° facture : N/A</p>
                    <p>Régime : TTC</p>
                </div>

                <p className="text-lg font-black uppercase text-black">
                    Contrat : {form.contractReference || "-"}
                </p>
            </div>

            <div className="mb-14 grid grid-cols-1 gap-10 md:grid-cols-2">
                <div>
                    <p className="mb-4 text-sm font-black uppercase text-black">
                        Émetteur :
                    </p>

                    <p className="text-sm font-bold leading-5 text-black">
                        iKwook Sarl
                        <br />
                        NIF : A1801326M
                        <br />
                        RCCM : CD/KIN/RCCM/XX-X-XXXXX
                        <br />
                        support.ikwook.cd
                        <br />
                        +243 822 22 000
                        <br />
                        76, Avenue de Justice C/Gombe, Kinshasa
                    </p>
                </div>

                <div className="md:text-right">
                    <p className="mb-4 text-sm font-black uppercase text-black">
                        Destinataire :
                    </p>

                    <p className="text-sm font-bold leading-5 text-black">
                        Type : {getClientTypeLabel()}
                        <br />
                        {form.clientName || "-"}
                        <br />
                        NIF : {form.nif || "-"}
                        <br />
                        RCCM : {form.rccm || "-"}
                        <br />
                        ID Nat : {form.idNat || "-"}
                        <br />
                        {form.email || "-"}
                        <br />
                        {form.phone || "-"}
                        <br />
                        {form.address || "-"}
                    </p>
                </div>
            </div>

            <div className="overflow-x-auto">
                <div className="grid min-w-[1250px] grid-cols-[45px_90px_1fr_120px_120px_80px_100px_130px_130px_130px] font-semibold bg-gray-200 px-3 py-2 text-sm font-black text-gray-900">
                    <div>#</div>
                    <div>Code</div>
                    <div>Désignation</div>
                    <div>Grp/Type</div>
                    <div className="text-right">P.U.</div>
                    <div className="text-right">Qté</div>
                    <div>Unité</div>
                    <div className="text-right">H.T.</div>
                    <div className="text-right">TVA</div>
                    <div className="text-right">TTC</div>
                </div>

                {items.map((item, index) => (
                    <div
                        key={item.id}
                        className="grid min-w-[1250px] grid-cols-[45px_90px_1fr_120px_120px_80px_100px_130px_130px_130px] border-b border-slate-300 px-3 py-3 text-sm font-semibold text-slate-700"
                    >
                        <div>{index + 1}</div>
                        <div>{getItemTypeCode(item)}</div>
                        <div>{item.name}</div>
                        <div>{getGroupType(item)}</div>
                        <div className="text-right">
                            {formatMoney(getItemUnitPrice(item))}
                        </div>
                        <div className="text-right">
                            {getItemQuantity(item)}
                        </div>
                        <div>{getItemUnit(item)}</div>
                        <div className="text-right">
                            {formatMoney(getItemHt(item))}
                        </div>
                        <div className="text-right">
                            {formatMoney(getItemTva(item))}
                        </div>
                        <div className="text-right">
                            {formatMoney(getItemTtc(item))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-2">
                <div className="pt-8">
                    <p className="mb-5 text-lg font-black uppercase text-black">
                        Règlement :
                    </p>

                    <p className="text-sm leading-5 text-black">
                        <span className="font-bold">
                            Par virement bancaire :
                        </span>
                        <br />
                        Banque : Rawbank
                        <br />
                        Compte : 123-456-7890
                    </p>
                </div>

                <div className="ml-auto w-full max-w-[360px]">
                    <div className="space-y-3">
                        <div className="flex justify-between text-lg font-black text-black">
                            <span>Sous-total :</span>
                            <span>
                                {form.currency} {formatMoney(subtotal)}
                            </span>
                        </div>

                        {taxGroups.map((group) => (
                            <div
                                key={group.rate}
                                className="flex justify-between text-lg font-black text-black"
                            >
                                <span>TVA {group.rate}% :</span>
                                <span>
                                    {form.currency}{" "}
                                    {formatMoney(group.taxAmount)}
                                </span>
                            </div>
                        ))}

                        <div className="flex justify-between border-t border-black pt-3 text-lg font-black text-black">
                            <span>Total TTC :</span>
                            <span>
                                {form.currency} {formatMoney(total)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <DgiSecurityBlock />
            <InvoiceCommentsBlock form={form} />
        </div>
    );
}
