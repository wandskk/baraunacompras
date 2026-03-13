import { CartRepository, CartItemRepository } from "../repositories";
import type { CreateCartInput, AddCartItemInput, UpdateCartItemInput } from "../schemas";

export class CartService {
  private repository = new CartRepository();
  private itemRepository = new CartItemRepository();

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

  async addItem(cartId: string, tenantId: string, input: AddCartItemInput) {
    await this.getById(cartId, tenantId);
    return this.itemRepository.add({
      cartId,
      productId: input.productId,
      quantity: input.quantity,
    });
  }

  async updateItemQuantity(cartId: string, tenantId: string, productId: string, input: UpdateCartItemInput) {
    await this.getById(cartId, tenantId);
    const result = await this.itemRepository.updateQuantity(cartId, productId, input.quantity);
    if (!result) return this.getById(cartId, tenantId);
    return this.getById(cartId, tenantId);
  }

  async removeItem(cartId: string, tenantId: string, productId: string) {
    await this.getById(cartId, tenantId);
    await this.itemRepository.remove(cartId, productId);
    return this.getById(cartId, tenantId);
  }

  async delete(id: string, tenantId: string) {
    await this.getById(id, tenantId);
    return this.repository.delete(id, tenantId);
  }
}
