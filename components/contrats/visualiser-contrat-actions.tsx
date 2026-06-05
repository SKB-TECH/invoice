"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    contratMutationErrorMessage,
    useDeleteContract,
} from "@/core/hooks/contrat/useContrat";

type VisualiserContratActionsProps = {
    contractId: string;
    listPath?: string;
    modifierPath: string;
};

export function VisualiserContratActions({
    contractId,
    listPath = "/home/contrats",
    modifierPath,
}: VisualiserContratActionsProps) {
    const router = useRouter();
    const t = useTranslations("contrats.actions");
    const del = useDeleteContract();

    const handleDelete = () => {
        if (!window.confirm(t("deleteConfirm"))) return;

        del.mutate(contractId, {
            onSuccess: () => {
                toast.success(t("deleteSuccess"));
                router.push(listPath);
            },
            onError: (err) => {
                toast.error(contratMutationErrorMessage(err));
            },
        });
    };

    return (
        <div className="mt-8 flex flex-col gap-3 border-t border-slate-100 pt-6 md:flex-row md:flex-wrap md:justify-end">
            <Button
                type="button"
                variant="secondary"
                onClick={() => router.push(listPath)}
                className="h-12 w-52 cursor-pointer rounded bg-[#949B9F] px-5 text-white hover:bg-[#949B9F]/80"
            >
                {t("backToList")}
            </Button>
            <Button
                type="button"
                variant="destructive"
                disabled={del.isPending}
                onClick={handleDelete}
                className="h-12 w-52 cursor-pointer rounded px-5"
            >
                {t("delete")}
            </Button>
            <Button
                type="button"
                onClick={() => router.push(modifierPath)}
                className="h-12 w-52 cursor-pointer rounded bg-[#0073C5] px-5 text-white shadow-none hover:bg-[#066aa8]"
            >
                {t("edit")}
            </Button>
        </div>
    );
}
