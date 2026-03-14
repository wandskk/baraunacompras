import { prisma } from "@/database/prisma";

type CreateOrderData = {
  tenantId: string;
  storeId: string;
  customerId?: string;
  total: number;
  status: string;
  paymentMethod?: string;
  deliveryType?: string;
  deliveryFee?: number;
  deliveryStreet?: string;
  deliveryNumber?: string;
  deliveryComplement?: string;
  deliveryNeighborhood?: string;
  deliveryCity?: string;
  deliveryState?: string;
  deliveryZipCode?: string;
};

type OrderItemData = {
  productId: string;
  quantity: number;
  price: number;
  variation?: string;
  size?: string;
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
            variation: i.variation ?? "",
            size: i.size ?? "",
          })),
        });

        const byProduct = new Map<string, number>();
        for (const i of items) {
          byProduct.set(i.productId, (byProduct.get(i.productId) ?? 0) + i.quantity);
        }
        for (const [productId, qty] of byProduct) {
          if (qty <= 0) continue;
          const affected = await tx.$executeRaw`
            UPDATE "Product"
            SET stock = stock - ${qty}
            WHERE id = ${productId} AND "tenantId" = ${data.tenantId} AND stock >= ${qty}
          `;
          if (affected === 0) {
            throw new Error("Estoque insuficiente para um ou mais produtos");
          }
        }
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

  async findManyByStore(
    storeId: string,
    tenantId: string,
    opts?: {
      status?: string;
      order?: "asc" | "desc";
      page?: number;
      limit?: number;
      q?: string;
    }
  ) {
    const page = Math.max(1, opts?.page ?? 1);
    const limit = Math.min(50, Math.max(1, opts?.limit ?? 10));
    const skip = (page - 1) * limit;

    const where: Parameters<typeof prisma.order.findMany>[0]["where"] = {
      storeId,
      tenantId,
    };
    if (opts?.status) {
      (where as { status: string }).status = opts.status;
    }
    const q = opts?.q?.trim();
    if (q) {
      (where as { OR?: unknown[] }).OR = [
        { id: { contains: q, mode: "insensitive" } },
        {
          customer: {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
            ],
          },
        },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: opts?.order ?? "desc" },
        skip,
        take: limit,
        include: {
          store: { select: { name: true } },
          customer: true,
          _count: { select: { items: true } },
          items: { include: { product: { select: { name: true } } } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return { orders, pagination: { page, limit, total } };
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

  /** Atualiza status para cancelado e restaura estoque dos produtos. */
  async updateToCancelled(id: string, tenantId: string) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: { id, tenantId },
        include: { store: true, customer: true, items: { include: { product: true } } },
      });
      if (!order) return null;

      await tx.order.update({
        where: { id },
        data: { status: "cancelled" },
      });

      const byProduct = new Map<string, number>();
      for (const item of order.items) {
        byProduct.set(item.productId, (byProduct.get(item.productId) ?? 0) + item.quantity);
      }
      for (const [productId, qty] of byProduct) {
        if (qty <= 0) continue;
        await tx.$executeRaw`
          UPDATE "Product"
          SET stock = stock + ${qty}
          WHERE id = ${productId} AND "tenantId" = ${tenantId}
        `;
      }

      return tx.order.findUniqueOrThrow({
        where: { id },
        include: { store: true, customer: true, items: { include: { product: true } } },
      });
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
