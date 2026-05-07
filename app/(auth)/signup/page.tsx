"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
    ArrowRight,
    Building2,
    Eye,
    EyeOff,
    Landmark,
    User,
} from "lucide-react";

type ProfileType = "PERSONNEL" | "PME" | "ENTREPRISE";
const profiles = [
    {
        type: "ENTREPRISE" as ProfileType,
        title: "Entreprise",
    },
    {
        type: "PME" as ProfileType,
        title: "PME",
    },
    {
        type: "PERSONNEL" as ProfileType,
        title: "Personnel",
    },
];

export default function RegisterPage() {
    const router = useRouter();

    const [profile, setProfile] = useState<ProfileType>("PERSONNEL");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [form, setForm] = useState({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        companyName: "",
        rccm: "",
        nif: "",
    });

    const isBusiness = profile === "PME" || profile === "ENTREPRISE";

    const handleChange = (key: keyof typeof form, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = () => {
        router.push("/home");
    };

    return (
        <main className="flex min-h-screen w-full flex-col bg-[#f5f6f8] lg:flex-row">
            {/* Section gauche - Illustration */}
            <section className="flex min-h-[38vh] w-full items-center justify-center bg-[#1f6a9a] px-6 py-8 lg:min-h-screen lg:w-1/2">
                <div className="flex flex-col items-center text-center text-white">
                    <Image
                        src="/imglogin.png"
                        alt="illustration"
                        width={460}
                        height={460}
                        priority
                        className="h-auto w-[250px] sm:w-[340px] lg:w-[430px]"
                    />

                    <p className="mt-4 max-w-[320px] text-[13px] leading-relaxed text-white/90">
                        Créez votre compte et gérez vos clients, contrats et factures avec
                        iKwook Invoice.
                    </p>

                    <div className="mt-4 flex gap-2">
                        <span className="h-2 w-2 bg-white" />
                        <span className="h-2 w-2 bg-white/40" />
                        <span className="h-2 w-2 bg-white/40" />
                    </div>
                </div>
            </section>

            {/* Section droite - Formulaire */}
            <section className="flex w-full items-center justify-center bg-[#f5f6f8] px-6 py-8 lg:min-h-screen lg:w-1/2">
                <div className="w-full max-w-[680px] bg-white px-6 py-8 sm:px-8">
                    {/* Logo */}
                    <div className="mb-6 flex justify-start">
                        <Image src="/favi.png" alt="logo" width={52} height={52} />
                    </div>

                    {/* Titres */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-slate-800 sm:text-[24px]">
                            Créer un compte
                        </h1>
                        <p className="mt-1 text-sm text-slate-500 sm:text-[14px]">
                            Choisissez votre profil et renseignez les premières informations.
                        </p>
                    </div>

                    {/* Sélection profil - Alignement corrigé */}
                    <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
                        {profiles.map((item) => {
                            const active = profile === item.type;

                            return (
                                <button
                                    key={item.type}
                                    type="button"
                                    onClick={() => setProfile(item.type)}
                                    className={`relative flex h-12 w-full items-center justify-between rounded-none  border-[0.09px] px-4 transition ${
                                        active
                                            ? "border-[#1f6a9a] bg-[#eef7fc]"
                                            : "border-slate-200 bg-white hover:border-[#1f6a9a]"
                                    }`}
                                >
                                    <span className="text-sm font-semibold text-slate-800">
                                        {item.title}
                                    </span>
                                    <span
                                        className={`h-4 w-4 rounded-none border ${
                                            active
                                                ? "border-[#1f6a9a] bg-[#1f6a9a]"
                                                : "border-slate-300 bg-white"
                                        }`}
                                    />
                                </button>
                            );
                        })}
                    </div>

                    {/* Formulaire */}
                    <div className="space-y-4">
                        {isBusiness && (
                            <div className="space-y-4">
                                <div>
                                    <label className="mb-1 block text-[13px] font-medium text-slate-600">
                                        Nom de l’entreprise
                                    </label>
                                    <input
                                        type="text"
                                        value={form.companyName}
                                        onChange={(e) =>
                                            handleChange("companyName", e.target.value)
                                        }
                                        placeholder="Ex: iKwook SARL"
                                        className="h-11 w-full border border-slate-300 px-3 text-[13px] outline-none focus:border-[#1f6a9a]"
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-1 block text-[13px] font-medium text-slate-600">
                                            RCCM
                                        </label>
                                        <input
                                            type="text"
                                            value={form.rccm}
                                            onChange={(e) => handleChange("rccm", e.target.value)}
                                            placeholder="Ex: CD/KIN/RCCM/..."
                                            className="h-11 w-full border border-slate-300 px-3 text-[13px] outline-none focus:border-[#1f6a9a]"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-[13px] font-medium text-slate-600">
                                            NIF
                                        </label>
                                        <input
                                            type="text"
                                            value={form.nif}
                                            onChange={(e) => handleChange("nif", e.target.value)}
                                            placeholder="Ex: A1234567"
                                            className="h-11 w-full border border-slate-300 px-3 text-[13px] outline-none focus:border-[#1f6a9a]"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Grille champs communs */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className={isBusiness ? "sm:col-span-2" : ""}>
                                <label className="mb-1 block text-[13px] font-medium text-slate-600">
                                    Nom complet
                                </label>
                                <input
                                    type="text"
                                    value={form.fullName}
                                    onChange={(e) => handleChange("fullName", e.target.value)}
                                    placeholder="Ex: Benjamin Shako"
                                    className="h-11 w-full border border-slate-300 px-3 text-[13px] outline-none focus:border-[#1f6a9a]"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-[13px] font-medium text-slate-600">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => handleChange("email", e.target.value)}
                                    placeholder="email@ikwook.cd"
                                    className="h-11 w-full border border-slate-300 px-3 text-[13px] outline-none focus:border-[#1f6a9a]"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-[13px] font-medium text-slate-600">
                                    Téléphone
                                </label>
                                <input
                                    type="tel"
                                    value={form.phone}
                                    onChange={(e) => handleChange("phone", e.target.value)}
                                    placeholder="+243 000 000 000"
                                    className="h-11 w-full border border-slate-300 px-3 text-[13px] outline-none focus:border-[#1f6a9a]"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-[13px] font-medium text-slate-600">
                                    Mot de passe
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={form.password}
                                        onChange={(e) => handleChange("password", e.target.value)}
                                        placeholder="********"
                                        className="h-11 w-full border border-slate-300 px-3 pr-10 text-[13px] outline-none focus:border-[#1f6a9a]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-[13px] font-medium text-slate-600">
                                    Confirmer le mot de passe
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={form.confirmPassword}
                                        onChange={(e) =>
                                            handleChange("confirmPassword", e.target.value)
                                        }
                                        placeholder="********"
                                        className="h-11 w-full border border-slate-300 px-3 pr-10 text-[13px] outline-none focus:border-[#1f6a9a]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bouton */}
                    <button
                        type="button"
                        onClick={handleSubmit}
                        className="mt-8 flex h-11 w-full items-center justify-center gap-2 bg-[#1f6a9a] text-sm font-semibold text-white transition hover:bg-[#18587f]"
                    >
                        Continuer
                        <ArrowRight className="h-4 w-4" />
                    </button>

                    {/* Lien connexion */}
                    <p className="mt-6 text-center text-[13px] text-slate-500">
                        Vous avez déjà un compte ?{" "}
                        <button
                            type="button"
                            onClick={() => router.push("/otp")}
                            className="font-semibold text-[#1f6a9a] transition hover:text-[#18587f]"
                        >
                            Se connecter
                        </button>
                    </p>
                </div>
            </section>
        </main>
    );
}
