"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
    Ban,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock3,
    Eye,
    House,
    Loader2,
    MessageSquareText,
    Send,
    X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {useInvoices} from "@/core/hooks/invoices/useInvoices";


type InvoiceStatus = "Brouillon" | "Émise" | "Payée" | "Annulée";

type InvoiceComment = {
    id: string;
    author: string;
    role: string;
    message: string;
    date: string;
};

type Reviewer = {
    id: string;
    name: string;
    initials: string;
};

type Invoice = {
    id: string;
    invoice: string;
    client: string;
    article: string;
    amount: number;
    currency: string;
    statut: InvoiceStatus;
    telephone: string;
    reviewers: Reviewer[];
    comments: InvoiceComment[];
};

type InvoiceOverrides = Record<
    string,
    {
        statut?: InvoiceStatus;
        reviewers?: Reviewer[];
        comments?: InvoiceComment[];
    }
>;

const PER_PAGE = 20;

function formatAmount(amount: number, currency: string) {
    if (amount >= 1_000_000) {
        const value = amount / 1_000_000;
        const formatted =
            Number.isInteger(value) ? value.toString() : value.toFixed(1);

        return `${currency} ${formatted}M`;
    }

    return `${currency} ${new Intl.NumberFormat("fr-FR")
        .format(amount)
        .replace(/\s/g, ".")}`;
}

function mapApiStatusToUiStatus(status: string): InvoiceStatus {
    switch (status) {
        case "draft":
            return "Brouillon";
        case "issued":
            return "Émise";
        case "paid":
            return "Payée";
        case "cancelled":
            return "Annulée";
        default:
            return "Brouillon";
    }
}

function StatutBadge({ statut }: { statut: InvoiceStatus }) {
    const styles: Record<InvoiceStatus, string> = {
        Brouillon:
            "border-transparent bg-[#FCF5E5] text-[#E8BC52] hover:bg-[#FCF5E5]",
        Émise:
            "border-transparent bg-[#E8EFFB] text-[#6691E7] hover:bg-[#E8EFFB]",
        Payée:
            "border-transparent bg-[#DCF6E9] text-[#13C56B] hover:bg-[#DCF6E9]",
        Annulée:
            "border-transparent bg-red-50 text-red-500 hover:bg-red-50",
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
    const visibleReviewers = reviewers.slice(0, 3);
    const remaining = reviewers.length - visibleReviewers.length;

    if (reviewers.length === 0) {
        return <span className="text-sm text-slate-400">—</span>;
    }

    return (
        <div className="flex items-center">
            {visibleReviewers.map((reviewer, index) => (
                <div
                    key={reviewer.id}
                    title={reviewer.name}
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

export default function InvoicesPage() {
    const t = useTranslations("invoicesPage");

    const [page, setPage] = useState(1);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(
        null
    );
    const [comment, setComment] = useState("");
    const [invoiceOverrides, setInvoiceOverrides] =
        useState<InvoiceOverrides>({});

    const { data, isLoading, isError, isFetching } = useInvoices({
        page,
        perPage: PER_PAGE,
    });

    const totalItems = data?.meta?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(totalItems / PER_PAGE));

    const invoices: Invoice[] = useMemo(() => {
        return (data?.items ?? []).map((item) => {
            const override = invoiceOverrides[item.id.toString()];

            const baseInvoice: Invoice = {
                id: item.id.toString(),
                invoice: item.invoice_number,
                client:
                    item.client?.legal_name ||
                    item.client?.client_name ||
                    "—",
                article:
                    item.line_items
                        ?.map((line) => line.service_name)
                        .filter(Boolean)
                        .join(", ") || "—",
                amount: Number(item.total ?? 0),
                currency: item.currency || "USD",
                statut: mapApiStatusToUiStatus(item.status),
                telephone: "—",
                reviewers: [],
                comments: [],
            };

            return {
                ...baseInvoice,
                statut: override?.statut ?? baseInvoice.statut,
                reviewers: override?.reviewers ?? baseInvoice.reviewers,
                comments: override?.comments ?? baseInvoice.comments,
            };
        });
    }, [data?.items, invoiceOverrides]);


    const handleChangeStatus = (statut: InvoiceStatus) => {
        if (!selectedInvoice) return;

        setInvoiceOverrides((prev) => ({
            ...prev,
            [selectedInvoice.id]: {
                ...prev[selectedInvoice.id],
                statut,
            },
        }));

        setSelectedInvoice((prev) =>
            prev
                ? {
                    ...prev,
                    statut,
                }
                : null
        );
    };

    const handleAddComment = () => {
        if (!selectedInvoice || !comment.trim()) return;

        const newComment: InvoiceComment = {
            id: crypto.randomUUID(),
            author: t("drawer.you"),
            role: t("drawer.reviewer"),
            message: comment.trim(),
            date: t("drawer.now"),
        };

        const currentUser: Reviewer = {
            id: "current-user",
            name: t("drawer.you"),
            initials: "VO",
        };

        const currentOverrides = invoiceOverrides[selectedInvoice.id];

        const currentComments =
            currentOverrides?.comments ?? selectedInvoice.comments;

        const currentReviewers =
            currentOverrides?.reviewers ?? selectedInvoice.reviewers;

        const nextReviewers = currentReviewers.some(
            (reviewer) => reviewer.id === currentUser.id
        )
            ? currentReviewers
            : [...currentReviewers, currentUser];

        const nextComments = [newComment, ...currentComments];

        setInvoiceOverrides((prev) => ({
            ...prev,
            [selectedInvoice.id]: {
                ...prev[selectedInvoice.id],
                reviewers: nextReviewers,
                comments: nextComments,
            },
        }));

        setSelectedInvoice((prev) =>
            prev
                ? {
                    ...prev,
                    reviewers: nextReviewers,
                    comments: nextComments,
                }
                : null
        );

        setComment("");
    };

    const handlePreviousPage = () => {
        setPage((prev) => {
            const nextPage = Math.max(1, prev - 1);

            if (nextPage !== prev) {
                setSelectedInvoice(null);
                setComment("");
            }
            return nextPage;
        });
    };

    const handleNextPage = () => {
        setPage((prev) => {
            const nextPage = Math.min(totalPages, prev + 1);

            if (nextPage !== prev) {
                setSelectedInvoice(null);
                setComment("");
            }

            return nextPage;
        });
    };

    return (
        <main className="mx-auto w-full min-w-full py-4 text-foreground">
            <span className="mb-6 flex flex-wrap items-center gap-1 text-sm text-slate-500">
                <Link href="/home">
                    <House className="size-4" />
                </Link>

                <ChevronRight className="size-4 shrink-0" />

                <span>{t("breadcrumb.invoices")}</span>

                <ChevronRight className="size-4 shrink-0" />

                <span className="text-slate-800">{t("breadcrumb.view")}</span>
            </span>

            <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
                    {t("title")}
                </h1>

                <Button
                    size="lg"
                    className="h-12 w-52 cursor-pointer rounded bg-[#0879bd] px-5 text-white hover:bg-[#076ca8]"
                    asChild
                >
                    <Link href="/home/factures/new">
                        {t("createInvoice")}
                    </Link>
                </Button>
            </div>

            <div className="overflow-hidden border border-slate-200/80 bg-white">
                <Table>
                    <TableHeader className="bg-[#F4F4F4BB]">
                        <TableRow className="border-slate-200 bg-[#F4F4F4BB] hover:bg-transparent">
                            <TableHead className="h-11 bg-slate-100 px-4 text-left text-sm font-semibold text-slate-700">
                                {t("table.invoice")}
                            </TableHead>

                            <TableHead className="h-11 bg-slate-100 px-4 text-left text-sm font-semibold text-slate-700">
                                {t("table.client")}
                            </TableHead>

                            <TableHead className="h-11 bg-slate-100 px-4 text-left text-sm font-semibold text-slate-700">
                                {t("table.article")}
                            </TableHead>

                            <TableHead className="h-11 bg-slate-100 px-4 text-left text-sm font-semibold text-slate-700">
                                {t("table.amount")}
                            </TableHead>

                            <TableHead className="h-11 bg-slate-100 px-4 text-left text-sm font-semibold text-slate-700">
                                {t("table.status")}
                            </TableHead>

                            <TableHead className="h-11 bg-slate-100 px-4 text-left text-sm font-semibold text-slate-700">
                                {t("table.phone")}
                            </TableHead>

                            <TableHead className="h-11 bg-slate-100 px-4 text-left text-sm font-semibold text-slate-700">
                                {t("table.comments")}
                            </TableHead>

                            <TableHead className="h-11 bg-slate-100 px-4 text-left text-sm font-semibold text-slate-700">
                                {t("table.interactions")}
                            </TableHead>

                            <TableHead className="h-11 bg-slate-100 px-4 text-right text-sm font-semibold text-slate-700">
                                <span className="sr-only">
                                    {t("table.actions")}
                                </span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell
                                    colSpan={9}
                                    className="h-40 text-center"
                                >
                                    <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                                        <Loader2 className="size-4 animate-spin" />
                                        Chargement des factures...
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : isError ? (
                            <TableRow>
                                <TableCell
                                    colSpan={9}
                                    className="h-40 text-center text-sm text-red-500"
                                >
                                    Une erreur est survenue lors du chargement
                                    des factures.
                                </TableCell>
                            </TableRow>
                        ) : invoices.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={9}
                                    className="h-40 text-center text-sm text-slate-500"
                                >
                                    Aucune facture trouvée.
                                </TableCell>
                            </TableRow>
                        ) : (
                            invoices.map((row) => (
                                <TableRow
                                    key={row.id}
                                    className="border-slate-200 hover:bg-slate-50/80"
                                >
                                    <TableCell className="px-4 py-3 text-sm text-slate-800">
                                        {row.invoice}
                                    </TableCell>

                                    <TableCell className="px-4 py-3 text-sm text-slate-800">
                                        {row.client}
                                    </TableCell>

                                    <TableCell className="px-4 py-3 text-sm text-slate-800">
                                        {row.article}
                                    </TableCell>

                                    <TableCell className="px-4 py-3 text-sm font-semibold text-slate-800">
                                        {formatAmount(
                                            row.amount,
                                            row.currency
                                        )}
                                    </TableCell>

                                    <TableCell className="px-4 py-3 text-sm text-slate-800">
                                        <StatutBadge statut={row.statut} />
                                    </TableCell>

                                    <TableCell className="px-4 py-3 text-sm text-slate-800">
                                        {row.telephone}
                                    </TableCell>

                                    <TableCell className="px-4 py-3 text-sm text-slate-800">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setSelectedInvoice(row)
                                            }
                                            className="inline-flex items-center gap-2 text-slate-500 hover:text-[#0879bd]"
                                        >
                                            <MessageSquareText className="size-4" />
                                            <span>{row.comments.length}</span>
                                        </button>
                                    </TableCell>

                                    <TableCell className="px-4 py-3 text-sm text-slate-800">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setSelectedInvoice(row)
                                            }
                                            className="inline-flex items-center"
                                            aria-label={t(
                                                "table.viewInteractions"
                                            )}
                                        >
                                            <AvatarStack
                                                reviewers={row.reviewers}
                                            />
                                        </button>
                                    </TableCell>

                                    <TableCell className="px-4 py-3 text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            asChild
                                            className="cursor-pointer text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                                        >
                                            <Link
                                                href={`/home/factures/${encodeURIComponent(
                                                    row.id
                                                )}`}
                                                aria-label={t(
                                                    "table.viewInvoice"
                                                )}
                                            >
                                                <Eye className="size-4" />
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="mt-5 flex flex-col items-center justify-between gap-4 sm:flex-row">
                <p className="text-sm text-slate-500">
                    {totalItems === 0
                        ? "0 facture"
                        : `${totalItems} facture${totalItems > 1 ? "s" : ""}`}
                    {isFetching && !isLoading ? " • Mise à jour..." : ""}
                </p>

                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handlePreviousPage}
                        disabled={page <= 1 || isFetching}
                        className="h-10 w-10 rounded"
                    >
                        <ChevronLeft className="size-4" />
                    </Button>

                    <div className="flex h-10 min-w-32 items-center justify-center border border-slate-200 px-4 text-sm font-medium text-slate-700">
                        Page {page} / {totalPages}
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleNextPage}
                        disabled={page >= totalPages || isFetching}
                        className="h-10 w-10 rounded"
                    >
                        <ChevronRight className="size-4" />
                    </Button>
                </div>
            </div>

            {selectedInvoice && (
                <div className="fixed inset-0 z-50 flex justify-end bg-black/25">
                    <div className="h-full w-full max-w-[560px] border-l border-slate-200 bg-white shadow-xl">
                        <div className="flex h-full flex-col">
                            <div className="border-b border-slate-200 bg-white px-6 py-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">
                                            {t("drawer.reviewInvoice")}
                                        </p>

                                        <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-800">
                                            {selectedInvoice.invoice}
                                        </h2>

                                        <p className="mt-1 text-sm text-slate-500">
                                            {selectedInvoice.client} /{" "}
                                            {selectedInvoice.article}
                                        </p>
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                            setSelectedInvoice(null)
                                        }
                                        className="text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                                    >
                                        <X className="size-4" />
                                    </Button>
                                </div>

                                <div className="mt-5 grid grid-cols-3 gap-3">
                                    <div className="border border-slate-200 bg-slate-50 px-4 py-3">
                                        <p className="text-xs font-medium text-slate-500">
                                            {t("drawer.amount")}
                                        </p>

                                        <p className="mt-1 text-base font-bold text-slate-800">
                                            {formatAmount(
                                                selectedInvoice.amount,
                                                selectedInvoice.currency
                                            )}
                                        </p>
                                    </div>

                                    <div className="border border-slate-200 bg-slate-50 px-4 py-3">
                                        <p className="text-xs font-medium text-slate-500">
                                            {t("drawer.status")}
                                        </p>

                                        <div className="mt-1">
                                            <StatutBadge
                                                statut={
                                                    selectedInvoice.statut
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="border border-slate-200 bg-slate-50 px-4 py-3">
                                        <p className="text-xs font-medium text-slate-500">
                                            {t("drawer.interactions")}
                                        </p>

                                        <div className="mt-2">
                                            <AvatarStack
                                                reviewers={
                                                    selectedInvoice.reviewers
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto px-6 py-5">
                                <div className="border border-slate-200">
                                    <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
                                        <h3 className="text-sm font-semibold text-slate-800">
                                            {t("drawer.decision")}
                                        </h3>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3 p-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() =>
                                                handleChangeStatus("Payée")
                                            }
                                            className="h-10 rounded border-emerald-100 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700"
                                        >
                                            <CheckCircle2 className="mr-2 size-4" />
                                            {t("drawer.validate")}
                                        </Button>

                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() =>
                                                handleChangeStatus("Brouillon")
                                            }
                                            className="h-10 rounded border-amber-100 bg-amber-50 text-amber-600 hover:bg-amber-100 hover:text-amber-700"
                                        >
                                            <Clock3 className="mr-2 size-4" />
                                            {t("drawer.pause")}
                                        </Button>

                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() =>
                                                handleChangeStatus("Annulée")
                                            }
                                            className="h-10 rounded border-red-100 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600"
                                        >
                                            <Ban className="mr-2 size-4" />
                                            {t("drawer.reject")}
                                        </Button>
                                    </div>
                                </div>

                                <div className="mt-5">
                                    <div className="mb-3 flex items-center justify-between">
                                        <h3 className="text-sm font-semibold text-slate-800">
                                            {t("drawer.comments")}
                                        </h3>

                                        <Badge
                                            variant="outline"
                                            className="rounded border-transparent bg-slate-100 text-slate-600"
                                        >
                                            {
                                                selectedInvoice.comments
                                                    .length
                                            }
                                        </Badge>
                                    </div>

                                    <div className="space-y-3">
                                        {selectedInvoice.comments.length ===
                                        0 ? (
                                            <div className="border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
                                                <MessageSquareText className="mx-auto size-5 text-slate-400" />

                                                <p className="mt-2 text-sm font-medium text-slate-600">
                                                    {t("drawer.noComment")}
                                                </p>
                                            </div>
                                        ) : (
                                            selectedInvoice.comments.map(
                                                (item) => (
                                                    <div
                                                        key={item.id}
                                                        className="border border-slate-200 bg-white px-4 py-4"
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-600">
                                                                {item.author
                                                                    .split(" ")
                                                                    .map(
                                                                        (
                                                                            name
                                                                        ) =>
                                                                            name[0]
                                                                    )
                                                                    .join("")
                                                                    .slice(0, 2)
                                                                    .toUpperCase()}
                                                            </div>

                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex items-start justify-between gap-4">
                                                                    <div>
                                                                        <p className="text-sm font-semibold text-slate-800">
                                                                            {
                                                                                item.author
                                                                            }
                                                                        </p>

                                                                        <p className="text-xs text-slate-500">
                                                                            {
                                                                                item.role
                                                                            }
                                                                        </p>
                                                                    </div>

                                                                    <span className="shrink-0 text-xs text-slate-400">
                                                                        {
                                                                            item.date
                                                                        }
                                                                    </span>
                                                                </div>

                                                                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                                                                    {
                                                                        item.message
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-slate-200 bg-white px-6 py-5">
                                <label className="mb-2 block text-sm font-semibold text-slate-800">
                                    {t("drawer.addComment")}
                                </label>

                                <textarea
                                    value={comment}
                                    onChange={(event) =>
                                        setComment(event.target.value)
                                    }
                                    placeholder={t(
                                        "drawer.commentPlaceholder"
                                    )}
                                    className="h-24 w-full resize-none rounded border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#0879bd]"
                                />

                                <Button
                                    type="button"
                                    onClick={handleAddComment}
                                    disabled={!comment.trim()}
                                    className="mt-3 h-11 w-full rounded bg-[#0879bd] text-white hover:bg-[#076ca8]"
                                >
                                    <Send className="mr-2 size-4" />
                                    {t("drawer.sendComment")}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
