export function formatPrice(price, currency = "IDR") {
  if (typeof price !== "number") return price;
  return new Intl.NumberFormat("id-ID", { style: "currency", currency, maximumFractionDigits: 0 }).format(price);
}
