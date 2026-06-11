"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { NotificationsList } from "@/components/shared/OtherComponents/NotificationsList";
import {
    useNotificationsInbox,
    useReadAllNotifications,
} from "@/core/hooks/notifications/useNotification";

export default function NotificationsPage() {
    const [page, setPage] = React.useState(1);
    const perPage = 20;

    const inboxQuery = useNotificationsInbox({ page, perPage });
    const readAll = useReadAllNotifications();
    const notifications = inboxQuery.data?.items ?? [];
    const meta = inboxQuery.data?.meta;
    const unreadCount =
        meta?.unread ?? notifications.filter((n) => n.unread).length;

    const total = meta?.total ?? notifications.length;
    const totalPages = Math.max(1, Math.ceil(total / perPage));

    return (
        <div className="min-h-full w-full text-[#4E5866]">
            <div className="border border-[#E2E5E9] bg-white">
                <div className="flex items-center justify-between border-b border-[#E7EBEF] px-5 py-5">
                    <h1 className="text-[15px] font-bold uppercase text-[#4D5662]">
                        Notifications
                    </h1>

                    {unreadCount > 0 ? (
                        <button
                            type="button"
                            onClick={() => readAll.mutate()}
                            disabled={readAll.isPending}
                            className="text-[13px] font-semibold text-[#0073C5] hover:underline disabled:opacity-50"
                        >
                            Tout marquer comme lu
                        </button>
                    ) : null}
                </div>

                {inboxQuery.isLoading ? (
                    <div className="px-5 py-6 text-[13px] font-semibold text-slate-500">
                        Chargement...
                    </div>
                ) : inboxQuery.isError ? (
                    <div className="px-5 py-6 text-[13px] font-semibold text-red-600">
                        Impossible de charger les notifications.
                    </div>
                ) : (
                    <div>
                        <NotificationsList
                            notifications={notifications.map((n) => ({
                                id: n.id,
                                title: n.title,
                                description: n.message,
                                dateLabel: n.date,
                                unread: n.unread,
                            }))}
                            emptyLabel="Vous n’avez aucune notification pour le moment."
                        />

                        <div className="flex items-center justify-end gap-2 border-t border-[#E7EBEF] px-5 py-4">
                            <button
                                type="button"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page <= 1}
                                aria-label="Page précédente"
                                className="inline-flex size-9 items-center justify-center rounded bg-[#0073C5] text-white disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <ChevronLeft className="size-5" aria-hidden />
                            </button>

                            <div className="text-[12px] font-semibold text-slate-500">
                                Page {page} / {totalPages}
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setPage((p) => Math.min(totalPages, p + 1))
                                }
                                disabled={page >= totalPages}
                                aria-label="Page suivante"
                                className="inline-flex size-9 items-center justify-center rounded bg-[#0073C5] text-white disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <ChevronRight className="size-5" aria-hidden />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

