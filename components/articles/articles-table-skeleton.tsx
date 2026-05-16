"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const COLUMN_KEYS = [
  "code",
  "title",
  "referential",
  "group",
  "taxGroup",
  "priceTtc",
  "status",
  "period",
] as const;

type Props = {
    rowCount?: number;
    className?: string;
};

function cellWidths(row: number, col: number): string {
    const offsets = (row * 2 + col * 5 + (row % 3) * 7) % 24;
    switch (col) {
        case 0:
            return cn("h-3.5", offsets % 2 ? "w-[4.5rem]" : "w-20");
        case 1:
            return cn("h-3.5", offsets % 3 === 0 ? "w-[88%]" : "w-[72%]");
        case 2:
            return cn("h-3.5", offsets % 2 ? "w-[70%]" : "w-[80%]");
        case 3:
            return "h-3.5 w-6";
        case 4:
            return cn("h-3.5", offsets % 3 === 0 ? "w-16" : "w-[7rem]");
        case 5:
            return cn("h-3.5", offsets % 2 ? "w-24" : "w-28");
        case 6:
            return "h-6 w-20 rounded-sm";
        case 7:
            return cn("h-3.5", offsets % 2 ? "w-[4.25rem]" : "w-24");
        default:
            return "h-3.5 w-16";
    }
}

export function ArticlesTableSkeleton({
  rowCount = 8,
  className,
}: Props) {
  const t = useTranslations("articles.list");

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={t("loading")}
      className={cn(
        "border border-slate-200 bg-white text-slate-700",
        className
      )}
    >
      <table className="w-full border-collapse text-left text-[11px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
            {COLUMN_KEYS.map((key) => (
              <th key={key} className="px-5 py-3 font-semibold">
                {t(`columns.${key}`)}
              </th>
            ))}
            <th className="px-5 py-3 text-right font-semibold">
              {t("action")}
            </th>
          </tr>
        </thead>
        <tbody className="animate-pulse">
          {Array.from({ length: rowCount }).map((_, row) => (
            <tr key={row} className="border-b border-slate-100">
              {COLUMN_KEYS.map((key, col) => (
                <td key={key} className="px-5 py-4">
                  <div
                    className={cn(
                      "rounded bg-slate-200/90",
                      cellWidths(row, col)
                    )}
                  />
                </td>
              ))}
              <td className="px-5 py-4 text-right">
                <div className="ml-auto h-8 w-8 rounded bg-slate-200/90" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
