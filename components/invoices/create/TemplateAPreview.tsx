import type { InvoiceForm, InvoiceItem } from "./types";
import {
    formatMoney,
    getLineSubtotal,
    getLineTotal,
    getTaxGroups,
} from "./utils";

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

                <h2 className="text-5xl font-black uppercase tracking-tight text-black">
                    FACTURE
                </h2>
            </div>

            <div className="mb-5 flex items-end justify-between border-b-2 border-black pb-2">
                <div className="text-sm font-bold uppercase leading-5 text-black">
                    <p>Date : {new Date().toLocaleDateString("fr-FR")}</p>
                    <p>Échéance : {form.dueDate || "-"}</p>
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
                        support.ikwook.cd
                        <br />
                        +243 822 22 000
                        <br />
                        76, Avenue de Justice C/Gombe
                    </p>
                </div>

                <div className="md:text-right">
                    <p className="mb-4 text-sm font-black uppercase text-black">
                        Destinataire :
                    </p>

                    <p className="text-sm font-bold leading-5 text-black">
                        {form.clientName || "-"}
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
                <div className="grid min-w-[850px] grid-cols-[60px_1fr_120px_120px_140px_140px] border-b-2 border-black pb-3 text-sm font-black text-black">
                    <div>#</div>
                    <div>Désignation</div>
                    <div className="text-right">Prix HT</div>
                    <div className="text-right">Qté</div>
                    <div className="text-right">TVA</div>
                    <div className="text-right">Total TTC</div>
                </div>

                {items.map((item, index) => (
                    <div
                        key={item.id}
                        className="grid min-w-[850px] grid-cols-[60px_1fr_120px_120px_140px_140px] border-b border-slate-400 py-4 text-sm font-semibold text-slate-700"
                    >
                        <div>{index + 1}</div>
                        <div>{item.name}</div>

                        <div className="text-right">
                            {formatMoney(getLineSubtotal(item))}
                        </div>

                        <div className="text-right">
                            {item.type === "Article"
                                ? item.quantity
                                : `${item.men ?? 1} × ${item.days ?? 1}`}
                        </div>

                        <div className="text-right">{item.tax}%</div>

                        <div className="text-right">
                            {formatMoney(getLineTotal(item))}
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
        </div>
    );
}
