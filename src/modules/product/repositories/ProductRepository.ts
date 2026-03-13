import { prisma } from "@/database/prisma";

type CreateProductData = {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  price: number;
  stock?: number;
  minStock?: number;
  variations?: string[];
  sizes?: string[];
  tenantId: string;
  storeId: string;
  categoryId?: string;
};

type UpdateProductData = Partial<Omit<CreateProductData, "tenantId">>;

export class ProductRepository {
  async create(data: CreateProductData) {
    return prisma.product.create({
      data: {
        ...data,
        price: data.price,
        variations: data.variations ?? [],
        sizes: data.sizes ?? [],
      },
    });
  }

  async findById(id: string, tenantId: string) {
    return prisma.product.findFirst({
      where: { id, tenantId },
      include: { store: true, category: true },
    });
  }

  async findBySlug(slug: string, storeId: string, tenantId: string) {
    return prisma.product.findFirst({
      where: { slug, storeId, tenantId },
    });
  }

  async findManyByStore(
    storeId: string,
    tenantId: string,
    opts?: { q?: string; page?: number; limit?: number; lowStock?: boolean }
  ) {
    const page = opts?.page ?? 1;
    const limit = opts?.limit ?? 50;
    const skip = (page - 1) * limit;
    const where: {
      storeId: string;
      tenantId: string;
      OR?: object[];
      AND?: object[];
    } = {
      storeId,
      tenantId,
    };
    if (opts?.q?.trim()) {
      where.OR = [
        { name: { contains: opts.q, mode: "insensitive" } },
        { description: { contains: opts.q, mode: "insensitive" } },
      ];
    }
    if (opts?.lowStock) {
      const lowStockIds = await prisma.$queryRaw<{ id: string }[]>`
        SELECT id FROM "Product"
        WHERE "storeId" = ${storeId} AND "tenantId" = ${tenantId}
        AND "minStock" > 0 AND stock < "minStock"
      `;
      const ids = lowStockIds.map((r) => r.id);
      if (ids.length === 0) {
        return {
          products: [],
          pagination: { page, limit, total: 0 },
        };
      }
      (where as { id?: { in: string[] } }).id = { in: ids };
    }
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);
    return { products, pagination: { page, limit, total } };
  }

  async update(id: string, tenantId: string, data: UpdateProductData) {
    const product = await this.findById(id, tenantId);
    if (!product) return null;
    return prisma.product.update({
      where: { id },
      data,
    });
  }

  async delete(id: string, tenantId: string) {
    const product = await this.findById(id, tenantId);
    if (!product) return null;
    return prisma.product.delete({
      where: { id },
    });
  }
}
