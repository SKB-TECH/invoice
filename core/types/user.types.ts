/**
 * Types TypeScript mappés depuis le backend.
 * Les noms de champs correspondent aux colonnes de la base de données.
 */

/** Table: entreprise4_main_users */
export interface BackendUser {
    Id_0: number;
    Date_1: string;
    Status_2: number;
    Account_3: number;
    Creator_4: number;
    Changes_5: string;
    Changer_6: number;
    /** Identifiant de connexion (email) */
    Identifier_7: string;
    /** Rôle par défaut */
    RoleId_9: number;
    Login_10: string;
    Logout_11: string;
}

/** Table: entreprise4_main_profiles */
export interface BackendProfile {
    Id_0: number;
    Date_1: string;
    Status_2: number;
    UserId_7: number;
    Firstname_9: string;
    Lastname_10: string;
    Middlename_11: string;
    Cellphone_12: string;
    /** Email de contact (distinct de l'identifiant de connexion) */
    Email_13: string;
    Language_14: number;
    Gender_15: string;
    Photo_16: string | null;
    Birthday_17: string;
    Position_18: string;
}

/** Permission associée à un rôle */
export interface BackendPermission {
    id: number;
    name: string;
    code: string;
}

/** Rôle enrichi avec ses permissions */
export interface BackendRole {
    id: number;
    name: string;
    desc: string;
    permissions: BackendPermission[];
}

/** Réponse du endpoint POST /auth */
export interface LoginApiResponse {
    status: number;
    message: string;
    token: string;
    user: BackendUser;
    profile: BackendProfile | null;
    role: BackendRole | null;
}

/** Payload pour PUT /users/{id}/profile */
export interface ProfileUpdatePayload {
    firstname?: string;
    lastname?: string;
    middlename?: string;
    cellphone?: string;
    email?: string;
    gender?: string;
    birthday?: string;
    position?: string;
}

/** Payload pour PUT /users/{id}/password */
export interface PasswordChangePayload {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}
