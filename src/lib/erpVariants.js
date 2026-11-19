import { parsePrice } from "./format.js";

/**
 * Colour variants synced from the ERP live in product.erp.variants as
 * {sku, colour, price, available}. Products without them behave as before.
 */
export function erpVariants(product) {
  const variants = product?.erp?.variants;
  return Array.isArray(variants) ? variants : [];
}

/**
 * Card/detail display facts for a product with ERP variants.
 * - lowest: lowest known variant price (null if none is above zero)
 * - differs: variants have more than one known price, so show "mulai dari"
 * - allSoldOut: every colour is out of stock, so the product shows "Habis"
 */
export function erpPriceInfo(product) {
  const variants = erpVariants(product);
  if (variants.length === 0) return { hasVariants: false, lowest: null, differs: false, allSoldOut: false };
  const prices = variants.map((variant) => parsePrice(variant.price)).filter((price) => price !== null);
  return {
    hasVariants: true,
    lowest: prices.length ? Math.min(...prices) : null,
    differs: new Set(prices).size > 1,
    allSoldOut: variants.every((variant) => variant.available !== true),
  };
}
