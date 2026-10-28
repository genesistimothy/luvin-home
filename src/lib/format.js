const UNKNOWN_PRICE = "Price on request";

/**
 * Parses a human-formatted price string ("Rp 1.999.000", "1,999,000.00")
 * or a plain number. Only positive finite values survive; 0, negatives,
 * "Contact for price", and missing values are unknown.
 */
export function parsePrice(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0 ? Math.round(value) : null;
  }

  if (typeof value !== "string") return null;
  const normalizedValue = value.replace(/,\s*-$/, "");
  if (/[-−]/.test(normalizedValue) || !/\d/.test(normalizedValue)) return null;

  const cleaned = normalizedValue.replace(/[^\d.,]/g, "");
  if (!cleaned) return null;

  const lastDot = cleaned.lastIndexOf(".");
  const lastComma = cleaned.lastIndexOf(",");
  let normalized = cleaned;

  if (lastDot >= 0 && lastComma >= 0) {
    const decimal = lastDot > lastComma ? "." : ",";
    const thousands = decimal === "." ? "," : ".";
    normalized = cleaned.split(thousands).join("").replace(decimal, ".");
  } else if (lastDot >= 0 || lastComma >= 0) {
    const separator = lastDot >= 0 ? "." : ",";
    const parts = cleaned.split(separator);
    const minor = parts[1] ?? "";
    normalized = parts.length > 2 || minor.length === 3 ? parts.join("") : parts.join(".");
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : null;
}

export function formatPrice(price, currency = "IDR") {
  const value = parsePrice(price);
  if (value === null) return UNKNOWN_PRICE;
  return new Intl.NumberFormat("id-ID", { style: "currency", currency, maximumFractionDigits: 0 }).format(value);
}

export function formatCount(value) {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatProductCount(value) {
  return `${formatCount(value)} ${value === 1 ? "product" : "products"} found`;
}
