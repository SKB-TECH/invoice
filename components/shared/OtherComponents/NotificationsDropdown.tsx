"use client";

import * as React from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    NotificationItem,
    NotificationsList,
} from "@/components/shared/OtherComponents/NotificationsList";

const DEMO_NOTIFICATIONS: readonly NotificationItem[] = [
    {
        id: "n-1",
        title: "Nouvelle facture créée",
        description: "La facture INV-2026-001 a été créée avec succès.",
        dateLabel: "Aujourd’hui",
        unread: true,
    },
    {
        id: "n-2",
        title: "Paiement reçu",
        description: "Un paiement a été enregistré pour le client ACME.",
        dateLabel: "Hier",
        unread: true,
    },
    {
        id: "n-3",
        title: "Rappel",
        description: "Certaines factures sont en attente de règlement.",
        dateLabel: "Il y a 3 jours",
        unread: false,
    },
];

type Props = {
    className?: string;
    notifications?: readonly NotificationItem[];
};

export function NotificationsDropdown({
    className,
    notifications = DEMO_NOTIFICATIONS,
}: Props) {
    const unreadCount = React.useMemo(
        () => notifications.filter((n) => n.unread).length,
        [notifications]
    );

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
                    "!z-[9999] w-[300px] min-w-[300px] !bg-white !p-0",
                    "overflow-hidden"
                )}
            >
                <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                    <div className="text-xs font-bold text-slate-800">
                        Notifications
                    </div>
                </div>

                <NotificationsList notifications={notifications.slice(0, 6)} />

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

