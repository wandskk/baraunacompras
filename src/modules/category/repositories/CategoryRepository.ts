import { prisma } from "@/database/prisma";

type CreateCategoryData = {
  name: string;
  slug: string;
  tenantId: string;
};

type UpdateCategoryData = Partial<Omit<CreateCategoryData, "tenantId">>;

export class CategoryRepository {
  async create(data: CreateCategoryData) {
    return prisma.category.create({
      data,
    });
  }

  async findById(id: string, tenantId: string) {
    return prisma.category.findFirst({
      where: { id, tenantId },
      include: { products: true },
    });
  }

  async findBySlug(slug: string, tenantId: string) {
    return prisma.category.findFirst({
      where: { slug, tenantId },
    });
  }

  async findManyByTenant(tenantId: string) {
    return prisma.category.findMany({
      where: { tenantId },
      include: { products: { select: { id: true, name: true } } },
    });
  }

  async update(id: string, tenantId: string, data: UpdateCategoryData) {
    const category = await this.findById(id, tenantId);
    if (!category) return null;
    return prisma.category.update({
      where: { id },
      data,
    });
  }

  async delete(id: string, tenantId: string) {
    const category = await this.findById(id, tenantId);
    if (!category) return null;
    return prisma.category.delete({
      where: { id },
    });
  }
}
