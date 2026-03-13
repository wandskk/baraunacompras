import { CartService } from "../services";
import { createCartSchema, addCartItemSchema, updateCartItemSchema } from "../schemas";

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

  async addItem(cartId: string, tenantId: string, body: unknown) {
    const input = addCartItemSchema.parse(body);
    return this.service.addItem(cartId, tenantId, input);
  }

  async updateItemQuantity(cartId: string, tenantId: string, productId: string, body: unknown) {
    const input = updateCartItemSchema.parse(body);
    return this.service.updateItemQuantity(cartId, tenantId, productId, input);
  }

  async removeItem(cartId: string, tenantId: string, productId: string) {
    return this.service.removeItem(cartId, tenantId, productId);
  }

  async delete(id: string, tenantId: string) {
    return this.service.delete(id, tenantId);
  }
}
