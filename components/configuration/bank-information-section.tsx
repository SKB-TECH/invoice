"use client";

import React, { useState } from "react";

import { SectionCard } from "@/components/configuration/section-card";
import { FormActions } from "@/components/configuration/form-actions";
import { InputField } from "@/components/configuration/input-field";
import { SelectBox } from "@/components/configuration/select-box";

type AccountType = "checking" | "savings";

export function BankInformationSection() {
    const initialForm = {
        bankName: "",
        accountHolder: "",
        accountNumber: "",
        iban: "",
        swiftCode: "",
        currency: "USD",
        accountType: "checking" as AccountType,
        branchName: "",
    };

    const [form, setForm] = useState(initialForm);

    const handleCancel = () => {
        setForm(initialForm);
    };

    const handleSubmit = () => {
        console.log("Informations bancaires sauvegardées :", form);
    };

    const accountTypeOptions: { value: AccountType; label: string }[] = [
        { value: "checking", label: "Compte courant" },
        { value: "savings", label: "Compte épargne" },
    ];

    const currencyOptions = [
        { value: "USD", label: "USD" },
        { value: "CDF", label: "CDF" },
        { value: "EUR", label: "EUR" },
    ];

    return (
        <>
            <SectionCard title="Informations bancaires">
                <div className="mb-5">
                    <p className="text-[14px] font-semibold text-slate-800">
                        Coordonnées bancaires de l’entreprise
                    </p>
                    <p className="mt-1 max-w-3xl text-[13px] leading-relaxed text-slate-500">
                        Ces informations peuvent apparaître sur les factures,
                        les documents de paiement et les reçus générés par la
                        plateforme.
                    </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                    <InputField
                        label="Nom de la banque"
                        value={form.bankName}
                        placeholder="Ex. EquityBCDC"
                        onChange={(value) =>
                            setForm((prev) => ({
                                ...prev,
                                bankName: value,
                            }))
                        }
                    />

                    <InputField
                        label="Titulaire du compte"
                        value={form.accountHolder}
                        placeholder="Nom légal de l’entreprise"
                        onChange={(value) =>
                            setForm((prev) => ({
                                ...prev,
                                accountHolder: value,
                            }))
                        }
                    />

                    <InputField
                        label="Numéro de compte"
                        value={form.accountNumber}
                        placeholder="Saisir le numéro de compte"
                        onChange={(value) =>
                            setForm((prev) => ({
                                ...prev,
                                accountNumber: value,
                            }))
                        }
                    />

                    <InputField
                        label="IBAN"
                        value={form.iban}
                        placeholder="Saisir l’IBAN si disponible"
                        onChange={(value) =>
                            setForm((prev) => ({
                                ...prev,
                                iban: value,
                            }))
                        }
                    />

                    <InputField
                        label="Code SWIFT / BIC"
                        value={form.swiftCode}
                        placeholder="Saisir le code SWIFT"
                        onChange={(value) =>
                            setForm((prev) => ({
                                ...prev,
                                swiftCode: value,
                            }))
                        }
                    />

                    <InputField
                        label="Agence bancaire"
                        value={form.branchName}
                        placeholder="Nom ou code de l’agence"
                        onChange={(value) =>
                            setForm((prev) => ({
                                ...prev,
                                branchName: value,
                            }))
                        }
                    />

                    <SelectBox
                        label="Type de compte"
                        value={form.accountType}
                        options={accountTypeOptions}
                        onChange={(value) =>
                            setForm((prev) => ({
                                ...prev,
                                accountType: value,
                            }))
                        }
                    />

                    <SelectBox
                        label="Devise principale"
                        value={form.currency}
                        options={currencyOptions}
                        onChange={(value) =>
                            setForm((prev) => ({
                                ...prev,
                                currency: value,
                            }))
                        }
                    />
                </div>
            </SectionCard>

            <FormActions
                onCancel={handleCancel}
                onSubmit={handleSubmit}
                submitLabel="Enregistrer les informations bancaires"
            />
        </>
    );
}
