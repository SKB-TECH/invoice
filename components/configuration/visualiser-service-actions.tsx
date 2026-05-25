"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";

type Props = {
    listPath?: string;
};

export function VisualiserServiceActions({
    listPath = "/home/services",
}: Props) {
    const router = useRouter();
    const t = useTranslations("configuration.services.view.actions");

    return (
        <div className="mt-6 flex flex-wrap items-center justify-end gap-5">
            <button
                type="button"
                onClick={() => router.push(listPath)}
                className="inline-flex h-[50px] w-52 items-center justify-center rounded bg-slate-400 text-[14px] font-semibold leading-none text-white hover:bg-slate-500"
            >
                {t("backToList")}
            </button>
        </div>
    );
}
