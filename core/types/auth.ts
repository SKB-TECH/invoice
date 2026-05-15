import type { AuthUser } from "@/core/types/rbac";

export type AccountType = "personal" | "pme" | "corporate";

export type RegisterBasePayload = {
    email: string;
    firstname: string;
    lastname: string;
    phone: string;
    password: string;
    password_confirm: string;
};

export type RegisterPersonalPayload = RegisterBasePayload & {
    type: "personal";
};

export type RegisterBusinessPayload = RegisterBasePayload & {
    company_name: string;
    legal_name: string;
    rccm: string;
    nif: string;
    idnat: string;
    position: string;
    business_sector: string;
    company_size: string;
};

export type RegisterPmePayload = RegisterBusinessPayload & {
    type: "pme";
};

export type RegisterCorporatePayload = RegisterBusinessPayload & {
    type: "corporate";
};

export type RegisterPayload =
    | RegisterPersonalPayload
    | RegisterPmePayload
    | RegisterCorporatePayload;

export type RegisterResponse = {
    message?: string;
    data?: unknown;
};

export type LoginSuccessResponse = {
    mfaRequired: false;
    token: string;
    refreshToken?: string | null;
    user: AuthUser;
    profile?: ApiProfile | null;
    role?: ApiRole | null;
    branch?: ApiBranch | null;
    till?: unknown | null;
    raw?: unknown;
    expiresIn?: number;
};

export type LoginMfaResponse = {
    mfaRequired: true;
    message?: string;
    email?: string;
    raw?: unknown;
};

export type LoginResponse = LoginSuccessResponse | LoginMfaResponse;

export type ApiProfile = Record<string, unknown>;
export type ApiRole = Record<string, unknown>;
export type ApiBranch = Record<string, unknown>;
