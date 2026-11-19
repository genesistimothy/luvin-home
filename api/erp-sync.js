import {handleErpSync} from './_lib/erpSync.js'

// ERP -> website product sync. See docs/erp-sync-contract.md.
export default function handler(req, res) {
  return handleErpSync(req, res)
}
