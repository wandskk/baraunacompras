import { prisma } from "@/database/prisma";

type CreateProductData = {
  name: string;
  slug: string;
  price: number;
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

  async findManyByStore(storeId: string, tenantId: string) {
    return prisma.product.findMany({
      where: { storeId, tenantId },
      include: { category: true },
    });
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
