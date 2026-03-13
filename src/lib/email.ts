import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL =
  process.env.EMAIL_FROM || "Barauna Compras <onboarding@resend.dev>";

type OrderWithRelations = {
  id: string;
  total: string | number | { toString(): string };
  status: string;
  customer: { email: string; name: string | null } | null;
  store: { name: string };
  items: Array<{
    quantity: number;
    price: string | number | { toString(): string };
    product: { name: string };
  }>;
};

const STATUS_LABELS: Record<string, string> = {
  confirmed: "confirmado",
  shipped: "enviado",
  delivered: "entregue",
};

export async function sendOrderConfirmation(
  order: OrderWithRelations,
  tenantSlug?: string
): Promise<boolean> {
  if (!resend || !order.customer?.email) return false;
  const itemsList = order.items
    .map(
      (i) =>
        `- ${i.product.name}: ${i.quantity}x R$ ${Number(String(i.price)).toFixed(2)}`
    )
    .join("\n");
  const html = `
    <h2>Pedido confirmado!</h2>
    <p>Olá${order.customer.name ? ` ${order.customer.name}` : ""},</p>
    <p>Recebemos seu pedido <strong>#${order.id.slice(-6).toUpperCase()}</strong> na ${order.store.name}.</p>
    <h3>Itens:</h3>
    <pre>${itemsList}</pre>
    <p><strong>Total: R$ ${Number(String(order.total)).toFixed(2)}</strong></p>
    <p>Você receberá atualizações por email.</p>
  `;
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: order.customer.email,
    subject: `Pedido #${order.id.slice(-6).toUpperCase()} - ${order.store.name}`,
    html,
  });
  return !error;
}

export async function sendOrderStatusUpdate(
  order: OrderWithRelations,
  newStatus: string,
  tenantSlug?: string
): Promise<boolean> {
  if (!resend || !order.customer?.email) return false;
  const label = STATUS_LABELS[newStatus] ?? newStatus;
  const html = `
    <h2>Atualização do pedido</h2>
    <p>Olá${order.customer.name ? ` ${order.customer.name}` : ""},</p>
    <p>Seu pedido <strong>#${order.id.slice(-6).toUpperCase()}</strong> foi atualizado para: <strong>${label}</strong>.</p>
    <p>Loja: ${order.store.name}</p>
    <p>Total: R$ ${Number(String(order.total)).toFixed(2)}</p>
  `;
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: order.customer.email,
    subject: `Pedido #${order.id.slice(-6).toUpperCase()} - ${label} - ${order.store.name}`,
    html,
  });
  return !error;
}
