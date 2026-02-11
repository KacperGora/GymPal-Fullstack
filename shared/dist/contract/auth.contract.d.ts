export interface AuthResponseUser {
    id: number;
    email: string;
    firstName?: string;
    lastName?: string;
    hasProfile?: boolean;
}
export interface LoginResponse {
    user: AuthResponseUser;
    accessToken: string;
}
export interface RegisterResponse {
    user: AuthResponseUser;
    accessToken: string;
}
export declare const AuthError: {
    readonly INVALID_CREDENTIALS: "INVALID_CREDENTIALS";
    readonly USER_EXISTS: "USER_EXISTS";
    readonly WEAK_PASSWORD: "WEAK_PASSWORD";
    readonly TOKEN_EXPIRED: "TOKEN_EXPIRED";
};
export type AuthErrorCode = (typeof AuthError)[keyof typeof AuthError];
