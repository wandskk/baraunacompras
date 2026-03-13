import { prisma } from "@/database/prisma";

type CreateOrderData = {
  tenantId: string;
  storeId: string;
  customerId?: string;
  total: number;
  status: string;
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
      include: { store: true, customer: true },
    });
  }

  async findById(id: string, tenantId: string) {
    return prisma.order.findFirst({
      where: { id, tenantId },
      include: { store: true, customer: true },
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
      include: { store: true, customer: true },
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
