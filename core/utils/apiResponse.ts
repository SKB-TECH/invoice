import axios from "axios";

/**
 * Normalise les réponses API ({ data: T } ou T direct).
 */
export function unwrapApiData<T>(body: unknown): T {
    if (
        body !== null &&
        typeof body === "object" &&
        "data" in body &&
        (body as { data: unknown }).data !== undefined
    ) {
        return (body as { data: T }).data;
    }

    return body as T;
}

export function getAxiosErrorMessage(error: unknown, fallback: string): string {
    if (axios.isAxiosError(error)) {
        const data = error.response?.data;
        if (
            data &&
            typeof data === "object" &&
            "message" in data &&
            typeof (data as { message: unknown }).message === "string"
        ) {
            return (data as { message: string }).message;
        }
        if (data && typeof data === "object" && "messages" in data) {
            const messages = (data as { messages: unknown }).messages;
            if (
                messages &&
                typeof messages === "object" &&
                "error" in messages &&
                typeof (messages as { error: unknown }).error === "string"
            ) {
                return (messages as { error: string }).error;
            }
        }
        if (error.message) return error.message;
    }

    if (error instanceof Error) return error.message;

    return fallback;
}
