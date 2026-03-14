/**
 * Retorna o preço efetivo do produto.
 * Se tiver promoção ativa (promotionalPrice definido e promotionEndsAt no futuro), usa promotionalPrice.
 * Caso contrário, usa price.
 */
export function getEffectivePrice(product: {
  price: { toString: () => string } | string | number;
  promotionalPrice?: { toString: () => string } | string | number | null;
  promotionEndsAt?: Date | string | null;
}): number {
  const basePrice = Number(product.price);
  const promoPrice = product.promotionalPrice
    ? Number(product.promotionalPrice)
    : null;
  const endsAt = product.promotionEndsAt
    ? new Date(product.promotionEndsAt)
    : null;

  if (promoPrice != null && promoPrice > 0 && endsAt && endsAt > new Date()) {
    return promoPrice;
  }
  return basePrice;
}

/**
 * Indica se o produto está em promoção ativa (preço promocional válido).
 */
export function isProductOnPromotion(product: {
  promotionalPrice?: { toString: () => string } | string | number | null;
  promotionEndsAt?: Date | string | null;
}): boolean {
  const promoPrice = product.promotionalPrice
    ? Number(product.promotionalPrice)
    : null;
  const endsAt = product.promotionEndsAt
    ? new Date(product.promotionEndsAt)
    : null;
  return (
    promoPrice != null &&
    promoPrice > 0 &&
    endsAt != null &&
    !isNaN(endsAt.getTime()) &&
    endsAt > new Date()
  );
}
