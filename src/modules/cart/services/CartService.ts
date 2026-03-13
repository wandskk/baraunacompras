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

    const variations = (product as { variations?: string[] }).variations ?? [];
    const sizes = (product as { sizes?: string[] }).sizes ?? [];
    const variation = (input.variation ?? "").trim();
    const size = (input.size ?? "").trim();

    if (variations.length > 0 && !variation) {
      throw new Error("Selecione uma variação");
    }
    if (sizes.length > 0 && !size) {
      throw new Error("Selecione um tamanho");
    }
    if (variations.length > 0 && variation && !variations.includes(variation)) {
      throw new Error("Variação inválida");
    }
    if (sizes.length > 0 && size && !sizes.includes(size)) {
      throw new Error("Tamanho inválido");
    }

    const existing = await this.itemRepository.findByCartAndProduct(
      cartId,
      input.productId,
      variation,
      size
    );
    const totalQty = (existing?.quantity ?? 0) + input.quantity;
    if (product.stock < totalQty) {
      throw new Error("Quantidade indisponível em estoque");
    }
    return this.itemRepository.add({
      cartId,
      productId: input.productId,
      quantity: input.quantity,
      variation,
      size,
    });
  }

  async updateItemQuantity(cartId: string, tenantId: string, productId: string, input: UpdateCartItemInput) {
    await this.getById(cartId, tenantId);
    const cart = await this.getById(cartId, tenantId);
    const item = (cart.items ?? []).find((i) => i.productId === productId);
    if (!item) return this.getById(cartId, tenantId);
    const product = await this.productRepository.findById(productId, tenantId);
    if (product && product.stock < input.quantity) {
      throw new Error("Quantidade indisponível em estoque");
    }
    const result = await this.itemRepository.updateQuantity(
      cartId,
      productId,
      (item as { variation?: string }).variation ?? "",
      (item as { size?: string }).size ?? "",
      input.quantity
    );
    if (!result) return this.getById(cartId, tenantId);
    return this.getById(cartId, tenantId);
  }

  async removeItem(cartId: string, tenantId: string, productId: string, variation = "", size = "") {
    await this.getById(cartId, tenantId);
    const cart = await this.getById(cartId, tenantId);
    const item = (cart.items ?? []).find(
      (i) =>
        i.productId === productId &&
        ((i as { variation?: string }).variation ?? "") === variation &&
        ((i as { size?: string }).size ?? "") === size
    );
    if (item) {
      await this.itemRepository.removeByItemId(item.id, cartId);
    }
    return this.getById(cartId, tenantId);
  }

  async updateItemQuantityById(cartId: string, tenantId: string, itemId: string, input: UpdateCartItemInput) {
    await this.getById(cartId, tenantId);
    const item = await this.itemRepository.findById(itemId, cartId);
    if (!item) throw new Error("Item não encontrado");
    const product = await this.productRepository.findById(item.productId, tenantId);
    if (product && product.stock < input.quantity) {
      throw new Error("Quantidade indisponível em estoque");
    }
    const result = await this.itemRepository.updateQuantityByItemId(itemId, cartId, input.quantity);
    if (!result) return this.getById(cartId, tenantId);
    return this.getById(cartId, tenantId);
  }

  async removeItemById(cartId: string, tenantId: string, itemId: string) {
    await this.getById(cartId, tenantId);
    await this.itemRepository.removeByItemId(itemId, cartId);
    return this.getById(cartId, tenantId);
  }

  async delete(id: string, tenantId: string) {
    await this.getById(id, tenantId);
    return this.repository.delete(id, tenantId);
  }
}
