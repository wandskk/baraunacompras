import { prisma } from "@/database/prisma";

export class UserRepository {
  async create(data: {
    email: string;
    name?: string;
    password: string;
    tenantId: string;
  }) {
    return prisma.user.create({
      data,
    });
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: { tenant: true },
    });
  }

  async findById(id: string, tenantId: string) {
    return prisma.user.findFirst({
      where: { id, tenantId },
    });
  }
}
