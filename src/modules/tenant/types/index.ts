import type { Tenant } from "@prisma/client";

export type TenantCreateInput = Omit<Tenant, "id" | "createdAt" | "updatedAt">;
export type TenantUpdateInput = Partial<Omit<Tenant, "id" | "createdAt" | "updatedAt">>;
