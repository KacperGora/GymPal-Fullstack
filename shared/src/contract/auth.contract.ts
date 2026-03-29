export interface AuthResponseUser {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  hasProfile?: boolean;
  role: "ADMIN" | "TRAINER" | "CLIENT";
}

export interface LoginResponse {
  user: AuthResponseUser;
  accessToken: string;
}

export interface RegisterResponse {
  user: AuthResponseUser;
  accessToken: string;
}
