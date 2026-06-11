"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateFourniturePayload } from "@/core/types/fourniture";
import { createFourniture } from "@/core/services/fournitures.service";

type Options = {
    onSuccess?: (data: Awaited<ReturnType<typeof createFourniture>>) => void;
    onError?: (error: unknown) => void;
};

export function useCreateFourniture(options?: Options) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateFourniturePayload) =>
            createFourniture(payload),
        onSuccess: (data) => {
            void queryClient.invalidateQueries({ queryKey: ["fournitures", "list"] });
            options?.onSuccess?.(data);
        },
        onError: options?.onError,
    });
}
