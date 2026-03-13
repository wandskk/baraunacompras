import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  tenantId: z.string().min(1),
});

export const updateCategorySchema = createCategorySchema
  .partial()
  .omit({ tenantId: true });

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
