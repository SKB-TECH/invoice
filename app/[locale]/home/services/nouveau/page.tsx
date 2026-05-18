"use client";

import { ChevronRight, House } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link, useRouter } from "@/i18n/routing";
import { CreateBillableServiceForm } from "@/components/configuration/create-billable-service-form";

export default function NouveauServiceFacturablePage() {
    const router = useRouter();
    const tNav = useTranslations("navbar");
    const t = useTranslations("configuration.services");

    const servicesListHref = "/home/services" as const;

    const goBackToList = () => {
        router.push(servicesListHref);
    };

    return (
        <div className="w-full min-w-full space-y-6">
            <span className="mb-6 flex flex-wrap items-center gap-1 text-sm text-slate-500">
                <Link href="/home" aria-label={tNav("Accueil")}>
                    <House className="size-4" />
                </Link>
                <ChevronRight className="size-4 shrink-0" />
                <Link href={servicesListHref} className="hover:text-slate-700">
                    {t("listSectionTitle")}
                </Link>
                <ChevronRight className="size-4 shrink-0" />
                <span aria-current="page">{t("breadcrumbNew")}</span>
            </span>

            <CreateBillableServiceForm
                cancelLabel={t("actions.cancelBack")}
                onCancel={goBackToList}
                onCreated={goBackToList}
            />
        </div>
    );
}
