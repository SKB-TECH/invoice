"use client";

import { ChevronRight, House } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/routing";
import { ServicesSection } from "@/components/configuration/services-section";

export default function BillableServicesPage() {
    const tNav = useTranslations("navbar");
    const t = useTranslations("configuration.services");

    return (
        <main className="mx-auto w-full min-w-full py-4 text-foreground">
            <span className="mb-6 flex flex-wrap items-center gap-1 text-sm text-slate-500">
                <Link href="/home" aria-label={tNav("Accueil")}>
                    <House className="size-4" />
                </Link>
                <ChevronRight className="size-4 shrink-0" />
                <span className="text-slate-800">{t("listSectionTitle")}</span>
            </span>

            <h1 className="mb-6 text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
                {t("listSectionTitle")}
            </h1>

            <ServicesSection suppressCardHeading />
        </main>
    );
}
