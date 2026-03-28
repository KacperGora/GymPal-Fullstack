export enum Role {
  ADMIN = "ADMIN",
  TRAINER = "TRAINER",
  CLIENT = "CLIENT",
}

export interface JwtPayload {
  sub: number;
  email: string;
  role: Role;
  subscriptionStatus?: string | null;
}
