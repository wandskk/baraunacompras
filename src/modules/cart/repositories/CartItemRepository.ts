import { prisma } from "@/database/prisma";

type AddItemData = {
  cartId: string;
  productId: string;
  quantity: number;
  variation?: string;
  size?: string;
};

export class CartItemRepository {
  private norm(v?: string) {
    return (v ?? "").trim() || "";
  }

  async add(data: AddItemData) {
    const variation = this.norm(data.variation);
    const size = this.norm(data.size);
    const existing = await prisma.cartItem.findUnique({
      where: {
        cartId_productId_variation_size: {
          cartId: data.cartId,
          productId: data.productId,
          variation,
          size,
        },
      },
    });
    if (existing) {
      return prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + data.quantity },
        include: { product: true },
      });
    }
    return prisma.cartItem.create({
      data: {
        cartId: data.cartId,
        productId: data.productId,
        quantity: data.quantity,
        variation,
        size,
      },
      include: { product: true },
    });
  }

  async findById(itemId: string, cartId: string) {
    return prisma.cartItem.findFirst({
      where: { id: itemId, cartId },
      include: { product: true },
    });
  }

  async updateQuantityByItemId(itemId: string, cartId: string, quantity: number) {
    const item = await this.findById(itemId, cartId);
    if (!item) return null;
    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: item.id } });
      return null;
    }
    return prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity },
      include: { product: true },
    });
  }

  async removeByItemId(itemId: string, cartId: string) {
    const item = await this.findById(itemId, cartId);
    if (!item) return null;
    return prisma.cartItem.delete({
      where: { id: item.id },
    });
  }

  async updateQuantity(cartId: string, productId: string, variation: string, size: string, quantity: number) {
    const v = this.norm(variation);
    const s = this.norm(size);
    const item = await prisma.cartItem.findUnique({
      where: {
        cartId_productId_variation_size: { cartId, productId, variation: v, size: s },
      },
    });
    if (!item) return null;
    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: item.id } });
      return null;
    }
    return prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity },
      include: { product: true },
    });
  }

  async remove(cartId: string, productId: string, variation: string, size: string) {
    const v = this.norm(variation);
    const s = this.norm(size);
    const item = await prisma.cartItem.findUnique({
      where: {
        cartId_productId_variation_size: { cartId, productId, variation: v, size: s },
      },
    });
    if (!item) return null;
    return prisma.cartItem.delete({
      where: { id: item.id },
    });
  }

  async findByCart(cartId: string) {
    return prisma.cartItem.findMany({
      where: { cartId },
      include: { product: true },
    });
  }

  async findByCartAndProduct(cartId: string, productId: string, variation?: string, size?: string) {
    const v = this.norm(variation);
    const s = this.norm(size);
    return prisma.cartItem.findUnique({
      where: {
        cartId_productId_variation_size: { cartId, productId, variation: v, size: s },
      },
    });
  }
}
