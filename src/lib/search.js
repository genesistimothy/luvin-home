const LATIN_FOLD = { đ: "d", Đ: "d", ø: "o", Ø: "o", ł: "l", Ł: "l", æ: "ae", Æ: "ae", ß: "ss" };

/**
 * Case- and diacritic-insensitive search key. NFD handles most accents;
 * the fold map covers letters with strokes that do not decompose.
 */
export function normalizeSearch(value) {
  return String(value || "")
    .trim()
    .replace(/[đĐøØłŁæÆß]/g, (character) => LATIN_FOLD[character])
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
}
