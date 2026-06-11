"use client";

import * as React from "react";
import {
    useMarkNotificationRead,
    useNotificationDetail,
} from "@/core/hooks/notifications/useNotification";

export function NotificationDetailsClient({ id }: { id: string }) {
    const detailQuery = useNotificationDetail(id);
    const markRead = useMarkNotificationRead();

    React.useEffect(() => {
        if (!id) return;
        markRead.mutate({ id });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (detailQuery.isLoading) {
        return (
            <div className="text-[13px] font-semibold text-slate-500">
                Chargement...
            </div>
        );
    }

    if (detailQuery.isError) {
        return (
            <div className="text-[13px] font-semibold text-red-600">
                Impossible de charger la notification.
            </div>
        );
    }

    if (!detailQuery.data) {
        return (
            <div className="text-[13px] font-semibold text-slate-500">
                Notification introuvable.
            </div>
        );
    }

    return (
        <div>
            <div className="text-[14px] font-bold text-slate-800">
                {detailQuery.data.title}
            </div>
            {detailQuery.data.type ? (
                <div className="mt-1 text-[12px] font-semibold text-slate-500">
                    Type: {detailQuery.data.type}
                </div>
            ) : null}
            {detailQuery.data.message ? (
                <p className="mt-2 text-[13px] font-medium text-slate-600">
                    {detailQuery.data.message}
                </p>
            ) : null}
            {detailQuery.data.date ? (
                <div className="mt-3 text-[12px] font-semibold text-slate-400">
                    {new Intl.DateTimeFormat('fr-FR').format(new Date(detailQuery.data.date ?? ""))}
                </div>
            ) : null}
        </div>
    );
}

