"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { AuthSession } from "@/context/AuthContext";
import { authService } from "@/core/services/auth.service";

export function useUploadAvatar() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (file: File) => authService.uploadAvatar(file),
        onSuccess: (relativeUrl) => {
            const nextUser = authService.mergeSessionPhoto(relativeUrl);
            if (!nextUser) return;

            const prev = queryClient.getQueryData<AuthSession>([
                "auth",
                "session",
            ]);

            if (!prev) return;

            const nextProfile =
                prev.profile !== null && typeof prev.profile === "object"
                    ? { ...prev.profile, Photo_16: relativeUrl }
                    : { Photo_16: relativeUrl };

            queryClient.setQueryData<AuthSession>(["auth", "session"], {
                ...prev,
                user: nextUser,
                profile: nextProfile,
            });

            void queryClient.invalidateQueries({
                queryKey: ["auth", "profile"],
            });
        },
    });
}
