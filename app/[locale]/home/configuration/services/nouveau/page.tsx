"use client";

import { ChevronRight, House } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link, useRouter } from "@/i18n/routing";
import { CreateBillableServiceForm } from "@/components/configuration/create-billable-service-form";

export default function NouveauServiceFacturablePage() {
    const router = useRouter();
    const tNav = useTranslations("navbar");
    const tCfg = useTranslations("configuration");
    const t = useTranslations("configuration.services");

    const configurationServicesHref =
        "/home/configuration?menu=services" as const;

    const goBackToList = () => {
        router.push(configurationServicesHref);
    };

    return (
        <main className="min-h-0 bg-white px-6 py-8 text-slate-800">
            <span className="mb-6 flex flex-wrap items-center gap-1 text-sm text-slate-500">
                <Link href="/home" aria-label={tNav("Accueil")}>
                    <House className="size-4" />
                </Link>
                <ChevronRight className="size-4 shrink-0" />
                <Link
                    href={configurationServicesHref}
                    className="hover:text-slate-700"
                >
                    {tCfg("menu.services")}
                </Link>
                <ChevronRight className="size-4 shrink-0" />
                <span aria-current="page">{t("breadcrumbNew")}</span>
            </span>

            <CreateBillableServiceForm
                cancelLabel={t("actions.cancelBack")}
                onCancel={goBackToList}
                onCreated={goBackToList}
            />
        </main>
    );
}
