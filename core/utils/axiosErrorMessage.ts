import axios from "axios";
import type { ApiErrorBody } from "@/core/types/fourniture";

export function getAxiosErrorMessage(
    error: unknown,
    fallback: string
): string {
    if (axios.isAxiosError(error)) {
        const data = error.response?.data as ApiErrorBody | undefined;
        if (data?.message && typeof data.message === "string") {
            return data.message;
        }
        if (error.message) return error.message;
    }
    if (error instanceof Error && error.message) return error.message;
    return fallback;
}
