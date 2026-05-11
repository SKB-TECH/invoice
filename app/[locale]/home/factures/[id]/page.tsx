"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { PDFDownloadLink } from "@react-pdf/renderer";
import {
    ArrowLeft,
    Ban,
    CheckCircle2,
    ChevronRight,
    Clock3,
    Download,
    House,
    MessageSquareText,
    Printer,
    Send,
    Share2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { InvoicePdfDocument } from "@/components/shared/OtherComponents/components/invoice/InvoicePdfDocument";

type InvoiceStatus = "Suspendu" | "Actif" | "Complet" | "Rejeté";

type Reviewer = {
    id: string;
    name: string;
    initials: string;
    role: string;
};

type InvoiceComment = {
    id: string;
    author: string;
    initials: string;
    role: string;
    message: string;
    date: string;
    status?: "open" | "resolved";
};

type InvoiceLine = {
    id: string;
    designation: string;
    quantity: number;
    unitPrice: number;
};

type Invoice = {
    id: string;
    invoice: string;
    client: string;
    clientAddress: string;
    article: string;
    amount: number;
    currency: "CDF" | "USD";
    statut: InvoiceStatus;
    telephone: string;
    createdAt: string;
    dueDate: string;
    reviewers: Reviewer[];
    comments: InvoiceComment[];
    lines: InvoiceLine[];
};

const demoInvoices: Invoice[] = [
    {
        id: "1",
        invoice: "INV-2024-001",
        client: "Rawbank",
        clientAddress: "Boulevard du 30 Juin, Kinshasa",
        article: "Maintenance",
        amount: 500000,
        currency: "CDF",
        statut: "Suspendu",
        telephone: "0822204012",
        createdAt: "12-05-2026",
        dueDate: "20-05-2026",
        reviewers: [
            {
                id: "u1",
                name: "Benoît Makiese",
                initials: "BM",
                role: "Validateur",
            },
            {
                id: "u2",
                name: "Ruth Kanku",
                initials: "RK",
                role: "Superviseur",
            },
        ],
        comments: [
            {
                id: "c1",
                author: "Benoît Makiese",
                initials: "BM",
                role: "Validateur",
                message:
                    "Le montant déclaré ne correspond pas totalement au contrat associé. Merci de vérifier la ligne maintenance.",
                date: "Aujourd’hui, 09:30",
                status: "open",
            },
            {
                id: "c2",
                author: "Ruth Kanku",
                initials: "RK",
                role: "Superviseur",
                message:
                    "La référence du bon de commande doit être ajoutée avant la validation finale.",
                date: "Aujourd’hui, 10:12",
                status: "open",
            },
        ],
        lines: [
            {
                id: "l1",
                designation: "Maintenance système",
                quantity: 1,
                unitPrice: 300000,
            },
            {
                id: "l2",
                designation: "Support technique",
                quantity: 1,
                unitPrice: 150000,
            },
            {
                id: "l3",
                designation: "Frais administratifs",
                quantity: 1,
                unitPrice: 50000,
            },
        ],
    },
    {
        id: "2",
        invoice: "INV-2024-002",
        client: "EquityBCDC",
        clientAddress: "Gombe, Kinshasa",
        article: "Installation",
        amount: 1000000,
        currency: "CDF",
        statut: "Actif",
        telephone: "0822204012",
        createdAt: "12-05-2026",
        dueDate: "20-05-2026",
        reviewers: [
            {
                id: "u3",
                name: "Kevin Mbala",
                initials: "KM",
                role: "Validateur",
            },
        ],
        comments: [
            {
                id: "c3",
                author: "Kevin Mbala",
                initials: "KM",
                role: "Validateur",
                message: "Facture conforme pour une première lecture.",
                date: "Hier, 16:45",
                status: "open",
            },
        ],
        lines: [
            {
                id: "l1",
                designation: "Installation logiciel",
                quantity: 1,
                unitPrice: 700000,
            },
            {
                id: "l2",
                designation: "Configuration initiale",
                quantity: 1,
                unitPrice: 300000,
            },
        ],
    },
];

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

function StatutBadge({ statut }: { statut: InvoiceStatus }) {
    const styles: Record<InvoiceStatus, string> = {
        Suspendu:
            "border-transparent bg-[#FCF5E5] text-[#E8BC52] hover:bg-[#FCF5E5]",
        Actif: "border-transparent bg-[#E8EFFB] text-[#6691E7] hover:bg-[#E8EFFB]",
        Complet:
            "border-transparent bg-[#DCF6E9] text-[#13C56B] hover:bg-[#DCF6E9]",
        Rejeté: "border-transparent bg-red-50 text-red-500 hover:bg-red-50",
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

type PageProps = {
    params: {
        id: string;
        locale: string;
    };
};

export default function InvoiceViewerPage({ params }: PageProps) {
    const t = useTranslations("invoiceViewer");

    const initialInvoice = useMemo(() => {
        return demoInvoices.find((item) => item.id === params.id) ?? demoInvoices[0];
    }, [params.id]);

    const [invoice, setInvoice] = useState<Invoice>(initialInvoice);
    const [comment, setComment] = useState("");

    const subtotal = invoice.lines.reduce(
        (sum, line) => sum + line.quantity * line.unitPrice,
        0
    );

    const tax = Math.round(subtotal * 0.16);
    const total = subtotal + tax;

    const pdfInvoice = {
        invoice: invoice.invoice,
        client: invoice.client,
        clientAddress: invoice.clientAddress,
        telephone: invoice.telephone,
        currency: invoice.currency,
        createdAt: invoice.createdAt,
        dueDate: invoice.dueDate,
        lines: invoice.lines,
    };

    const handleChangeStatus = (statut: InvoiceStatus) => {
        setInvoice((current) => ({
            ...current,
            statut,
        }));
    };

    const handleAddComment = () => {
        if (!comment.trim()) return;

        const newComment: InvoiceComment = {
            id: crypto.randomUUID(),
            author: t("you"),
            initials: "VO",
            role: t("reviewer"),
            message: comment.trim(),
            date: t("now"),
            status: "open",
        };

        const currentUser: Reviewer = {
            id: "current-user",
            name: t("you"),
            initials: "VO",
            role: t("reviewer"),
        };

        setInvoice((current) => ({
            ...current,
            reviewers: current.reviewers.some(
                (reviewer) => reviewer.id === currentUser.id
            )
                ? current.reviewers
                : [...current.reviewers, currentUser],
            comments: [newComment, ...current.comments],
        }));

        setComment("");
    };

    const handleResolveComment = (commentId: string) => {
        setInvoice((current) => ({
            ...current,
            comments: current.comments.map((item) =>
                item.id === commentId ? { ...item, status: "resolved" } : item
            ),
        }));
    };

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
                                <Link href="/home" className="hover:text-slate-700">
                                    <House className="size-3.5" />
                                </Link>
                                <ChevronRight className="size-3.5" />
                                <Link href="/home/factures" className="hover:text-slate-700">
                                    {t("breadcrumbInvoices")}
                                </Link>
                                <ChevronRight className="size-3.5" />
                                <span className="text-slate-700">
                                    {t("breadcrumbView")}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="hidden items-center gap-2 md:flex">
                        <StatutBadge statut={invoice.statut} />

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-10 rounded border-slate-200 text-slate-600"
                        >
                            <Printer className="mr-2 size-4" />
                            {t("print")}
                        </Button>

                        <PDFDownloadLink
                            document={<InvoicePdfDocument invoice={pdfInvoice} />}
                            fileName={`${invoice.invoice}.pdf`}
                            className="inline-flex h-10 items-center justify-center rounded border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                        >
                            {({ loading }) => (
                                <>
                                    <Download className="mr-2 size-4" />
                                    {loading ? "Préparation..." : t("download")}
                                </>
                            )}
                        </PDFDownloadLink>

                        <Button
                            type="button"
                            size="sm"
                            className="h-10 rounded bg-[#0879bd] text-white hover:bg-[#076ca8]"
                        >
                            <Share2 className="mr-2 size-4" />
                            {t("share")}
                        </Button>
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
                                {t("documentHelp")}
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
                                {t("invoice")}
                            </h2>
                        </div>

                        <div className="mb-5 flex items-end justify-between border-b-2 border-black pb-2">
                            <div className="text-sm font-bold uppercase leading-5 text-black">
                                <p>
                                    {t("createdAt")} : {invoice.createdAt}
                                </p>
                                <p>
                                    {t("dueDate")} : {invoice.dueDate}
                                </p>
                            </div>

                            <p className="text-lg font-black uppercase text-black">
                                {t("invoice")} N° : {invoice.invoice}
                            </p>
                        </div>

                        <div className="mb-20 grid grid-cols-2 gap-10">
                            <div>
                                <p className="mb-4 text-sm font-black uppercase text-black">
                                    Émetteur :
                                </p>
                                <p className="text-sm font-bold leading-5 text-black">
                                    iKwook Sarl
                                    <br />
                                    contact@ikwook.cd
                                    <br />
                                    +243 822 204 012
                                    <br />
                                    Kinshasa, RDC
                                </p>
                            </div>

                            <div className="text-right">
                                <p className="mb-4 text-sm font-black uppercase text-black">
                                    Destinataire :
                                </p>
                                <p className="text-sm font-bold leading-5 text-black">
                                    {invoice.client}
                                    <br />
                                    {invoice.telephone}
                                    <br />
                                    {invoice.clientAddress}
                                </p>
                            </div>
                        </div>

                        <div>
                            <div className="grid grid-cols-[1fr_180px_120px_180px] border-b-2 border-black pb-3 text-sm font-black text-black">
                                <div>{t("designation")} :</div>
                                <div className="text-right">{t("unitPrice")} :</div>
                                <div className="text-right">{t("quantity")} :</div>
                                <div className="text-right">{t("lineTotal")} :</div>
                            </div>

                            {invoice.lines.map((line) => (
                                <div
                                    key={line.id}
                                    className="grid grid-cols-[1fr_180px_120px_180px] border-b border-slate-500 py-4 text-base text-slate-800"
                                >
                                    <div>{line.designation}</div>
                                    <div className="text-right">
                                        {formatAmount(line.unitPrice, invoice.currency)}
                                    </div>
                                    <div className="text-right">{line.quantity}</div>
                                    <div className="text-right">
                                        {formatAmount(
                                            line.quantity * line.unitPrice,
                                            invoice.currency
                                        )}
                                    </div>
                                </div>
                            ))}

                            {Array.from({
                                length: Math.max(0, 5 - invoice.lines.length),
                            }).map((_, index) => (
                                <div
                                    key={index}
                                    className="grid grid-cols-[1fr_180px_120px_180px] border-b border-slate-500 py-4 text-base text-slate-500"
                                >
                                    <div>-</div>
                                    <div className="text-right">-</div>
                                    <div className="text-right">-</div>
                                    <div className="text-right">-</div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 grid grid-cols-2 gap-10">
                            <div className="pt-10">
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

                            <div className="ml-auto w-full max-w-[320px]">
                                <div className="space-y-3">
                                    <div className="flex justify-between text-lg font-black text-black">
                                        <span>TOTAL HT :</span>
                                        <span>{formatAmount(subtotal, invoice.currency)}</span>
                                    </div>

                                    <div className="flex justify-between text-lg font-black text-black">
                                        <span>TVA 16% :</span>
                                        <span>{formatAmount(tax, invoice.currency)}</span>
                                    </div>

                                    <div className="flex justify-between text-lg font-black text-black">
                                        <span>REMISE :</span>
                                        <span>-</span>
                                    </div>

                                    <div className="flex justify-between text-lg font-black text-black">
                                        <span>TOTAL TTC :</span>
                                        <span>{formatAmount(total, invoice.currency)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-16 max-w-[420px] space-y-5 text-xs leading-5 text-black">
                            <p>
                                En cas de retard de paiement, une indemnité de retard peut
                                être appliquée conformément aux conditions générales.
                            </p>

                            <p>
                                Conditions générales de vente consultables sur le site :
                                www.ikwook.cd
                            </p>
                        </div>
                    </div>
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
                                    onClick={() => handleChangeStatus("Complet")}
                                    className="h-10 rounded border-emerald-100 bg-emerald-50 px-2 text-xs text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700"
                                >
                                    <CheckCircle2 className="mr-1 size-4" />
                                    {t("validate")}
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => handleChangeStatus("Suspendu")}
                                    className="h-10 rounded border-amber-100 bg-amber-50 px-2 text-xs text-amber-600 hover:bg-amber-100 hover:text-amber-700"
                                >
                                    <Clock3 className="mr-1 size-4" />
                                    {t("pause")}
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => handleChangeStatus("Rejeté")}
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
                            </div>

                            <div className="mt-6">
                                <p className="mb-3 text-sm font-semibold text-slate-800">
                                    {t("comments")}
                                </p>

                                <div className="space-y-3">
                                    {invoice.comments.length === 0 ? (
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

                                                        {item.status !== "resolved" ? (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleResolveComment(item.id)
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
                                onChange={(event) => setComment(event.target.value)}
                                placeholder={t("commentPlaceholder")}
                                className="h-24 w-full resize-none rounded border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#0879bd]"
                            />

                            <Button
                                type="button"
                                onClick={handleAddComment}
                                disabled={!comment.trim()}
                                className="mt-3 h-11 w-full rounded bg-[#0879bd] text-white hover:bg-[#076ca8]"
                            >
                                <Send className="mr-2 size-4" />
                                {t("sendComment")}
                            </Button>
                        </div>
                    </div>
                </aside>
            </div>
        </main>
    );
}
