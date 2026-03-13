import { TenantRepository } from "../repositories";
import type { CreateTenantInput, UpdateTenantInput } from "../schemas";

export class TenantService {
  private repository = new TenantRepository();

  async create(input: CreateTenantInput) {
    const existing = await this.repository.findBySlug(input.slug);
    if (existing) {
      throw new Error("Tenant with this slug already exists");
    }
    return this.repository.create(input);
  }

  async getById(id: string) {
    const tenant = await this.repository.findById(id);
    if (!tenant) {
      throw new Error("Tenant not found");
    }
    return tenant;
  }

  async getBySlug(slug: string) {
    const tenant = await this.repository.findBySlug(slug);
    if (!tenant) {
      throw new Error("Tenant not found");
    }
    return tenant;
  }

  async update(id: string, input: UpdateTenantInput) {
    await this.getById(id);
    if (input.slug) {
      const existing = await this.repository.findBySlug(input.slug);
      if (existing && existing.id !== id) {
        throw new Error("Tenant with this slug already exists");
      }
    }
    return this.repository.update(id, input);
  }

  async delete(id: string) {
    await this.getById(id);
    return this.repository.delete(id);
  }
}
