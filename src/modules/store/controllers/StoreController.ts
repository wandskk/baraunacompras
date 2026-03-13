import { StoreService } from "../services";
import { createStoreSchema, updateStoreSchema } from "../schemas";

export class StoreController {
  private service = new StoreService();

  async create(body: unknown) {
    const input = createStoreSchema.parse(body);
    return this.service.create(input);
  }

  async getById(id: string, tenantId: string) {
    return this.service.getById(id, tenantId);
  }

  async getBySlug(slug: string, tenantId: string) {
    return this.service.getBySlug(slug, tenantId);
  }

  async listByTenant(tenantId: string) {
    return this.service.listByTenant(tenantId);
  }

  async update(id: string, tenantId: string, body: unknown) {
    const input = updateStoreSchema.parse(body);
    return this.service.update(id, tenantId, input);
  }

  async delete(id: string, tenantId: string) {
    return this.service.delete(id, tenantId);
  }
}
