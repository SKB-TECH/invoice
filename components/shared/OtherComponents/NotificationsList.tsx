import * as React from "react";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/routing";

export type NotificationItem = {
    id: string;
    title: string;
    description?: string;
    dateLabel?: string;
    unread?: boolean;
    href?: string;
};

type Props = {
    notifications: readonly NotificationItem[];
    className?: string;
    emptyLabel?: string;
};

export function NotificationsList({
    notifications,
    className,
    emptyLabel = "Aucune notification",
}: Props) {
    if (!notifications.length) {
        return (
            <div
                className={cn(
                    "flex min-h-[140px] items-center justify-center px-4 text-[14px] font-semibold text-slate-500",
                    className
                )}
            >
                {emptyLabel}
            </div>
        );
    }

    return (
        <div className={cn("divide-y divide-slate-200", className)}>
            {notifications.map((n) => {
                const href = n.href ?? `/home/notifications/${encodeURIComponent(n.id)}`;

                return (
                    <Link
                        key={n.id}
                        href={href}
                        className={cn(
                            "group flex w-full gap-3 px-4 py-3 outline-none transition hover:bg-slate-50",
                            "focus-visible:ring-2 focus-visible:ring-[#0073C5]/40"
                        )}
                    >
                        <div className="mt-1.5 flex h-2.5 w-2.5 shrink-0 items-center justify-center">
                            {n.unread ? (
                                <span className="h-2 w-2 rounded-full bg-[#F04444]" />
                            ) : (
                                <span className="h-2 w-2 rounded-full bg-slate-200" />
                            )}
                        </div>

                        <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="truncate text-[13px] font-bold text-slate-800">
                                        {n.title}
                                    </div>
                                    {n.description ? (
                                        <div className="mt-0.5 line-clamp-2 text-[12px] font-medium text-slate-500">
                                            {n.description}
                                        </div>
                                    ) : null}
                                </div>

                                {n.dateLabel ? (
                                    <div className="shrink-0 text-[11px] font-semibold text-slate-400">
                                        {n.dateLabel}
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}

