This SaaS platform must support multiple stores using a multi-tenant architecture.

Each store is a tenant.

Rules:

All data must belong to a tenant.

Database models must include:

tenantId

All queries must filter by tenantId.

Tenants must be isolated from each other.

Stores must have independent:

products
orders
customers
settings

The system must support:

subdomain routing
store-specific branding
store-specific catalog
store-specific orders
