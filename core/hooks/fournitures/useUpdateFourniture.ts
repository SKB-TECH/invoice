"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateFourniturePayload, FournitureArticle } from "@/core/types/fourniture";
import { updateFourniture } from "@/core/services/fournitures.service";

type UpdateVars = { id: number; payload: CreateFourniturePayload };

type Options = {
    onSuccess?: (data: FournitureArticle, variables: UpdateVars) => void;
    onError?: (error: unknown) => void;
};

export function useUpdateFourniture(options?: Options) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }: UpdateVars) =>
            updateFourniture(id, payload),
        onSuccess: (data, variables) => {
            void queryClient.invalidateQueries({
                queryKey: ["fournitures", "list"],
            });
            void queryClient.invalidateQueries({
                queryKey: ["fournitures", "detail"],
            });
            options?.onSuccess?.(data, variables);
        },
        onError: options?.onError,
    });
}
