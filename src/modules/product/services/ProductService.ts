import { ProductRepository } from "../repositories";
import type { CreateProductInput, UpdateProductInput } from "../schemas";

export class ProductService {
  private repository = new ProductRepository();

  async create(input: CreateProductInput) {
    const existing = await this.repository.findBySlug(
      input.slug,
      input.storeId,
      input.tenantId,
    );
    if (existing) {
      throw new Error("Product with this slug already exists in this store");
    }
    return this.repository.create(input);
  }

  async getById(id: string, tenantId: string) {
    const product = await this.repository.findById(id, tenantId);
    if (!product) {
      throw new Error("Product not found");
    }
    return product;
  }

  async listByStore(
    storeId: string,
    tenantId: string,
    opts?: { q?: string; page?: number; limit?: number }
  ) {
    return this.repository.findManyByStore(storeId, tenantId, opts);
  }

  async update(id: string, tenantId: string, input: UpdateProductInput) {
    await this.getById(id, tenantId);
    if (input.slug && input.storeId) {
      const existing = await this.repository.findBySlug(
        input.slug,
        input.storeId,
        tenantId,
      );
      if (existing && existing.id !== id) {
        throw new Error("Product with this slug already exists in this store");
      }
    }
    return this.repository.update(id, tenantId, input);
  }

  async delete(id: string, tenantId: string) {
    await this.getById(id, tenantId);
    return this.repository.delete(id, tenantId);
  }
}
