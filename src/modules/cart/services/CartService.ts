import { CartRepository } from "../repositories";
import type { CreateCartInput } from "../schemas";

export class CartService {
  private repository = new CartRepository();

  async create(input: CreateCartInput) {
    return this.repository.create(input);
  }

  async getById(id: string, tenantId: string) {
    const cart = await this.repository.findById(id, tenantId);
    if (!cart) {
      throw new Error("Cart not found");
    }
    return cart;
  }

  async listByStore(storeId: string, tenantId: string) {
    return this.repository.findManyByStore(storeId, tenantId);
  }

  async delete(id: string, tenantId: string) {
    await this.getById(id, tenantId);
    return this.repository.delete(id, tenantId);
  }
}
