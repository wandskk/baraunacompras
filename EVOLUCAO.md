# Evolução - Barauna Compras SaaS

Guia de desenvolvimento contínuo para tornar o SaaS mais robusto e completo.

---

## Regras gerais

- Consultar `.cursor/skills/` antes de criar arquivos
- Verificar existência para evitar duplicação
- Seguir arquitetura limpa e estrutura de módulos
- Código em inglês, tipos estritos, sem comentários

---

## Fase 7: Robustez e Segurança

| # | Item | Descrição | Prioridade |
|---|------|-----------|------------|
| 7.1 | **Autenticação** | ✅ JWT em cookie httpOnly (Web Crypto, Edge-compatível) | Alta |
| 7.2 | **Middleware** | ✅ Proteger `/dashboard` e `/api/tenants/*` | Alta |
| 7.3 | **Hash de senha** | ✅ bcrypt (compatível com SHA-256 legado) | Alta |
| 7.4 | **Rate limiting** | Limitar requisições por IP em APIs públicas | Média |
| 7.5 | **Tratamento de erros** | Handler global e mensagens padronizadas | Média |
| 7.6 | **Validação server-side** | ✅ Zod em rotas + params + apiErrorResponse | Alta |

---

## Fase 8: Carrinho e Pedidos completos

| # | Item | Descrição | Prioridade |
|---|------|-----------|------------|
| 8.1 | **CartItem (Prisma)** | ✅ Modelo `productId`, `quantity`, `cartId` | Alta |
| 8.2 | **OrderItem (Prisma)** | ✅ Modelo `productId`, `quantity`, `price`, `orderId` | Alta |
| 8.3 | **API Cart** | ✅ POST/PATCH/DELETE items em `/cart/[cartId]/items` | Alta |
| 8.4 | **Checkout** | ✅ `checkoutFromCart` com cartId cria Order + OrderItems | Alta |
| 8.5 | **UI Carrinho** | Página `/loja/[slug]/carrinho` com itens e totais | Alta |
| 8.6 | **Persistência do carrinho** | Cookie ou `localStorage` por sessão/visitante | Média |

---

## Fase 9: Produto e catálogo

| # | Item | Descrição | Prioridade |
|---|------|-----------|------------|
| 9.1 | **Descrição do produto** | Campo `description` (texto longo) em Product | Média |
| 9.2 | **Imagem do produto** | Campo `imageUrl` ou upload via S3/storage | Média |
| 9.3 | **Estoque** | Campo `stock` e controle de disponibilidade | Média |
| 9.4 | **Múltiplas imagens** | Modelo `ProductImage` para galeria | Baixa |
| 9.5 | **Produtos por categoria** | Filtro na loja: `/loja/[slug]?categoria=x` | Média |
| 9.6 | **Busca de produtos** | Campo de busca na loja e no dashboard | Média |
| 9.7 | **Paginação** | Listagens com `page` e `limit` (schema já existe em `lib/schemas`) | Média |

---

## Fase 10: Configurações da loja

| # | Item | Descrição | Prioridade |
|---|------|-----------|------------|
| 10.1 | **Store settings** | Logo, favicon, descrição, contato | Média |
| 10.2 | **Formas de pagamento** | Configurar métodos (PIX, cartão, boleto) | Média |
| 10.3 | **Envio/entrega** | Regras de frete, prazos, valores | Média |
| 10.4 | **Políticas** | Termos, privacidade, troca e devolução | Baixa |
| 10.5 | **Temas customizados** | Permitir hex/cor personalizada além dos pré-fabricados | Baixa |

---

## Fase 11: Gestão de pedidos

| # | Item | Descrição | Prioridade |
|---|------|-----------|------------|
| 11.1 | **Detalhe do pedido** | Página com OrderItems e histórico | Alta |
| 11.2 | **Alterar status** | Fluxo visual: Pendente → Confirmado → Enviado → Entregue | Alta |
| 11.3 | **Notificações** | Email ao confirmar/enviar pedido (Resend, SendGrid) | Média |
| 11.4 | **Exportar pedidos** | CSV/Excel para lojista | Baixa |
| 11.5 | **Rastreio** | Campo `trackingCode` e link de rastreio | Baixa |

---

## Fase 12: Múltiplos usuários (tenant)

| # | Item | Descrição | Prioridade |
|---|------|-----------|------------|
| 12.1 | **Convite de usuários** | Admin convida email para acessar o tenant | Média |
| 12.2 | **Roles** | Admin, Editor, Visualizador por tenant | Média |
| 12.3 | **Lista de usuários** | CRUD de usuários do tenant no dashboard | Média |
| 12.4 | **Permissões** | Middleware/guard por role nas ações | Média |

---

## Fase 13: Cliente e loja pública

| # | Item | Descrição | Prioridade |
|---|------|-----------|------------|
| 13.1 | **Perfil do cliente** | Histórico de pedidos para cliente logado | Média |
| 13.2 | **Login de cliente** | Auth opcional na loja (email/senha ou link mágico) | Baixa |
| 13.3 | **Subdomínios** | `loja.seudominio.com` em vez de `/loja/slug` | Baixa |
| 13.4 | **SEO** | Meta tags, Open Graph, structured data | Média |
| 13.5 | **PWA** | Service worker para instalação no celular | Baixa |

---

## Fase 14: Relatórios e analytics

| # | Item | Descrição | Prioridade |
|---|------|-----------|------------|
| 14.1 | **Dashboard básico** | Resumo: pedidos, receita, produtos mais vendidos | Média |
| 14.2 | **Gráficos** | Vendas ao longo do tempo (Recharts, Chart.js) | Baixa |
| 14.3 | **Relatório de estoque** | Produtos com baixo estoque | Baixa |

---

## Fase 15: Infraestrutura e deploy

| # | Item | Descrição | Prioridade |
|---|------|-----------|------------|
| 15.1 | **Variáveis de ambiente** | Documentar `.env.example` | Alta |
| 15.2 | **CI/CD** | GitHub Actions para build e deploy | Média |
| 15.3 | **Monitoramento** | Logs, Sentry para erros | Média |
| 15.4 | **Backup** | Estratégia de backup do banco | Média |
| 15.5 | **Testes** | Unitários e E2E (Vitest, Playwright) | Média |

---

## Ordem sugerida de implementação

1. **Prioridade alta:** Fase 7 (Segurança), Fase 8 (Carrinho/Pedidos)
2. **Prioridade média:** Fase 9 (Produto), Fase 10 (Config), Fase 11 (Pedidos)
3. **Prioridade baixa:** Fase 12–15 conforme demanda

---

## Schema Prisma pendente (referência)

```prisma
// Exemplo CartItem
model CartItem {
  id        String   @id @default(cuid())
  cartId    String
  productId String
  quantity  Int      @default(1)
  cart      Cart     @relation(...)
  product   Product  @relation(...)
}

// Exemplo OrderItem
model OrderItem {
  id        String   @id @default(cuid())
  orderId   String
  productId String
  quantity  Int
  price     Decimal
  order     Order    @relation(...)
  product   Product  @relation(...)
}
```

---

## Checklist antes de cada implementação

- [ ] Ler skill relevante (architecture, backend, frontend, database)
- [ ] Verificar se o módulo/arquivo já existe
- [ ] Seguir estrutura: `modules/[dominio]/{controllers,services,repositories,schemas,types,useCases}`
- [ ] Usar Tailwind para estilos
- [ ] Atualizar este arquivo ao concluir cada item
