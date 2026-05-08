import { cn } from "@/lib/utils";
import type { ArticleRowStatus } from "./types";

const statusLabel: Record<ArticleRowStatus, string> = {
  suspendu: "Suspendu",
  actif: "Actif",
  complet: "Complet",
};

const statusClass: Record<ArticleRowStatus, string> = {
  suspendu: "bg-[#FCF5E5] text-[#E8BC52]",
  actif: "bg-[#E8EFFB] text-[#6691E7]",
  complet: "bg-[#DCF6E9] text-[#13C56B]",
};

type ArticleStatusBadgeProps = {
  status: ArticleRowStatus;
  className?: string;
};

export function ArticleStatusBadge({ status, className }: ArticleStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-block px-2 py-1 text-[10px] font-semibold",
        statusClass[status],
        className
      )}
    >
      {statusLabel[status]}
    </span>
  );
}
