import { CategoryRepository } from "../repositories";
import type { CreateCategoryInput, UpdateCategoryInput } from "../schemas";

export class CategoryService {
  private repository = new CategoryRepository();

  async create(input: CreateCategoryInput) {
    const existing = await this.repository.findBySlug(input.slug, input.tenantId);
    if (existing) {
      throw new Error("Category with this slug already exists");
    }
    return this.repository.create(input);
  }

  async getById(id: string, tenantId: string) {
    const category = await this.repository.findById(id, tenantId);
    if (!category) {
      throw new Error("Category not found");
    }
    return category;
  }

  async listByTenant(tenantId: string) {
    return this.repository.findManyByTenant(tenantId);
  }

  async update(id: string, tenantId: string, input: UpdateCategoryInput) {
    await this.getById(id, tenantId);
    if (input.slug) {
      const existing = await this.repository.findBySlug(input.slug, tenantId);
      if (existing && existing.id !== id) {
        throw new Error("Category with this slug already exists");
      }
    }
    return this.repository.update(id, tenantId, input);
  }

  async delete(id: string, tenantId: string) {
    await this.getById(id, tenantId);
    return this.repository.delete(id, tenantId);
  }
}
