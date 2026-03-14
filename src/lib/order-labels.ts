/** Labels para status do pedido */
export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

/** Labels para opção de entrega escolhida pelo cliente */
export const DELIVERY_TYPE_LABELS: Record<string, string> = {
  pickup: "Retirar na loja",
  delivery: "Entrega",
};

/** Labels para ações de alteração de status */
export const ORDER_ACTION_LABELS: Record<string, string> = {
  confirmed: "Confirmar",
  shipped: "Marcar enviado",
  delivered: "Marcar entregue",
  cancelled: "Cancelar",
};

/** Label do botão/ação "shipped" conforme tipo de entrega */
export function getShippedActionLabel(deliveryType?: string | null): string {
  return deliveryType === "pickup" ? "Pronto para retirada" : "Marcar enviado";
}

/** Label do status "shipped" conforme tipo de entrega */
export function getShippedStatusLabel(deliveryType?: string | null): string {
  return deliveryType === "pickup" ? "Pronto para retirada" : "Enviado";
}
