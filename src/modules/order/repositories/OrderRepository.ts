import { prisma } from "@/database/prisma";

type CreateOrderData = {
  tenantId: string;
  storeId: string;
  customerId?: string;
  total: number;
  status: string;
};

type OrderItemData = {
  productId: string;
  quantity: number;
  price: number;
};

type UpdateOrderData = {
  status?: string;
  customerId?: string | null;
};

export class OrderRepository {
  async create(data: CreateOrderData) {
    return prisma.order.create({
      data: {
        ...data,
        total: data.total,
      },
      include: { store: true, customer: true, items: true },
    });
  }

  async createWithItems(
    data: CreateOrderData,
    items: OrderItemData[]
  ) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          ...data,
          total: data.total,
        },
      });
      if (items.length > 0) {
        await tx.orderItem.createMany({
          data: items.map((i) => ({
            orderId: order.id,
            productId: i.productId,
            quantity: i.quantity,
            price: i.price,
          })),
        });
      }
      return tx.order.findUniqueOrThrow({
        where: { id: order.id },
        include: { store: true, customer: true, items: { include: { product: true } } },
      });
    });
  }

  async findById(id: string, tenantId: string) {
    return prisma.order.findFirst({
      where: { id, tenantId },
      include: { store: true, customer: true, items: { include: { product: true } } },
    });
  }

  async findManyByStore(storeId: string, tenantId: string) {
    return prisma.order.findMany({
      where: { storeId, tenantId },
      include: { customer: true },
    });
  }

  async findManyByTenant(tenantId: string) {
    return prisma.order.findMany({
      where: { tenantId },
      include: { store: true, customer: true },
    });
  }

  async update(id: string, tenantId: string, data: UpdateOrderData) {
    const order = await this.findById(id, tenantId);
    if (!order) return null;
    return prisma.order.update({
      where: { id },
      data,
      include: {
        store: true,
        customer: true,
        items: { include: { product: true } },
      },
    });
  }

  async delete(id: string, tenantId: string) {
    const order = await this.findById(id, tenantId);
    if (!order) return null;
    return prisma.order.delete({
      where: { id },
    });
  }
}
