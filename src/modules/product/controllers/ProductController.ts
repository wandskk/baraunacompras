import { ProductService } from "../services";
import { createProductSchema, updateProductSchema } from "../schemas";

export class ProductController {
  private service = new ProductService();

  async create(body: unknown) {
    const input = createProductSchema.parse(body);
    return this.service.create(input);
  }

  async getById(id: string, tenantId: string) {
    return this.service.getById(id, tenantId);
  }

  async listByStore(storeId: string, tenantId: string) {
    return this.service.listByStore(storeId, tenantId);
  }

  async update(id: string, tenantId: string, body: unknown) {
    const input = updateProductSchema.parse(body);
    return this.service.update(id, tenantId, input);
  }

  async delete(id: string, tenantId: string) {
    return this.service.delete(id, tenantId);
  }
}
