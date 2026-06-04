import type { InvoiceForm, InvoiceItem } from "./types";
import {
    formatMoney,
    getLineSubtotal,
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

export function TemplateBPreview({
                                     form,
                                     items,
                                     tax,
                                     total,
                                     taxGroups,
                                 }: {
    form: InvoiceForm;
    items: InvoiceItem[];
    tax: number;
    total: number;
    taxGroups: ReturnType<typeof getTaxGroups>;
}) {
    return (
        <div className="w-full rounded border border-slate-300 bg-white px-10 py-8 text-black">
            <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="space-y-1 text-sm font-semibold leading-5">
                    <h3 className="mb-2 text-lg font-black tracking-wide">
                        IKWOK EXPRESS SARL
                    </h3>
                    <p>Point de vente : IKWOK EXPRESS SARL</p>
                    <p>NIF : A1801326M</p>
                    <p>RCCM : CD/KIN/RCCM/XX-X-XXXXX</p>
                    <p>76 AV. JUSTICE</p>
                    <p>IMM. HAMDAM, No 76 av. de la JUSTICE</p>
                    <p>C/GOMBE</p>
                    <p>KINSHASA</p>
                    <p>0820191921</p>
                    <p>FINANCE@IKWOOK.COM</p>
                </div>

                <div className="border border-slate-400">
                    <div className="bg-slate-500 px-4 py-2 text-sm font-black text-white">
                        CLIENT
                    </div>

                    <div className="space-y-2 px-4 py-3 text-sm">
                        <div className="grid grid-cols-[110px_1fr]">
                            <span className="italic">Type</span>
                            <span className="font-semibold">
                                {getClientTypeLabel()}
                            </span>
                        </div>

                        <div className="grid grid-cols-[110px_1fr]">
                            <span className="italic">Nom</span>
                            <span className="font-semibold">
                                {form.clientName || "-"}
                            </span>
                        </div>

                        <div className="grid grid-cols-[110px_1fr]">
                            <span className="italic">NIF</span>
                            <span className="font-semibold">
                                {form.nif || "-"}
                            </span>
                        </div>

                        <div className="grid grid-cols-[110px_1fr]">
                            <span className="italic">RCCM</span>
                            <span className="font-semibold">
                                {form.rccm || "-"}
                            </span>
                        </div>

                        <div className="grid grid-cols-[110px_1fr]">
                            <span className="italic">ID Nat</span>
                            <span className="font-semibold">
                                {form.idNat || "-"}
                            </span>
                        </div>

                        <div className="grid grid-cols-[110px_1fr]">
                            <span className="italic">Adresse</span>
                            <span className="font-semibold">
                                {form.address || "-"}
                            </span>
                        </div>

                        <div className="grid grid-cols-[110px_1fr]">
                            <span className="italic">Contact</span>
                            <span className="font-semibold">
                                {form.phone || "-"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mb-8 text-center">
                <h2 className="text-2xl font-black">
                    {getInvoiceTypeLabel()}
                </h2>
                <p className="mt-1 text-base">Facture n° N/A</p>
                <p className="mt-1 text-sm">
                    Date : {new Date().toLocaleDateString("fr-FR")} | Échéance :{" "}
                    {form.dueDate || "-"}
                </p>
            </div>

            <div className="overflow-x-auto border-y border-slate-400">
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
                        className="grid min-w-[1250px] grid-cols-[45px_90px_1fr_120px_120px_80px_100px_130px_130px_130px] border-t border-slate-300 px-3 py-2 text-sm"
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

            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-[1fr_1.4fr_1fr]">
                <div className="text-sm font-semibold">
                    <p>Nombre de lignes : {items.length}</p>
                </div>

                <div className="space-y-1 text-sm">
                    {taxGroups.map((group) => (
                        <div key={group.rate}>
                            <div className="flex justify-between">
                                <span>H.T. Taxable {group.rate}%</span>
                                <span>{formatMoney(group.subtotal)}</span>
                            </div>

                            <div className="flex justify-between">
                                <span>TVA Taxable {group.rate}%</span>
                                <span>{formatMoney(group.taxAmount)}</span>
                            </div>
                        </div>
                    ))}

                    <div className="flex justify-between font-black">
                        <span>TOTAL TVA</span>
                        <span>{formatMoney(tax)}</span>
                    </div>
                </div>

                <div className="text-sm font-semibold leading-5">
                    <p>Mode de paiement : VIREMENT</p>
                    <p>Banque Centrale du Congo</p>
                    <p>Montant en USD : -</p>
                </div>
            </div>

            <div className="mt-8 flex justify-end border-b-2 border-black pb-2">
                <p className="text-xl font-black tracking-[0.2em]">
                    Total TTC : {form.currency} {formatMoney(total)}
                </p>
            </div>

            <DgiSecurityBlock />
            <InvoiceCommentsBlock form={form} />
        </div>
    );
}
