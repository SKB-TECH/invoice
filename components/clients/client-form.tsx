"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useForm, useWatch, type Path } from "react-hook-form";
import { toast } from "sonner";

import type { ClientDetailRecord } from "@/lib/clients/clients-data";
import { createClientSchema } from "@/core/schemas/client.schema";
import type { ClientType } from "@/core/schemas/client.schema";
import type { ClientStatutForm } from "@/lib/clients/clients-data";
import {
    useCreateClient,
    useUpdateClient,
    clientMutationErrorMessage,
} from "@/core/hooks/client/useClient";
import { useTypeClient } from "@/core/hooks/type-client/useTypeClient";
import {
    clientTypeRequiresField,
    clientTypeShowsBusinessSector,
    clientTypeShowsCompanyName,
    clientTypeShowsCorporateLayout,
    clientTypeShowsPersonalFields,
    clientTypeShowsRccm,
    type ClientTypeOption,
} from "@/core/schemas/type-client.schema";
import {
    FieldLabel,
    InputField,
    NativeSelectField,
} from "@/components/invoices/create/Fields";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export type ClientFormValues = {
    client_type: ClientType;
    reference: string;
    status: ClientStatutForm;
    phone: string;
    email: string;
    address: string;
    country: string;
    nif: string;
    first_name: string;
    last_name: string;
    company_name: string;
    subtitle: string;
    rccm: string;
    business_sector: string;
    legal_representative: string;
};

function emptyCreateDefaults(): ClientFormValues {
    return {
        client_type: "",
        reference: "",
        status: "actif",
        phone: "",
        email: "",
        address: "",
        country: "",
        nif: "",
        first_name: "",
        last_name: "",
        company_name: "",
        subtitle: "",
        rccm: "",
        business_sector: "",
        legal_representative: "",
    };
}

function detailToFormValues(d: ClientDetailRecord): ClientFormValues {
    return {
        client_type: d.client_type,
        reference: d.reference,
        status: d.statut,
        phone: d.telephone,
        email: d.email,
        address: d.adresse,
        country: d.pays,
        nif: d.nif,
        first_name: d.first_name,
        last_name: d.last_name,
        company_name: d.client_type === "personal" ? "" : d.nomClient,
        subtitle: d.sousTitre,
        rccm: d.rccm,
        business_sector: d.business_sector,
        legal_representative: d.legal_representative,
    };
}

function applyZodFieldErrors(
    setError: (name: Path<ClientFormValues>, err: { message: string }) => void,
    issues: { path: (string | number)[]; message?: string }[]
) {
    for (const issue of issues) {
        const top = issue.path[0];
        if (typeof top === "string") {
            setError(top as Path<ClientFormValues>, {
                message: issue.message ?? "Champ invalide",
            });
        }
    }
}

function validateRequiredTypeFields(
    values: ClientFormValues,
    typeOption: ClientTypeOption | undefined
): string | null {
    const required = typeOption?.required_fields ?? [];

    if (
        clientTypeRequiresField(required, "first_name", "prenom") &&
        !(values.first_name ?? "").trim()
    ) {
        return "Le prénom est requis.";
    }

    if (
        clientTypeRequiresField(required, "last_name", "nom") &&
        !(values.last_name ?? "").trim()
    ) {
        return "Le nom est requis.";
    }

    if (
        clientTypeRequiresField(
            required,
            "denomination",
            "company_name",
            "raison_sociale"
        ) &&
        !(values.company_name ?? "").trim()
    ) {
        return "La dénomination est requise.";
    }

    if (
        clientTypeRequiresField(required, "nif") &&
        !(values.nif ?? "").trim()
    ) {
        return "Le NIF est requis.";
    }

    if (
        clientTypeRequiresField(required, "rccm") &&
        !(values.rccm ?? "").trim()
    ) {
        return "Le RCCM est requis.";
    }

    if (
        clientTypeRequiresField(
            required,
            "business_sector",
            "secteur",
            "secteur_activite"
        ) &&
        !(values.business_sector ?? "").trim()
    ) {
        return "Le secteur d'activité est requis.";
    }

    return null;
}

type ClientFormBase = {
    cancelHref: string;
};

type ClientFormCreateProps = ClientFormBase & {
    variant: "create";
};

type ClientFormEditProps = ClientFormBase & {
    variant: "edit";
    initial: ClientDetailRecord;
};

export type ClientFormProps = ClientFormCreateProps | ClientFormEditProps;

export function ClientForm(props: ClientFormProps) {
    const cancelHref = props.cancelHref;
    const t = useTranslations("clients.createClient.form");
    const router = useRouter();
    const createMut = useCreateClient();
    const updateMut = useUpdateClient();
    const {
        data: clientTypes = [],
        isPending: clientTypesPending,
        isError: clientTypesError,
    } = useTypeClient();

    const defaults =
        props.variant === "edit"
            ? detailToFormValues(props.initial)
            : emptyCreateDefaults();

    const form = useForm<ClientFormValues>({
        defaultValues: defaults,
        mode: "onSubmit",
    });

    const clientType = useWatch({
        control: form.control,
        name: "client_type",
        defaultValue: defaults.client_type,
    });

    const selectedTypeOption = useMemo(
        () => clientTypes.find((item) => item.code === clientType),
        [clientTypes, clientType]
    );

    const requiredFields = selectedTypeOption?.required_fields ?? [];
    const showPersonalFields = clientTypeShowsPersonalFields(
        clientType,
        requiredFields
    );
    const showCompanyName = clientTypeShowsCompanyName(
        clientType,
        requiredFields
    );
    const showRccm = clientTypeShowsRccm(clientType, requiredFields);
    const showBusinessSector = clientTypeShowsBusinessSector(
        clientType,
        requiredFields
    );
    const showCorporateLayout = clientTypeShowsCorporateLayout(
        clientType,
        requiredFields
    );
    const showCompanyBlock =
        showCompanyName || showRccm || showBusinessSector;

    useEffect(() => {
        if (clientTypes.length === 0) return;

        const current = form.getValues("client_type");
        const exists = clientTypes.some((item) => item.code === current);
        if (exists) return;

        const fallback =
            clientTypes.find((item) => item.is_default) ?? clientTypes[0];
        if (fallback) {
            form.setValue("client_type", fallback.code, {
                shouldValidate: false,
            });
        }
    }, [clientTypes, form]);

    const onSubmit = form.handleSubmit((values) => {
        const typeError = validateRequiredTypeFields(values, selectedTypeOption);
        if (typeError) {
            toast.error(typeError);
            return;
        }

        const parsed = createClientSchema.safeParse(values);
        if (!parsed.success) {
            applyZodFieldErrors(form.setError, parsed.error.issues);
            toast.error("Merci de corriger les champs du formulaire.");
            return;
        }

        if (props.variant === "create") {
            createMut.mutate(parsed.data, {
                onSuccess: (row) => {
                    toast.success("Client créé.");
                    router.push(`/home/clients/${encodeURIComponent(row.id)}`);
                },
                onError: (err) => {
                    toast.error(clientMutationErrorMessage(err));
                },
            });
            return;
        }

        updateMut.mutate(
            { id: props.initial.id, payload: parsed.data },
            {
                onSuccess: () => {
                    toast.success("Client mis à jour.");
                    router.push(
                        `/home/clients/${encodeURIComponent(props.initial.id)}`
                    );
                },
                onError: (err) => {
                    toast.error(clientMutationErrorMessage(err));
                },
            }
        );
    });

    const pending = createMut.isPending || updateMut.isPending;
    const errors = form.formState.errors;

    return (
        <form className="mt-4 bg-white p-8" onSubmit={onSubmit} noValidate>
            <div className="grid grid-cols-1 gap-x-14 gap-y-4 lg:grid-cols-2">
                <div className="min-w-0">
                    <FieldLabel>
                        Type de client <span className="text-red-500">*</span>
                    </FieldLabel>
                    <NativeSelectField
                        id="client-type"
                        value={clientType}
                        disabled={
                            pending ||
                            clientTypesPending ||
                            clientTypes.length === 0
                        }
                        onChange={(value) =>
                            form.setValue("client_type", value as ClientType, {
                                shouldValidate: true,
                            })
                        }
                    >
                        <option value="" disabled>
                            {clientTypesPending
                                ? t("clientTypeLoading")
                                : clientTypesError
                                  ? t("clientTypeLoadError")
                                  : clientTypes.length === 0
                                    ? t("clientTypeEmpty")
                                    : t("clientTypePlaceholder")}
                        </option>
                        {clientTypes.map((item) => (
                            <option key={item.id} value={item.code}>
                                {item.title}
                            </option>
                        ))}
                    </NativeSelectField>
                    {clientTypesError ? (
                        <p className="mt-2 text-sm font-medium text-red-500">
                            {t("clientTypeLoadError")}
                        </p>
                    ) : null}
                </div>

                <div className="min-w-0">
                    <FieldLabel>
                        {t("reference")} <span className="text-red-500">*</span>
                    </FieldLabel>
                    <InputField
                        id="reference"
                        value={form.watch("reference")}
                        onChange={(value) =>
                            form.setValue("reference", value, {
                                shouldValidate: true,
                            })
                        }
                        error={errors.reference?.message}
                    />
                </div>

                <div className="min-w-0">
                    <FieldLabel>{t("status.title")}</FieldLabel>
                    <NativeSelectField
                        id="statut"
                        value={form.watch("status")}
                        disabled={pending}
                        onChange={(value) =>
                            form.setValue(
                                "status",
                                value as ClientStatutForm,
                                { shouldValidate: true }
                            )
                        }
                    >
                        <option value="actif">
                            {t("status.options.actif")}
                        </option>
                        <option value="suspendu">
                            {t("status.options.suspendu")}
                        </option>
                        <option value="complet">
                            {t("status.options.complet")}
                        </option>
                    </NativeSelectField>
                </div>

                <div className="min-w-0">
                    <FieldLabel>{t("nif")}</FieldLabel>
                    <InputField
                        id="nif"
                        value={form.watch("nif")}
                        onChange={(value) => form.setValue("nif", value)}
                    />
                </div>

                {showPersonalFields ? (
                    <>
                        <div className="min-w-0">
                            <FieldLabel>
                                Prénom <span className="text-red-500">*</span>
                            </FieldLabel>
                            <InputField
                                value={form.watch("first_name")}
                                onChange={(value) =>
                                    form.setValue("first_name", value, {
                                        shouldValidate: true,
                                    })
                                }
                                error={errors.first_name?.message}
                            />
                        </div>
                        <div className="min-w-0">
                            <FieldLabel>
                                Nom <span className="text-red-500">*</span>
                            </FieldLabel>
                            <InputField
                                value={form.watch("last_name")}
                                onChange={(value) =>
                                    form.setValue("last_name", value, {
                                        shouldValidate: true,
                                    })
                                }
                                error={errors.last_name?.message}
                            />
                        </div>
                    </>
                ) : null}

                {showCompanyBlock ? (
                    <>
                        {showCompanyName ? (
                            <>
                                <div className="min-w-0">
                                    <FieldLabel>
                                        {t("nom")}{" "}
                                        <span className="text-red-500">*</span>
                                    </FieldLabel>
                                    <InputField
                                        value={form.watch("company_name")}
                                        onChange={(value) =>
                                            form.setValue("company_name", value, {
                                                shouldValidate: true,
                                            })
                                        }
                                        error={errors.company_name?.message}
                                    />
                                </div>
                                <div className="min-w-0">
                                    <FieldLabel>{t("sousTitre")}</FieldLabel>
                                    <InputField
                                        value={form.watch("subtitle")}
                                        onChange={(value) =>
                                            form.setValue("subtitle", value)
                                        }
                                    />
                                </div>
                            </>
                        ) : null}
                        {showRccm ? (
                            <div className="min-w-0">
                                <FieldLabel>
                                    {t("rccm")}{" "}
                                    <span className="text-red-500">*</span>
                                </FieldLabel>
                                <InputField
                                    value={form.watch("rccm")}
                                    onChange={(value) =>
                                        form.setValue("rccm", value, {
                                            shouldValidate: true,
                                        })
                                    }
                                    error={errors.rccm?.message}
                                />
                            </div>
                        ) : null}
                        {showBusinessSector ? (
                            <div className="min-w-0">
                                <FieldLabel>
                                    Secteur d&apos;activité{" "}
                                    <span className="text-red-500">*</span>
                                </FieldLabel>
                                <InputField
                                    value={form.watch("business_sector")}
                                    onChange={(value) =>
                                        form.setValue("business_sector", value, {
                                            shouldValidate: true,
                                        })
                                    }
                                    error={errors.business_sector?.message}
                                />
                            </div>
                        ) : null}
                    </>
                ) : null}

                <div className="min-w-0">
                    <FieldLabel>{t("tel")}</FieldLabel>
                    <InputField
                        id="telephone"
                        type="tel"
                        value={form.watch("phone")}
                        onChange={(value) => form.setValue("phone", value)}
                    />
                </div>

                <div className="min-w-0">
                    <FieldLabel>{t("email")}</FieldLabel>
                    <InputField
                        id="email"
                        type="email"
                        value={form.watch("email")}
                        onChange={(value) =>
                            form.setValue("email", value, {
                                shouldValidate: true,
                            })
                        }
                        error={errors.email?.message}
                    />
                </div>

                {showCorporateLayout ? (
                    <>
                        <div className="min-w-0">
                            <FieldLabel>Représentant légal</FieldLabel>
                            <InputField
                                value={form.watch("legal_representative")}
                                onChange={(value) =>
                                    form.setValue("legal_representative", value)
                                }
                            />
                        </div>
                        <div className="min-w-0">
                            <FieldLabel>{t("pays")}</FieldLabel>
                            <InputField
                                id="pays"
                                value={form.watch("country")}
                                onChange={(value) =>
                                    form.setValue("country", value)
                                }
                            />
                        </div>

                        <div className="min-w-0 lg:col-span-2">
                            <FieldLabel>{t("adresse")}</FieldLabel>
                            <InputField
                                id="adresse"
                                value={form.watch("address")}
                                onChange={(value) =>
                                    form.setValue("address", value)
                                }
                            />
                        </div>
                    </>
                ) : (
                    <>
                        <div className="min-w-0">
                            <FieldLabel>{t("pays")}</FieldLabel>
                            <InputField
                                id="pays"
                                value={form.watch("country")}
                                onChange={(value) =>
                                    form.setValue("country", value)
                                }
                            />
                        </div>

                        <div className="min-w-0">
                            <FieldLabel>{t("adresse")}</FieldLabel>
                            <InputField
                                id="adresse"
                                value={form.watch("address")}
                                onChange={(value) =>
                                    form.setValue("address", value)
                                }
                            />
                        </div>
                    </>
                )}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-end gap-5">
                <Link href={cancelHref}>
                    <Button
                        type="button"
                        variant="secondary"
                        className="inline-flex h-[50px] w-52 items-center justify-center rounded bg-slate-400 px-5 text-[14px] font-semibold text-white hover:bg-slate-500"
                    >
                        {t("annule")}
                    </Button>
                </Link>
                <Button
                    type="submit"
                    disabled={pending}
                    className="inline-flex h-[50px] w-52 items-center justify-center rounded bg-[#0879bd] px-5 text-[14px] font-semibold text-white shadow-none hover:bg-[#066aa8]"
                >
                    {pending ? "..." : t("save")}
                </Button>
            </div>
        </form>
    );
}
