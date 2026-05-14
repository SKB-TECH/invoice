export type AccountType = "personal" | "pme" | "corporate";
type RegisterBasePayload = {
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
    type: "pme" | "corporate";
    company_name: string;
    rccm: string;
    nif: string;
    position: string;
    business_sector: string;
    company_size: string;
    logo?: File | null;
};

export type RegisterPayload =
    | RegisterPersonalPayload
    | RegisterBusinessPayload;

export type RegisterResponse = {
    status: number;
    message: string;
    next_step?: string;
    otp_sent?: boolean;
    user_id?: number;
    account_id?: number;
    role_id?: number;
};

/* =========================================================
 * LOGIN
 * ======================================================= */

export type LoginPayload = {
    identifier: string;
    password: string;
};

export type LoginResponse = {
    status: number;
    message: string;
    code?: string;
    challenge_id?: string;
    expires_in?: number;
    resend_in?: number;
    next_step?: string;
    otp_sent?: boolean;
};

/* =========================================================
 * GENERATE OTP
 * ======================================================= */

export type GenerateOtpPayload = {
    email: string;
};

export type GenerateOtpResponse = {
    status: number;
    message: string;
    otp_sent?: boolean;
    expires_in?: number;
    resend_in?: number;
};

/* =========================================================
 * VERIFY OTP
 * ======================================================= */

export type VerifyOtpPayload = {
    email: string;
    otp: string;
};

export type VerifyOtpResponse = {
    status: number;
    message: string;

    token?: string;
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;

    user?: {
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
        permissions?: Array<{
            Id_0?: string | number;
            Module_7?: string;
            Resource_8?: string;
            Action_9?: string;
            LongCode_10?: string;
            ShortCode_11?: string;
            Description_12?: string;
        }>;
    };

    branch?: unknown;
    till?: unknown;
};
