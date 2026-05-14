import {AuthUser} from "@/core/types/rbac";

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

export type RegisterPmePayload = RegisterBasePayload & {
    type: "pme";
    company_name: string;
    rccm: string;
    nif: string;
    position: string;
    business_sector: string;
    company_size: string;
};

export type RegisterCorporatePayload = RegisterBasePayload & {
    type: "corporate";

    legal_name: string;
    idnat: string;
    rccm: string;
    nif: string;
    position: string;
    business_sector: string;
    company_size: string;
};

export type RegisterPayload =
    | RegisterPersonalPayload
    | RegisterPmePayload
    | RegisterCorporatePayload;

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
