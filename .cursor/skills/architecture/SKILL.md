You are responsible for enforcing the architectural structure of this SaaS platform.

This project is a multi-tenant SaaS platform that allows local businesses to create and manage their own online stores.

The system must always follow a modular architecture and strict separation of concerns.

Architecture layers:

Application Layer
Handles use cases and orchestration.

Domain Layer
Contains business rules and domain entities.

Infrastructure Layer
Handles database access and external integrations.

Interface Layer
Handles controllers, routes, and API communication.

Presentation Layer
Handles UI components and pages.

Rules:

Never mix database access, business rules, and UI logic.

Controllers must remain thin and only orchestrate requests.

Repositories handle persistence only.

Services handle business logic.

Use cases orchestrate complex workflows.

Project structure:

src/

app/
components/
modules/
services/
lib/
types/
config/
database/

Every business domain must live inside the modules folder.

Modules must contain:

controllers
services
repositories
schemas
types
useCases

All generated code must follow this architecture.
