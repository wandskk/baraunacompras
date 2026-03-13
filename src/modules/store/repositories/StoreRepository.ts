import { prisma } from "@/database/prisma";

type CreateStoreData = {
  name: string;
  slug: string;
  tenantId: string;
};

type UpdateStoreData = Partial<Omit<CreateStoreData, "tenantId">>;

export class StoreRepository {
  async create(data: CreateStoreData) {
    return prisma.store.create({
      data,
    });
  }

  async findById(id: string, tenantId: string) {
    return prisma.store.findFirst({
      where: { id, tenantId },
    });
  }

  async findBySlug(slug: string, tenantId: string) {
    return prisma.store.findFirst({
      where: { slug, tenantId },
    });
  }

  async findManyByTenant(tenantId: string) {
    return prisma.store.findMany({
      where: { tenantId },
    });
  }

  async update(id: string, tenantId: string, data: UpdateStoreData) {
    const store = await this.findById(id, tenantId);
    if (!store) return null;
    return prisma.store.update({
      where: { id },
      data,
    });
  }

  async delete(id: string, tenantId: string) {
    const store = await this.findById(id, tenantId);
    if (!store) return null;
    return prisma.store.delete({
      where: { id },
    });
  }
}
