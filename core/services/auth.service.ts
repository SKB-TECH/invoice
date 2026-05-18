import { tokenStore } from "@/core/utils/tokenStore";
import { setCookie, getCookie, deleteCookie } from "@/core/utils/cookies";
import type {
    AuthUser,
    Permission,
    RolePermission,
} from "@/core/types/rbac";
import { api } from "@/core/services/api";
import { mfaStore } from "@/core/utils/mfaStore";
import type {
    AuthChangePasswordPayload,
    RegisterPayload,
    RegisterResponse,
} from "@/core/types/auth";

const AUTH_USER_KEY = "auth_user";
const USER_COOKIE = "bank_user";
const AUTH_EXPIRES_KEY = "accessToken_expires_at";
const AUTH_REFRESH_TOKEN_KEY = "refresh_token";
const AUTH_ACCESS_TOKEN_KEY = "auth_access_token";

const DEFAULT_TOKEN_EXPIRE_SECONDS = 24 * 60 * 60;

function getCookieOrLocalStorage(name: string): string | null {
    const cookie = getCookie(name);
    if (cookie) return cookie;

    if (typeof window === "undefined") return null;

    return window.localStorage.getItem(name);
}

function setCookieAndLocalStorage(
    name: string,
    value: string,
    days = 1
): void {
    setCookie(name, value, days);

    if (typeof window !== "undefined") {
        window.localStorage.setItem(name, value);
    }
}

function deleteCookieAndLocalStorage(name: string): void {
    deleteCookie(name);

    if (typeof window !== "undefined") {
        window.localStorage.removeItem(name);
    }
}

interface JwtPayload {
    exp?: number;
    [key: string]: unknown;
}

interface ApiPermission {
    Id_0?: string | number;
    Module_7?: string;
    Resource_8?: string;
    Action_9?: string;
    LongCode_10?: string;
    ShortCode_11?: string;
    Description_12?: string;

    id?: string | number;
    module?: string;
    resource?: string;
    action?: string;
    longCode?: string;
    shortCode?: string;
    description?: string;
}

export interface ApiUserData {
    code?: string;
    challenge_id?: string;
    expires_in?: number;
    resend_in?: number;
    status?: string | number;
    message?: string;

    /**
     * Nouveau retour Loras
     */
    access_token?: string;
    refresh_token?: string;

    user?: {
        id?: string | number;
        account_id?: string | number;
        email?: string;
        firstname?: string;
        lastname?: string;
        phone?: string;
        userType?: string;
        permissions?: Permission[];
        modules?: unknown[];
        createdAt?: string;
        updatedAt?: string;

        /**
         * Ancien format conservé au cas où
         */
        Id_0?: string | number;
        Identifier_7?: string;
        RoleId_9?: string | number;
        CountryCode_20?: string;
    };

    profile?: {
        Firstname_9?: string;
        Lastname_10?: string;
        Cellphone_12?: string;
        Email_13?: string;
        Photo_16?: string | null;
    };

    role?: {
        id?: string | number;
        name?: string;
        desc?: string;
        permissions?: ApiPermission[];
    } | null;

    branch?: unknown;
    till?: unknown;
}

export function parseJwtPayload(token: string): JwtPayload | null {
    try {
        const [, payload] = token.split(".");

        if (!payload) return null;

        const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));

        return JSON.parse(
            decodeURIComponent(
                decoded
                    .split("")
                    .map(
                        (c) =>
                            `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`
                    )
                    .join("")
            )
        ) as JwtPayload;
    } catch (error) {
        console.warn("Unable to parse JWT payload", error);
        return null;
    }
}

function getTokenExpiration(token: string): number | null {
    const payload = parseJwtPayload(token);

    if (!payload?.exp) return null;

    return payload.exp * 1000;
}

export function mapApiUser(data: ApiUserData): AuthUser {
    const userData = data?.user || {};
    const profileData = data?.profile || {};
    const roleData = data?.role || null;

    const rolePermissions: RolePermission[] = (
        roleData?.permissions || []
    ).map((p, index) => ({
        id: String(p?.id ?? p?.Id_0 ?? index + 1),
        module: String(p?.module ?? p?.Module_7 ?? ""),
        resource: String(p?.resource ?? p?.Resource_8 ?? ""),
        action: String(p?.action ?? p?.Action_9 ?? ""),
        longCode: String(p?.longCode ?? p?.LongCode_10 ?? ""),
        shortCode: String(p?.shortCode ?? p?.ShortCode_11 ?? ""),
        description: String(
            p?.description ?? p?.Description_12 ?? ""
        ),
    }));

    const rolePermissionsCodes: Permission[] = rolePermissions
        .map((p) => p.longCode || p.shortCode)
        .filter(Boolean) as Permission[];

    const directUserPermissions = Array.isArray(userData?.permissions)
        ? userData.permissions
        : [];

    const permissions: Permission[] = Array.from(
        new Set([...directUserPermissions, ...rolePermissionsCodes])
    );

    const firstName = String(
        userData?.firstname ??
        profileData?.Firstname_9 ??
        userData?.Identifier_7 ??
        ""
    );

    const lastName = String(
        userData?.lastname ?? profileData?.Lastname_10 ?? ""
    );

    const fullName = `${firstName} ${lastName}`.trim();

    return {
        id: String(userData?.id ?? userData?.Id_0 ?? ""),
        username: String(
            userData?.email ??
            userData?.Identifier_7 ??
            ""
        ),
        name: fullName || String(userData?.email ?? ""),
        email: String(
            userData?.email ??
            profileData?.Email_13 ??
            userData?.Identifier_7 ??
            ""
        ),
        phone: String(
            userData?.phone ??
            profileData?.Cellphone_12 ??
            ""
        ),
        countryCode: String(userData?.CountryCode_20 ?? ""),
        roleId: String(
            roleData?.id ??
            userData?.RoleId_9 ??
            ""
        ),
        role: {
            id: String(roleData?.id ?? userData?.RoleId_9 ?? ""),
            name: String(roleData?.name ?? userData?.userType ?? ""),
            desc: String(roleData?.desc ?? ""),
            permissions: rolePermissions,
        },
        permissions,
        photo: profileData?.Photo_16 ?? null,
        branch: data?.branch ?? null,
        accountId: String(userData?.account_id ?? ""),
        userType: String(userData?.userType ?? ""),
    } as AuthUser;
}

export const authService = {
    async register(payload: RegisterPayload): Promise<RegisterResponse> {
        const formData = new FormData();

        formData.append("email", payload.email);
        formData.append("firstname", payload.firstname);
        formData.append("lastname", payload.lastname);
        formData.append("phone", payload.phone);
        formData.append("password", payload.password);
        formData.append("password_confirm", payload.password_confirm);
        formData.append("type", payload.type);

        if (payload.type === "pme" || payload.type === "corporate") {
            formData.append("company_name", payload.company_name);
            formData.append("legal_name", payload.legal_name);
            formData.append("rccm", payload.rccm);
            formData.append("nif", payload.nif);
            formData.append("idnat", payload.idnat);
            formData.append("position", payload.position);
            formData.append("business_sector", payload.business_sector);
            formData.append("company_size", payload.company_size);

        }

        const { data } = await api.post<RegisterResponse>(
            "/auth/register",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        if (Number(data?.status) >= 400) {
            throw new Error(data?.message || "Erreur lors de l'inscription.");
        }

        return data;
    },
    async login(identifier: string, password: string) {
        const { data } = await api.post<ApiUserData>("/auth/login", {
            identifier,
            password,
        });

        if (Number(data?.status) >= 400) {
            throw new Error(data?.message || "Identifiants invalides");
        }

        if (
            data?.code === "MFA_REQUIRED" ||
            data?.challenge_id ||
            Number(data?.status) === 202
        ) {
            if (data?.challenge_id) {
                mfaStore.set(
                    data.challenge_id,
                    data.resend_in,
                    data.expires_in
                );
            }

            return {
                mfaRequired: true as const,
                challengeId: data.challenge_id ?? "",
                resendIn: data.resend_in,
                expiresIn: data.expires_in,
                raw: data,
            };
        }

        /**
         * Loras retourne access_token et non token
         */
        if (!data?.access_token) {
            throw new Error("Token introuvable dans la réponse API.");
        }

        const user = mapApiUser(data);

        return {
            mfaRequired: false as const,
            token: data.access_token,
            refreshToken: data.refresh_token ?? null,
            user,
            profile: data.profile ?? null,
            role: data.role ?? null,
            branch: data.branch ?? null,
            till: data.till ?? null,
            expiresIn: data.expires_in,
            raw: data,
        };
    },
    saveSession(
        token: string,
        user: AuthUser,
        expiresInSeconds = DEFAULT_TOKEN_EXPIRE_SECONDS,
        refreshToken?: string | null
    ) {
        const tokenExpiresAt = getTokenExpiration(token);
        const effectiveExpiresAt = tokenExpiresAt ?? Date.now() + expiresInSeconds * 1000;
        const effectiveSeconds = Math.max(Math.floor((effectiveExpiresAt - Date.now()) / 1000), 0);
        const expiresInDays = effectiveSeconds / (24 * 60 * 60);
        tokenStore.set(token, expiresInDays);
        setCookieAndLocalStorage(
            AUTH_ACCESS_TOKEN_KEY,
            token,
            expiresInDays
        );
        const userJson = JSON.stringify(user);
        setCookieAndLocalStorage(AUTH_USER_KEY, userJson, expiresInDays);
        setCookieAndLocalStorage(USER_COOKIE, userJson, expiresInDays);
        setCookieAndLocalStorage(
            AUTH_EXPIRES_KEY,
            String(effectiveExpiresAt),
            expiresInDays
        );

        if (refreshToken) {
            setCookieAndLocalStorage(
                AUTH_REFRESH_TOKEN_KEY,
                refreshToken,
                7
            );
        }

        if (process.env.NODE_ENV === "development") {
            console.log("SAVE SESSION DEBUG:", {
                tokenStored: !!tokenStore.get(),
                authAccessTokenStored:
                    !!getCookieOrLocalStorage(AUTH_ACCESS_TOKEN_KEY),
                userStored: !!getCookieOrLocalStorage(AUTH_USER_KEY),
                expiresStored: !!getCookieOrLocalStorage(AUTH_EXPIRES_KEY),
                refreshStored:
                    !!getCookieOrLocalStorage(AUTH_REFRESH_TOKEN_KEY),
            });
        }
    },

    restoreSession() {
        const token =
            tokenStore.get() ??
            getCookieOrLocalStorage(AUTH_ACCESS_TOKEN_KEY);

        const userRaw =
            getCookieOrLocalStorage(AUTH_USER_KEY) ??
            getCookieOrLocalStorage(USER_COOKIE);

        const expiresRaw = getCookieOrLocalStorage(AUTH_EXPIRES_KEY);
        const refreshToken = getCookieOrLocalStorage(AUTH_REFRESH_TOKEN_KEY);

        if (process.env.NODE_ENV === "development") {
            console.log("RESTORE SESSION DEBUG:", {
                tokenExists: !!token,
                tokenStoreExists: !!tokenStore.get(),
                authAccessTokenExists:
                    !!getCookieOrLocalStorage(AUTH_ACCESS_TOKEN_KEY),
                userExists: !!userRaw,
                expiresExists: !!expiresRaw,
                refreshTokenExists: !!refreshToken,
                expiresRaw,
            });
        }

        if (!token || !userRaw) {
            authService.clearSession();
            return null;
        }

        const payloadExpiresAt = getTokenExpiration(token);

        if (payloadExpiresAt && payloadExpiresAt <= Date.now()) {
            authService.clearSession();
            return null;
        }

        if (expiresRaw) {
            const expiresAt = Number(expiresRaw);

            if (Number.isNaN(expiresAt) || expiresAt <= Date.now()) {
                authService.clearSession();
                return null;
            }
        }

        try {
            const user = JSON.parse(userRaw) as AuthUser;

            if (!user.id || !user.username) {
                authService.clearSession();
                return null;
            }
            if (!tokenStore.get()) {
                const payloadExpiresAt = getTokenExpiration(token);
                const remainingSeconds = payloadExpiresAt
                    ? Math.max(
                        Math.floor((payloadExpiresAt - Date.now()) / 1000),
                        0
                    )
                    : DEFAULT_TOKEN_EXPIRE_SECONDS;

                tokenStore.set(token, remainingSeconds / (24 * 60 * 60));
            }

            return {
                token,
                refreshToken,
                user,
                profile: null,
                role: null,
                branch: null,
                till: null,
                raw: null,
            };
        } catch (error) {
            console.error("Erreur lors de la restauration de session:", error);
            authService.clearSession();
            return null;
        }
    },

    async uploadAvatar(file: File): Promise<string> {
        const fd = new FormData();
        fd.append("avatar", file);

        const { data } = await api.post<unknown>("/auth/avatar", fd);

        let url: string | undefined;

        if (data !== null && typeof data === "object") {
            const d = data as Record<string, unknown>;
            const inner = d.data;
            if (
                inner !== null &&
                typeof inner === "object" &&
                typeof (inner as { url?: unknown }).url === "string"
            ) {
                url = (inner as { url: string }).url;
            }
            if (!url && typeof d.url === "string") {
                url = d.url;
            }
        }

        if (!url?.trim()) {
            const msg =
                data !== null &&
                typeof data === "object" &&
                typeof (data as { message?: unknown }).message === "string"
                    ? (data as { message: string }).message
                    : "Échec du téléversement.";
            throw new Error(msg);
        }

        return url.trim();
    },

    async changePassword(
        payload: AuthChangePasswordPayload,
    ): Promise<string> {
        const { data } = await api.post<{
            status?: string | number;
            message?: string;
        }>("/auth/password", payload);

        const msg =
            data?.message && typeof data.message === "string"
                ? data.message
                : "Mot de passe mis à jour";

        if (
            data?.status !== undefined &&
            data.status !== "" &&
            String(data.status).toLowerCase() !== "success"
        ) {
            throw new Error(msg);
        }

        return msg;
    },

    mergeSessionPhoto(relativePhotoUrl: string): AuthUser | null {
        const token =
            tokenStore.get() ??
            getCookieOrLocalStorage(AUTH_ACCESS_TOKEN_KEY);

        const userRaw =
            getCookieOrLocalStorage(AUTH_USER_KEY) ??
            getCookieOrLocalStorage(USER_COOKIE);

        if (!token || !userRaw) return null;

        let user: AuthUser;
        try {
            user = JSON.parse(userRaw) as AuthUser;
        } catch {
            return null;
        }

        const nextUser: AuthUser = {
            ...user,
            photo: relativePhotoUrl,
        };

        const expiresRaw = getCookieOrLocalStorage(AUTH_EXPIRES_KEY);
        const expiresAt = expiresRaw ? Number(expiresRaw) : Number.NaN;
        const expiresInSeconds =
            Number.isFinite(expiresAt) && expiresAt > Date.now()
                ? Math.max(60, Math.floor((expiresAt - Date.now()) / 1000))
                : DEFAULT_TOKEN_EXPIRE_SECONDS;

        const refreshToken =
            getCookieOrLocalStorage(AUTH_REFRESH_TOKEN_KEY);

        authService.saveSession(
            token,
            nextUser,
            expiresInSeconds,
            refreshToken ?? undefined,
        );

        return nextUser;
    },

    clearSession() {
        tokenStore.clear();
        deleteCookieAndLocalStorage(AUTH_USER_KEY);
        deleteCookieAndLocalStorage(USER_COOKIE);
        deleteCookieAndLocalStorage(AUTH_EXPIRES_KEY);
        deleteCookieAndLocalStorage(AUTH_REFRESH_TOKEN_KEY);
        deleteCookieAndLocalStorage(AUTH_ACCESS_TOKEN_KEY);
    },

    async logout() {
        authService.clearSession();
    },
};
