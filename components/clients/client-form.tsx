"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch, type Path } from "react-hook-form";
import { toast } from "sonner";
import type { ZodIssue } from "zod";

import type { ClientDetailRecord } from "@/lib/clients/clients-data";
import {
    createClientSchema,
    parseCountryForApi,
} from "@/core/schemas/client.schema";
import type { ClientStatutForm } from "@/lib/clients/clients-data";
import {
    useCreateClient,
    useUpdateClient,
    clientMutationErrorMessage,
} from "@/core/hooks/client/useClient";
import { useTypeClient } from "@/core/hooks/type-client/useTypeClient";
import { useCountries } from "@/core/hooks/country/useCountry";
import {
    countryFormValue,
    findCountryByValue,
} from "@/core/schemas/country.schema";
import {
    clientTypeFieldIsRequired,
    clientTypeShowsField,
    resolveClientTypeOption,
    type ClientTypeOption,
} from "@/core/schemas/type-client.schema";
import {
    FieldLabel,
    InputField,
    NativeSelectField,
} from "@/components/invoices/create/Fields";
import { ClientReferenceDocumentField } from "@/components/shared/OtherComponents/components/clients/ClientReferenceDocumentField";
import { CountryAutocomplete } from "@/components/shared/OtherComponents/components/clients/CountryAutocomplete";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export type ClientFormValues = {
    client_type_id: string;
    client_name: string;
    idnat: string;
    reference_document: string;
    status: ClientStatutForm;
    phone: string;
    email: string;
    address: string;
    country: string;
    nif: string;
    rccm: string;
    business_sector: string;
    legal_representative: string;
};

function emptyCreateDefaults(): ClientFormValues {
    return {
        client_type_id: "",
        client_name: "",
        idnat: "",
        reference_document: "",
        status: "actif",
        phone: "",
        email: "",
        address: "",
        country: "",
        nif: "",
        rccm: "",
        business_sector: "",
        legal_representative: "",
    };
}

function detailToFormValues(d: ClientDetailRecord): ClientFormValues {
    return {
        client_type_id: d.client_type_id,
        client_name: d.nomClient,
        idnat: d.idnat,
        reference_document: d.reference_document,
        status: d.statut,
        phone: d.telephone,
        email: d.email,
        address: d.adresse,
        country: d.pays,
        nif: d.nif,
        rccm: d.rccm,
        business_sector: d.business_sector,
        legal_representative: d.legal_representative,
    };
}

function applyZodFieldErrors(
    setError: (name: Path<ClientFormValues>, err: { message: string }) => void,
    issues: ZodIssue[]
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
    typeOption: ClientTypeOption | undefined,
    referenceDocumentFile: File | null
): string | null {
    const checks: {
        aliases: string[];
        value: string;
        message: string;
        numericCountry?: boolean;
    }[] = [
        {
            aliases: ["client_name"],
            value: values.client_name,
            message: "Le nom du client est requis.",
        },
        {
            aliases: ["nif"],
            value: values.nif,
            message: "Le NIF est requis.",
        },
        {
            aliases: ["rccm"],
            value: values.rccm,
            message: "Le RCCM est requis.",
        },
        {
            aliases: ["idnat"],
            value: values.idnat,
            message: "L'IDNAT est requis.",
        },
        {
            aliases: ["business_sector", "secteur", "secteur_activite"],
            value: values.business_sector,
            message: "Le secteur d'activité est requis.",
        },
        {
            aliases: ["legal_representative", "representant_legal"],
            value: values.legal_representative,
            message: "Le représentant légal est requis.",
        },
        {
            aliases: ["phone", "telephone"],
            value: values.phone,
            message: "Le téléphone est requis.",
        },
        {
            aliases: ["email"],
            value: values.email,
            message: "L'email est requis.",
        },
        {
            aliases: ["country", "pays"],
            value: values.country,
            message: "Le pays est requis.",
            numericCountry: true,
        },
        {
            aliases: ["address", "adresse"],
            value: values.address,
            message: "L'adresse est requise.",
        },
    ];

    for (const check of checks) {
        if (!clientTypeFieldIsRequired(typeOption, ...check.aliases)) {
            continue;
        }

        if (!(check.value ?? "").trim()) {
            return check.message;
        }

        if (check.numericCountry && !parseCountryForApi(check.value)) {
            return "Veuillez sélectionner un pays valide.";
        }
    }

    if (
        clientTypeFieldIsRequired(typeOption, "reference_document") &&
        !referenceDocumentFile &&
        !(values.reference_document ?? "").trim()
    ) {
        return "Le document de référence est requis.";
    }

    return null;
}

function RequiredMark({ required }: { required: boolean }) {
    if (!required) return null;
    return <span className="text-red-500"> *</span>;
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
    const [referenceDocumentFile, setReferenceDocumentFile] =
        useState<File | null>(null);
    const {
        data: clientTypes = [],
        isPending: clientTypesPending,
        isError: clientTypesError,
    } = useTypeClient();
    const {
        data: countries = [],
        isPending: countriesPending,
        isError: countriesError,
    } = useCountries();

    const defaults =
        props.variant === "edit"
            ? detailToFormValues(props.initial)
            : emptyCreateDefaults();

    const form = useForm<ClientFormValues>({
        defaultValues: defaults,
        mode: "onSubmit",
    });

    const clientTypeId = useWatch({
        control: form.control,
        name: "client_type_id",
        defaultValue: defaults.client_type_id,
    });
    const statusValue = useWatch({
        control: form.control,
        name: "status",
        defaultValue: defaults.status,
    });
    const formValues = useWatch({
        control: form.control,
        defaultValue: defaults,
    });

    const selectedTypeOption = useMemo(
        () => resolveClientTypeOption(clientTypeId, clientTypes),
        [clientTypes, clientTypeId]
    );

    const showNif = clientTypeShowsField(selectedTypeOption, "nif");
    const showRccm = clientTypeShowsField(selectedTypeOption, "rccm");
    const showIdnat = clientTypeShowsField(
        selectedTypeOption,
        "idnat"
    );
    const showReferenceDocument = clientTypeShowsField(
        selectedTypeOption,
        "reference_document"
    );
    const showBusinessSector = clientTypeShowsField(
        selectedTypeOption,
        "business_sector",
        "secteur",
        "secteur_activite"
    );
    const showLegalRepresentative = clientTypeShowsField(
        selectedTypeOption,
        "legal_representative",
        "representant_legal"
    );

    const isPersonalType = clientTypeId === "1";
    const addressFullWidth =
        clientTypeId === "1" || clientTypeId === "3" || clientTypeId === "4";

    useEffect(() => {
        if (clientTypes.length === 0) return;

        const current = form.getValues("client_type_id");
        const exists = clientTypes.some((item) => item.id === current);
        if (exists) return;

        const fallback =
            clientTypes.find((item) => item.is_default) ??
            clientTypes.find((item) => item.id === "1") ??
            clientTypes[0];
        if (fallback) {
            form.setValue("client_type_id", fallback.id, {
                shouldValidate: false,
            });
        }
    }, [clientTypes, form]);

    useEffect(() => {
        if (countries.length === 0) return;

        const current = form.getValues("country");
        if (current && findCountryByValue(countries, current)) {
            return;
        }

        if (props.variant !== "create") return;

        const defaultCountry =
            countries.find((item) => item.code === "CD") ?? countries[0];
        if (defaultCountry) {
            form.setValue("country", countryFormValue(defaultCountry), {
                shouldValidate: false,
            });
        }
    }, [countries, form, props.variant]);

    const onSubmit = form.handleSubmit((values) => {
        const typeError = validateRequiredTypeFields(
            values,
            selectedTypeOption,
            referenceDocumentFile
        );
        if (typeError) {
            toast.error(typeError);
            return;
        }

        const apiValues = {
            ...values,
            reference_document:
                referenceDocumentFile instanceof File
                    ? undefined
                    : values.reference_document,
        };
        const parsed = createClientSchema.safeParse(apiValues);
        if (!parsed.success) {
            applyZodFieldErrors(form.setError, parsed.error.issues);
            toast.error("Merci de corriger les champs du formulaire.");
            return;
        }

        const mutationInput = {
            payload: parsed.data,
            typeOption: selectedTypeOption,
            referenceDocumentFile,
        };

        if (props.variant === "create") {
            createMut.mutate(mutationInput, {
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
            { id: props.initial.id, ...mutationInput },
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
                        {t("type.title")}
                        <RequiredMark required />
                    </FieldLabel>
                    <NativeSelectField
                        id="client-type"
                        value={clientTypeId}
                        disabled={
                            pending ||
                            clientTypesPending ||
                            clientTypes.length === 0
                        }
                        onChange={(value) =>
                            form.setValue("client_type_id", value, {
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
                            <option key={item.id} value={item.id}>
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
                    <FieldLabel>{t("status.title")}</FieldLabel>
                    <NativeSelectField
                        id="statut"
                        value={statusValue ?? defaults.status}
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
                    <FieldLabel>
                        {t("clientName")}
                        <RequiredMark
                            required={clientTypeFieldIsRequired(
                                selectedTypeOption,
                                "client_name"
                            )}
                        />
                    </FieldLabel>
                    <InputField
                        id="client-name"
                        value={formValues.client_name ?? ""}
                        onChange={(value) =>
                            form.setValue("client_name", value, {
                                shouldValidate: true,
                            })
                        }
                        error={errors.client_name?.message}
                    />
                </div>

                {isPersonalType ? (
                    <div className="min-w-0">
                        <FieldLabel>
                            {t("tel")}
                            <RequiredMark
                                required={clientTypeFieldIsRequired(
                                    selectedTypeOption,
                                    "phone",
                                    "telephone"
                                )}
                            />
                        </FieldLabel>
                        <InputField
                            id="telephone"
                            type="tel"
                            value={formValues.phone ?? ""}
                            onChange={(value) =>
                                form.setValue("phone", value, {
                                    shouldValidate: true,
                                })
                            }
                            error={errors.phone?.message}
                        />
                    </div>
                ) : null}

                {!isPersonalType && showNif ? (
                    <div className="min-w-0">
                        <FieldLabel>
                            {t("nif")}
                            <RequiredMark
                                required={clientTypeFieldIsRequired(
                                    selectedTypeOption,
                                    "nif"
                                )}
                            />
                        </FieldLabel>
                        <InputField
                            id="nif"
                            value={formValues.nif ?? ""}
                            onChange={(value) =>
                                form.setValue("nif", value, {
                                    shouldValidate: true,
                                })
                            }
                            error={errors.nif?.message}
                        />
                    </div>
                ) : null}

                {!isPersonalType && showRccm ? (
                    <div className="min-w-0">
                        <FieldLabel>
                            {t("rccm")}
                            <RequiredMark
                                required={clientTypeFieldIsRequired(
                                    selectedTypeOption,
                                    "rccm"
                                )}
                            />
                        </FieldLabel>
                        <InputField
                            id="rccm"
                            value={formValues.rccm ?? ""}
                            onChange={(value) =>
                                form.setValue("rccm", value, {
                                    shouldValidate: true,
                                })
                            }
                            error={errors.rccm?.message}
                        />
                    </div>
                ) : null}

                {!isPersonalType && showIdnat ? (
                    <div className="min-w-0">
                        <FieldLabel>
                            {t("reference")}
                            <RequiredMark
                                required={clientTypeFieldIsRequired(
                                    selectedTypeOption,
                                    "idnat"
                                )}
                            />
                        </FieldLabel>
                        <InputField
                            id="reference"
                            value={formValues.idnat ?? ""}
                            onChange={(value) =>
                                form.setValue("idnat", value, {
                                    shouldValidate: true,
                                })
                            }
                            error={errors.idnat?.message}
                        />
                    </div>
                ) : null}

                {!isPersonalType && showReferenceDocument ? (
                    <div className="min-w-0">
                        <FieldLabel>
                            {t("referenceDocument")}
                            <RequiredMark
                                required={clientTypeFieldIsRequired(
                                    selectedTypeOption,
                                    "reference_document"
                                )}
                            />
                        </FieldLabel>
                        <ClientReferenceDocumentField
                            file={referenceDocumentFile}
                            existingLabel={formValues.reference_document ?? ""}
                            disabled={pending}
                            onChange={setReferenceDocumentFile}
                            error={
                                referenceDocumentFile ||
                                formValues.reference_document
                                    ? undefined
                                    : errors.reference_document?.message
                            }
                        />
                    </div>
                ) : null}

                {!isPersonalType && showBusinessSector ? (
                    <div className="min-w-0">
                        <FieldLabel>
                            {t("businessSector")}
                            <RequiredMark
                                required={clientTypeFieldIsRequired(
                                    selectedTypeOption,
                                    "business_sector",
                                    "secteur",
                                    "secteur_activite"
                                )}
                            />
                        </FieldLabel>
                        <InputField
                            id="business-sector"
                            value={formValues.business_sector ?? ""}
                            onChange={(value) =>
                                form.setValue("business_sector", value, {
                                    shouldValidate: true,
                                })
                            }
                            error={errors.business_sector?.message}
                        />
                    </div>
                ) : null}

                {!isPersonalType && showLegalRepresentative ? (
                    <div className="min-w-0">
                        <FieldLabel>
                            {t("legalRepresentative")}
                            <RequiredMark
                                required={clientTypeFieldIsRequired(
                                    selectedTypeOption,
                                    "legal_representative",
                                    "representant_legal"
                                )}
                            />
                        </FieldLabel>
                        <InputField
                            id="legal-representative"
                            value={formValues.legal_representative ?? ""}
                            onChange={(value) =>
                                form.setValue("legal_representative", value, {
                                    shouldValidate: true,
                                })
                            }
                            error={errors.legal_representative?.message}
                        />
                    </div>
                ) : null}

                {!isPersonalType ? (
                    <div className="min-w-0">
                        <FieldLabel>
                            {t("tel")}
                            <RequiredMark
                                required={clientTypeFieldIsRequired(
                                    selectedTypeOption,
                                    "phone",
                                    "telephone"
                                )}
                            />
                        </FieldLabel>
                        <InputField
                            id="telephone"
                            type="tel"
                            value={formValues.phone ?? ""}
                            onChange={(value) =>
                                form.setValue("phone", value, {
                                    shouldValidate: true,
                                })
                            }
                            error={errors.phone?.message}
                        />
                    </div>
                ) : null}

                <div className="min-w-0">
                    <FieldLabel>
                        {t("email")}
                        <RequiredMark
                            required={clientTypeFieldIsRequired(
                                selectedTypeOption,
                                "email"
                            )}
                        />
                    </FieldLabel>
                    <InputField
                        id="email"
                        type="email"
                        value={formValues.email ?? ""}
                        onChange={(value) =>
                            form.setValue("email", value, {
                                shouldValidate: true,
                            })
                        }
                        error={errors.email?.message}
                    />
                </div>

                <div className="min-w-0">
                    <FieldLabel>
                        {t("pays")}
                        <RequiredMark
                            required={clientTypeFieldIsRequired(
                                selectedTypeOption,
                                "country",
                                "pays"
                            )}
                        />
                    </FieldLabel>
                    <CountryAutocomplete
                        id="pays"
                        value={formValues.country ?? ""}
                        countries={countries}
                        loading={countriesPending}
                        loadError={countriesError}
                        disabled={pending}
                        placeholder={t("countryPlaceholder")}
                        loadingPlaceholder={t("countryLoading")}
                        loadErrorMessage={t("countryLoadError")}
                        onChange={(value) =>
                            form.setValue("country", value, {
                                shouldValidate: true,
                            })
                        }
                        error={errors.country?.message}
                    />
                </div>

                <div
                    className={cn(
                        "min-w-0",
                        addressFullWidth && "lg:col-span-2"
                    )}
                >
                    <FieldLabel>
                        {t("adresse")}
                        <RequiredMark
                            required={clientTypeFieldIsRequired(
                                selectedTypeOption,
                                "address",
                                "adresse"
                            )}
                        />
                    </FieldLabel>
                    <InputField
                        id="adresse"
                        value={formValues.address ?? ""}
                        onChange={(value) =>
                            form.setValue("address", value, {
                                shouldValidate: true,
                            })
                        }
                        error={errors.address?.message}
                    />
                </div>
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
