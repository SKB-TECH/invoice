export interface VerifyOtpPayload {
    challenge_id: string;
    otp: string;
}

export interface ResendOtpPayload {
    challenge_id: string;
}

export interface VerifyOtpResponse {
    token: string;
    user: {
        id: number;
        login: string;
        email: string;
    };
}

export interface ApiResponse<T> {
    code?: number;
    status?: string;
    message?: string;
    data?: T;
    token?: string;
    user?: T extends VerifyOtpResponse ? VerifyOtpResponse['user'] : unknown;
}
