"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";

import {
    useInvoiceContracts,
    useInvoiceTypes,
} from "@/core/hooks/invoices/useInvoices";
import { useClients } from "@/core/hooks/client/useClient";

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

    const clientListParams = useMemo(
        () => ({
            page: 1,
            perPage: 100,
        }),
        []
    );

    const {
        data: clientsData,
        isPending: isLoadingClients,
        isError: isClientsError,
    } = useClients(clientListParams);

    const {
        data: invoiceTypesData,
        isPending: isLoadingInvoiceTypes,
        isError: isInvoiceTypesError,
    } = useInvoiceTypes();

    const invoiceTypes = invoiceTypesData?.items ?? [];
    const {
        data: contractsData,
        isLoading: isLoadingContracts,
        isError: isContractsError,
    } = useInvoiceContracts({
        page: 1,
        perPage: 100,
        client_id: form.clientId ?? undefined,
    });

    const clients: Client[] = useMemo(() => {
        return (clientsData?.items ?? []).map((client) => ({
            id: Number(client.id),
            name: String(client.legal_name || client.name || ""),
            nif: String(client.nif || client.vat_num || ""),
            rccm: String(client.rccm || client.registration_id || ""),
            idNat: String(client.idnat || ""),
            address: String(client.address || ""),
            phone: String(client.phone || ""),
            email: String(client.email || ""),
        }));
    }, [clientsData?.items]);

    const contracts = useMemo(() => {
        if (!form.clientId) {
            return [];
        }

        return contractsData?.items ?? [];
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

            /**
             * Lorsqu’on change de client,
             * on vide le contrat sélectionné.
             */
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
                        key={form.clientId ?? "none"}
                        clients={clients}
                        value={form.clientName}
                        error={errors.clientId}
                        inputId="invoice-create-client"
                        onSelect={handleSelectClient}
                    />

                    {isLoadingClients && (
                        <p className="mt-2 text-sm font-medium text-slate-400">
                            Chargement des clients...
                        </p>
                    )}

                    {isClientsError && (
                        <p className="mt-2 text-sm font-medium text-red-500">
                            Impossible de charger les clients.
                        </p>
                    )}
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
                        disabled={
                            !form.clientId ||
                            isLoadingContracts ||
                            contracts.length === 0
                        }
                        error={errors.contractId}
                    />

                    {isContractsError && form.clientId && (
                        <p className="mt-2 text-sm font-medium text-red-500">
                            Impossible de charger les contrats du client.
                        </p>
                    )}
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
                    <InputField value={form.idNat} />
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
                        placeholder={
                            isLoadingInvoiceTypes
                                ? "Chargement des types de facture..."
                                : invoiceTypes.length === 0
                                    ? "Aucun type de facture disponible"
                                    : "Sélectionnez un type de facture"
                        }
                        value={form.invoiceType}
                        options={invoiceTypes.map((type) => ({
                            label: type.title,
                            value: String(type.id),
                        }))}
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
                        disabled={
                            isLoadingInvoiceTypes ||
                            invoiceTypes.length === 0
                        }
                        error={errors.invoiceType}
                    />

                    {isInvoiceTypesError && (
                        <p className="mt-2 text-sm font-medium text-red-500">
                            Impossible de charger les types de facture.
                        </p>
                    )}
                </div>

                <div>
                    <FieldLabel>{t("client.itemKind")}</FieldLabel>

                    <SelectField
                        placeholder={t("common.select")}
                        value={form.itemKind}
                        options={[
                            {
                                label: t("kind.article"),
                                value: "Article",
                            },
                            {
                                label: t("kind.service"),
                                value: "Service",
                            },
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

                <div className={"w-full"}>
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
