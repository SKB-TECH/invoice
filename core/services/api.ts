import axios, { type InternalAxiosRequestConfig } from 'axios';
import { ENV } from '@/core/constants/env';
import { tokenStore } from '@/core/utils/tokenStore';
import { authEvents } from '@/core/utils/authEvents';

declare module 'axios' {
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

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    if (config.skipAuth) {
    } else {
        const token = tokenStore.get();
        if (token) {
            config.headers = config.headers ?? {};
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    const isFormData =
        typeof FormData !== 'undefined' && config.data instanceof FormData;
    if (isFormData) {
        config.maxBodyLength = Infinity;
        config.maxContentLength = Infinity;
        const hdrs = config.headers;
        if (hdrs != null && typeof hdrs === 'object') {
            if (typeof hdrs.delete === 'function') {
                hdrs.delete('Content-Type');
                hdrs.delete('content-type');
            } else {
                const rec = hdrs as Record<string, unknown>;
                delete rec['Content-Type'];
                delete rec['content-type'];
            }
        }
    }
    return config;
});

api.interceptors.response.use(
    (res) => res,
    (error) => {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
            tokenStore.clear();
            authEvents.emitLogout();
        }
        return Promise.reject(error);
    }
);
