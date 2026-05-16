"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
    const del = useDeleteClient();

    const handleDelete = () => {
        if (!window.confirm("Supprimer définitivement ce client ?")) return;

        del.mutate(clientId, {
            onSuccess: () => {
                toast.success("Client supprimé.");
                router.push(listPath);
            },
            onError: (err) => {
                toast.error(clientMutationErrorMessage(err));
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
                className="h-12 w-52 cursor-pointer rounded bg-[#0879bd] px-5 text-white shadow-none hover:bg-[#066aa8]"
            >
                Modifier
            </Button>
        </div>
    );
}
