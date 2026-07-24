export async function adminRequest(path, options = {}) {
  const response = await fetch(path, {
    credentials: 'same-origin',
    ...options,
    headers: {
      ...(options.body && typeof options.body === 'string' ? {'Content-Type': 'application/json'} : {}),
      ...options.headers,
    },
  })
  const data = await response.json().catch(() => ({}))
  if (response.status === 401) {
    window.location.assign('/admin/login')
  }
  if (!response.ok) throw new Error(data.error || 'Something went wrong.')
  return data
}

export function formatRupiah(value) {
  return new Intl.NumberFormat('id-ID', {style: 'currency', currency: 'IDR', maximumFractionDigits: 0}).format(Number(value) || 0)
}

export function formatDate(value) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-GB', {day: '2-digit', month: 'short', year: 'numeric'}).format(new Date(value))
}
