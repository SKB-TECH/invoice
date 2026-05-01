import { getCookie, setCookie, deleteCookie } from './cookies';

const TOKEN_KEY = 'accessToken';
const ALT_TOKEN_KEY = 'auth_token';

function getLocalStorageToken(): string | null {
    if (typeof window === 'undefined') return null;
    return (
        window.localStorage.getItem(TOKEN_KEY) ??
        window.localStorage.getItem(ALT_TOKEN_KEY)
    );
}

export const tokenStore = {
    get(): string | null {
        return (
            getCookie(TOKEN_KEY) ??
            getCookie(ALT_TOKEN_KEY) ??
            getLocalStorageToken()
        );
    },

    set(token: string, days = 1): void {
        setCookie(TOKEN_KEY, token, days);
        setCookie(ALT_TOKEN_KEY, token, days);
        if (typeof window !== 'undefined') {
            window.localStorage.setItem(TOKEN_KEY, token);
            window.localStorage.setItem(ALT_TOKEN_KEY, token);
        }
    },

    clear(): void {
        deleteCookie(TOKEN_KEY);
        deleteCookie(ALT_TOKEN_KEY);
        if (typeof window !== 'undefined') {
            window.localStorage.removeItem(TOKEN_KEY);
            window.localStorage.removeItem(ALT_TOKEN_KEY);
        }
    },
};
