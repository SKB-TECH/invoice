import { getCookie, setCookie, deleteCookie } from '@/core/utils/cookies';

const MFA_CHALLENGE_KEY = 'mfa_challenge_id';
const MFA_RESEND_IN_KEY = 'mfa_resend_in';
const MFA_EXPIRES_IN_KEY = 'mfa_expires_in';

export const mfaStore = {
    set(challengeId: string, resendIn?: number, expiresIn?: number) {
        setCookie(MFA_CHALLENGE_KEY, challengeId, 1);

        if (resendIn !== undefined) {
            setCookie(MFA_RESEND_IN_KEY, String(resendIn), 1);
        }

        if (expiresIn !== undefined) {
            setCookie(MFA_EXPIRES_IN_KEY, String(expiresIn), 1);
        }
    },

    getChallengeId() {
        return getCookie(MFA_CHALLENGE_KEY);
    },

    getResendIn() {
        return Number(getCookie(MFA_RESEND_IN_KEY) || 60);
    },

    clear() {
        deleteCookie(MFA_CHALLENGE_KEY);
        deleteCookie(MFA_RESEND_IN_KEY);
        deleteCookie(MFA_EXPIRES_IN_KEY);
    },
};
