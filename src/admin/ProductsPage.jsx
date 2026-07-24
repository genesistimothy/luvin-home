import {useEffect, useMemo, useState} from 'react'
import {Edit3, Plus, Search} from 'lucide-react'
import {adminRequest, formatDate, formatRupiah} from './adminApi'
import {AdminLink} from './AdminApp'
import {EmptyState, ErrorState} from './DashboardPage'

export function ProductsPage() {
  const [state, setState] = useState({loading: true, products: [], categories: [], error: ''})
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [status, setStatus] = useState('all')
  useEffect(() => {
    Promise.all([adminRequest('/api/admin/products'), adminRequest('/api/admin/categories')])
      .then(([products, categories]) => setState({loading: false, products: products.products, categories: categories.categories, error: ''}))
      .catch((error) => setState({loading: false, products: [], categories: [], error: error.message}))
  }, [])

  const filtered = useMemo(() => state.products.filter((product) => {
    const matchesSearch = product.name?.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = category === 'all' || product.categoryId === category
    const matchesStatus = status === 'all' || product.status === status
    return matchesSearch && matchesCategory && matchesStatus
  }), [state.products, search, category, status])

  if (state.error) return <ErrorState message={state.error}/>
  return <div className="admin-page">
    <div className="admin-page-heading"><div><p className="admin-eyebrow">PRODUCTS</p><h1>The Luvin collection.</h1><p>Create, refine, and publish products from one place.</p></div><AdminLink to="/admin/products/new" className="admin-primary-button"><Plus size={17}/> Add Product</AdminLink></div>
    <section className="admin-panel">
      <div className="admin-filters">
        <label className="admin-search"><Search size={17}/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by product name"/></label>
        <select aria-label="Filter category" value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">All categories</option>{state.categories.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</select>
        <select aria-label="Filter status" value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">All statuses</option>{['active','draft','soldOut','comingSoon','archived'].map((item) => <option key={item} value={item}>{item}</option>)}</select>
      </div>
      {state.loading ? <div className="admin-table-loading admin-skeleton"/> : filtered.length ? <div className="admin-product-table-wrap"><table className="admin-product-table"><thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Status</th><th>Updated</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{filtered.map((product) => <tr key={product._id}><td><div className="admin-product-cell">{product.mainImage?.url ? <img src={product.mainImage.url} alt=""/> : <span className="admin-product-placeholder">LH</span>}<span><strong>{product.name}</strong><small>{product.sku || 'No SKU'}{product.hasDraft ? ' · Unpublished changes' : ''}</small></span></div></td><td>{product.category || '—'}</td><td>{formatRupiah(product.price)}</td><td><em className={`admin-status admin-status-${product.status}`}>{product.status}</em></td><td>{formatDate(product._updatedAt)}</td><td><AdminLink className="admin-icon-link" to={`/admin/products/${product._id}`}><Edit3 size={16}/> Edit</AdminLink></td></tr>)}</tbody></table></div> : <EmptyState title="No matching products" text="Adjust your search or filters, or add a new product."/>}
    </section>
  </div>
}
