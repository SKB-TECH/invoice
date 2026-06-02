"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "@/core/services/notification.service";
import type { NotificationsInboxMeta, NotificationInboxItem } from "@/core/types/notification";

export const notificationQueryKeys = {
    all: ["notifications"] as const,
    inbox: (page: number, perPage: number) =>
        [...notificationQueryKeys.all, "inbox", page, perPage] as const,
    detail: (id: string) => [...notificationQueryKeys.all, "detail", id] as const,
};

export type NotificationsInboxResult = {
    items: NotificationInboxItem[];
    meta: NotificationsInboxMeta;
};

export function useNotificationsInbox(params?: { page?: number; perPage?: number }) {
    const page = Math.max(1, Math.floor(params?.page ?? 1));
    const perPage = Math.max(1, Math.floor(params?.perPage ?? 20));

    return useQuery<NotificationsInboxResult>({
        queryKey: notificationQueryKeys.inbox(page, perPage),
        queryFn: () => notificationService.getInbox({ page, perPage }),
        staleTime: 30 * 1000,
        retry: false,
    });
}

export function useNotificationDetail(id: string) {
    return useQuery<NotificationInboxItem | null>({
        queryKey: notificationQueryKeys.detail(id),
        queryFn: () => notificationService.getNotification(id),
        enabled: String(id ?? "").trim() !== "",
        staleTime: 30 * 1000,
        retry: false,
    });
}

export function useMarkNotificationRead() {
    const queryClient = useQueryClient();

    return useMutation<unknown, unknown, { id: string }>({
        mutationFn: ({ id }) => notificationService.markAsRead(id),
        onSuccess: (_data, variables) => {
            void queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all });
            void queryClient.invalidateQueries({
                queryKey: notificationQueryKeys.detail(variables.id),
            });
        },
    });
}

export function useReadAllNotifications() {
    const queryClient = useQueryClient();

    return useMutation<unknown, unknown, void>({
        mutationFn: () => notificationService.markAllAsRead(),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all });
        },
    });
}

