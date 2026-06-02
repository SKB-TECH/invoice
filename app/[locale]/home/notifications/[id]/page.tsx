import React from "react";
import Link from "next/link";

type Props = {
    params: {
        id: string;
    };
};

export default function NotificationDetailsPage({ params }: Props) {
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
                    <div className="text-[14px] font-semibold text-slate-700">
                        ID: {params.id}
                    </div>
                    <p className="mt-2 text-[13px] font-medium text-slate-500">
                        Cette page est prête à être branchée sur les vraies données de
                        notifications (API / store). Pour l’instant, elle sert de détail
                        simple et cohérent avec l’UI existante.
                    </p>
                </div>
            </div>
        </div>
    );
}

