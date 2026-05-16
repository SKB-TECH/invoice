"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";

import { useInvoiceContracts } from "@/core/hooks/invoices/useInvoices";

import { clients } from "./constants";
import { ClientSearchSelect } from "./ClientSearchSelect";
import { FieldLabel, InputField, SelectField } from "./Fields";
import type {
    Client,
    InvoiceForm,
    InvoiceFormErrors,
    SetInvoiceErrors,
    SetInvoiceForm,
    SetInvoiceItems,
} from "./types";

export function StepClient({
                               form,
                               errors,
                               setForm,
                               setItems,
                               setErrors,
                           }: {
    form: InvoiceForm;
    errors: InvoiceFormErrors;
    setForm: SetInvoiceForm;
    setItems: SetInvoiceItems;
    setErrors: SetInvoiceErrors;
}) {
    const t = useTranslations("createInvoice");

    const { data: contractsData, isLoading: isLoadingContracts } =
        useInvoiceContracts({
            page: 1,
            perPage: 100,
        });

    const contracts = useMemo(() => {
        const allContracts = contractsData?.items ?? [];

        if (!form.clientId) return [];

        return allContracts.filter(
            (contract) => contract.client_id === form.clientId
        );
    }, [contractsData?.items, form.clientId]);

    const handleSelectClient = (client: Client) => {
        setForm((prev) => ({
            ...prev,
            clientId: client.id,
            clientName: client.name,
            nif: client.nif,
            rccm: client.rccm,
            idNat: client.idNat,
            address: client.address,
            phone: client.phone,
            email: client.email,
            contractId: null,
            contractReference: "",
        }));

        setErrors((prev) => ({
            ...prev,
            clientId: undefined,
            contractId: undefined,
        }));
    };

    const handleChangeContract = (value: string) => {
        const selectedContract = contracts.find(
            (contract) => contract.id === Number(value)
        );

        setForm((prev) => ({
            ...prev,
            contractId: selectedContract?.id ?? null,
            contractReference: selectedContract?.reference ?? "",
        }));

        setErrors((prev) => ({
            ...prev,
            contractId: undefined,
        }));
    };

    const handleChangeItemKind = (value: string) => {
        const itemKind = value as InvoiceForm["itemKind"];

        setForm((prev) => ({
            ...prev,
            itemKind,
        }));

        setItems([]);

        setErrors((prev) => ({
            ...prev,
            itemKind: undefined,
            items: undefined,
        }));
    };

    return (
        <div className="bg-white p-8">
            <div className="grid grid-cols-1 gap-x-14 gap-y-4 lg:grid-cols-2">
                <div>
                    <FieldLabel>{t("client.client")}</FieldLabel>

                    <ClientSearchSelect
                        clients={clients}
                        value={form.clientName}
                        error={errors.clientId}
                        onSelect={handleSelectClient}
                    />
                </div>

                <div>
                    <FieldLabel>Contrat lié au client</FieldLabel>

                    <SelectField
                        placeholder={
                            !form.clientId
                                ? "Choisissez d’abord un client"
                                : isLoadingContracts
                                    ? "Chargement des contrats..."
                                    : contracts.length === 0
                                        ? "Aucun contrat disponible"
                                        : "Sélectionnez un contrat"
                        }
                        value={
                            form.contractId ? String(form.contractId) : ""
                        }
                        options={contracts.map((contract) => ({
                            label: `${
                                contract.reference || "Sans référence"
                            } - ${contract.title}`,
                            value: String(contract.id),
                        }))}
                        onChange={handleChangeContract}
                        // disabled={
                        //     !form.clientId ||
                        //     isLoadingContracts ||
                        //     contracts.length === 0
                        // }
                        error={errors.contractId}
                    />
                </div>

                <div>
                    <FieldLabel>{t("client.clientName")}</FieldLabel>
                    <InputField value={form.clientName} readOnly />
                </div>

                <div>
                    <FieldLabel>Référence du contrat</FieldLabel>
                    <InputField value={form.contractReference} readOnly />
                </div>

                <div>
                    <FieldLabel>{t("client.nif")}</FieldLabel>
                    <InputField value={form.nif} readOnly />
                </div>

                <div>
                    <FieldLabel>{t("client.rccm")}</FieldLabel>
                    <InputField value={form.rccm} readOnly />
                </div>

                <div>
                    <FieldLabel>{t("client.idNat")}</FieldLabel>
                    <InputField value={form.idNat} readOnly />
                </div>

                <div>
                    <FieldLabel>{t("client.address")}</FieldLabel>
                    <InputField value={form.address} readOnly />
                </div>

                <div>
                    <FieldLabel>{t("client.phone")}</FieldLabel>
                    <InputField value={form.phone} readOnly />
                </div>

                <div>
                    <FieldLabel>{t("client.email")}</FieldLabel>
                    <InputField value={form.email} readOnly />
                </div>

                <div>
                    <FieldLabel>{t("client.invoiceType")}</FieldLabel>

                    <SelectField
                        placeholder={t("client.invoiceTypePlaceholder")}
                        value={form.invoiceType}
                        options={[
                            { label: t("invoiceTypes.sale"), value: "Vente" },
                            {
                                label: t("invoiceTypes.creditNote"),
                                value: "Avoir",
                            },
                            {
                                label: t("invoiceTypes.proforma"),
                                value: "Proforma",
                            },
                        ]}
                        onChange={(value) => {
                            setForm((prev) => ({
                                ...prev,
                                invoiceType: value,
                            }));

                            setErrors((prev) => ({
                                ...prev,
                                invoiceType: undefined,
                            }));
                        }}
                        error={errors.invoiceType}
                    />
                </div>

                <div>
                    <FieldLabel>{t("client.itemKind")}</FieldLabel>

                    <SelectField
                        placeholder={t("common.select")}
                        value={form.itemKind}
                        options={[
                            { label: t("kind.article"), value: "Article" },
                            { label: t("kind.service"), value: "Service" },
                        ]}
                        onChange={handleChangeItemKind}
                        error={errors.itemKind}
                    />
                </div>

                <div>
                    <FieldLabel>Devise</FieldLabel>

                    <SelectField
                        placeholder="Sélectionnez une devise"
                        value={form.currency}
                        options={[
                            { label: "CDF", value: "CDF" },
                            { label: "USD", value: "USD" },
                        ]}
                        onChange={(value) => {
                            setForm((prev) => ({
                                ...prev,
                                currency: value as "CDF" | "USD",
                            }));

                            setErrors((prev) => ({
                                ...prev,
                                currency: undefined,
                            }));
                        }}
                        error={errors.currency}
                    />
                </div>

                <div>
                    <FieldLabel>Date d’échéance</FieldLabel>

                    <InputField
                        type="date"
                        value={form.dueDate}
                        error={errors.dueDate}
                        onChange={(value) => {
                            setForm((prev) => ({
                                ...prev,
                                dueDate: value,
                            }));

                            setErrors((prev) => ({
                                ...prev,
                                dueDate: undefined,
                            }));
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
