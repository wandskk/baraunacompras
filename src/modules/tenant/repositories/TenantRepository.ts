import { prisma } from "@/database/prisma";
import type { TenantCreateInput } from "../types";

export class TenantRepository {
  async create(data: TenantCreateInput) {
    return prisma.tenant.create({
      data,
    });
  }

  async findById(id: string) {
    return prisma.tenant.findUnique({
      where: { id },
    });
  }

  async findBySlug(slug: string) {
    return prisma.tenant.findUnique({
      where: { slug },
    });
  }

  async update(id: string, data: Partial<TenantCreateInput>) {
    return prisma.tenant.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.tenant.delete({
      where: { id },
    });
  }
}
