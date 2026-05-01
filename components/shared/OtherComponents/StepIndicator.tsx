type Step = {
    number: number;
    label: string;
};

type StepIndicatorProps = {
    steps: Step[];
    currentStep: number;
    isSuccess?: boolean;
    onStepClick?: (stepNumber: number) => void;
};

export function StepIndicator({
                                  steps,
                                  currentStep,
                                  isSuccess = false,
                                  onStepClick,
                              }: StepIndicatorProps) {
    return (
        <div className="w-full mb-10 text-[16px]">
            <div className="hidden md:block relative px-4">
                <div
                    className="absolute top-6 left-0 right-0 flex justify-between"
                    style={{ zIndex: 0, paddingLeft: "3.5rem", paddingRight: "3.5rem" }}
                >
                    {steps.map((step, index) => {
                        if (index === steps.length - 1) return null;

                        const lineCompleted = isSuccess || step.number < currentStep;

                        return (
                            <div
                                key={`line-${step.number}`}
                                className={`h-px transition-colors ${
                                    lineCompleted ? "bg-green-500" : "bg-gray-300"
                                }`}
                                style={{ flex: 1 }}
                            />
                        );
                    })}
                </div>

                <div
                    className="relative flex justify-between items-start"
                    style={{ zIndex: 1 }}
                >
                    {steps.map((step) => {
                        const isCompleted = isSuccess || step.number < currentStep;
                        const isCurrent = !isSuccess && step.number === currentStep;
                        const isClickable = !!onStepClick && !isSuccess;

                        return (
                            <button
                                key={step.number}
                                type="button"
                                onClick={() => onStepClick?.(step.number)}
                                disabled={!isClickable}
                                className={`flex flex-col items-center relative ${
                                    isClickable ? "cursor-pointer" : "cursor-default"
                                }`}
                                style={{ width: "110px" }}
                            >
                                <div
                                    className={`flex items-center justify-center w-12 h-12 rounded-full font-semibold text-[16px] transition-all relative ${
                                        isCompleted
                                            ? "bg-green-500 text-white"
                                            : isCurrent
                                                ? "bg-[#0066b2] text-white"
                                                : "bg-gray-300 text-gray-600"
                                    }`}
                                    style={{ zIndex: 2 }}
                                >
                                    {step.number}
                                </div>

                                <p
                                    className={`mt-3 text-[16px] text-center leading-tight transition-colors ${
                                        isCompleted
                                            ? "text-green-600 font-medium"
                                            : isCurrent
                                                ? "text-[#0066b2] font-medium"
                                                : "text-gray-500"
                                    }`}
                                >
                                    {step.label}
                                </p>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="flex md:hidden items-start justify-between px-1">
                {steps.map((step, index) => {
                    const isCompleted = isSuccess || step.number < currentStep;
                    const isCurrent = !isSuccess && step.number === currentStep;
                    const prevStepCompleted =
                        index > 0 &&
                        (isSuccess || steps[index - 1].number < currentStep);

                    const isClickable = !!onStepClick && !isSuccess;

                    return (
                        <div
                            key={step.number}
                            className="flex flex-col items-center"
                            style={{ flex: "1 1 0", minWidth: 0 }}
                        >
                            <div className="flex items-center w-full">
                                {index > 0 && (
                                    <div
                                        className={`flex-1 h-px transition-colors ${
                                            prevStepCompleted ? "bg-green-500" : "bg-gray-300"
                                        }`}
                                    />
                                )}

                                <button
                                    type="button"
                                    onClick={() => onStepClick?.(step.number)}
                                    disabled={!isClickable}
                                    className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold text-xs flex-shrink-0 transition-all ${
                                        isCompleted
                                            ? "bg-green-500 text-white"
                                            : isCurrent
                                                ? "bg-[#0066b2] text-white"
                                                : "bg-gray-300 text-gray-600"
                                    } ${isClickable ? "cursor-pointer" : "cursor-default"}`}
                                >
                                    {step.number}
                                </button>

                                {index < steps.length - 1 && (
                                    <div
                                        className={`flex-1 h-px transition-colors ${
                                            isCompleted ? "bg-green-500" : "bg-gray-300"
                                        }`}
                                    />
                                )}
                            </div>

                            <p
                                className={`mt-2 text-[9px] text-center leading-tight transition-colors px-1 ${
                                    isCompleted
                                        ? "text-green-600 font-medium"
                                        : isCurrent
                                            ? "text-[#0066b2] font-medium"
                                            : "text-gray-500"
                                }`}
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
