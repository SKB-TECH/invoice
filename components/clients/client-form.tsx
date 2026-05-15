"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";

const selectClassName =
    "h-12 w-full rounded border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";

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
        client_type: "personal",
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
        company_name:
            d.client_type === "personal" ? "" : d.nomClient,
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

    const onSubmit = form.handleSubmit((values) => {
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

    return (
        <form
            className="rounded border border-slate-200/80 bg-white p-6 sm:p-8"
            onSubmit={onSubmit}
            noValidate
        >
            <div className="grid gap-6 sm:grid-cols-2">
                <div className="flex flex-col gap-2 sm:col-span-2">
                    <Label htmlFor="client-type" className="font-medium text-slate-700">
                        Type de client <span className="text-red-500">*</span>
                    </Label>
                    <select
                        id="client-type"
                        className={selectClassName}
                        disabled={pending}
                        {...form.register("client_type")}
                    >
                        <option value="personal">Personne physique</option>
                        <option value="pme">PME</option>
                        <option value="corporate">Entreprise</option>
                    </select>
                </div>

                <div className="flex flex-col gap-2">
                    <Label htmlFor="reference" className="font-medium text-slate-700">
                        {t("reference")} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="reference"
                        className="h-12 rounded"
                        disabled={pending}
                        aria-invalid={Boolean(form.formState.errors.reference)}
                        {...form.register("reference")}
                    />
                    {form.formState.errors.reference?.message ? (
                        <p className="text-sm text-destructive">
                            {form.formState.errors.reference.message}
                        </p>
                    ) : null}
                </div>

                <div className="flex flex-col gap-2">
                    <Label htmlFor="statut" className="font-medium text-slate-700">
                        {t("status.title")}
                    </Label>
                    <select
                        id="statut"
                        className={selectClassName}
                        disabled={pending}
                        {...form.register("status")}
                    >
                        <option value="actif">{t("status.options.actif")}</option>
                        <option value="suspendu">
                            {t("status.options.suspendu")}
                        </option>
                        <option value="complet">{t("status.options.complet")}</option>
                    </select>
                </div>

                {clientType === "personal" ? (
                    <>
                        <div className="flex flex-col gap-2">
                            <Label className="font-medium text-slate-700">
                                Prénom <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                className="h-12 rounded"
                                disabled={pending}
                                {...form.register("first_name")}
                            />
                            {form.formState.errors.first_name?.message ? (
                                <p className="text-sm text-destructive">
                                    {form.formState.errors.first_name.message}
                                </p>
                            ) : null}
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label className="font-medium text-slate-700">
                                Nom <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                className="h-12 rounded"
                                disabled={pending}
                                {...form.register("last_name")}
                            />
                            {form.formState.errors.last_name?.message ? (
                                <p className="text-sm text-destructive">
                                    {form.formState.errors.last_name.message}
                                </p>
                            ) : null}
                        </div>
                    </>
                ) : null}

                {(clientType === "pme" || clientType === "corporate") && (
                    <>
                        <div className="flex flex-col gap-2 sm:col-span-2">
                            <Label className="font-medium text-slate-700">
                                {t("nom")} <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                className="h-12 rounded"
                                disabled={pending}
                                {...form.register("company_name")}
                            />
                            {form.formState.errors.company_name?.message ? (
                                <p className="text-sm text-destructive">
                                    {form.formState.errors.company_name.message}
                                </p>
                            ) : null}
                        </div>
                        <div className="flex flex-col gap-2 sm:col-span-2">
                            <Label className="font-medium text-slate-700">
                                {t("sousTitre")}
                            </Label>
                            <Input
                                className="h-12 rounded"
                                disabled={pending}
                                {...form.register("subtitle")}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label className="font-medium text-slate-700">
                                {t("rccm")} <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                className="h-12 rounded"
                                disabled={pending}
                                {...form.register("rccm")}
                            />
                            {form.formState.errors.rccm?.message ? (
                                <p className="text-sm text-destructive">
                                    {form.formState.errors.rccm.message}
                                </p>
                            ) : null}
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label className="font-medium text-slate-700">
                                Secteur d&apos;activité{" "}
                                <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                className="h-12 rounded"
                                disabled={pending}
                                {...form.register("business_sector")}
                            />
                            {form.formState.errors.business_sector?.message ? (
                                <p className="text-sm text-destructive">
                                    {form.formState.errors.business_sector.message}
                                </p>
                            ) : null}
                        </div>
                    </>
                )}

                {clientType === "corporate" ? (
                    <div className="flex flex-col gap-2 sm:col-span-2">
                        <Label className="font-medium text-slate-700">
                            Représentant légal
                        </Label>
                        <Input
                            className="h-12 rounded"
                            disabled={pending}
                            {...form.register("legal_representative")}
                        />
                    </div>
                ) : null}

                <div className="flex flex-col gap-2">
                    <Label htmlFor="nif" className="font-medium text-slate-700">
                        {t("nif")}
                    </Label>
                    <Input
                        id="nif"
                        className="h-12 rounded"
                        disabled={pending}
                        {...form.register("nif")}
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <Label htmlFor="telephone" className="font-medium text-slate-700">
                        {t("tel")}
                    </Label>
                    <Input
                        id="telephone"
                        type="tel"
                        className="h-12 rounded"
                        disabled={pending}
                        {...form.register("phone")}
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <Label htmlFor="email" className="font-medium text-slate-700">
                        {t("email")}
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        className="h-12 rounded"
                        disabled={pending}
                        {...form.register("email")}
                    />
                    {form.formState.errors.email?.message ? (
                        <p className="text-sm text-destructive">
                            {form.formState.errors.email.message}
                        </p>
                    ) : null}
                </div>

                <div className="flex flex-col gap-2">
                    <Label htmlFor="adresse" className="font-medium text-slate-700">
                        {t("adresse")}
                    </Label>
                    <Input
                        id="adresse"
                        type="text"
                        className="h-12 rounded"
                        disabled={pending}
                        {...form.register("address")}
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <Label htmlFor="pays" className="font-medium text-slate-700">
                        {t("pays")}
                    </Label>
                    <Input
                        id="pays"
                        type="text"
                        className="h-12 rounded"
                        disabled={pending}
                        {...form.register("country")}
                    />
                </div>
            </div>

            <div className="mt-8 flex flex-col flex-wrap gap-3 border-t border-slate-100 pt-6 md:flex-row md:justify-end">
                <Link href={cancelHref}>
                    <Button
                        type="button"
                        variant="secondary"
                        className="h-12 w-52 cursor-pointer rounded bg-[#949B9F] px-5 text-white hover:bg-[#949B9F]/80"
                    >
                        {t("annule")}
                    </Button>
                </Link>
                <Button
                    type="submit"
                    disabled={pending}
                    className="h-12 w-52 cursor-pointer rounded bg-[#0879bd] px-5 text-white shadow-none hover:bg-[#066aa8]"
                >
                    {pending ? "..." : t("save")}
                </Button>
            </div>
        </form>
    );
}
