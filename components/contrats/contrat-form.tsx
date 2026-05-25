"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar } from "lucide-react";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import type { ContratDetailRecord } from "@/lib/contrats/contrats-data";
import {
    BILLING_CYCLE_FORM_OPTIONS,
    billingCycleFromApi,
    billingCycleLabelFr,
    createContractSchema,
    updateContractSchema,
    type CreateContractInput,
} from "@/core/schemas/contrat.schema";
import { fetchReferentielsPage } from "@/core/services/referentiels.service";
import { ClientSearchSelect } from "@/components/invoices/create/ClientSearchSelect";
import type { Client } from "@/components/invoices/create/types";
import {
    contratMutationErrorMessage,
    useCreateContract,
    useUpdateContract,
} from "@/core/hooks/contrat/useContrat";
import { useClients } from "@/core/hooks/client/useClient";
import { currencyService } from "@/core/services/currency.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

const textareaClassName = cn(
    "flex min-h-[120px] w-full resize-y rounded border border-input bg-transparent px-2.5 py-2 text-sm text-foreground transition-colors outline-none placeholder:text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30",
);

const selectClassName = cn(
    "h-12 w-full rounded border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
);

type ContratFormBase = {
    cancelHref: string;
};

type ContratFormCreateProps = ContratFormBase & {
    variant: "create";
};

type ContratFormEditProps = ContratFormBase & {
    variant: "edit";
    initial: ContratDetailRecord;
};

export type ContratFormProps = ContratFormCreateProps | ContratFormEditProps;

function emptyContractDefaults(): CreateContractInput {
    return {
        client_id: "",
        title: "",
        reference: "",
        starting: "",
        ending: "",
        currency: "USD",
        total: 0,
        monthly: 0,
        paid: 0,
        description: "",
        billing_cycle: "monthly",
        type: 0,
        items_template: [],
        phone: "",
        auto_renew: false,
    };
}

function detailToContractInput(d: ContratDetailRecord): CreateContractInput {
    let items: CreateContractInput["items_template"] = [];
    try {
        const parsed = JSON.parse(d.items_template_json) as unknown;
        items =
            parsed && typeof parsed === "object"
                ? (parsed as CreateContractInput["items_template"])
                : [];
    } catch {
        items = [];
    }

    return {
        client_id: d.client_id,
        title: d.nomContrat,
        reference: d.reference,
        starting: d.dateDebut,
        ending: d.dateFin,
        currency: d.currency.toUpperCase(),
        total: d.valeur,
        monthly: d.monthly,
        paid: d.paid,
        description: d.description,
        billing_cycle: billingCycleFromApi(d.billing_cycle),
        type: d.type ?? 0,
        items_template: items,
        phone: d.telephone,
        auto_renew: d.autoRenew,
    };
}

function DateField({
    id,
    label,
    error,
    disabled,
    ...rest
}: React.ComponentProps<typeof Input> & {
    id: string;
    label: string;
    error?: string;
}) {
    return (
        <div className="flex flex-col gap-2">
            <Label htmlFor={id} className="font-medium text-slate-700">
                {label}
            </Label>
            <div className="relative">
                <Input
                    id={id}
                    type="date"
                    disabled={disabled}
                    aria-invalid={Boolean(error)}
                    className="h-12 rounded pr-9 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
                    {...rest}
                />
                <Calendar
                    className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                    aria-hidden
                />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
    );
}

export function ContratForm(props: ContratFormProps) {
    const t = useTranslations("contrats.createContrat");
    const cancelHref = props.cancelHref;
    const router = useRouter();
    const fileRef = useRef<HTMLInputElement>(null);
    const itemsTextareaRef = useRef<HTMLTextAreaElement>(null);

    const {
        data: clientsResult,
        isPending: clientsPending,
        isError: clientsError,
    } = useClients({
        per_page: 200,
    });
    const clientsForSearch: Client[] = useMemo(() => {
        return (clientsResult?.items ?? []).map((client) => ({
            id: client.id,
            name: client.legal_name || client.name || "",
            nif: client.nif || client.vat_num || "",
            rccm: client.rccm || client.registration_id || "",
            idNat: client.idnat || "",
            address: client.address || "",
            phone: client.phone || "",
            email: client.email || "",
        }));
    }, [clientsResult?.items]);

    const currencyOptions = [{ code: "USD", label: "USD" }, { code: "CDF", label: "CDF" }];

    const { data: referentielsPage, isLoading: referentielsLoading } =
        useQuery({
            queryKey: ["referentiels", "page", { axe: "Contrat", page: 1 }],
            queryFn: () =>
                fetchReferentielsPage({
                    page: 1,
                    perPage: 200,
                    axe: "Contrat",
                }),
            enabled: props.variant === "create",
        });

    const referentielOptions = referentielsPage?.items ?? [];

    const currencyCodesKey = useMemo(
        () =>
            [...currencyOptions]
                .map((c) => c.code)
                .sort()
                .join(","),
        [currencyOptions]
    );

    const defaults =
        props.variant === "edit"
            ? detailToContractInput(props.initial)
            : emptyContractDefaults();

    const createMut = useCreateContract();
    const updateMut = useUpdateContract();

    const resolverSchema =
        props.variant === "create" ? createContractSchema : updateContractSchema;

    const form = useForm<CreateContractInput>({
        resolver: zodResolver(resolverSchema) as Resolver<CreateContractInput>,
        defaultValues: defaults,
        mode: "onSubmit",
    });

    useEffect(() => {
        const opts = [...currencyOptions];
        const valid = new Set(opts.map((c) => c.code));
        const current =
            form.getValues("currency")?.trim().toUpperCase() ?? "";
        if (current && !valid.has(current)) {
            form.setValue(
                "currency",
                currencyService.preferredFallbackCode(opts),
                { shouldValidate: true }
            );
        }
    }, [currencyCodesKey]);

    const pending = createMut.isPending || updateMut.isPending;
    const isCreate = props.variant === "create";

    const billingCycleWatched = form.watch("billing_cycle");

    useEffect(() => {
        if (!isCreate) return;
        if (billingCycleWatched === "one_shot") {
            form.setValue("monthly", 0, { shouldValidate: true });
        }
    }, [billingCycleWatched, form, isCreate]);

    const clientIdStr = form.watch("client_id");

    const editClientNom =
        props.variant === "edit" ? props.initial.clientNom : "";
    const editClientId =
        props.variant === "edit" ? props.initial.client_id : "";

    const selectedClientDisplay = useMemo(() => {
        const idStr = clientIdStr?.trim() ?? "";
        const id = Number(idStr);
        if (!idStr || Number.isNaN(id)) return "";
        const fromList = clientsForSearch.find((c) => c.id === id);
        if (fromList) return fromList.name;
        if (editClientId !== "" && editClientId === idStr) {
            return editClientNom;
        }
        return "";
    }, [clientIdStr, clientsForSearch, editClientId, editClientNom]);

    function syncItemsFromTextarea(): boolean {
        const ta = itemsTextareaRef.current;
        if (!ta) return true;
        try {
            form.setValue(
                "items_template",
                JSON.parse(ta.value || "[]") as CreateContractInput["items_template"],
                { shouldValidate: true }
            );
            form.clearErrors("items_template");
            return true;
        } catch {
            form.setError("items_template", { message: "JSON invalide" });
            return false;
        }
    }

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (props.variant === "edit" && !syncItemsFromTextarea()) {
            toast.error("Le gabarit JSON est invalide.");
            return;
        }

        const selectedFile = fileRef.current?.files?.[0] ?? null;

        void form.handleSubmit((values) => {
            if (props.variant === "create") {
                createMut.mutate(
                    { data: values, file: selectedFile },
                    {
                        onSuccess: (row) => {
                            toast.success("Contrat créé.");
                            router.push(
                                `/home/contrats/${encodeURIComponent(row.id)}`
                            );
                        },
                        onError: (err) => {
                            toast.error(contratMutationErrorMessage(err));
                        },
                    }
                );
                return;
            }

            updateMut.mutate(
                { id: props.initial.id, data: values, file: selectedFile },
                {
                    onSuccess: () => {
                        toast.success("Contrat mis à jour.");
                        router.push(
                            `/home/contrats/${encodeURIComponent(props.initial.id)}`
                        );
                    },
                    onError: (err) => {
                        toast.error(contratMutationErrorMessage(err));
                    },
                }
            );
        })(e);
    };

    return (
        <form
            className="rounded border border-slate-200/80 bg-white p-6 sm:p-8"
            onSubmit={onSubmit}
            noValidate
        >
            <div className="grid gap-6 sm:grid-cols-2">
                <div className="flex flex-col gap-2 sm:col-span-1">
                    <Label
                        htmlFor="contrat-form-client"
                        className="font-medium text-slate-700"
                    >
                        {t("form.client")}{" "}
                        <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                        name="client_id"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <>
                                <ClientSearchSelect
                                    key={
                                        field.value?.trim()
                                            ? `client-${field.value}`
                                            : "client-none"
                                    }
                                    inputId="contrat-form-client"
                                    clients={clientsForSearch}
                                    value={selectedClientDisplay}
                                    error={fieldState.error?.message}
                                    placeholder={
                                        clientsPending
                                            ? t("form.loadingClients")
                                            : t(
                                                  "form.clientSearchPlaceholder"
                                              )
                                    }
                                    emptyLabel={t("form.clientSearchEmpty")}
                                    disabled={
                                        pending || clientsPending || clientsError
                                    }
                                    onSelect={(c) => {
                                        field.onChange(String(c.id));
                                        form.clearErrors("client_id");
                                    }}
                                />
                                {clientsError ? (
                                    <p className="text-sm text-destructive">
                                        {t("form.clientsLoadError")}
                                    </p>
                                ) : null}
                            </>
                        )}
                    />
                </div>

                    <div className="flex flex-col gap-2 sm:col-span-1">
                        <Label htmlFor="nom-contrat" className="font-medium text-slate-700">
                            {t("form.nom")} <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="nom-contrat"
                            className="h-12 rounded"
                            disabled={pending}
                            {...form.register("title")}
                        />
                        {form.formState.errors.title?.message ? (
                            <p className="text-sm text-destructive">
                                {form.formState.errors.title.message}
                            </p>
                        ) : null}
                    </div>
                    <div className="flex flex-col gap-2 sm:col-span-1">
                        <Label htmlFor="reference" className="font-medium text-slate-700">
                            {t("form.reference")}{" "}
                            <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="reference"
                            className="h-12 rounded"
                            disabled={pending}
                            {...form.register("reference")}
                        />
                        {form.formState.errors.reference?.message ? (
                            <p className="text-sm text-destructive">
                                {form.formState.errors.reference.message}
                            </p>
                        ) : null}
                    </div>
                    <Controller
                        name="auto_renew"
                        control={form.control}
                        render={({ field }) => (
                            <div className="flex flex-col gap-2 sm:col-span-1">
                                <Label htmlFor="auto-renew" className="font-medium text-slate-700">
                                    {t("form.auto-renew.title")}{" "}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <select
                                    id="auto-renew"
                                    className={selectClassName}
                                    disabled={pending}
                                    value={field.value ? "oui" : "non"}
                                    onChange={(e) =>
                                        field.onChange(e.target.value === "oui")
                                    }
                                >
                                    <option value="oui">
                                        {t("form.auto-renew.options.oui")}
                                    </option>
                                    <option value="non">
                                        {t("form.auto-renew.options.non")}
                                    </option>
                                </select>
                            </div>
                        )}
                    />

                <DateField
                    id="date-debut"
                    label={t("form.dateStart")}
                    disabled={pending}
                    error={form.formState.errors.starting?.message}
                    {...form.register("starting")}
                />
                <DateField
                    id="date-fin"
                    label={t("form.dateEnd")}
                    disabled={pending}
                    error={form.formState.errors.ending?.message}
                    {...form.register("ending")}
                />

                <div className="flex flex-col gap-2">
                    <Label htmlFor="valeur" className="font-medium text-slate-700">
                        {t("form.valeur")}
                        <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="valeur"
                        inputMode="decimal"
                        className="h-12 rounded"
                        disabled={pending}
                        {...form.register("total")}
                    />
                    {form.formState.errors.total?.message ? (
                        <p className="text-sm text-destructive">
                            {form.formState.errors.total.message}
                        </p>
                    ) : null}
                </div>

                <div className="flex flex-col gap-2">
                    <Label htmlFor="currency" className="font-medium text-slate-700">
                        Devise <span className="text-red-500">*</span>
                    </Label>
                    <select
                        id="currency"
                        className={selectClassName}
                        disabled={pending}
                        {...form.register("currency")}
                    >
                        {currencyOptions.map((cur) => (
                            <option key={cur.code} value={cur.code}>
                                {cur.label}
                            </option>
                        ))}
                    </select>
                    {form.formState.errors.currency?.message ? (
                        <p className="text-sm text-destructive">
                            {form.formState.errors.currency.message}
                        </p>
                    ) : null}
                </div>

                {isCreate ? (
                    <>
                        <div className="flex flex-col gap-2 sm:col-span-1">
                            <Label
                                htmlFor="type-contrat"
                                className="font-medium text-slate-700"
                            >
                                Type de contrat <span className="text-red-500">*</span>
                            </Label>
                            <select
                                id="type-contrat"
                                className={selectClassName}
                                disabled={pending || referentielsLoading}
                                {...form.register("type", {
                                    valueAsNumber: true,
                                })}
                            >
                                <option value={0}>
                                    {referentielsLoading
                                        ? "Chargement des référentiels…"
                                        : "Sélectionner un type de contrat"}
                                </option>
                                {referentielOptions.map((r) => (
                                    <option key={r.id} value={r.id}>
                                        {r.title.trim() || r.code.trim()}
                                    </option>
                                ))}
                            </select>
                            {form.formState.errors.type?.message ? (
                                <p className="text-sm text-destructive">
                                    {form.formState.errors.type.message}
                                </p>
                            ) : null}
                        </div>

                        <div className="flex flex-col gap-2 sm:col-span-1">
                            <Label
                                htmlFor="billing-cycle-create"
                                className="font-medium text-slate-700"
                            >
                                Cycle de facturation{" "}
                                <span className="text-red-500">*</span>
                            </Label>
                            <select
                                id="billing-cycle-create"
                                className={selectClassName}
                                disabled={pending}
                                {...form.register("billing_cycle")}
                            >
                                {BILLING_CYCLE_FORM_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                            {form.formState.errors.billing_cycle?.message ? (
                                <p className="text-sm text-destructive">
                                    {form.formState.errors.billing_cycle.message}
                                </p>
                            ) : null}
                        </div>

                        {billingCycleWatched !== "one_shot" ? (
                            <div className="flex flex-col gap-2 sm:col-span-1">
                                <Label
                                    htmlFor="monthly-create"
                                    className="font-medium text-slate-700"
                                >
                                    Montant&nbsp;
                                    {billingCycleLabelFr(
                                        billingCycleWatched
                                    )}{" "}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="monthly-create"
                                    inputMode="decimal"
                                    className="h-12 rounded"
                                    disabled={pending}
                                    {...form.register("monthly")}
                                />
                                {form.formState.errors.monthly?.message ? (
                                    <p className="text-sm text-destructive">
                                        {
                                            form.formState.errors.monthly
                                                .message
                                        }
                                    </p>
                                ) : null}
                            </div>
                        ) : null}

                        <div className={`flex flex-col gap-2 ${billingCycleWatched == "one_shot" ? "sm:col-span-2" : "sm:col-span-1"}`}>
                            <Label
                                htmlFor="contrat-file-create"
                                className="font-medium text-slate-700"
                            >
                                Fichier du contrat
                            </Label>
                            <Input
                                id="contrat-file-create"
                                ref={fileRef}
                                type="file"
                                disabled={pending}
                                className="h-12 rounded pt-2"
                            />
                        </div>
                    </>
                ) : null}

                {!isCreate ? (
                    <>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="telephone" className="font-medium text-slate-700">
                                {t("form.tel")}
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
                            <Label className="font-medium text-slate-700">
                                Mensuel <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                inputMode="decimal"
                                className="h-12 rounded"
                                disabled={pending}
                                {...form.register("monthly")}
                            />
                            {form.formState.errors.monthly?.message ? (
                                <p className="text-sm text-destructive">
                                    {form.formState.errors.monthly.message}
                                </p>
                            ) : null}
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label className="font-medium text-slate-700">
                                Payé <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                inputMode="decimal"
                                className="h-12 rounded"
                                disabled={pending}
                                {...form.register("paid")}
                            />
                            {form.formState.errors.paid?.message ? (
                                <p className="text-sm text-destructive">
                                    {form.formState.errors.paid.message}
                                </p>
                            ) : null}
                        </div>

                        <div className="flex flex-col gap-2 sm:col-span-2">
                            <Label htmlFor="billing-cycle" className="font-medium text-slate-700">
                                Cycle de facturation <span className="text-red-500">*</span>
                            </Label>
                            <select
                                id="billing-cycle"
                                className={selectClassName}
                                disabled={pending}
                                {...form.register("billing_cycle")}
                            >
                                {BILLING_CYCLE_FORM_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                            {form.formState.errors.billing_cycle?.message ? (
                                <p className="text-sm text-destructive">
                                    {form.formState.errors.billing_cycle.message}
                                </p>
                            ) : null}
                        </div>

                        <div className="flex flex-col gap-2 sm:col-span-2">
                            <Label htmlFor="items-template" className="font-medium text-slate-700">
                                Gabarit des lignes (JSON)
                            </Label>
                            <textarea
                                ref={itemsTextareaRef}
                                id="items-template"
                                rows={6}
                                className={cn(
                                    textareaClassName,
                                    "rounded font-mono text-xs"
                                )}
                                disabled={pending}
                                defaultValue={JSON.stringify(
                                    defaults.items_template ?? [],
                                    null,
                                    2
                                )}
                                onBlur={(e) => {
                                    try {
                                        const parsed = JSON.parse(
                                            e.target.value || "[]"
                                        ) as unknown;
                                        form.setValue(
                                            "items_template",
                                            parsed as CreateContractInput["items_template"],
                                            { shouldValidate: true }
                                        );
                                        form.clearErrors("items_template");
                                    } catch {
                                        form.setError("items_template", {
                                            message: "JSON invalide",
                                        });
                                    }
                                }}
                            />
                            {form.formState.errors.items_template?.message ? (
                                <p className="text-sm text-destructive">
                                    {String(
                                        form.formState.errors.items_template.message
                                    )}
                                </p>
                            ) : null}
                        </div>

                        <div className="flex flex-col gap-2 sm:col-span-2">
                            <Label htmlFor="contrat-file" className="font-medium text-slate-700">
                                Fichier contractuel (optionnel)
                            </Label>
                            <Input
                                id="contrat-file"
                                ref={fileRef}
                                type="file"
                                disabled={pending}
                                className="h-12 rounded pt-2"
                            />
                        </div>

                        <div className="flex flex-col gap-2 sm:col-span-2">
                            <Label htmlFor="description" className="font-medium text-slate-700">
                                {t("form.description")}
                            </Label>
                            <textarea
                                id="description"
                                rows={5}
                                className={cn(textareaClassName, "rounded")}
                                disabled={pending}
                                {...form.register("description")}
                            />
                        </div>
                    </>
                ) : null}
            </div>

            <div className="mt-8 flex flex-col flex-wrap gap-3 border-t border-slate-100 pt-6 md:flex-row md:justify-end">
                <Link href={cancelHref}>
                    <Button
                        type="button"
                        variant="secondary"
                        className="h-12 w-52 rounded bg-[#949B9F] px-5 text-white hover:bg-[#949B9F]/80 cursor-pointer"
                    >
                        {t("cancel")}
                    </Button>
                </Link>
                <Button
                    type="submit"
                    disabled={pending}
                    className="h-12 w-52 rounded bg-[#0073C5] px-5 text-white shadow-none hover:bg-[#066aa8] cursor-pointer"
                >
                    {pending ? "..." : t("save")}
                </Button>
            </div>
        </form>
    );
}
