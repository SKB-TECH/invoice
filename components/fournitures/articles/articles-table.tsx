import { cn } from "@/lib/utils";
import { ArticleStatusBadge } from "./article-status-badge";
import type { ArticleTableRow } from "./types";

export const ARTICLES_TABLE_COLUMN_LABELS = {
  idIkwook: "ID iKwook",
  title: "Titre",
  group: "Groupe",
  priceTtc: "Prix TTC",
  status: "Statut",
  period: "Période",
} as const satisfies Record<keyof ArticleTableRow, string>;

const COLUMN_ORDER = [
  "idIkwook",
  "title",
  "group",
  "priceTtc",
  "status",
  "period",
] as const satisfies readonly (keyof ArticleTableRow)[];

type ArticlesTableProps = {
  rows: ArticleTableRow[];
  className?: string;
};

export function ArticlesTable({ rows, className }: ArticlesTableProps) {
  return (
    <div
      className={cn(
        "border border-slate-200 bg-white text-slate-700",
        className
      )}
    >
      <table className="w-full border-collapse text-left text-[11px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
            {COLUMN_ORDER.map((key) => (
              <th key={key} className="px-5 py-3 font-semibold">
                {ARTICLES_TABLE_COLUMN_LABELS[key]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.idIkwook} className="border-b border-slate-100">
              {COLUMN_ORDER.map((key) => (
                <td key={key} className="px-5 py-4">
                  {key === "status" ? (
                    <ArticleStatusBadge status={row.status} />
                  ) : (
                    row[key]
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
