import type { Cart } from "@prisma/client";

export type CartWithStore = Cart & {
  store: { id: string; name: string; slug: string };
};
