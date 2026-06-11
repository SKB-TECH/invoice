'use client';

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from 'react';

import { tokenStore } from '@/core/utils/tokenStore';
import { getCookie, setCookie, deleteCookie } from '@/core/utils/cookies';
import { authEvents } from '@/core/utils/authEvents';

import type {
    BackendUser,
    BackendProfile,
} from '@/core/types/user.types';

const COOKIE_USER = 'bank_user';
const LEGACY_COOKIE_USER = 'dgi_user';
const AUTH_COOKIE_USER = 'auth_user';
const COOKIE_PROFILE = 'dgi_profile';
const AUTH_EXPIRES_KEY = 'accessToken_expires_at';

const AUTH_STORAGE_KEYS = [
    COOKIE_USER,
    LEGACY_COOKIE_USER,
    AUTH_COOKIE_USER,
    COOKIE_PROFILE,
    AUTH_EXPIRES_KEY,
];

interface AppContextValue {
    token: string | null;
    user: BackendUser | null;
    profile: BackendProfile | null;
    isAuthenticated: boolean;

    login: (
        token: string,
        user: BackendUser,
        profile?: BackendProfile | null,
        expiresInSeconds?: number
    ) => void;

    logout: () => void;
    setProfile: (profile: BackendProfile | null) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

function isBrowser() {
    return typeof window !== 'undefined';
}

function getStoredValue(key: string): string | null {
    const cookieValue = getCookie(key);
    if (cookieValue) return cookieValue;

    if (!isBrowser()) return null;

    return window.localStorage.getItem(key);
}

function safeParse<T>(key: string): T | null {
    const raw = getStoredValue(key);
    if (!raw) return null;

    try {
        return JSON.parse(raw) as T;
    } catch {
        return null;
    }
}

function safeParseFirst<T>(keys: string[]): T | null {
    for (const key of keys) {
        const value = safeParse<T>(key);
        if (value) return value;
    }

    return null;
}

function setStoredValue(name: string, value: string, days: number) {
    setCookie(name, value, days);

    if (isBrowser()) {
        window.localStorage.setItem(name, value);
    }
}

function removeStoredValue(name: string) {
    deleteCookie(name);

    if (isBrowser()) {
        window.localStorage.removeItem(name);
    }
}

function clearAuthStorage() {
    tokenStore.clear();
    AUTH_STORAGE_KEYS.forEach(removeStoredValue);
}

function getTokenExpiration(expiresInSeconds: number) {
    return {
        expiresInDays: expiresInSeconds / (24 * 60 * 60),
        expiresAt: Date.now() + expiresInSeconds * 1000,
    };
}

type AppSessionState = {
    token: string;
    user: BackendUser;
    profile: BackendProfile | null;
};

function readInitialSession(): AppSessionState | null {
    const token = tokenStore.get();
    const expiresAt = Number(getStoredValue(AUTH_EXPIRES_KEY));

    const user = safeParseFirst<BackendUser>([
        COOKIE_USER,
        AUTH_COOKIE_USER,
        LEGACY_COOKIE_USER,
    ]);
    const profile = safeParse<BackendProfile>(COOKIE_PROFILE);

    const isValid =
        Boolean(token && user && expiresAt && !Number.isNaN(expiresAt)) &&
        expiresAt > Date.now();

    if (!isValid || !token || !user) {
        return null;
    }

    return {
        token,
        user,
        profile,
    };
}

export function AppProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<AppSessionState | null>(() =>
        readInitialSession()
    );

    const token = session?.token ?? null;
    const user = session?.user ?? null;
    const profile = session?.profile ?? null;

    const logout = useCallback(() => {
        clearAuthStorage();
        setSession(null);
    }, []);

    const login = useCallback(
        (
            token: string,
            user: BackendUser,
            profile: BackendProfile | null = null,
            expiresInSeconds = 24 * 60 * 60
        ) => {
            const { expiresInDays, expiresAt } =
                getTokenExpiration(expiresInSeconds);

            tokenStore.set(token, expiresInDays);

            setStoredValue(COOKIE_USER, JSON.stringify(user), expiresInDays);
            setStoredValue(AUTH_EXPIRES_KEY, String(expiresAt), expiresInDays);

            if (profile) {
                setStoredValue(COOKIE_PROFILE, JSON.stringify(profile), expiresInDays);
            } else {
                removeStoredValue(COOKIE_PROFILE);
            }

            setSession({
                token,
                user,
                profile,
            });
        },
        []
    );

    const setProfile = useCallback((profile: BackendProfile | null) => {
        if (profile) {
            setStoredValue(COOKIE_PROFILE, JSON.stringify(profile), 1);
        } else {
            removeStoredValue(COOKIE_PROFILE);
        }

        setSession((prev) =>
            prev
                ? {
                    ...prev,
                    profile,
                }
                : prev
        );
    }, []);

    useEffect(() => {
        return authEvents.onLogout(() => {
            logout();
        });
    }, [logout]);

    return (
        <AppContext.Provider
            value={{
                token,
                user,
                profile,
                isAuthenticated: Boolean(token),
                login,
                logout,
                setProfile,
            }}
        >
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used inside AppProvider');
    }
    return context;
}
