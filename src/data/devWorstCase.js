/**
 * Worst-case fixtures for the catalogue — DEV ONLY.
 *
 * Every value here is plausible, or the longest value the data layer accepts.
 * No random strings: a designer who sees "aaaaaaaa" stops reading.
 *
 * Guarded by import.meta.env.DEV in Layout.jsx, so a production build drops it.
 */

const base = {
  currency: "IDR",
  colors: [],
  materials: ["Solid wood"],
  benefits: ["A considered piece for everyday rooms."],
  palette: ["#7A8060", "#B86F4D", "#827D75"],
};

/** Six products. Each row carries a different failure, as real data does. */
export const worstCaseProducts = [
  {
    ...base,
    name: "Aleksandra Wiśniewska-Kowalczyk Signature Modular Corner Sectional with Chaise",
    category: "Sofa Bed Collection",
    dimensions: "124 x 186 x 28 cm",
    price: 1999000,
  },
  {
    ...base,
    name: "Đặng Thị Ngọc Hân Woven Lounge Chair",
    category: "Wohnzimmermöbelkollektion",
    dimensions:
      "124 x 85 x 70 cm (seating height 43 cm, armrest 62 cm, chaise depth 186 cm)",
    price: 1234567890,
  },
  {
    ...base,
    name: "王秀英 实木餐桌",
    category: "Dining Collection",
    dimensions: "90 x 90 x 75 cm",
    price: 0,
  },
  {
    ...base,
    name: "Jo",
    category: "Sofa Collection",
    dimensions: "—",
    price: "Contact for price",
  },
  {
    ...base,
    name: "🦊 Fox Side Table",
    category: "Custom Order — European Imported Solid Oak Collection",
    dimensions: "45 x 45 x 55 cm",
    price: 1284,
    status: "soldOut",
  },
  {
    ...base,
    name: "",
    category: "Sofa Collection",
    dimensions: "116 x 186 x 28 cm",
    price: null,
    colors: Array.from({ length: 12 }, (_, i) => `Colour ${i + 1}`),
    status: "comingSoon",
  },
];

export const worstCaseCollections = [
  { name: "Wohnzimmermöbelkollektion", slug: "wohnzimmerm-belkollektion" },
  { name: "Custom Order — European Imported Solid Oak Collection", slug: "custom-order-european-imported-solid-oak-collection" },
  { name: "Sofa Bed Collection", slug: "sofa-bed-collection" },
  { name: "Sofa Collection", slug: "sofa-collection" },
  { name: "Dining Collection", slug: "dining-collection" },
];

/** 1,000 rows. The list paginates at 9, so this tests the count and the pager. */
export function makeManyProducts(count = 1000) {
  return Array.from({ length: count }, (_, i) => ({
    ...base,
    name: `Sierra Woven Sofa — Armchair ${i + 1}`,
    category: i % 3 === 0 ? "Sofa Collection" : "Sofa Bed Collection",
    dimensions: `${100 + (i % 60)} x ${80 + (i % 40)} x ${60 + (i % 30)} cm`,
    price: 1000000 + i * 137000,
  }));
}

/**
 * Scenarios the toggle can pick. `null` means "use the real data".
 * The URL param is `?data=`, so a reload keeps the choice.
 */
export function getScenarioContent(scenario) {
  switch (scenario) {
    case "worst":
      return { products: worstCaseProducts, collections: worstCaseCollections };
    case "empty":
      return { products: [], collections: worstCaseCollections };
    case "one":
      return { products: worstCaseProducts.slice(0, 1), collections: worstCaseCollections };
    case "many":
      return { products: makeManyProducts(1000), collections: worstCaseCollections };
    default:
      return null;
  }
}

export const SCENARIOS = [
  { id: "demo", label: "Demo data" },
  { id: "worst", label: "Worst case" },
  { id: "empty", label: "Empty" },
  { id: "one", label: "One" },
  { id: "many", label: "1,000 rows" },
];
