"use client";

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
        <main className="w-full text-slate-700">
            <div className="mb-3 text-[13px] font-medium text-slate-400">
                <Link href="/home" className="hover:text-slate-600">
                    {tNav("Accueil")}
                </Link>
                {" / "}
                <Link
                    href={servicesListHref}
                    className="hover:text-slate-600"
                >
                    {t("listSectionTitle")}
                </Link>
                {" / "}
                <span className="font-semibold text-slate-600">
                    {t("breadcrumbNew")}
                </span>
            </div>

            <h1 className="text-[40px] font-bold tracking-tight text-slate-700">
                {t("createSectionTitle")}
            </h1>

            <div className="mt-4">
                <CreateBillableServiceForm
                    cancelLabel={t("actions.cancelBack")}
                    onCancel={goBackToList}
                    onCreated={goBackToList}
                />
            </div>
        </main>
    );
}
