"use client";

import { useRouter } from "next/navigation";
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
    const del = useDeleteContract();

    const handleDelete = () => {
        if (!window.confirm("Supprimer définitivement ce contrat ?")) return;

        del.mutate(contractId, {
            onSuccess: () => {
                toast.success("Contrat supprimé.");
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
                Retour à la liste
            </Button>
            <Button
                type="button"
                variant="destructive"
                disabled={del.isPending}
                onClick={handleDelete}
                className="h-12 w-52 cursor-pointer rounded px-5"
            >
                Supprimer
            </Button>
            <Button
                type="button"
                onClick={() => router.push(modifierPath)}
                className="h-12 w-52 cursor-pointer rounded bg-[#0073C5] px-5 text-white shadow-none hover:bg-[#066aa8]"
            >
                Modifier
            </Button>
        </div>
    );
}
