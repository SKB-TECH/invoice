"use client";

import { ChevronRight, House } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/routing";
import { ServicesSection } from "@/components/configuration/services-section";

export default function BillableServicesPage() {
    const tNav = useTranslations("navbar");
    const t = useTranslations("configuration.services");

    return (
        <div className="w-full min-w-full space-y-6">
            <span className="flex flex-wrap items-center gap-1 text-sm text-slate-500">
                <Link href="/home" aria-label={tNav("Accueil")}>
                    <House className="size-4" />
                </Link>
                <ChevronRight className="size-4 shrink-0" />
                <span aria-current="page">{t("listSectionTitle")}</span>
            </span>

            <h1 className="text-lg font-bold text-slate-800">
                {t("listSectionTitle")}
            </h1>

            <ServicesSection suppressCardHeading />
        </div>
    );
}
