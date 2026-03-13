import type { User } from "@prisma/client";

export type AuthUser = Omit<User, "password"> & {
  password?: string;
};

export type AuthSession = {
  userId: string;
  tenantId: string;
  email: string;
};
