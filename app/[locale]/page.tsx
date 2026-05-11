"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function LoginPage() {
    const router = useRouter();
    const t = useTranslations("login");

    return (
        <div className="flex min-h-screen w-full flex-col bg-[#f5f6f8] lg:flex-row">
            <div className="flex min-h-[38vh] w-full items-center justify-center bg-[#1f6a9a] px-6 py-10 lg:min-h-screen lg:w-1/2">
                <div className="flex flex-col items-center text-center text-white">
                    <Image
                        src="/imglogin.png"
                        alt={t("illustrationAlt")}
                        width={460}
                        height={460}
                        priority
                        className="h-auto w-[260px] sm:w-[340px] lg:w-[460px]"
                    />

                    <p className="mt-4 max-w-[300px] text-xs leading-relaxed text-white/90 sm:text-sm">
                        {t("description")}
                    </p>

                    <div className="mt-4 flex gap-2">
                        <span className="h-2 w-2 bg-white/40" />
                        <span className="h-2 w-2 bg-white" />
                        <span className="h-2 w-2 bg-white/40" />
                    </div>
                </div>
            </div>

            <div className="flex w-full flex-1 items-center justify-center bg-[#FFFFFF] px-6 py-10 sm:px-10 lg:w-1/2 lg:px-16">
                <div className="w-full max-w-[500px]">
                    <div className="mb-6 flex justify-start">
                        <Image
                            src="/favi.png"
                            alt={t("logoAlt")}
                            width={60}
                            height={60}
                        />
                    </div>

                    <h2 className="mb-6 text-left text-lg font-semibold text-slate-700 sm:text-xl">
                        {t("title")}
                    </h2>

                    <div className="flex flex-col gap-5 sm:gap-6">
                        <div>
                            <label className="mb-1 block text-xs font-medium text-slate-600 sm:text-sm">
                                {t("identifier")}
                            </label>
                            <input
                                type="text"
                                placeholder={t("identifierPlaceholder")}
                                className="h-12 w-full border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#1f6a9a] sm:text-base"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-medium text-slate-600 sm:text-sm">
                                {t("password")}
                            </label>
                            <input
                                type="password"
                                placeholder={t("passwordPlaceholder")}
                                className="h-12 w-full border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#1f6a9a] sm:text-base"
                            />
                        </div>

                        <button
                            className="mt-2 h-12 bg-[#1f6a9a] py-2 text-sm font-medium text-white hover:bg-[#18587f] sm:text-base"
                            onClick={() => router.push("/home")}
                        >
                            {t("submit")}
                        </button>
                    </div>

                    <p className="mt-4 text-center text-xs text-slate-500 sm:text-sm">
                        {t("noAccount")}{" "}
                        <span
                            className="cursor-pointer text-[#1f6a9a] hover:underline"
                            onClick={() => router.push("/signup")}
                        >
                            {t("createAccount")}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}
