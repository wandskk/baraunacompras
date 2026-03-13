import { CategoryService } from "../services";
import { createCategorySchema, updateCategorySchema } from "../schemas";

export class CategoryController {
  private service = new CategoryService();

  async create(body: unknown) {
    const input = createCategorySchema.parse(body);
    return this.service.create(input);
  }

  async getById(id: string, tenantId: string) {
    return this.service.getById(id, tenantId);
  }

  async listByTenant(tenantId: string) {
    return this.service.listByTenant(tenantId);
  }

  async update(id: string, tenantId: string, body: unknown) {
    const input = updateCategorySchema.parse(body);
    return this.service.update(id, tenantId, input);
  }

  async delete(id: string, tenantId: string) {
    return this.service.delete(id, tenantId);
  }
}
