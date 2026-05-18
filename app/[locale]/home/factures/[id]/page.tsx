"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { toast } from "sonner";
import {
    ArrowLeft,
    Ban,
    CheckCircle2,
    ChevronRight,
    Clock3,
    Download,
    House,
    Loader2,
    MessageSquareText,
    Printer,
    Send,
    Share2,
    Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import {
    useInvoiceById,
    useNormalizeInvoice,
} from "@/core/hooks/invoices/useInvoices";

import {
    useCreateInvoiceComment,
    useGetInvoiceComments,
} from "@/core/hooks/invoices/useInvoiceComments";

import { InvoicePdfDocument } from "@/components/shared/OtherComponents/components/invoice/InvoicePdfDocument";

type InvoiceStatus =
    | "Brouillon"
    | "Enregistrée"
    | "Validée"
    | "Normalisée"
    | "Soumise"
    | "Réceptionnée"
    | "Payée"
    | "Classée";

type Reviewer = {
    id: string;
    name: string;
    initials: string;
    role: string;
};

type InvoiceCommentViewModel = {
    id: string;
    author: string;
    initials: string;
    role: string;
    message: string;
    date: string;
    status?: "open" | "resolved";
    replyToId?: number | null;
};

type InvoiceLine = {
    id: string;
    designation: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    subtotal: number;
    taxAmount: number;
    lineTotal: number;
};

type TaxGroup = {
    rate: number;
    subtotal: number;
    taxAmount: number;
};

type InvoiceViewModel = {
    id: string;
    invoice: string;
    number: string;
    client: string;
    clientAddress: string;
    clientEmail: string;
    clientPhone: string;
    clientNif: string;
    clientRccm: string;
    senderName: string;
    senderLegalName: string;
    senderAddress: string;
    senderPhone: string;
    senderEmail: string;
    senderNif: string;
    senderRccm: string;
    amountHT: number;
    taxAmount: number;
    totalAmount: number;
    paidAmount: number;
    balance: number;
    currency: string;
    statut: InvoiceStatus;
    createdAt: string;
    dueDate: string;
    templateId: number | null;
    contractReference: string;
    paymentMethod: string;
    paymentBankName: string;
    paymentAccountNumber: string;
    reviewers: Reviewer[];
    comments: InvoiceCommentViewModel[];
    lines: InvoiceLine[];
};

type InvoiceOverrides = {
    statut?: InvoiceStatus;
    reviewers?: Reviewer[];
};

function safeText(value: unknown, fallback = "—") {
    if (typeof value === "string" && value.trim()) return value;
    if (typeof value === "number") return String(value);
    return fallback;
}

function formatAmount(amount: number, currency: string) {
    if (amount >= 1_000_000) {
        const value = amount / 1_000_000;
        const formatted = Number.isInteger(value)
            ? value.toString()
            : value.toFixed(1);

        return `${currency} ${formatted}M`;
    }

    return `${currency} ${new Intl.NumberFormat("fr-FR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    })
        .format(amount)
        .replace(/\s/g, ".")}`;
}

function formatSimpleAmount(amount: number) {
    return new Intl.NumberFormat("fr-FR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    })
        .format(amount)
        .replace(/\s/g, ".");
}

function formatApiDate(value?: string | null) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString("fr-FR");
}

function formatCommentDate(value?: string | null) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function getCommentInitials(userId?: number | null) {
    if (!userId) return "US";

    return `U${String(userId).slice(-1)}`;
}

function mapWorkflowStatusToUiStatus(
    workflowStatus?: string | null
): InvoiceStatus {
    switch (workflowStatus) {
        case "brouillon":
            return "Brouillon";

        case "enregistrer":
            return "Enregistrée";

        case "valider":
            return "Validée";

        case "normaliser":
            return "Normalisée";

        case "soumise":
            return "Soumise";

        case "receptionner":
            return "Réceptionnée";

        case "payer":
            return "Payée";

        case "classer":
            return "Classée";

        default:
            return "Brouillon";
    }
}

function StatutBadge({ statut }: { statut: InvoiceStatus }) {
    const styles: Record<InvoiceStatus, string> = {
        Brouillon:
            "border-transparent bg-[#FCF5E5] text-[#E8BC52] hover:bg-[#FCF5E5]",

        Enregistrée:
            "border-transparent bg-[#E8EFFB] text-[#6691E7] hover:bg-[#E8EFFB]",

        Validée:
            "border-transparent bg-[#E8F7EE] text-[#16A34A] hover:bg-[#E8F7EE]",

        Normalisée:
            "border-transparent bg-[#EDE9FE] text-[#7C3AED] hover:bg-[#EDE9FE]",

        Soumise:
            "border-transparent bg-[#E0F2FE] text-[#0284C7] hover:bg-[#E0F2FE]",

        Réceptionnée:
            "border-transparent bg-[#FFF7ED] text-[#EA580C] hover:bg-[#FFF7ED]",

        Payée:
            "border-transparent bg-[#DCF6E9] text-[#13C56B] hover:bg-[#DCF6E9]",

        Classée:
            "border-transparent bg-slate-100 text-slate-600 hover:bg-slate-100",
    };

    return (
        <Badge
            variant="outline"
            className={cn("rounded px-2.5 font-medium", styles[statut])}
        >
            {statut}
        </Badge>
    );
}

function AvatarStack({ reviewers }: { reviewers: Reviewer[] }) {
    const visibleReviewers = reviewers.slice(0, 4);
    const remaining = reviewers.length - visibleReviewers.length;

    if (reviewers.length === 0) {
        return <span className="text-sm text-slate-400">—</span>;
    }

    return (
        <div className="flex items-center">
            {visibleReviewers.map((reviewer, index) => (
                <div
                    key={reviewer.id}
                    title={`${reviewer.name} - ${reviewer.role}`}
                    className={cn(
                        "flex size-8 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[10px] font-bold text-slate-600",
                        index > 0 && "-ml-2"
                    )}
                >
                    {reviewer.initials}
                </div>
            ))}

            {remaining > 0 && (
                <div className="-ml-2 flex size-8 items-center justify-center rounded-full border-2 border-white bg-slate-200 text-[10px] font-bold text-slate-600">
                    +{remaining}
                </div>
            )}
        </div>
    );
}

function getTaxGroups(lines: InvoiceLine[]): TaxGroup[] {
    const groups = new Map<number, TaxGroup>();

    lines.forEach((line) => {
        const current = groups.get(line.taxRate);

        if (current) {
            current.subtotal += line.subtotal;
            current.taxAmount += line.taxAmount;
            return;
        }

        groups.set(line.taxRate, {
            rate: line.taxRate,
            subtotal: line.subtotal,
            taxAmount: line.taxAmount,
        });
    });

    return Array.from(groups.values()).sort((a, b) => b.rate - a.rate);
}

function TemplateAPreview({
                              invoice,
                              taxGroups,
                          }: {
    invoice: InvoiceViewModel;
    taxGroups: TaxGroup[];
}) {
    return (
        <div className="relative overflow-hidden border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-12 flex items-start justify-between gap-8">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="flex size-12 items-center justify-center border-4 border-slate-900 text-sm font-black text-slate-900">
                            IK
                        </div>

                        <div>
                            <p className="text-3xl font-black leading-none tracking-tight text-slate-900">
                                iKwook
                            </p>
                            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-600">
                                Invoice
                            </p>
                        </div>
                    </div>
                </div>

                <h2 className="text-5xl font-black uppercase tracking-tight text-black">
                    FACTURE
                </h2>
            </div>

            <div className="mb-5 flex items-end justify-between border-b-2 border-black pb-2">
                <div className="text-sm font-bold uppercase leading-5 text-black">
                    <p>Date : {invoice.createdAt}</p>
                    <p>Échéance : {invoice.dueDate}</p>
                </div>

                <div className="text-right">
                    <p className="text-lg font-black uppercase text-black">
                        Facture : {invoice.invoice}
                    </p>
                    <p className="mt-1 text-sm font-bold text-black">
                        Contrat : {invoice.contractReference || "—"}
                    </p>
                </div>
            </div>

            <div className="mb-16 grid grid-cols-1 gap-10 md:grid-cols-2">
                <div>
                    <p className="mb-4 text-sm font-black uppercase text-black">
                        Émetteur :
                    </p>

                    <p className="text-sm font-bold leading-5 text-black">
                        {invoice.senderLegalName || invoice.senderName}
                        <br />
                        {invoice.senderEmail}
                        <br />
                        {invoice.senderPhone}
                        <br />
                        {invoice.senderAddress}
                    </p>
                </div>

                <div className="md:text-right">
                    <p className="mb-4 text-sm font-black uppercase text-black">
                        Destinataire :
                    </p>

                    <p className="text-sm font-bold leading-5 text-black">
                        {invoice.client}
                        <br />
                        {invoice.clientEmail}
                        <br />
                        {invoice.clientPhone}
                        <br />
                        {invoice.clientAddress}
                    </p>
                </div>
            </div>

            <div className="overflow-x-auto">
                <div className="grid min-w-[900px] grid-cols-[60px_1fr_140px_100px_120px_160px] border-b-2 border-black pb-3 text-sm font-black text-black">
                    <div>#</div>
                    <div>Désignation</div>
                    <div className="text-right">Prix HT</div>
                    <div className="text-right">Qté</div>
                    <div className="text-right">TVA</div>
                    <div className="text-right">Total TTC</div>
                </div>

                {invoice.lines.map((line, index) => (
                    <div
                        key={line.id}
                        className="grid min-w-[900px] grid-cols-[60px_1fr_140px_100px_120px_160px] border-b border-slate-300 py-4 text-sm font-semibold text-slate-700"
                    >
                        <div>{index + 1}</div>
                        <div>{line.designation}</div>
                        <div className="text-right">
                            {formatSimpleAmount(line.unitPrice)}
                        </div>
                        <div className="text-right">{line.quantity}</div>
                        <div className="text-right">{line.taxRate}%</div>
                        <div className="text-right">
                            {formatSimpleAmount(line.lineTotal)}
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
                        <span className="font-bold">Mode :</span>{" "}
                        {invoice.paymentMethod}
                        <br />
                        Banque : {invoice.paymentBankName}
                        <br />
                        Compte : {invoice.paymentAccountNumber}
                    </p>
                </div>

                <div className="ml-auto w-full max-w-[380px]">
                    <div className="space-y-3">
                        <div className="flex justify-between text-lg font-black text-black">
                            <span>Sous-total :</span>
                            <span>
                                {invoice.currency}{" "}
                                {formatSimpleAmount(invoice.amountHT)}
                            </span>
                        </div>

                        {taxGroups.map((group) => (
                            <div
                                key={group.rate}
                                className="flex justify-between text-lg font-black text-black"
                            >
                                <span>TVA {group.rate}% :</span>
                                <span>
                                    {invoice.currency}{" "}
                                    {formatSimpleAmount(group.taxAmount)}
                                </span>
                            </div>
                        ))}

                        <div className="flex justify-between border-t border-black pt-3 text-lg font-black text-black">
                            <span>Total TTC :</span>
                            <span>
                                {invoice.currency}{" "}
                                {formatSimpleAmount(invoice.totalAmount)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TemplateBPreview({
                              invoice,
                              taxGroups,
                          }: {
    invoice: InvoiceViewModel;
    taxGroups: TaxGroup[];
}) {
    const isNormalized = invoice.statut === "Normalisée";

    return (
        <div className="relative overflow-hidden border border-slate-200 bg-white px-10 py-8 text-black shadow-sm">
            <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="space-y-1 text-sm font-semibold leading-5">
                    <h3 className="mb-2 text-lg font-black tracking-wide">
                        {invoice.senderLegalName || invoice.senderName}
                    </h3>

                    <p>NIF : {invoice.senderNif}</p>
                    <p>RCCM : {invoice.senderRccm}</p>
                    <p>{invoice.senderAddress}</p>
                    <p>{invoice.senderPhone}</p>
                    <p>{invoice.senderEmail}</p>
                </div>

                <div className="border border-slate-400">
                    <div className="bg-slate-500 px-4 py-2 text-sm font-black text-white">
                        CLIENT
                    </div>

                    <div className="space-y-2 px-4 py-3 text-sm">
                        <div className="grid grid-cols-[90px_1fr]">
                            <span className="italic">Nom</span>
                            <span className="font-semibold">
                                {invoice.client}
                            </span>
                        </div>

                        <div className="grid grid-cols-[90px_1fr]">
                            <span className="italic">NIF</span>
                            <span className="font-semibold">
                                {invoice.clientNif}
                            </span>
                        </div>

                        <div className="grid grid-cols-[90px_1fr]">
                            <span className="italic">RCCM</span>
                            <span className="font-semibold">
                                {invoice.clientRccm}
                            </span>
                        </div>

                        <div className="grid grid-cols-[90px_1fr]">
                            <span className="italic">Adresse</span>
                            <span className="font-semibold">
                                {invoice.clientAddress}
                            </span>
                        </div>

                        <div className="grid grid-cols-[90px_1fr]">
                            <span className="italic">Contact</span>
                            <span className="font-semibold">
                                {invoice.clientPhone}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mb-8 text-center">
                <h2 className="text-2xl font-black">FACTURE DE VENTE</h2>
                <p className="mt-1 text-base">Facture n° {invoice.invoice}</p>
            </div>

            <p className="mb-3 text-sm">Merci pour la confiance !</p>

            <div className="overflow-x-auto border-y border-slate-400">
                <div className="grid min-w-[860px] grid-cols-[60px_1fr_170px_110px_150px_150px] bg-slate-200 px-3 py-2 text-sm font-black">
                    <div>#</div>
                    <div>Désignation</div>
                    <div className="text-right">Prix unitaire HT</div>
                    <div className="text-right">Quantité</div>
                    <div className="text-right">TVA</div>
                    <div className="text-right">Montant TTC</div>
                </div>

                {invoice.lines.map((line, index) => (
                    <div
                        key={line.id}
                        className="grid min-w-[860px] grid-cols-[60px_1fr_170px_110px_150px_150px] border-t border-slate-300 px-3 py-2 text-sm"
                    >
                        <div>{index + 1}</div>
                        <div>{line.designation}</div>
                        <div className="text-right">
                            {formatSimpleAmount(line.unitPrice)}
                        </div>
                        <div className="text-right">{line.quantity}</div>
                        <div className="text-right">{line.taxRate}%</div>
                        <div className="text-right">
                            {formatSimpleAmount(line.lineTotal)}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-[1fr_1.4fr_1fr]">
                <div className="text-sm font-semibold">
                    <p>Nombre d’articles : {invoice.lines.length}</p>
                    <p className="mt-2">
                        Contrat : {invoice.contractReference}
                    </p>
                </div>

                <div className="space-y-1 text-sm">
                    {taxGroups.map((group) => (
                        <div key={group.rate}>
                            <div className="flex justify-between">
                                <span>H.T. Taxable {group.rate}%</span>
                                <span>{formatSimpleAmount(group.subtotal)}</span>
                            </div>

                            <div className="flex justify-between">
                                <span>TVA Taxable {group.rate}%</span>
                                <span>{formatSimpleAmount(group.taxAmount)}</span>
                            </div>
                        </div>
                    ))}

                    <div className="flex justify-between font-black">
                        <span>TOTAL TVA</span>
                        <span>{formatSimpleAmount(invoice.taxAmount)}</span>
                    </div>
                </div>

                <div className="text-sm font-semibold leading-5">
                    <p>Mode de paiement : {invoice.paymentMethod}</p>
                    <p>Banque : {invoice.paymentBankName}</p>
                    <p>Compte : {invoice.paymentAccountNumber}</p>
                </div>
            </div>

            <div className="mt-8 flex justify-end border-b-2 border-black pb-2">
                <p className="text-xl font-black tracking-[0.2em]">
                    Total TTC : {invoice.currency}{" "}
                    {formatSimpleAmount(invoice.totalAmount)}
                </p>
            </div>

            <div className="mt-8 flex justify-between border-t border-slate-300 pt-2 text-xs italic">
                <span>
                    --- ÉLÉMENTS DE SÉCURITÉ DE LA FACTURE NORMALISÉE ---
                </span>

                <span className="font-black not-italic">ISF: DGI-RDC-01</span>
            </div>

            <div
                className={cn(
                    "mt-3 border py-6 text-center",
                    isNormalized
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-red-200 bg-red-50"
                )}
            >
                <p
                    className={cn(
                        "text-lg font-semibold",
                        isNormalized ? "text-emerald-600" : "text-red-500"
                    )}
                >
                    {isNormalized
                        ? "La facture est normalisée."
                        : "La facture n’est pas normalisée !"}
                </p>
            </div>
        </div>
    );
}

export default function InvoiceViewerPage() {
    const t = useTranslations("invoiceViewer");
    const params = useParams<{ id: string }>();
    const invoiceId = params?.id;

    const {
        data: invoiceData,
        isLoading,
        isError,
    } = useInvoiceById(invoiceId);

    const {
        data: apiComments = [],
        isLoading: isLoadingComments,
    } = useGetInvoiceComments(invoiceId, {
        enabled: Boolean(invoiceId),
    });

    const {
        mutate: createInvoiceComment,
        isPending: isCreatingComment,
    } = useCreateInvoiceComment({
        onSuccess: () => {
            toast.success("Commentaire ajouté avec succès.");
            setComment("");
        },
        onError: () => {
            toast.error("Impossible d’ajouter le commentaire.");
        },
    });

    const {
        mutate: normalizeInvoice,
        isPending: isNormalizing,
    } = useNormalizeInvoice({
        onSuccess: () => {
            toast.success("Facture normalisée avec succès.");
        },
        onError: () => {
            toast.error("Impossible de normaliser cette facture.");
        },
    });

    const [comment, setComment] = useState("");
    const [overrides, setOverrides] = useState<InvoiceOverrides>({});
    const [resolvedCommentIds, setResolvedCommentIds] = useState<string[]>([]);

    const comments = useMemo<InvoiceCommentViewModel[]>(() => {
        return apiComments.map((item) => ({
            id: String(item.id),
            author: `Utilisateur #${item.user_id}`,
            initials: getCommentInitials(item.user_id),
            role: "Commentaire",
            message: item.comment,
            date: formatCommentDate(item.created_at),
            status: resolvedCommentIds.includes(String(item.id))
                ? "resolved"
                : "open",
            replyToId: item.reply_to_id,
        }));
    }, [apiComments, resolvedCommentIds]);

    const reviewers = useMemo<Reviewer[]>(() => {
        const uniqueUsers = new Map<number, Reviewer>();

        apiComments.forEach((item) => {
            if (!uniqueUsers.has(item.user_id)) {
                uniqueUsers.set(item.user_id, {
                    id: String(item.user_id),
                    name: `Utilisateur #${item.user_id}`,
                    initials: getCommentInitials(item.user_id),
                    role: "Commentateur",
                });
            }
        });

        return Array.from(uniqueUsers.values());
    }, [apiComments]);

    const baseInvoice = useMemo<InvoiceViewModel | null>(() => {
        if (!invoiceData) return null;

        const senderInfo =
            (invoiceData.sender_info ?? {}) as Record<string, unknown>;
        const receiverInfo =
            (invoiceData.receiver_info ?? {}) as Record<string, unknown>;
        const clientInfo =
            (invoiceData.client_info ?? {}) as Record<string, unknown>;
        const paymentInfo =
            (invoiceData.payment_info ?? {}) as Record<string, unknown>;

        const contract =
            "contract" in invoiceData
                ? (invoiceData.contract as Record<string, unknown> | null)
                : null;

        const lines: InvoiceLine[] = (invoiceData.items ?? []).map(
            (item, index) => ({
                id: `${invoiceData.id}-${index}`,
                designation: safeText(item.description),
                quantity: Number(item.quantity ?? 0),
                unitPrice: Number(item.unit_price ?? 0),
                taxRate: Number(item.tax_rate ?? 0),
                subtotal: Number(item.subtotal ?? 0),
                taxAmount: Number(item.tax_amount ?? 0),
                lineTotal: Number(item.line_total ?? 0),
            })
        );

        return {
            id: String(invoiceData.id),
            invoice: safeText(
                "invoice_ref" in invoiceData
                    ? invoiceData.invoice_ref
                    : invoiceData.number,
                `Facture #${invoiceData.id}`
            ),
            number: safeText(invoiceData.number, ""),
            client:
                safeText(receiverInfo.legal_name, "") ||
                safeText(receiverInfo.name, "") ||
                safeText(clientInfo.legal_name, "") ||
                safeText(clientInfo.name, "—"),
            clientAddress:
                safeText(receiverInfo.address, "") ||
                safeText(clientInfo.address, "—"),
            clientEmail:
                safeText(receiverInfo.email, "") ||
                safeText(clientInfo.email, "—"),
            clientPhone:
                safeText(receiverInfo.phone, "") ||
                safeText(clientInfo.phone, "—"),
            clientNif:
                safeText(receiverInfo.nif, "") ||
                safeText(clientInfo.nif, "") ||
                safeText(clientInfo.vat_num, "—"),
            clientRccm:
                safeText(receiverInfo.rccm, "") ||
                safeText(clientInfo.rccm, "") ||
                safeText(clientInfo.registration_id, "—"),
            senderName: safeText(senderInfo.name),
            senderLegalName: safeText(senderInfo.legal_name, ""),
            senderAddress: safeText(senderInfo.address),
            senderPhone: safeText(senderInfo.phone),
            senderEmail: safeText(senderInfo.email),
            senderNif: safeText(senderInfo.nif),
            senderRccm: safeText(senderInfo.rccm),
            amountHT: Number(invoiceData.invoice_amount ?? 0),
            taxAmount: Number(invoiceData.tax_amount ?? 0),
            totalAmount: Number(invoiceData.total_amount ?? 0),
            paidAmount: Number(invoiceData.paid_amount ?? 0),
            balance: Number(invoiceData.balance ?? 0),
            currency: safeText(invoiceData.currency, "CDF"),
            statut: mapWorkflowStatusToUiStatus(
                "workflow_status" in invoiceData
                    ? String(invoiceData.workflow_status ?? "")
                    : undefined
            ),
            createdAt: formatApiDate(invoiceData.created_at),
            dueDate: formatApiDate(invoiceData.due_date),
            templateId:
                "template_id" in invoiceData
                    ? Number(invoiceData.template_id ?? 1)
                    : 1,
            contractReference: contract
                ? safeText(contract.reference, "—")
                : "—",
            paymentMethod: safeText(paymentInfo.method),
            paymentBankName: safeText(paymentInfo.bank_name),
            paymentAccountNumber: safeText(paymentInfo.account_number),
            reviewers,
            comments,
            lines,
        };
    }, [invoiceData, reviewers, comments]);

    const invoice = useMemo<InvoiceViewModel | null>(() => {
        if (!baseInvoice) return null;

        return {
            ...baseInvoice,
            statut: overrides.statut ?? baseInvoice.statut,
            reviewers: overrides.reviewers ?? baseInvoice.reviewers,
        };
    }, [baseInvoice, overrides]);

    const taxGroups = useMemo(() => {
        return invoice ? getTaxGroups(invoice.lines) : [];
    }, [invoice]);

    const pdfInvoice = useMemo(() => {
        if (!invoice) return null;

        return {
            invoice: invoice.invoice,
            client: invoice.client,
            clientAddress: invoice.clientAddress,
            telephone: invoice.clientPhone,
            currency: invoice.currency as "CDF" | "USD",
            createdAt: invoice.createdAt,
            dueDate: invoice.dueDate,
            lines: invoice.lines.map((line) => ({
                id: line.id,
                designation: line.designation,
                quantity: line.quantity,
                unitPrice: line.unitPrice,
            })),
        };
    }, [invoice]);

    const canNormalize =
        invoice?.statut !== "Payée" && invoice?.statut !== "Classée";

    const handleNormalizeInvoice = () => {
        if (!invoice || !canNormalize) return;

        normalizeInvoice({
            id: invoice.id,
        });
    };

    const handleChangeStatus = (statut: InvoiceStatus) => {
        setOverrides((current) => ({
            ...current,
            statut,
        }));
    };

    const handleAddComment = () => {
        if (!invoiceId || !comment.trim()) return;

        createInvoiceComment({
            invoiceId,
            payload: {
                comment: comment.trim(),
            },
        });
    };

    const handleResolveComment = (commentId: string) => {
        setResolvedCommentIds((current) =>
            current.includes(commentId)
                ? current
                : [...current, commentId]
        );
    };

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center gap-2 text-sm text-slate-500">
                <Loader2 className="size-5 animate-spin" />
                Chargement de la facture...
            </div>
        );
    }

    if (isError || !invoice) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center text-sm text-red-500">
                Impossible de charger le détail de la facture.
            </div>
        );
    }

    return (
        <main className="w-full text-slate-800">
            <div className="mb-6 border-b border-slate-200 bg-white">
                <div className="flex min-h-16 items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            className="shrink-0 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                        >
                            <Link href="/home/factures">
                                <ArrowLeft className="size-4" />
                            </Link>
                        </Button>

                        <div className="min-w-0">
                            <h1 className="truncate text-base font-bold text-slate-800 sm:text-lg">
                                {invoice.invoice}
                            </h1>

                            <div className="mt-0.5 flex flex-wrap items-center gap-1 text-xs text-slate-500">
                                <Link
                                    href="/home"
                                    className="hover:text-slate-700"
                                >
                                    <House className="size-3.5" />
                                </Link>

                                <ChevronRight className="size-3.5" />

                                <Link
                                    href="/home/factures"
                                    className="hover:text-slate-700"
                                >
                                    {t("breadcrumbInvoices")}
                                </Link>

                                <ChevronRight className="size-3.5" />

                                <span className="text-slate-700">
                                    {t("breadcrumbView")}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="hidden items-center gap-5 md:flex">
                        {canNormalize && (
                            <Button
                                type="button"
                                size="sm"
                                onClick={handleNormalizeInvoice}
                                disabled={isNormalizing}
                                className="h-12 w-52 rounded bg-[#0879bd] text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isNormalizing ? (
                                    <>
                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                        Normalisation...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="mr-2 size-4" />
                                        Normaliser
                                    </>
                                )}
                            </Button>
                        )}

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-12 w-52 rounded border-[#0879bd] text-sm font-semibold text-[#0879bd]"
                        >
                            <Printer className="mr-2 size-4" />
                            {t("print")}
                        </Button>

                        {pdfInvoice && (
                            <PDFDownloadLink
                                document={
                                    <InvoicePdfDocument invoice={pdfInvoice} />
                                }
                                fileName={`${invoice.invoice}.pdf`}
                                className="inline-flex h-12 w-52 items-center justify-center rounded border border-[#0879bd] bg-white px-3 text-sm font-semibold text-[#0879bd] transition-colors hover:bg-slate-100"
                            >
                                {({ loading }) => (
                                    <>
                                        <Download className="mr-2 size-4" />
                                        {loading
                                            ? "Préparation..."
                                            : t("download")}
                                    </>
                                )}
                            </PDFDownloadLink>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid min-h-[calc(100vh-120px)] grid-cols-1 gap-5 lg:grid-cols-[1fr_390px]">
                <section className="min-w-0 overflow-y-auto">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <p className="text-sm font-semibold text-slate-700">
                                {t("documentPreview")}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                                Modèle affiché :{" "}
                                {invoice.templateId === 2
                                    ? "Template B"
                                    : "Template A"}
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <AvatarStack reviewers={invoice.reviewers} />

                            <div className="inline-flex items-center gap-2 rounded bg-white px-3 py-2 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                                <MessageSquareText className="size-4 text-slate-400" />
                                {invoice.comments.length}
                            </div>
                        </div>
                    </div>

                    {invoice.templateId === 2 ? (
                        <TemplateBPreview
                            invoice={invoice}
                            taxGroups={taxGroups}
                        />
                    ) : (
                        <TemplateAPreview
                            invoice={invoice}
                            taxGroups={taxGroups}
                        />
                    )}
                </section>

                <aside className="border border-slate-200 bg-white">
                    <div className="flex h-full flex-col">
                        <div className="border-b border-slate-200 p-5">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-base font-bold text-slate-800">
                                        {t("reviewAndComments")}
                                    </h2>

                                    <p className="mt-1 text-xs text-slate-500">
                                        {t("reviewHelp")}
                                    </p>
                                </div>

                                <Badge
                                    variant="outline"
                                    className="rounded border-transparent bg-slate-100 text-slate-600"
                                >
                                    {invoice.comments.length}
                                </Badge>
                            </div>
                        </div>

                        <div className="border-b border-slate-200 p-5">
                            <div className="mb-3 flex items-center justify-between">
                                <p className="text-sm font-semibold text-slate-800">
                                    {t("decision")}
                                </p>

                                <StatutBadge statut={invoice.statut} />
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        handleChangeStatus("Validée")
                                    }
                                    className="h-10 rounded border-emerald-100 bg-emerald-50 px-2 text-xs text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700"
                                >
                                    <CheckCircle2 className="mr-1 size-4" />
                                    {t("validate")}
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        handleChangeStatus("Brouillon")
                                    }
                                    className="h-10 rounded border-amber-100 bg-amber-50 px-2 text-xs text-amber-600 hover:bg-amber-100 hover:text-amber-700"
                                >
                                    <Clock3 className="mr-1 size-4" />
                                    {t("pause")}
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        handleChangeStatus("Classée")
                                    }
                                    className="h-10 rounded border-red-100 bg-red-50 px-2 text-xs text-red-500 hover:bg-red-100 hover:text-red-600"
                                >
                                    <Ban className="mr-1 size-4" />
                                    {t("reject")}
                                </Button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5">
                            <div>
                                <p className="mb-2 text-sm font-semibold text-slate-800">
                                    {t("interactions")}
                                </p>

                                {invoice.reviewers.length === 0 ? (
                                    <div className="rounded border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                                        Aucune interaction.
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {invoice.reviewers.map((reviewer) => (
                                            <div
                                                key={reviewer.id}
                                                className="flex items-center gap-3 rounded border border-slate-200 bg-slate-50 px-3 py-2"
                                            >
                                                <div className="flex size-8 items-center justify-center rounded-full bg-white text-[10px] font-bold text-slate-600 ring-1 ring-slate-200">
                                                    {reviewer.initials}
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-semibold text-slate-700">
                                                        {reviewer.name}
                                                    </p>

                                                    <p className="text-xs text-slate-500">
                                                        {reviewer.role}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="mt-6">
                                <p className="mb-3 text-sm font-semibold text-slate-800">
                                    {t("comments")}
                                </p>

                                <div className="space-y-3">
                                    {isLoadingComments ? (
                                        <div className="flex items-center justify-center rounded border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-500">
                                            <Loader2 className="mr-2 size-4 animate-spin" />
                                            Chargement des commentaires...
                                        </div>
                                    ) : invoice.comments.length === 0 ? (
                                        <div className="rounded border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
                                            <MessageSquareText className="mx-auto size-5 text-slate-400" />

                                            <p className="mt-2 text-sm font-medium text-slate-600">
                                                {t("noComment")}
                                            </p>
                                        </div>
                                    ) : (
                                        invoice.comments.map((item) => (
                                            <div
                                                key={item.id}
                                                className={cn(
                                                    "rounded border bg-white p-4",
                                                    item.status === "resolved"
                                                        ? "border-slate-200 opacity-70"
                                                        : "border-slate-200"
                                                )}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-600">
                                                        {item.initials}
                                                    </div>

                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div>
                                                                <p className="text-sm font-semibold text-slate-800">
                                                                    {item.author}
                                                                </p>

                                                                <p className="text-xs text-slate-500">
                                                                    {item.role}
                                                                </p>
                                                            </div>

                                                            <span className="shrink-0 text-xs text-slate-400">
                                                                {item.date}
                                                            </span>
                                                        </div>

                                                        <p className="mt-3 text-sm leading-relaxed text-slate-600">
                                                            {item.message}
                                                        </p>

                                                        {item.status !==
                                                        "resolved" ? (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleResolveComment(
                                                                        item.id
                                                                    )
                                                                }
                                                                className="mt-3 text-xs font-semibold text-[#0879bd] hover:underline"
                                                            >
                                                                {t("resolve")}
                                                            </button>
                                                        ) : (
                                                            <p className="mt-3 text-xs font-semibold text-slate-400">
                                                                {t("resolved")}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-slate-200 p-5">
                            <label className="mb-2 block text-sm font-semibold text-slate-800">
                                {t("addComment")}
                            </label>

                            <textarea
                                value={comment}
                                onChange={(event) =>
                                    setComment(event.target.value)
                                }
                                placeholder={t("commentPlaceholder")}
                                className="h-24 w-full resize-none rounded border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#0879bd]"
                            />

                            <Button
                                type="button"
                                onClick={handleAddComment}
                                disabled={!comment.trim() || isCreatingComment}
                                className="mt-3 h-11 w-full rounded bg-[#0879bd] text-white hover:bg-[#076ca8] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isCreatingComment ? (
                                    <>
                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                        Envoi...
                                    </>
                                ) : (
                                    <>
                                        <Send className="mr-2 size-4" />
                                        {t("sendComment")}
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </aside>
            </div>
        </main>
    );
}
