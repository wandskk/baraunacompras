import type { Order } from "@prisma/client";

export type OrderWithRelations = Order & {
  store: { id: string; name: string };
  customer: { id: string; email: string; name: string | null } | null;
};
