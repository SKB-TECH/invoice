"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import {
    clientMutationErrorMessage,
    useDeleteClient,
} from "@/core/hooks/client/useClient";

type VisualiserClientActionsProps = {
    clientId: string;
    listPath?: string;
    modifierPath: string;
};

export function VisualiserClientActions({
    clientId,
    listPath = "/home/clients",
    modifierPath,
}: VisualiserClientActionsProps) {
    const router = useRouter();
    const t = useTranslations("clients.view.actions");
    const del = useDeleteClient();

    const buttonClass =
        "inline-flex h-[50px] w-52 items-center justify-center rounded text-[14px] font-semibold leading-none disabled:cursor-not-allowed disabled:opacity-60";

    const handleDelete = () => {
        if (!window.confirm(t("deleteConfirm"))) return;

        del.mutate(clientId, {
            onSuccess: () => {
                toast.success(t("deleteSuccess"));
                router.push(listPath);
            },
            onError: (err) => {
                toast.error(clientMutationErrorMessage(err));
            },
        });
    };

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
                disabled={del.isPending}
                onClick={handleDelete}
                className={`${buttonClass} bg-red-600 text-white hover:bg-red-700`}
            >
                {t("delete")}
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
