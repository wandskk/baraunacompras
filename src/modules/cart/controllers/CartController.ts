import { CartService } from "../services";
import { createCartSchema } from "../schemas";

export class CartController {
  private service = new CartService();

  async create(body: unknown) {
    const input = createCartSchema.parse(body);
    return this.service.create(input);
  }

  async getById(id: string, tenantId: string) {
    return this.service.getById(id, tenantId);
  }

  async listByStore(storeId: string, tenantId: string) {
    return this.service.listByStore(storeId, tenantId);
  }

  async delete(id: string, tenantId: string) {
    return this.service.delete(id, tenantId);
  }
}
