export const AuthError = {
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  USER_EXISTS: "USER_EXISTS",
  WEAK_PASSWORD: "WEAK_PASSWORD",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
} as const;

export type AuthErrorCode = (typeof AuthError)[keyof typeof AuthError];
