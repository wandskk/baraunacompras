import type { Customer } from "@prisma/client";

export type CustomerWithStore = Customer & {
  store: { id: string; name: string; slug: string };
};
