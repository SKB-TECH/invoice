"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

type Props = {
    onCreate: () => void;
};

export function PaymentsListHeader({ onCreate }: Props) {
    const t = useTranslations("paymentsPage");

    return (
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
                    {t("title")}
                </h1>
            </div>

            <Button
                type="button"
                size="lg"
                className="h-12 cursor-pointer rounded bg-[#0879bd] px-5 text-white hover:bg-[#076ca8]"
                onClick={onCreate}
            >
                <Plus className="mr-2 size-4" />
                {t("recordPayment")}
            </Button>
        </div>
    );
}
