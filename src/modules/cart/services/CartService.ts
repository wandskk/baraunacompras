import { CartRepository, CartItemRepository } from "../repositories";
import { ProductRepository } from "@/modules/product/repositories/ProductRepository";
import type { CreateCartInput, AddCartItemInput, UpdateCartItemInput } from "../schemas";

export class CartService {
  private repository = new CartRepository();
  private itemRepository = new CartItemRepository();
  private productRepository = new ProductRepository();

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
    const cart = await this.getById(cartId, tenantId);
    const product = await this.productRepository.findById(input.productId, tenantId);
    if (!product) throw new Error("Produto não encontrado");
    if (product.storeId !== cart.storeId) throw new Error("Produto não pertence à loja do carrinho");
    const existing = await this.itemRepository.findByCartAndProduct(cartId, input.productId);
    const totalQty = (existing?.quantity ?? 0) + input.quantity;
    if (product.stock < totalQty) {
      throw new Error("Quantidade indisponível em estoque");
    }
    return this.itemRepository.add({
      cartId,
      productId: input.productId,
      quantity: input.quantity,
    });
  }

  async updateItemQuantity(cartId: string, tenantId: string, productId: string, input: UpdateCartItemInput) {
    await this.getById(cartId, tenantId);
    const product = await this.productRepository.findById(productId, tenantId);
    if (product && product.stock < input.quantity) {
      throw new Error("Quantidade indisponível em estoque");
    }
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
