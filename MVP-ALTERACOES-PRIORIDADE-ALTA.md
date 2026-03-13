# MVP - Alterações de Prioridade Alta

Controle de implementação das melhorias para deixar o MVP pronto para prospectar clientes.

---

## Visão geral

| Fase | Itens | Concluídos | Status |
|------|-------|------------|--------|
| 10 - Configurações | 3 | 3 | ✅ Concluído |
| 11 - Gestão pedidos | 3 | 3 | ✅ Concluído |
| Dashboard lojista | 1 | 1 | ✅ Concluído |

---

## Fase 10: Configurações da loja

### 10.1 Store settings ✅
| Campo | Descrição | Status |
|-------|-----------|--------|
| logoUrl | URL da logo da loja | ✅ |
| faviconUrl | URL do favicon | ✅ |
| description | Descrição/texto da loja | ✅ |
| contactEmail | Email de contato | ✅ |
| contactPhone | Telefone/WhatsApp | ✅ |

**Arquivos:**
- [x] `prisma/schema.prisma` - Campos em Store
- [x] `src/modules/store/schemas` - Validação
- [x] `src/app/(dashboard)/dashboard/stores/[storeId]/page.tsx` - UI edição
- [x] `src/app/(store)/loja/[tenantSlug]` - Logo no header, descrição + WhatsApp na home

---


---

### 10.2 Formas de pagamento ✅
| Item | Descrição | Status |
|------|-----------|--------|
| Modelo | Store.paymentMethods (PIX, cartão, boleto, dinheiro, retirada) | ✅ |
| UI | Checkboxes no dashboard | ✅ |
| Checkout | Exibir métodos disponíveis | ✅ |

### 10.3 Envio/entrega ✅
| Item | Descrição | Status |
|------|-----------|--------|
| Modelo | Store: deliveryType, deliveryFee, deliveryDays | ✅ |
| Retirada | Opção "Apenas retirada" | ✅ |
| Entrega | Valor fixo, prazo em dias | ✅ |
| Dashboard | Configurar entrega | ✅ |

**Nota:** Endereço no checkout fica para fase posterior.

---

## Fase 11: Gestão de pedidos

### 11.1 Detalhe do pedido ✅
| Item | Descrição | Status |
|------|-----------|--------|
| API | GET /orders/[orderId] | ✅ |
| Página | /dashboard/stores/[storeId]/orders/[orderId] | ✅ |
| Conteúdo | OrderItems, customer, total, status | ✅ |
| Lista | Link para detalhe em cada pedido | ✅ |

**Arquivos:**
- [x] API GET já existia
- [x] `src/app/(dashboard)/dashboard/stores/[storeId]/orders/[orderId]/page.tsx`
- [x] Lista com links

---

### 11.2 Alterar status ✅
| Item | Descrição | Status |
|------|-----------|--------|
| API | PATCH /orders/[orderId] - status | ✅ |
| UI | Botões: Confirmar, Marcar enviado, Marcar entregue, Cancelar | ✅ |

**Arquivos:**
- [x] API PATCH já existia
- [x] Página detalhe: controles de status
- [x] OrderRepository.update - inclui items no retorno

---

### 11.3 Notificações por email ✅
| Item | Descrição | Status |
|------|-----------|--------|
| Serviço | Resend | ✅ |
| Eventos | Confirmação pedido, Status (confirmado/enviado/entregue) | ✅ |
| Template | Email HTML simples | ✅ |
| ENV | RESEND_API_KEY, EMAIL_FROM | ✅ |

**Arquivos:**
- [x] `src/lib/email.ts` - Cliente Resend
- [x] `src/modules/order/services` - Disparo async (não bloqueia)
- [x] `.env.example` - Variáveis

---

## Dashboard do lojista

### Resumo e ações principais ✅
| Item | Descrição | Status |
|------|-----------|--------|
| Resumo | Pedidos pendentes, receita mês, produtos com baixo estoque | ✅ |
| Ações | Links: ver pedidos, gerenciar, produtos | ✅ |
| Por loja | Cards na dashboard + resumo na página da loja | ✅ |

**Arquivos:**
- [x] `src/app/(dashboard)/dashboard/page.tsx` - Resumo por loja
- [x] `src/app/(dashboard)/dashboard/stores/[storeId]/page.tsx` - Resumo da loja
- [x] `src/app/api/tenants/[tenantId]/stores/[storeId]/stats/route.ts`
- [x] `src/app/api/tenants/[tenantId]/dashboard-summary/route.ts`

---

## Ordem de implementação sugerida

1. **10.1** Store settings (base para identidade)
2. **11.1** Detalhe do pedido (essencial para operação)
3. **11.2** Alterar status (fluxo operacional)
4. **Dashboard** Resumo (visibilidade)
5. **10.2** Formas de pagamento (config)
6. **10.3** Envio/entrega (checkout completo)
7. **11.3** Notificações (profissionalismo)

---

## Atualização

Ao concluir cada item, marcar com ✅ e data.

Exemplo:
```markdown
### 10.1 Store settings ✅ 2025-03-13
```
