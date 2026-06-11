"use client";

import * as React from "react";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/routing";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    NotificationsList,
} from "@/components/shared/OtherComponents/NotificationsList";
import {
    useNotificationsInbox,
    useReadAllNotifications,
} from "@/core/hooks/notifications/useNotification";

type Props = {
    className?: string;
};

export function NotificationsDropdown({
    className,
}: Props) {
    const inboxQuery = useNotificationsInbox({ page: 1, perPage: 6 });
    const readAll = useReadAllNotifications();

    const unreadNotifications = React.useMemo(
        () => (inboxQuery.data?.items ?? []).filter((n) => n.unread),
        [inboxQuery.data?.items]
    );
    const unreadCount =
        inboxQuery.data?.meta?.unread ??
        unreadNotifications.length;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className={cn(
                        "relative text-white/90 transition hover:text-white cursor-pointer",
                        className
                    )}
                    aria-label="Notifications"
                >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 ? (
                        <span className="absolute -right-1.5 -top-1.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-[#0073C5]" />
                    ) : null}
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                sideOffset={10}
                className={cn(
                    "!z-[9999] w-[340px] min-w-[300px] !bg-white !p-0 rounded-none",
                    "overflow-hidden"
                )}
            >
                <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                    <div className="text-xs font-bold text-slate-800">
                        Notifications
                    </div>

                    {unreadCount > 0 ? (
                        <button
                            type="button"
                            onClick={() => readAll.mutate()}
                            className="text-[11px] font-semibold text-[#0073C5] hover:underline disabled:opacity-50"
                            disabled={readAll.isPending}
                        >
                            Tout lire
                        </button>
                    ) : null}
                </div>

                {inboxQuery.isLoading ? (
                    <div className="px-4 py-6 text-center text-xs font-semibold text-slate-500">
                        Chargement...
                    </div>
                ) : inboxQuery.isError ? (
                    <div className="px-4 py-6 text-center text-xs font-semibold text-red-600">
                        Impossible de charger les notifications.
                    </div>
                ) : (
                    <NotificationsList
                        notifications={unreadNotifications.slice(0, 6).map((n) => ({
                            id: n.id,
                            title: n.title,
                            description: n.message,
                            dateLabel: n.date,
                            unread: n.unread,
                        }))}
                        emptyLabel="Aucune notification"
                    />
                )}

                <div className="border-t border-slate-200 bg-[#0073C5] px-4 py-3 hover:bg-[#0073C5]/80">
                    <Link
                        href="/home/notifications"
                        className="block text-center text-xs font-semibold text-white transition cursor-pointer"
                    >
                        Accéder au centre de notifications
                    </Link>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
