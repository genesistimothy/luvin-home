# How to export and remove inquiry data from Sanity

This runbook is written for the agent or person who executes the C2 cleanup. It moves every `inquiry` document and its reference images out of the public Sanity dataset, proves the export is complete, then deletes the originals. Deletion is irreversible. The export is the only backup.

Do not run this until the Supabase write path is live and the contact forms no longer write to Sanity. Deleting first loses new submissions that arrive during the run.

## Preconditions

- The owner approved deletion in writing. Keep the approval link in the ticket.
- The Supabase write path is deployed and verified. A test submission left a row in Supabase and no new `inquiry` document in Sanity.
- `SANITY_WRITE_TOKEN` is set in the shell. It needs read and write on project `p3ihfsxq`, dataset `production`. Do not paste the token into a prompt, commit, or ticket.
- `SANITY_AUTH_TOKEN` is set to the same value for the Sanity CLI. If the CLI ignores it, run `npx sanity login` once.
- You have disk space equal to the dataset plus its assets. Check with the counts in step 2.
- The secure workspace is outside the repo, for example `~/secure/luvin-c2-2026-11-01`. The export contains customer names, emails, phone numbers, messages, and photos. Never commit it.

Set up the workspace first.

```bash
SECURE="$HOME/secure/luvin-c2-$(date +%F)"
mkdir -p "$SECURE/export"
chmod 700 "$SECURE"
```

## Step 1. Count the live documents

Run this from the repo root so Node resolves `@sanity/client`.

```bash
cd /Users/jeremygeraldprawira/Documents/luvin-home
node --input-type=module -e '
import {createClient} from "@sanity/client"
const token = process.env.SANITY_WRITE_TOKEN
if (!token) throw new Error("SANITY_WRITE_TOKEN is not set")
const client = createClient({projectId:"p3ihfsxq", dataset:"production", apiVersion:"2025-02-19", token, useCdn:false, perspective:"raw"})
const ids = await client.fetch(`*[_type == "inquiry"]._id`)
console.log(ids.length)
' | tee "$SECURE/count-before.txt"
```

Record the number. This is the expected count in the export.

## Step 2. Export the dataset and its assets

```bash
cd /Users/jeremygeraldprawira/Documents/luvin-home/sanity
npx sanity datasets export production "$SECURE/inquiries-backup.tar.gz" -p p3ihfsxq --overwrite
```

Do not use `--no-assets`. The reference photos are the PII that must leave the public CDN too.

Hash the backup and write the hash down.

```bash
shasum -a 256 "$SECURE/inquiries-backup.tar.gz" | tee "$SECURE/backup.sha256"
tar -xzf "$SECURE/inquiries-backup.tar.gz" -C "$SECURE/export"
ls "$SECURE/export"
```

The export contains `data.ndjson`, `assets/`, and `images/`. Adjust the paths below if your archive extracts a wrapper folder.

If the export fails partway, delete the partial files and run it again. Do not delete anything from Sanity yet.

## Step 3. Verify the export before deleting

Extract the exported ids and compare them with the live ids. The difference must be empty.

```bash
jq -r 'select(._type == "inquiry") | ._id' "$SECURE/export/data.ndjson" | sort > "$SECURE/exported-ids.txt"
wc -l < "$SECURE/exported-ids.txt"

cd /Users/jeremygeraldprawira/Documents/luvin-home
node --input-type=module -e '
import {createClient} from "@sanity/client"
const token = process.env.SANITY_WRITE_TOKEN
if (!token) throw new Error("SANITY_WRITE_TOKEN is not set")
const client = createClient({projectId:"p3ihfsxq", dataset:"production", apiVersion:"2025-02-19", token, useCdn:false, perspective:"raw"})
const ids = await client.fetch(`*[_type == "inquiry"]._id`)
console.log(ids.sort().join("\n"))
' > "$SECURE/live-ids.txt"

comm -3 "$SECURE/exported-ids.txt" "$SECURE/live-ids.txt"
```

`comm` prints nothing when the two lists match. If it prints any id, stop. Re-export and compare again. Do not delete.

Also confirm the exported count equals `count-before.txt`.

```bash
test "$(wc -l < "$SECURE/exported-ids.txt")" -eq "$(cat "$SECURE/count-before.txt")" && echo MATCH
```

## Step 4. Delete the documents

This deletes published documents and drafts in batches. It prints counts only.

```bash
cd /Users/jeremygeraldprawira/Documents/luvin-home
node --input-type=module -e '
import {createClient} from "@sanity/client"
const token = process.env.SANITY_WRITE_TOKEN
if (!token) throw new Error("SANITY_WRITE_TOKEN is not set")
const client = createClient({projectId:"p3ihfsxq", dataset:"production", apiVersion:"2025-02-19", token, useCdn:false, perspective:"raw"})
const ids = await client.fetch(`*[_type == "inquiry"]._id`)
console.log(`deleting ${ids.length}`)
for (let i = 0; i < ids.length; i += 50) {
  const tx = client.transaction()
  for (const id of ids.slice(i, i + 50)) tx.delete(id)
  await tx.commit()
}
console.log(`remaining ${await client.fetch(`count(*[_type == "inquiry"])`)}`)
'
```

## Step 5. Verify the public dataset is clean

The first command checks with the write token and raw perspective, so drafts are included. The second is anonymous, which is what an attacker sees.

```bash
cd /Users/jeremygeraldprawira/Documents/luvin-home
node --input-type=module -e '
import {createClient} from "@sanity/client"
const token = process.env.SANITY_WRITE_TOKEN
if (!token) throw new Error("SANITY_WRITE_TOKEN is not set")
const client = createClient({projectId:"p3ihfsxq", dataset:"production", apiVersion:"2025-02-19", token, useCdn:false, perspective:"raw"})
console.log(await client.fetch(`count(*[_type == "inquiry"])`))
'

curl -s 'https://p3ihfsxq.api.sanity.io/v2025-02-19/data/query/production?query=count(*%5B_type%3D%3D%22inquiry%22%5D)'
```

Both must return `0`. Open Sanity Studio and confirm the Inquiries list is empty.

After that, remove the dead Sanity schema. Delete `sanity/schemas/inquiry.js`, its
entry in `sanity/schemas/index.js`, and the Inquiries item in `sanity/structure.js`.

## Step 6. Delete the reference images

Deleting a document does not delete its image asset. The asset URL still serves the photo until you delete the asset itself. This step needs its own approval because it is irreversible.

Collect the asset ids from the export and count them.

```bash
jq -r 'select(._type == "inquiry") | .referenceImage.asset._ref // empty' "$SECURE/export/data.ndjson" | sort -u > "$SECURE/asset-ids.txt"
wc -l < "$SECURE/asset-ids.txt"
```

For each id, confirm no remaining document references it, then delete it. The check must return `0` before the delete.

```bash
cd /Users/jeremygeraldprawira/Documents/luvin-home
node --input-type=module -e '
import {createClient} from "@sanity/client"
import {readFileSync} from "node:fs"
const token = process.env.SANITY_WRITE_TOKEN
if (!token) throw new Error("SANITY_WRITE_TOKEN is not set")
const client = createClient({projectId:"p3ihfsxq", dataset:"production", apiVersion:"2025-02-19", token, useCdn:false, perspective:"raw"})
const ids = readFileSync(process.env.ASSET_IDS, "utf8").trim().split("\n").filter(Boolean)
let deleted = 0
for (const id of ids) {
  const refs = await client.fetch(`count(*[references($id)])`, {id})
  if (refs !== 0) { console.log(`skip ${id}: still referenced`); continue }
  await client.delete(id)
  deleted += 1
}
console.log(`deleted ${deleted} of ${ids.length}`)
'
```

Run it with `ASSET_IDS="$SECURE/asset-ids.txt"` set.

Assets uploaded by failed form submissions have no document reference, so this list cannot find them. Treat that residue as out of scope and say so in the ticket.

## Step 7. Record the evidence

Write a short evidence file in the secure workspace. Never include document contents.

```markdown
- Date and operator:
- Documents before:
- Documents in export:
- Documents after (raw):
- Documents after (anonymous):
- Backup sha256:
- comm output: empty
- Assets deleted:
- Approval link:
```

Link the evidence file in the ticket, not the export. Delete the local export when the owner says the retention window is over.

## Rollback

Restore the backup if the deletion was wrong.

```bash
cd /Users/jeremygeraldprawira/Documents/luvin-home/sanity
npx sanity datasets import "$SECURE/inquiries-backup.tar.gz" production -p p3ihfsxq
```

The import restores document ids and assets. Verify the count afterward with the step 1 command.

## Do not

- Do not delete before the export matches the live set.
- Do not combine export and delete in one unattended run.
- Do not print, paste, or commit document contents or the backup.
- Do not delete image assets without a second explicit approval.
- Do not run this while the forms still write to Sanity.
