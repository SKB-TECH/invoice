import axios, { type InternalAxiosRequestConfig } from "axios";
import { ENV } from "@/core/constants/env";
import { tokenStore } from "@/core/utils/tokenStore";
import { authEvents } from "@/core/utils/authEvents";

declare module "axios" {
    export interface InternalAxiosRequestConfig {
        skipAuth?: boolean;
    }
}

export const publicApi = axios.create({
    baseURL: ENV.API_URL,
    withCredentials: true,
});

export const api = axios.create({
    baseURL: ENV.API_URL,
    withCredentials: true,
});

function cleanFormDataHeaders(config: InternalAxiosRequestConfig) {
    const isFormData =
        typeof FormData !== "undefined" && config.data instanceof FormData;

    if (isFormData) {
        config.maxBodyLength = Infinity;
        config.maxContentLength = Infinity;

        const headers = config.headers;

        if (headers != null && typeof headers === "object") {
            if (typeof headers.delete === "function") {
                headers.delete("Content-Type");
                headers.delete("content-type");
            } else {
                const record = headers as Record<string, unknown>;
                delete record["Content-Type"];
                delete record["content-type"];
            }
        }
    }

    return config;
}

/* =========================================================
 * PUBLIC API
 * ======================================================= */

publicApi.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        return cleanFormDataHeaders(config);
    }
);

/* =========================================================
 * AUTHENTICATED API
 * ======================================================= */

api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        if (!config.skipAuth) {
            const token = tokenStore.get();

            if (token) {
                config.headers = config.headers ?? {};
                config.headers.Authorization = `Bearer ${token}`;
            }
        }

        return cleanFormDataHeaders(config);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
            tokenStore.clear();
            authEvents.emitLogout();
        }

        return Promise.reject(error);
    }
);
