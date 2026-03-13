import { TenantService } from "../services";
import { createTenantSchema, updateTenantSchema } from "../schemas";

export class TenantController {
  private service = new TenantService();

  async create(body: unknown) {
    const input = createTenantSchema.parse(body);
    return this.service.create(input);
  }

  async getById(id: string) {
    return this.service.getById(id);
  }

  async getBySlug(slug: string) {
    return this.service.getBySlug(slug);
  }

  async update(id: string, body: unknown) {
    const input = updateTenantSchema.parse(body);
    return this.service.update(id, input);
  }

  async delete(id: string) {
    return this.service.delete(id);
  }
}
