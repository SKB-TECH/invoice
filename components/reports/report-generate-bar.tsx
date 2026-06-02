"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

type Props = {
    onGeneratePreview: () => void;
    isPreviewPending: boolean;
    disabled?: boolean;
};

export function ReportActionsBar({
    onGeneratePreview,
    isPreviewPending,
    disabled,
}: Props) {
    const t = useTranslations("reports");

    return (
        <div className="mt-6 flex flex-wrap items-center justify-end gap-4 border-t border-slate-100 pt-5">
            <button
                type="button"
                disabled={disabled || isPreviewPending}
                onClick={onGeneratePreview}
                className="h-12 w-52 rounded bg-[#0879bd] text-sm font-semibold text-white hover:bg-[#076ca8] disabled:cursor-not-allowed disabled:bg-slate-300"
            >
                {isPreviewPending ? (
                    <span className="inline-flex items-center justify-center gap-2">
                        <Loader2 className="size-4 animate-spin" aria-hidden />
                        {t("actions.generating")}
                    </span>
                ) : (
                    t("actions.generate")
                )}
            </button>
        </div>
    );
}
