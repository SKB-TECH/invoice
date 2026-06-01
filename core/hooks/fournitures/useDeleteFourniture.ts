"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteFourniture } from "@/core/services/fournitures.service";

type Options = {
    onSuccess?: () => void;
    onError?: (error: unknown) => void;
};

export function useDeleteFourniture(options?: Options) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deleteFourniture(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ["fournitures", "list"],
            });
            options?.onSuccess?.();
        },
        onError: options?.onError,
    });
}
