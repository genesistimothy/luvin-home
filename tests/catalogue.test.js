import test from "node:test";
import assert from "node:assert/strict";
import { formatCount, formatPrice, formatProductCount, parsePrice } from "../src/lib/format.js";
import { pageWindow } from "../src/lib/pagination.js";
import { normalizeSearch } from "../src/lib/search.js";

test("parsePrice accepts numbers, formatted strings, and plain numeric strings", () => {
  assert.equal(parsePrice(1999000), 1999000);
  assert.equal(parsePrice("1999000"), 1999000);
  assert.equal(parsePrice("Rp 1.999.000"), 1999000);
  assert.equal(parsePrice("Rp 400.000"), 400000);
  assert.equal(parsePrice("1,999,000.00"), 1999000);
  assert.equal(parsePrice("1.234.567,89"), 1234568);
});

test("parsePrice rejects unknown, zero, negative, and non-finite values", () => {
  for (const value of [null, undefined, "", "Contact for price", "Rp 0", 0, -1000, "-1000", "−1000", NaN, Infinity]) {
    assert.equal(parsePrice(value), null, `expected null for ${String(value)}`);
  }
});

test("formatPrice falls back to the on-request label", () => {
  assert.match(formatPrice(1999000), /1\.999\.000/);
  assert.match(formatPrice("Rp 1.999.000"), /1\.999\.000/);
  assert.equal(formatPrice(0), "Price on request");
  assert.equal(formatPrice(null), "Price on request");
  assert.equal(formatPrice("Contact for price"), "Price on request");
});

test("formatProductCount formats and pluralizes", () => {
  assert.equal(formatProductCount(0), "0 products found");
  assert.equal(formatProductCount(1), "1 product found");
  assert.equal(formatProductCount(9), "9 products found");
  assert.equal(formatProductCount(1000), "1,000 products found");
  assert.equal(formatCount(1284), "1,284");
});

test("pageWindow keeps first, last, current, and neighbours", () => {
  assert.deepEqual(pageWindow(1, 5), [1, 2, 3, 4, 5]);
  assert.deepEqual(pageWindow(1, 112), [1, 2, 3, 4, 112]);
  assert.deepEqual(pageWindow(56, 112), [1, 55, 56, 57, 112]);
  assert.deepEqual(pageWindow(112, 112), [1, 109, 110, 111, 112]);
  assert.deepEqual(pageWindow(1, 1), [1]);
  assert.deepEqual(pageWindow(1, 0), []);
});

test("pageWindow output is sorted, unique, and in range", () => {
  for (let total = 1; total <= 220; total += 7) {
    for (const current of [1, 2, 3, Math.ceil(total / 2), total - 1, total]) {
      const pages = pageWindow(current, total);
      assert.deepEqual(pages, [...new Set(pages)].sort((a, b) => a - b));
      assert.ok(pages.length <= 7, `too many pages for ${current}/${total}`);
      assert.ok(pages.every((page) => page >= 1 && page <= total));
      assert.ok(pages.includes(1) && pages.includes(total));
    }
  }
});

test("normalizeSearch folds accents and stroked letters", () => {
  assert.equal(normalizeSearch("Đặng Thị Ngọc Hân"), "dang thi ngoc han");
  assert.equal(normalizeSearch("Wohnzimmermöbelkollektion"), "wohnzimmermobelkollektion");
  assert.equal(normalizeSearch("Łódź"), "lodz");
  assert.equal(normalizeSearch("  "), "");
});
