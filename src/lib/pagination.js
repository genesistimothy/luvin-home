/**
 * Visible page numbers for a pager. Always keeps the first page, the last
 * page, the current page, and one neighbour on each side. Returns an empty
 * array for an invalid total.
 */
export function pageWindow(current, total) {
  if (!Number.isInteger(total) || total < 1) return [];
  if (!Number.isInteger(current) || current < 1) current = 1;
  if (current > total) current = total;
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);

  const pages = new Set([1, total, current, current - 1, current + 1]);
  if (current <= 3) [2, 3, 4].forEach((page) => pages.add(page));
  if (current >= total - 2) [total - 3, total - 2, total - 1].forEach((page) => pages.add(page));

  return [...pages].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b);
}
