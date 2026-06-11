"use client";

import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

import { ClientForm } from "@/components/clients/client-form";

export default function NouveauClientPage() {
    const t = useTranslations("clients.createClient");
    const tNavbar = useTranslations("navbar");

    return (
        <main className="relative w-full text-slate-700">
            <div className="mb-3 flex flex-wrap items-center gap-1 text-[13px] font-medium text-slate-400">
                <Link href="/home" className="hover:text-slate-600">
                    {tNavbar("Accueil")}
                </Link>
                <span>/</span>
                <Link href="/home/clients" className="hover:text-slate-600">
                    {t("breadcrumb.Step1")}
                </Link>
                <span>/</span>
                <span className="font-semibold text-slate-600">
                    {t("breadcrumb.Step2")}
                </span>
            </div>

            <h1 className="text-[40px] font-bold tracking-tight text-slate-700">
                {t("title")}
            </h1>

            <ClientForm variant="create" cancelHref="/home/clients" />
        </main>
    );
}
