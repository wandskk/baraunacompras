import { prisma } from "@/database/prisma";

type CreateCustomerData = {
  email: string;
  name?: string;
  tenantId: string;
  storeId: string;
};

type UpdateCustomerData = Partial<Omit<CreateCustomerData, "tenantId" | "storeId">>;

export class CustomerRepository {
  async create(data: CreateCustomerData) {
    return prisma.customer.create({
      data,
    });
  }

  async findById(id: string, tenantId: string) {
    return prisma.customer.findFirst({
      where: { id, tenantId },
    });
  }

  async findManyByStore(storeId: string, tenantId: string) {
    return prisma.customer.findMany({
      where: { storeId, tenantId },
    });
  }

  async findByEmail(email: string, storeId: string, tenantId: string) {
    return prisma.customer.findFirst({
      where: { email, storeId, tenantId },
    });
  }

  async update(id: string, tenantId: string, data: UpdateCustomerData) {
    const customer = await this.findById(id, tenantId);
    if (!customer) return null;
    return prisma.customer.update({
      where: { id },
      data,
    });
  }

  async delete(id: string, tenantId: string) {
    const customer = await this.findById(id, tenantId);
    if (!customer) return null;
    return prisma.customer.delete({
      where: { id },
    });
  }
}
