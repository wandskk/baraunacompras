import type { Product } from "@prisma/client";

export type ProductWithRelations = Product & {
  store: { id: string; name: string; slug: string };
  category: { id: string; name: string; slug: string } | null;
};
