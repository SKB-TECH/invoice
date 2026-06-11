"use client";

import { Eye } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
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
import type { ArticleTableRow } from "./types";

const COLUMN_ORDER = [
    "code",
    "title",
    "referential",
    "taxGroup",
    "priceHt",
    "priceTtc",
    "period",
] as const satisfies readonly (keyof ArticleTableRow)[];

const TABLE_HEAD_CLASS =
    "h-11 bg-slate-100 px-4 text-left text-sm font-semibold text-slate-700";

type ArticlesTableProps = {
    rows: ArticleTableRow[];
    className?: string;
};

export function ArticlesTable({ rows, className }: ArticlesTableProps) {
    const router = useRouter();
    const t = useTranslations("articles.list");

    return (
        <div
            className={cn(
                "overflow-hidden border border-slate-200/80 bg-white",
                className,
            )}
        >
            <Table>
                <TableHeader className="bg-[#F4F4F4BB]">
                    <TableRow className="border-slate-200 bg-[#F4F4F4BB] hover:bg-transparent">
                        {COLUMN_ORDER.map((key) => (
                            <TableHead key={key} className={TABLE_HEAD_CLASS}>
                                {t(`columns.${key}`)}
                            </TableHead>
                        ))}
                        <TableHead
                            className={cn(
                                TABLE_HEAD_CLASS,
                                "text-right",
                            )}
                        >
                            {t("action")}
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map((row) => (
                        <TableRow
                            key={row.id}
                            className="border-slate-200 hover:bg-slate-50/80"
                        >
                            {COLUMN_ORDER.map((key) => (
                                <TableCell
                                    key={key}
                                    className={cn(
                                        "px-4 py-3 text-sm text-slate-800",
                                        key === "code" && "font-semibold",
                                    )}
                                >
                                    {row[key]}
                                </TableCell>
                            ))}
                            <TableCell className="px-4 py-3 text-right">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="cursor-pointer text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                                    aria-label={t("viewArticleDetail", {
                                        id: row.code,
                                    })}
                                    onClick={() =>
                                        router.push(
                                            `/home/articles/${encodeURIComponent(row.navigationId)}/visualiser`,
                                        )
                                    }
                                >
                                    <Eye className="size-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
