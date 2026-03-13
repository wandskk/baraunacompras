import type { Store } from "@prisma/client";

export type StoreWithTenant = Store & {
  tenant: { id: string; name: string; slug: string };
};
