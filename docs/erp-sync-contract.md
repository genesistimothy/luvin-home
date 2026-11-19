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
| name | photos (main image, gallery) |
| SKUs | descriptions, product story, dimensions, weight, materials, benefits |
| colours (one variant per SKU) | category / collection |
| prices | slug (URLs never change) |
| availability (per colour) | featured flag, sort order, publish/draft/archive status, lead time, WhatsApp text |

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
| `mode` | string | `"full"` or `"partial"`. Informational: it does not change how products are processed (see note below). |
| `products` | array | 0 to 200 items. |
| `products[].erpProdukId` | string | 1–64 characters from `A-Z a-z 0-9 . _ -`. Send numeric ids as strings. Must be unique within the request. This is the permanent key linking an ERP product to a website product. |
| `products[].websiteProductId` | string or `null` | The website product row id (for example `product-alder-sofa-bed`), or `null` if there is no website product yet. 1–128 characters from `A-Z a-z 0-9 . _ -`. Unique within the request. |
| `products[].name` | string | 1–120 characters after trimming, no control characters. |
| `products[].variants` | array | 1 to 20 items. |
| `variants[].sku` | string | 1–64 characters from `A-Z a-z 0-9 . _ -`. Unique across the whole request (case-insensitive). |
| `variants[].colour` | string | 1–60 characters after trimming, no control characters. |
| `variants[].price` | integer | Whole rupiah, 0 to 10,000,000,000. `0` shows as "Price on request". |
| `variants[].available` | boolean | `true` or `false`. There are no stock numbers anywhere: the website only ever sees available / not available. |

Note on `mode`: it is validated and echoed back, but `full` and `partial` are processed identically. Products absent from the payload are never changed or removed, so a partial batch and a full catalogue are equally safe to send.

## What the website does with each product

For every product in `products`, in order:

1. **Find the website row.**
   - If `websiteProductId` is set: use that row. It must exist and be a product.
   - Otherwise: use the row that already carries this `erpProdukId`, if there is one.
2. **Row found:** write only the ERP-owned fields (name, SKUs, colours, prices, availability) and the derived fields below. Nothing else is touched.
3. **No row found:** create **one hidden draft** with the ERP data only (name, price, variants). The row id is `product-erp-<erpProdukId>` and its slug comes from the name. The owner then adds photos, description and category in `/admin` and publishes. Repeating the call never creates a second draft.
4. **Skipped** (nothing written, counted as `skipped`):
   - nothing would change (the row already matches);
   - `websiteProductId` points at a row that does not exist or is not a product;
   - the row is already linked to a *different* `erpProdukId`;
   - the `erpProdukId` is already linked to a *different* row;
   - a draft with that id already exists.

**Derived fields** (so existing pages keep working): `price` = lowest variant price, `stockStatus` = `inStock` if any variant is available otherwise `soldOut`, `colors` = the variant colours, `sku` = the first variant's SKU. The full ERP data is stored under `data.erp` as `{produkId, variants, syncedAt}`; `syncedAt` is the time of the last change that was applied.

## Response

Counts only, no product data and no personal data.

`200 OK`

```json
{"ok": true, "mode": "full", "received": 1, "updated": 0, "created": 1, "skipped": 0}
```

`updated + created + skipped = received`.

| Status | Meaning |
|---|---|
| `200` | Processed. See the counts. |
| `400` | Invalid JSON, or the payload failed validation. Body: `{"error": "Invalid payload.", "details": ["products[0].variants[1].price must be an integer ..."]}` (at most 20 messages). Nothing was written. |
| `401` | Missing or wrong `Authorization` header. |
| `405` | Not a `POST`. |
| `413` | Body larger than 512,000 bytes. |
| `500` | A database error part-way through. Body includes the counts so far plus `"error": "Sync failed. Safe to retry."`. Send the same request again. |
| `503` | `ERP_SYNC_SECRET` is not configured on the website. |

## What visitors see

- **Colour options:** the product page lists every colour with its price. A colour that is not available stays visible with a **Habis** label.
- **Cards and listings:** the lowest variant price, prefixed with **mulai dari** when the colours have different prices. A product whose colours are all unavailable shows **Habis**.
- **Never shown:** stock numbers.
- A draft stays invisible until the owner publishes it. Publishing needs a photo, a category and a SKU/material in `/admin`.
- In `/admin`, ERP-owned fields are read-only for synced products ("Diatur dari ERP") and admin saves cannot overwrite them.

## Operational notes

- The ERP data is stored in the product's public content row, so `erpProdukId`, SKUs, prices and availability are readable through the website's public content API, like everything else on a published product. Do not put anything in a payload that must stay private.
- The website serves this endpoint from the same function as `/api/keepalive` because the Hobby plan caps a deployment at 12 functions. `GET /api/erp-sync` therefore behaves like `GET /api/keepalive`; only `POST` syncs.

## Example

```bash
curl -sS -X POST https://luvin-home.vercel.app/api/erp-sync \
  -H "Authorization: Bearer $ERP_SYNC_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"mode":"partial","products":[{"erpProdukId":"P-100","websiteProductId":null,"name":"Elora Dining Chair Set 4","variants":[{"sku":"ELO-HIT","colour":"Hitam","price":1500000,"available":true}]}]}'
```
