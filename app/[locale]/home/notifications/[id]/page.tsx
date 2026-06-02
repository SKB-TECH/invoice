import React from "react";
import { Link } from "@/i18n/routing";
import { NotificationDetailsClient } from "@/components/shared/OtherComponents/NotificationDetailsClient";

type Props = {
    params: Promise<{
        id: string;
    }>;
};

export default async function NotificationDetailsPage({ params }: Props) {
    const resolvedParams = await params;
    const id = String(resolvedParams?.id ?? "").trim();

    return (
        <div className="min-h-full w-full text-[#4E5866]">
            <div className="border border-[#E2E5E9] bg-white">
                <div className="flex items-center justify-between border-b border-[#E7EBEF] px-5 py-5">
                    <h1 className="text-[15px] font-bold uppercase text-[#4D5662]">
                        Détail notification
                    </h1>

                    <Link
                        href="/home/notifications"
                        className="text-[13px] font-semibold text-[#0073C5] hover:underline"
                    >
                        Retour
                    </Link>
                </div>

                <div className="px-5 py-5">
                    <NotificationDetailsClient id={id} />
                </div>
            </div>
        </div>
    );
}

