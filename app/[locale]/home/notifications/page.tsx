"use client";

import * as React from "react";
import { NotificationsList, NotificationItem } from "@/components/shared/OtherComponents/NotificationsList";

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

export default function NotificationsPage() {
    return (
        <div className="min-h-full w-full text-[#4E5866]">
            <div className="border border-[#E2E5E9] bg-white">
                <div className="border-b border-[#E7EBEF] px-5 py-5">
                    <h1 className="text-[15px] font-bold uppercase text-[#4D5662]">
                        Notifications
                    </h1>
                </div>

                <NotificationsList
                    notifications={DEMO_NOTIFICATIONS}
                    emptyLabel="Vous n’avez aucune notification pour le moment."
                />
            </div>
        </div>
    );
}

