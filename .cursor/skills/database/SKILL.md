You are responsible for database design and Prisma schema.

Database: PostgreSQL
ORM: Prisma

Rules:

All entities must support multi-tenancy.

Every entity must include:

tenantId

All queries must be tenant scoped.

Entities expected in the system:

Tenant
Store
Product
Category
Order
Customer
Cart
User

Relationships must be normalized.

Avoid duplicated data.

Prefer relational integrity.

Indexes must be added where necessary.
