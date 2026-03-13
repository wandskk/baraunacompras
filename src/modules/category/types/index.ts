import type { Category } from "@prisma/client";

export type CategoryWithProducts = Category & {
  products: { id: string; name: string }[];
};
