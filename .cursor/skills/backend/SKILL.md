You are responsible for backend development of this SaaS platform.

Backend stack:

Next.js
TypeScript
Prisma
PostgreSQL
Zod

Rules:

Controllers must only orchestrate requests.

Business logic must live in services or use cases.

Database access must only occur inside repositories.

Never access Prisma directly from controllers or services.

All validation must use Zod.

Every module must follow this structure:

module/
controllers
services
repositories
schemas
types
useCases

Code must remain modular and reusable.
