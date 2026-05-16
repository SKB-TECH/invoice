import type { InvoiceForm, InvoiceItem } from "./types";
import {
    formatMoney,
    getLineSubtotal,
    getTaxGroups,
} from "./utils";

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
                        <div className="grid grid-cols-[90px_1fr]">
                            <span className="italic">Type</span>
                            <span className="font-semibold">
                                [PM] Personne morale
                            </span>
                        </div>

                        <div className="grid grid-cols-[90px_1fr]">
                            <span className="italic">Nom</span>
                            <span className="font-semibold">
                                {form.clientName || "-"}
                            </span>
                        </div>

                        <div className="grid grid-cols-[90px_1fr]">
                            <span className="italic">NIF</span>
                            <span className="font-semibold">
                                {form.nif || "-"}
                            </span>
                        </div>

                        <div className="grid grid-cols-[90px_1fr]">
                            <span className="italic">Adresse</span>
                            <span className="font-semibold">
                                {form.address || "-"}
                            </span>
                        </div>

                        <div className="grid grid-cols-[90px_1fr]">
                            <span className="italic">Contact</span>
                            <span className="font-semibold">
                                {form.phone || "-"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mb-8 text-center">
                <h2 className="text-2xl font-black">FACTURE DE VENTE</h2>
                <p className="mt-1 text-base">Facture n° N/A</p>
            </div>

            <p className="mb-3 text-sm">Merci pour la confiance !</p>

            <div className="overflow-x-auto border-y border-slate-400">
                <div className="grid min-w-[760px] grid-cols-[60px_1fr_180px_110px_180px] bg-slate-200 px-3 py-2 text-sm font-black">
                    <div>#</div>
                    <div>Désignation</div>
                    <div className="text-right">Prix unitaire HT</div>
                    <div className="text-right">Quantité</div>
                    <div className="text-right">Montant HT</div>
                </div>

                {items.map((item, index) => (
                    <div
                        key={item.id}
                        className="grid min-w-[760px] grid-cols-[60px_1fr_180px_110px_180px] border-t border-slate-300 px-3 py-2 text-sm"
                    >
                        <div>{index + 1}</div>
                        <div>{item.name}</div>

                        <div className="text-right">
                            {formatMoney(
                                item.type === "Article"
                                    ? item.priceHT
                                    : item.dailyPrice ?? 0
                            )}
                        </div>

                        <div className="text-right">
                            {item.type === "Article"
                                ? item.quantity
                                : `${item.men ?? 1} × ${item.days ?? 1}`}
                        </div>

                        <div className="text-right">
                            {formatMoney(getLineSubtotal(item))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-[1fr_1.4fr_1fr]">
                <div className="text-sm font-semibold">
                    <p>Nombre d’articles : {items.length}</p>
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

            <div className="mt-8 flex justify-between border-t border-slate-300 pt-2 text-xs italic">
                <span>
                    --- ÉLÉMENTS DE SÉCURITÉ DE LA FACTURE NORMALISÉE ---
                </span>

                <span className="font-black not-italic">ISF: DGI-RDC-01</span>
            </div>

            <div className="mt-3 border border-red-200 bg-red-50 py-6 text-center">
                <p className="text-lg font-semibold text-red-500">
                    La facture n&apos;est pas normalisée !
                </p>
            </div>
        </div>
    );
}
