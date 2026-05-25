"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import {
    FieldLabel,
    ReadOnlyField,
    ReadOnlyTextarea,
} from "@/components/invoices/create/Fields";
import { ServiceVisualiserSkeleton } from "@/components/configuration/service-visualiser-skeleton";
import { VisualiserServiceActions } from "@/components/configuration/visualiser-service-actions";
import { Button } from "@/components/ui/button";
import { useBillableServiceDetail } from "@/core/hooks/billable-services/useBillableServices";
import { useInvoiceTaxGroups } from "@/core/hooks/invoices/useInvoiceTaxGroups";
import {
    formatBillableServiceReferentialLabel,
    formatBillableServiceTaxGroupLabel,
} from "@/lib/billable-services/service-display-labels";
import {
    computePriceAfterTax,
    resolveBillableServiceTaxGroupLabel,
} from "@/lib/tax-groups/invoice-tax-group-label";

function formatMoney(n: number): string {
    return n.toLocaleString("fr-FR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

type Props = {
    serviceId: string;
};

export function ServiceVisualiserClient({ serviceId }: Props) {
    const t = useTranslations("configuration.services.view");
    const tList = useTranslations("configuration.services");
    const tNavbar = useTranslations("navbar");

    const { data, isPending, isError, error, refetch } =
        useBillableServiceDetail(serviceId);
    const { data: taxGroups = [] } = useInvoiceTaxGroups();

    if (isPending) {
        return <ServiceVisualiserSkeleton />;
    }

    if (isError || !data) {
        return (
            <main className="w-full text-slate-700">
                <p className="text-sm font-medium text-red-500">
                    {tList("loadErrorDetail")}
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
                    {tList("retryLoad")}
                </Button>
            </main>
        );
    }

    const priceBefore = data.unit_price ?? data.price_before;
    const taxGroupLabel =
        data.tax_group_info != null
            ? formatBillableServiceTaxGroupLabel(data.tax_group_info)
            : resolveBillableServiceTaxGroupLabel(data.tax_group, taxGroups) ??
              "—";
    const priceAfter =
        data.price_after ??
        (priceBefore !== undefined &&
        data.tax_group_info?.rate !== undefined
            ? computePriceAfterTax(priceBefore, data.tax_group_info.rate)
            : undefined);
    const currency = data.currency?.trim().toUpperCase() || "USD";
    const referentialLabel = formatBillableServiceReferentialLabel(
        data.category_info,
    );

    return (
        <main className="relative w-full text-slate-700">
            <div className="mb-3 flex flex-wrap items-center gap-1 text-[13px] font-medium text-slate-400">
                <Link href="/home" className="hover:text-slate-600">
                    {tNavbar("Accueil")}
                </Link>
                <span>/</span>
                <Link href="/home/services" className="hover:text-slate-600">
                    {tList("listSectionTitle")}
                </Link>
                <span>/</span>
                <span className="max-w-48 truncate text-slate-600 sm:max-w-md">
                    {data.name}
                </span>
                <span>/</span>
                <span className="font-semibold text-slate-600">
                    {tNavbar("Visualiser")}
                </span>
            </div>

            <h1 className="text-[40px] font-bold tracking-tight text-slate-700">
                {data.name}
            </h1>
            <p className="mt-2 text-[17px] font-medium text-slate-500">
                {t("referenceLabel")}
                {"\u00a0"}
                <span className="text-slate-700">{data.code}</span>
            </p>

            <div className="mt-4 bg-white p-8">
                <div className="grid grid-cols-1 gap-x-14 gap-y-4 lg:grid-cols-2">
                    <div>
                        <FieldLabel>{t("fields.serviceName")}</FieldLabel>
                        <ReadOnlyField>{data.name}</ReadOnlyField>
                    </div>

                    <div>
                        <FieldLabel>{t("fields.code")}</FieldLabel>
                        <ReadOnlyField>{data.code}</ReadOnlyField>
                    </div>

                    <div>
                        <FieldLabel>{t("fields.businessSector")}</FieldLabel>
                        <ReadOnlyField>
                            {data.business_sector?.trim() || "—"}
                        </ReadOnlyField>
                    </div>

                    <div>
                        <FieldLabel>{t("fields.unitPrice")}</FieldLabel>
                        <ReadOnlyField className="font-semibold tabular-nums">
                            {priceBefore !== undefined
                                ? `${formatMoney(priceBefore)} ${currency}`
                                : "—"}
                        </ReadOnlyField>
                    </div>

                    <div>
                        <FieldLabel>{t("fields.taxGroup")}</FieldLabel>
                        <ReadOnlyField>{taxGroupLabel}</ReadOnlyField>
                    </div>

                    <div>
                        <FieldLabel>{t("fields.priceInclTax")}</FieldLabel>
                        <ReadOnlyField className="font-semibold tabular-nums">
                            {priceAfter !== undefined
                                ? `${formatMoney(priceAfter)} ${currency}`
                                : "—"}
                        </ReadOnlyField>
                    </div>

                    <div>
                        <FieldLabel>{t("fields.currency")}</FieldLabel>
                        <ReadOnlyField>{currency}</ReadOnlyField>
                    </div>

                    <div>
                        <FieldLabel>{t("fields.referential")}</FieldLabel>
                        <ReadOnlyField>{referentialLabel}</ReadOnlyField>
                    </div>

                    <div className="lg:col-span-2">
                        <FieldLabel>{t("fields.description")}</FieldLabel>
                        <ReadOnlyTextarea>
                            {data.description?.trim() || "—"}
                        </ReadOnlyTextarea>
                    </div>
                </div>

                <VisualiserServiceActions
                    modifierPath={`/home/services/${encodeURIComponent(String(data.id))}/modifier`}
                />
            </div>
        </main>
    );
}
