"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { AuthSession } from "@/context/AuthContext";
import { authService } from "@/core/services/auth.service";
import type { AuthProfileData } from "@/core/types/auth";

export function useUploadAvatar() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (file: File) => authService.uploadAvatar(file),
        onSuccess: (profile) => {
            queryClient.setQueryData<AuthProfileData>(
                ["auth", "profile"],
                profile,
            );

            const avatarUrl = profile.avatar?.trim();
            if (avatarUrl) {
                const nextUser = authService.mergeSessionPhoto(avatarUrl);
                const prev = queryClient.getQueryData<AuthSession>([
                    "auth",
                    "session",
                ]);

                if (prev && nextUser) {
                    queryClient.setQueryData<AuthSession>(["auth", "session"], {
                        ...prev,
                        user: nextUser,
                    });
                }
            }
        },
    });
}
