import { StoreRepository } from "../repositories";
import type { CreateStoreInput, UpdateStoreInput } from "../schemas";

export class StoreService {
  private repository = new StoreRepository();

  async create(input: CreateStoreInput) {
    const existing = await this.repository.findBySlug(input.slug, input.tenantId);
    if (existing) {
      throw new Error("Store with this slug already exists");
    }
    return this.repository.create(input);
  }

  async getById(id: string, tenantId: string) {
    const store = await this.repository.findById(id, tenantId);
    if (!store) {
      throw new Error("Store not found");
    }
    return store;
  }

  async getBySlug(slug: string, tenantId: string) {
    const store = await this.repository.findBySlug(slug, tenantId);
    if (!store) {
      throw new Error("Store not found");
    }
    return store;
  }

  async listByTenant(tenantId: string) {
    return this.repository.findManyByTenant(tenantId);
  }

  async update(id: string, tenantId: string, input: UpdateStoreInput) {
    await this.getById(id, tenantId);
    if (input.slug) {
      const existing = await this.repository.findBySlug(input.slug, tenantId);
      if (existing && existing.id !== id) {
        throw new Error("Store with this slug already exists");
      }
    }
    return this.repository.update(id, tenantId, input);
  }

  async delete(id: string, tenantId: string) {
    await this.getById(id, tenantId);
    return this.repository.delete(id, tenantId);
  }
}
