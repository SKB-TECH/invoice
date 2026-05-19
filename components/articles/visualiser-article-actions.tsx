"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";

type VisualiserArticleActionsProps = {
    listPath?: string;
    modifierPath: string;
};

export function VisualiserArticleActions({
    listPath = "/home/articles",
    modifierPath,
}: VisualiserArticleActionsProps) {
    const router = useRouter();
    const t = useTranslations("articles.view.actions");

    const buttonClass =
        "inline-flex h-[50px] w-52 items-center justify-center rounded text-[14px] font-semibold leading-none";

    return (
        <div className="mt-6 flex flex-wrap items-center justify-end gap-5">
            <button
                type="button"
                onClick={() => router.push(listPath)}
                className={`${buttonClass} bg-slate-400 text-white hover:bg-slate-500`}
            >
                {t("backToList")}
            </button>
            <button
                type="button"
                onClick={() => router.push(modifierPath)}
                className={`${buttonClass} bg-[#0879bd] text-white hover:bg-[#076ca8]`}
            >
                {t("edit")}
            </button>
        </div>
    );
}
