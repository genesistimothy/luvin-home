# ERP → website product sync: contract

One-way: the Luvin ERP pushes product identity, colours, prices and availability to the website. The website never calls the ERP.

## Endpoint

```
POST https://luvin-home.vercel.app/api/erp-sync
Authorization: Bearer <ERP_SYNC_SECRET>
Content-Type: application/json
```

- Server-to-server only. No cookies, no browser origin.
- `ERP_SYNC_SECRET` is a long random string that the website owner stores in the website's Vercel environment and shares with the ERP out of band. If it is not configured on the website, every call returns `503`.
- Maximum body size: 512,000 bytes.
- Every call is **idempotent**: sending the same payload again changes nothing and is always safe (retry on any 5xx or timeout).
- Calls are processed in order, one product at a time. Send large catalogues in batches of up to 200 products.

## Who owns what

| ERP owns (the sync writes these) | Website owns (the sync never touches these) |
|---|---|
| name | **product code** (`sku`, for example `LUV-001`) |
| colours (one variant per ERP SKU) | photos (main image, gallery) |
| per-colour ERP SKUs (stored only in `data.erp.variants`) | descriptions, product story, dimensions, weight, materials, benefits |
| prices | category / collection |
| availability (per colour, true/false) | slug (URLs never change) |
| | featured flag, sort order, publish/draft/archive status, lead time, WhatsApp text |

The website's product code and the ERP's per-colour SKUs are two different things. The product code is never read from, derived from or written by the sync. A hidden draft created by the sync has an **empty** product code, for the owner to fill in in `/admin`.

Rows are never deleted. A product missing from a payload is left exactly as it was, in both modes.

## Request body

```json
{
  "mode": "full",
  "products": [
    {
      "erpProdukId": "P-100",
      "websiteProductId": null,
      "name": "Elora Dining Chair Set 4",
      "variants": [
        {"sku": "ELO-HIT", "colour": "Hitam", "price": 1500000, "available": true},
        {"sku": "ELO-CRM", "colour": "Krem",  "price": 1600000, "available": false}
      ]
    }
  ]
}
```

Validation is strict. **Unknown fields are rejected at every level**, and every field below is required (including an explicit `null` for `websiteProductId`).

| Field | Type | Rules |
|---|---|---|
| `mode` | string | `"full"` or `"partial"`. In `"full"` mode the response also reports mapped products that are missing from the payload (see Response). |
| `products` | array | 0 to 200 items. |
| `products[].erpProdukId` | string | 1–64 characters from `A-Z a-z 0-9 . _ -`. Send numeric ids as strings. Must be unique within the request. This is the permanent key linking an ERP product to a website product. |
| `products[].websiteProductId` | string or `null` | The website product row id (for example `product-alder-sofa-bed`), or `null` if there is no website product yet. 1–128 characters from `A-Z a-z 0-9 . _ -`. Unique within the request. |
| `products[].name` | string | 1–120 characters after trimming, no control characters. |
| `products[].variants` | array | 1 to 20 items. |
| `variants[].sku` | string | The ERP's SKU for this colour. 1–64 characters from `A-Z a-z 0-9 . _ -`. Unique across the whole request (case-insensitive). |
| `variants[].colour` | string | 1–60 characters after trimming, no control characters. |
| `variants[].price` | integer | Whole rupiah, 0 to 10,000,000,000. `0` shows as "Price on request". |
| `variants[].available` | boolean | `true` or `false` only. |

### No stock quantities, ever

The ERP sends **availability as a boolean per colour and nothing else**. A variant with any other field (for example `stock`, `qty`, `quantity`) is rejected, and `available` must be exactly `true` or `false` (a number or a string is rejected). `data.erp` therefore holds only `produkId`, `syncedAt` and, per colour, `sku`, `colour`, `price` and `available`. Stock numbers are never stored and never shown.

## What the website does with each product

For every product in `products`, in order, exactly one of these outcomes applies:

1. **Find the website row.**
   - If `websiteProductId` is set: use that row. It must exist and be a product.
   - Otherwise: use the row that already carries this `erpProdukId`, if there is one.
2. **Row found, something differs → `updated`.** Only the ERP-owned fields are written (name, colours, prices, availability and the derived fields below). Nothing else is touched.
3. **Row found, already identical → `unchanged`.** Nothing is written.
4. **No row found → `created`.** One hidden draft is created with the ERP data only (name, price, variants). The row id is `product-erp-<erpProdukId>`, the slug comes from the name, the product code is empty. The owner adds the product code, photos, description and category in `/admin` and publishes there. Repeating the call never creates a second draft (a concurrent creation counts as `unchanged`).
5. **Cannot be applied → `failed`.** Nothing is written for that product. This happens when:
   - `websiteProductId` points at a row that does not exist or is not a product;
   - that row is already linked to a *different* `erpProdukId`;
   - the `erpProdukId` is already linked to a *different* row;
   - the draft id `product-erp-<erpProdukId>` is already used by an unrelated row, or no free slug could be found.

A `failed` product does not stop the others: the rest of the batch is still applied. Fix the mapping on the ERP side (or ask the website owner) and resend.

**Derived fields** (so existing pages keep working): `price` = lowest variant price, `stockStatus` = `inStock` if any colour is available otherwise `soldOut`, `colors` = the variant colour names. The full ERP data is stored under `data.erp` as `{produkId, variants, syncedAt}`; `syncedAt` is the time of the last change that was applied.

## Response

Counts, plus the ids of failing products and (in `full` mode) of missing ones. No other product data and no personal data.

`updated + created + unchanged + failed = received`.

### `200 OK`: nothing failed

```json
{"ok": true, "mode": "partial", "received": 3, "updated": 1, "created": 1, "unchanged": 1, "failed": 0}
```

In `full` mode the same response also carries the missing report:

```json
{"ok": true, "mode": "full", "received": 3, "updated": 1, "created": 1, "unchanged": 1, "failed": 0,
 "missing": 2, "missingErpProdukIds": ["P-555", "P-999"]}
```

- `missing` is the number of website products linked to the ERP (rows with `data.erp.produkId`) whose `erpProdukId` is **not** in this payload; `missingErpProdukIds` lists them, sorted.
- It is reported only. Those rows are never changed, hidden or deleted. A product created or updated by this very request is never listed as missing.
- `missing` and `missingErpProdukIds` are present only when `mode` is `"full"`.

### `422 Unprocessable Entity`: at least one product failed

Same counts, plus the failing ids. The products that did not fail **were applied**; nothing is rolled back. Safe to resend after fixing the mapping.

```json
{"ok": false, "error": "Some products could not be applied.", "mode": "partial", "received": 3,
 "updated": 1, "created": 0, "unchanged": 1, "failed": 1, "failedErpProdukIds": ["P-BAD"]}
```

`failedErpProdukIds` is present only when `failed` is greater than 0. In `full` mode a 422 also carries the `missing` fields.

### Other statuses

| Status | Meaning |
|---|---|
| `400` | Invalid JSON, or the payload failed validation. Body: `{"error": "Invalid payload.", "details": ["products[0].variants[1].price must be an integer ..."]}` (at most 20 messages). Nothing was written. |
| `401` | Missing or wrong `Authorization` header. |
| `405` | Not a `POST`. |
| `413` | Body larger than 512,000 bytes. |
| `500` | A database error part-way through. Body: `{"error": "Sync failed. Safe to retry.", ...counts so far}`. Send the same request again. |
| `503` | `ERP_SYNC_SECRET` is not configured on the website. |

## What visitors see

- **Colour options:** the product page lists every colour with its price. A colour that is not available stays visible with a **Habis** label.
- **Cards and listings:** the lowest variant price, prefixed with **mulai dari** when the colours have different prices. A product whose colours are all unavailable shows **Habis**.
- **Never shown:** stock numbers. The website's product code still appears in the specifications, as before.
- A draft stays invisible until the owner publishes it. Publishing needs a product code, a photo, a category and a material or benefit in `/admin`.
- In `/admin`, for synced products the name, colours, prices and stock status are read-only ("Diatur dari ERP") and admin saves cannot overwrite them. The product code, photos, description, category and slug stay editable.

## Operational notes

- The ERP data is stored in the product's public content row, so `erpProdukId`, ERP SKUs, prices and availability are readable through the website's public content API, like everything else on a published product. Do not put anything in a payload that must stay private.
- The website serves this endpoint from the same function as `/api/keepalive` because the Hobby plan caps a deployment at 12 functions. `GET /api/erp-sync` therefore behaves like `GET /api/keepalive`; only `POST` syncs.

## Example

```bash
curl -sS -X POST https://luvin-home.vercel.app/api/erp-sync \
  -H "Authorization: Bearer $ERP_SYNC_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"mode":"partial","products":[{"erpProdukId":"P-100","websiteProductId":null,"name":"Elora Dining Chair Set 4","variants":[{"sku":"ELO-HIT","colour":"Hitam","price":1500000,"available":true}]}]}'
```
