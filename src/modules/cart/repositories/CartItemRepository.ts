import { prisma } from "@/database/prisma";

type AddItemData = {
  cartId: string;
  productId: string;
  quantity: number;
};

export class CartItemRepository {
  async add(data: AddItemData) {
    const existing = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: { cartId: data.cartId, productId: data.productId },
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
      data,
      include: { product: true },
    });
  }

  async updateQuantity(cartId: string, productId: string, quantity: number) {
    const item = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: { cartId, productId },
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

  async remove(cartId: string, productId: string) {
    const item = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: { cartId, productId },
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
}
