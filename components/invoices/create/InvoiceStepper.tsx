import { useTranslations } from "next-intl";

import type { ItemKind, Step } from "./types";

export function InvoiceStepper({
                                   currentStep,
                                   itemKind,
                               }: {
    currentStep: Step;
    itemKind: ItemKind;
}) {
    const t = useTranslations("createInvoice");

    const steps = [
        {
            id: 1,
            label: t("steps.client"),
        },
        {
            id: 2,
            label:
                itemKind === "Article"
                    ? t("kind.article")
                    : t("kind.service"),
        },
        {
            id: 3,
            label: t("steps.comment"),
        },

        {
            id: 4,
            label: t("steps.preview"),
        },
    ];

    return (
        <div className="mt-12">
            <div className="relative flex items-start justify-between">
                <div className="absolute left-[35px] right-[35px] top-[17px] h-px bg-slate-300" />

                <div
                    className="absolute left-[35px] top-[17px] h-px bg-[#0EAA2C]"
                    style={{
                        width:
                            currentStep === 1
                                ? "0%"
                                : currentStep === 2
                                    ? "50%"
                                    : "100%",
                    }}
                />

                {steps.map((step) => {
                    const isActive = step.id === currentStep;
                    const isDone = step.id < currentStep;

                    return (
                        <div
                            key={step.id}
                            className="relative z-10 flex w-[140px] flex-col items-center"
                        >
                            <div
                                className={[
                                    "flex size-9 items-center justify-center rounded-full text-sm font-bold",
                                    isActive
                                        ? "bg-[#0879bd] text-white"
                                        : isDone
                                            ? "bg-[#0EAA2C] text-white"
                                            : "bg-slate-300 text-slate-500",
                                ].join(" ")}
                            >
                                {step.id}
                            </div>

                            <p
                                className={[
                                    "mt-4 text-center text-[11px] font-semibold",
                                    isActive
                                        ? "text-[#0879bd]"
                                        : isDone
                                            ? "text-[#0EAA2C]"
                                            : "text-slate-400",
                                ].join(" ")}
                            >
                                {step.label}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
