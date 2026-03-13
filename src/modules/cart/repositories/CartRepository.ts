import { prisma } from "@/database/prisma";

type CreateCartData = {
  tenantId: string;
  storeId: string;
};

export class CartRepository {
  async create(data: CreateCartData) {
    return prisma.cart.create({
      data,
      include: { store: true },
    });
  }

  async findById(id: string, tenantId: string) {
    return prisma.cart.findFirst({
      where: { id, tenantId },
      include: { store: true, items: { include: { product: true } } },
    });
  }

  async findManyByStore(storeId: string, tenantId: string) {
    return prisma.cart.findMany({
      where: { storeId, tenantId },
      include: { store: true },
    });
  }

  async delete(id: string, tenantId: string) {
    const cart = await this.findById(id, tenantId);
    if (!cart) return null;
    return prisma.cart.delete({
      where: { id },
    });
  }
}
