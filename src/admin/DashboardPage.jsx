import {useEffect, useState} from 'react'
import {ArrowRight, ExternalLink, Plus} from 'lucide-react'
import {adminRequest, formatDate} from './adminApi'
import {AdminLink} from './AdminApp'

export function DashboardPage() {
  const [state, setState] = useState({loading: true, data: null, error: ''})
  useEffect(() => { adminRequest('/api/admin/dashboard').then((data) => setState({loading: false, data, error: ''})).catch((error) => setState({loading: false, data: null, error: error.message})) }, [])
  if (state.loading) return <div className="admin-page"><div className="admin-page-skeleton"/><div className="admin-card-grid">{[1,2,3,4].map((item) => <div key={item} className="admin-stat-card admin-skeleton"/>)}</div></div>
  if (state.error) return <ErrorState message={state.error}/>
  const {data} = state
  return <div className="admin-page">
    <div className="admin-page-heading"><div><p className="admin-eyebrow">OVERVIEW</p><h1>A calm view of the collection.</h1><p>Live editorial data from Sanity production.</p></div><AdminLink to="/admin/products/new" className="admin-primary-button"><Plus size={17}/> Add Product</AdminLink></div>
    <div className="admin-card-grid">
      {[['Total products',data.totalProducts],['Active products',data.activeProducts],['Draft products',data.draftProducts],['Categories',data.totalCategories]].map(([label,value]) => <article className="admin-stat-card" key={label}><span>{label}</span><strong>{value}</strong></article>)}
    </div>
    <div className="admin-dashboard-grid">
      <section className="admin-panel"><div className="admin-panel-title"><div><p className="admin-eyebrow">RECENTLY UPDATED</p><h2>Latest product activity</h2></div><AdminLink to="/admin/products">View all <ArrowRight size={15}/></AdminLink></div>
        {data.recentProducts?.length ? <div className="admin-recent-list">{data.recentProducts.map((product) => <AdminLink to={`/admin/products/${product._id.replace(/^drafts\./,'')}`} key={product._id}><span><strong>{product.name}</strong><small>{product.category || 'Uncategorised'}</small></span><span><small>{formatDate(product._updatedAt)}</small><em className={`admin-status admin-status-${product.status}`}>{product.status}</em></span></AdminLink>)}</div> : <EmptyState title="No products yet" text="Create the first product to begin your collection."/>}
      </section>
      <aside className="admin-panel admin-quick-panel"><p className="admin-eyebrow">QUICK ACTIONS</p><h2>Keep the collection moving.</h2><AdminLink to="/admin/products/new" className="admin-secondary-button"><Plus size={16}/> Add Product</AdminLink><a className="admin-secondary-button" href="https://luvin-home.sanity.studio" target="_blank" rel="noreferrer">Open Sanity Studio <ExternalLink size={16}/></a></aside>
    </div>
  </div>
}

export function ErrorState({message}) { return <div className="admin-state-card"><p className="admin-eyebrow">SOMETHING WENT WRONG</p><h2>We could not load this workspace.</h2><p>{message}</p><button className="admin-secondary-button" onClick={() => window.location.reload()}>Try again</button></div> }
export function EmptyState({title, text}) { return <div className="admin-empty"><h3>{title}</h3><p>{text}</p></div> }
