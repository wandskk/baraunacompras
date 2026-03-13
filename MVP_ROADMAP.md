# MVP Roadmap - Barauna Compras SaaS

SaaS multi-tenant para lojas locais criarem e gerenciarem lojas online.

---

## Princípios de Desenvolvimento

- **Consultar skills** em `.cursor/skills/` antes de criar qualquer arquivo
- **Verificar existência** antes de criar (evitar duplicação)
- **Arquitetura limpa**: Application, Domain, Infrastructure, Interface, Presentation
- **Multi-tenant**: todas as entidades com `tenantId`, queries sempre escopadas
- **Tailwind CSS**: base para temas pré-fabricados futuros (cor da lojinha do cliente)

---

## Estado Atual do Projeto

| Área | Status | Observações |
|------|--------|-------------|
| **Database/Prisma** | ✅ Estruturado | Tenant, User, Store, Category, Product, Order, Customer, Cart |
| **Schemas Zod** | ✅ Implementados | auth, tenant, store, category, product, order, cart |
| **Backend (módulos)** | ✅ Parcial | Controllers, Services, Repositories, UseCases em maioria dos módulos |
| **API Routes** | ✅ Completo | auth, tenants, stores, categories, products, orders, customers, cart |
| **Frontend** | ⚠️ Inicial | Apenas `layout.tsx` e `page.tsx`, Tailwind configurado |
| **Tailwind** | ✅ Configurado | Tema base com CSS variables para temas futuros |

---

## Etapas do MVP (em ordem sugerida)

### **Fase 1: Infraestrutura e Base**

| # | Etapa | Descrição | Arquivos principais |
|---|-------|-----------|---------------------|
| 1.1 | **Tailwind CSS** | Instalar e configurar Tailwind | `tailwind.config.ts`, `postcss.config.js`, `src/app/globals.css` |
| 1.2 | **Tema base** | CSS variables para cores (preparar temas futuros) | `globals.css`, tokens de cor |
| 1.3 | **Layout raiz** | Layout com Tailwind, fontes, estrutura base | `src/app/layout.tsx` |

---

### **Fase 2: Schemas e Validações**

| # | Etapa | Descrição | Observação |
|---|-------|-----------|------------|
| 2.1 | **Revisar schemas** | Garantir que todos os schemas Zod cobrem os fluxos do MVP | Schemas já existem em cada módulo |
| 2.2 | **Schema Customer** | Criar schema para Customer (criar/atualizar) | Verificar `src/modules/order` – Customer pode precisar de módulo próprio |
| 2.3 | **Schemas de query** | Schemas para listagem (paginação, filtros) se necessário | Opcional para MVP inicial |

---

### **Fase 3: Backend (API)**

| # | Etapa | Descrição | Rotas a criar |
|---|-------|-----------|---------------|
| 3.1 | **API Stores** | CRUD Store | `/api/tenants/[tenantId]/stores` ou similar |
| 3.2 | **API Categories** | CRUD Category | `/api/tenants/[tenantId]/categories` |
| 3.3 | **API Products** | CRUD Product | `/api/stores/[storeId]/products` |
| 3.4 | **API Orders** | CRUD Order | `/api/stores/[storeId]/orders` |
| 3.5 | **API Customers** | CRUD Customer | `/api/stores/[storeId]/customers` |
| 3.6 | **API Cart** | Create + itens | `/api/stores/[storeId]/cart` |

**Regra:** Sempre usar controllers existentes. Consultar `src/modules/[modulo]/controllers` antes de criar rotas.

---

### **Fase 4: Frontend - Painel Admin (Tenant/Store)**

| # | Etapa | Descrição | Estrutura |
|---|-------|-----------|-----------|
| 4.1 | **Auth UI** | Login e Registro | `(auth)/login`, `(auth)/register` |
| 4.2 | **Dashboard Tenant** | Lista de lojas, criar loja | `(dashboard)/` ou `(admin)/` |
| 4.3 | **Gestão Store** | Editar loja, configurações básicas | `(dashboard)/stores/[id]` |
| 4.4 | **Gestão Categories** | CRUD categorias da loja | `(dashboard)/stores/[id]/categories` |
| 4.5 | **Gestão Products** | CRUD produtos | `(dashboard)/stores/[id]/products` |
| 4.6 | **Gestão Orders** | Listar e atualizar pedidos | `(dashboard)/stores/[id]/orders` |

**Componentes:** Criar em `src/components/`, seguir estrutura modular. Componentes apresentacionais.

---

### **Fase 5: Frontend - Loja Pública (Cliente)**

| # | Etapa | Descrição | Observação |
|---|-------|-----------|-------------|
| 5.1 | **Roteamento por store** | Subdomínio ou path: `/[storeSlug]` | Conforme skill multi-tenant |
| 5.2 | **Home da loja** | Listagem de produtos/categorias | `(store)/[storeSlug]/page.tsx` |
| 5.3 | **Página produto** | Detalhe do produto | `(store)/[storeSlug]/products/[slug]` |
| 5.4 | **Carrinho** | Adicionar, ver, remover itens | Depende de Cart API + CartItem (verificar schema) |
| 5.5 | **Checkout simplificado** | Finalizar pedido | Order + Customer |

---

### **Fase 6: Ajustes Finais MVP**

| # | Etapa | Descrição |
|---|-------|-----------|
| 6.1 | **Customer module** | Módulo completo se Customer não existir |
| 6.2 | **CartItem no Prisma** | Verificar se Cart tem itens (produtos no carrinho) |
| 6.3 | **Tema placeholder** | 1 tema de exemplo via CSS variables (Tailwind) |

---

## Checklist antes de criar qualquer arquivo

1. [ ] Verificar se o arquivo já existe em `src/`
2. [ ] Consultar `.cursor/skills/` relevante (architecture, backend, frontend, database, multi-tenant, code-style)
3. [ ] Seguir estrutura: `modules/[dominio]/{controllers,services,repositories,schemas,types,useCases}`
4. [ ] Usar Tailwind para estilos (não Sass)
5. [ ] Código em inglês, sem comentários, tipos estritos

---

## Estrutura de pastas (referência)

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Rotas de autenticação
│   ├── (dashboard)/        # Painel admin/tenant
│   ├── (store)/            # Loja pública [storeSlug]
│   └── api/                # API routes
├── components/             # Componentes reutilizáveis
├── modules/                # Domínios de negócio
│   └── [module]/
│       ├── controllers
│       ├── services
│       ├── repositories
│       ├── schemas
│       ├── types
│       └── useCases
├── lib/                    # Utilitários
├── types/                  # Tipos globais
├── config/                 # Configurações
└── database/               # Prisma client
```

---

## Pontos de atenção (schema atual)

1. **Product** – `z.coerce.number()` aplicado para price
2. **Cart** não tem `CartItem` – carrinho pode precisar de itens (produto + quantidade)
3. **Order** não tem `OrderItem` – pedido pode precisar de itens (produto + quantidade + preço)
4. **Customer** – módulo completo implementado

Para MVP mínimo, pode-se começar com Order/Cart sem itens e evoluir depois.

---

**Próxima etapa sugerida:** Fase 4 – Frontend Admin (Auth UI, Dashboard, gestão de lojas).
