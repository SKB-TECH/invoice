"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useDeleteFourniture } from "@/core/hooks/fournitures/useDeleteFourniture";
import { getAxiosErrorMessage } from "@/core/utils/axiosErrorMessage";
import { useRouter } from "@/i18n/routing";

type VisualiserArticleActionsProps = {
    articleId: number;
    listPath?: string;
    modifierPath: string;
};

export function VisualiserArticleActions({
    articleId,
    listPath = "/home/articles",
    modifierPath,
}: VisualiserArticleActionsProps) {
    const router = useRouter();
    const t = useTranslations("articles.view.actions");

    const deleteMutation = useDeleteFourniture();

    const buttonClass =
        "inline-flex h-[50px] w-52 items-center justify-center rounded text-[14px] font-semibold leading-none disabled:cursor-not-allowed disabled:opacity-60";

    const handleConfirmDelete = () => {
        deleteMutation.mutate(articleId, {
            onSuccess: () => {
                toast.success(t("deleteSuccess"));
                router.push(listPath);
            },
            onError: (err) => {
                toast.error(getAxiosErrorMessage(err, t("deleteError")));
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
            <ConfirmDialog
                message={t("deleteConfirm")}
                cancelLabel={t("cancel")}
                confirmLabel={t("delete")}
                loadingText={t("deleting")}
                onConfirm={handleConfirmDelete}
                pending={deleteMutation.isPending}
            >
                <button
                    type="button"
                    disabled={deleteMutation.isPending}
                    className={`${buttonClass} bg-red-600 text-white hover:bg-red-700`}
                >
                    {t("delete")}
                </button>
            </ConfirmDialog>
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
