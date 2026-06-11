"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ModifierBillableServiceForm } from "@/components/configuration/modifier-billable-service-form";
import { ModifierBillableServiceSkeleton } from "@/components/configuration/modifier-billable-service-skeleton";
import { Button } from "@/components/ui/button";
import { useBillableServiceDetail } from "@/core/hooks/billable-services/useBillableServices";

type Props = {
    serviceId: string;
};

export function ModifierBillableServiceClient({ serviceId }: Props) {
    const t = useTranslations("configuration.services");
    const tEdit = useTranslations("configuration.services.edit");
    const tNavbar = useTranslations("navbar");

    const { data, isPending, isError, error, refetch } =
        useBillableServiceDetail(serviceId);

    if (isPending) {
        return <ModifierBillableServiceSkeleton />;
    }

    if (isError || !data) {
        return (
            <main className="w-full text-slate-700">
                <p className="text-sm font-medium text-red-500">
                    {t("loadErrorDetail")}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                    {error instanceof Error ? error.message : ""}
                </p>
                <Button
                    type="button"
                    variant="secondary"
                    className="mt-3"
                    onClick={() => refetch()}
                >
                    {t("retryLoad")}
                </Button>
            </main>
        );
    }

    const visualiserPath = `/home/services/${encodeURIComponent(data.code)}/visualiser`;

    return (
        <main className="relative w-full text-slate-700">
            <div className="mb-3 flex flex-wrap items-center gap-1 text-[13px] font-medium text-slate-400">
                <Link href="/home" className="hover:text-slate-600">
                    {tNavbar("Accueil")}
                </Link>
                <span>/</span>
                <Link href="/home/services" className="hover:text-slate-600">
                    {t("listSectionTitle")}
                </Link>
                <span>/</span>
                <Link
                    href={visualiserPath}
                    className="max-w-48 truncate hover:text-slate-600 sm:max-w-xs"
                >
                    {data.name}
                </Link>
                <span>/</span>
                <span className="font-semibold text-slate-600">
                    {tEdit("breadcrumbSegment")}
                </span>
            </div>

            <h1 className="text-[40px] font-bold tracking-tight text-slate-700">
                {tEdit("title")}
            </h1>
            <p className="mt-2 text-[17px] font-medium text-slate-500">
                {tEdit("referencePrefix")}
                <span className="text-slate-700">{data.code}</span>
            </p>

            <ModifierBillableServiceForm service={data} />
        </main>
    );
}
