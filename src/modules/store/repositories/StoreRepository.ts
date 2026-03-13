import { prisma } from "@/database/prisma";

type CreateStoreData = {
  name: string;
  slug: string;
  theme?: string;
  logoUrl?: string | null;
  faviconUrl?: string | null;
  description?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  paymentMethods?: string | null;
  deliveryType?: string | null;
  deliveryFee?: number | null;
  deliveryDays?: number | null;
  addressStreet?: string | null;
  addressNumber?: string | null;
  addressComplement?: string | null;
  addressNeighborhood?: string | null;
  addressCity?: string | null;
  addressState?: string | null;
  addressZipCode?: string | null;
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
      include: { tenant: { select: { slug: true } } },
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
      include: { tenant: { select: { slug: true } } },
    });
  }

  async update(id: string, tenantId: string, data: UpdateStoreData) {
    const store = await this.findById(id, tenantId);
    if (!store) return null;
    return prisma.store.update({
      where: { id },
      data,
      include: { tenant: { select: { slug: true } } },
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
