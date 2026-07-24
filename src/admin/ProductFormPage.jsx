import {useEffect, useMemo, useState} from 'react'
import {Archive, ArrowLeft, ImagePlus, LoaderCircle, Save, Send, Trash2} from 'lucide-react'
import {adminRequest} from './adminApi'
import {AdminLink, navigateAdmin} from './AdminApp'
import {ErrorState} from './DashboardPage'

const emptyProduct = {
  name: '', slug: {current: ''}, sku: '', status: 'draft', featured: false, displayOrder: 100,
  collection: null, shortDescription: '', productStory: '', price: '', currency: 'IDR', colors: [],
  dimensions: '', weight: '', materials: [], benefits: [], stockStatus: 'inStock', madeToOrder: false,
  leadTime: '', whatsAppMessage: '', mainImage: null,
}

const toLines = (value) => Array.isArray(value) ? value.join('\n') : ''
const fromLines = (value) => value.split(/\n|,/).map((item) => item.trim()).filter(Boolean)
const slugify = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 96)

function Field({label, hint = '', children, wide = false}) { return <label className={`admin-field ${wide ? 'is-wide' : ''}`}><span>{label}</span>{children}{hint && <small>{hint}</small>}</label> }

export function ProductFormPage({id = null}) {
  const isNew = !id
  const [product, setProduct] = useState(emptyProduct)
  const [categories, setCategories] = useState([])
  const [state, setState] = useState({loading: true, saving: false, uploading: false, error: '', success: ''})
  const [dirty, setDirty] = useState(false)
  const [slugTouched, setSlugTouched] = useState(false)

  useEffect(() => {
    const requests = [adminRequest('/api/admin/categories')]
    if (!isNew) requests.push(adminRequest(`/api/admin/products/${encodeURIComponent(id)}`))
    Promise.all(requests).then(([categoryData, productData]) => {
      setCategories(categoryData.categories)
      if (productData) setProduct({...emptyProduct, ...productData.product})
      setState((current) => ({...current, loading: false}))
    }).catch((error) => setState((current) => ({...current, loading: false, error: error.message})))
  }, [id, isNew])

  useEffect(() => {
    const beforeUnload = (event) => { if (dirty) { event.preventDefault(); event.returnValue = '' } }
    window.addEventListener('beforeunload', beforeUnload)
    return () => window.removeEventListener('beforeunload', beforeUnload)
  }, [dirty])

  const update = (field, value) => { setProduct((current) => ({...current, [field]: value})); setDirty(true); setState((current) => ({...current, error: '', success: ''})) }
  const imageUrl = product.mainImage?.image?.asset?.url || product.mainImage?.url || ''
  const title = useMemo(() => isNew ? 'Add a new product.' : `Edit ${product.name || 'product'}.`, [isNew, product.name])

  const save = async (action) => {
    if (state.saving || state.uploading) return
    setState((current) => ({...current, saving: true, error: '', success: ''}))
    try {
      const payload = {...product, materials: product.materials, colors: product.colors, benefits: product.benefits}
      const result = await adminRequest(isNew ? '/api/admin/products' : `/api/admin/products/${encodeURIComponent(id)}`, {
        method: isNew ? 'POST' : 'PATCH', body: JSON.stringify({product: payload, action}),
      })
      setDirty(false)
      setState((current) => ({...current, saving: false, success: action === 'publish' ? 'Product published successfully.' : 'Draft saved successfully.'}))
      if (isNew) navigateAdmin(`/admin/products/${result.id}`)
    } catch (error) { setState((current) => ({...current, saving: false, error: error.message})) }
  }

  const upload = async (file) => {
    if (!file) return
    setState((current) => ({...current, uploading: true, error: '', success: ''}))
    const preview = URL.createObjectURL(file)
    try {
      const data = await adminRequest('/api/admin/upload', {method: 'POST', body: file, headers: {'Content-Type': file.type, 'X-File-Name': encodeURIComponent(file.name)}})
      update('mainImage', {_type: 'cmsImage', image: {_type: 'image', asset: {_type: 'reference', _ref: data.asset._id, url: data.asset.url}}, altText: product.name || file.name})
    } catch (error) { setState((current) => ({...current, error: error.message})) }
    finally { URL.revokeObjectURL(preview); setState((current) => ({...current, uploading: false})) }
  }

  const archive = async () => {
    if (!window.confirm('Archive this product? It will no longer appear as active on the public website.')) return
    try { await adminRequest(`/api/admin/products/${encodeURIComponent(id)}`, {method: 'DELETE'}); setDirty(false); navigateAdmin('/admin/products') }
    catch (error) { setState((current) => ({...current, error: error.message})) }
  }

  if (state.loading) return <div className="admin-page"><div className="admin-page-skeleton"/><div className="admin-form-skeleton admin-skeleton"/></div>
  if (state.error && !product.name && !isNew) return <ErrorState message={state.error}/>
  return <div className="admin-page admin-product-form-page">
    <AdminLink to="/admin/products" className="admin-back-link"><ArrowLeft size={16}/> Back to products</AdminLink>
    <div className="admin-page-heading"><div><p className="admin-eyebrow">{isNew ? 'NEW PRODUCT' : 'PRODUCT EDITOR'}</p><h1>{title}</h1><p>Fields follow the current Sanity product schema.</p></div><div className="admin-form-actions"><button disabled={state.saving || state.uploading} className="admin-secondary-button" onClick={() => save('draft')}><Save size={16}/> Save Draft</button><button disabled={state.saving || state.uploading} className="admin-primary-button" onClick={() => save('publish')}>{state.saving ? <LoaderCircle className="admin-spin" size={17}/> : <Send size={16}/>} Publish</button></div></div>
    {state.error && <div className="admin-alert admin-alert-error">{state.error}</div>}{state.success && <div className="admin-alert admin-alert-success">{state.success}</div>}
    <div className="admin-form-layout">
      <div className="admin-form-main">
        <section className="admin-panel admin-form-section"><div><p className="admin-eyebrow">IDENTITY</p><h2>Product essentials</h2></div><div className="admin-form-grid">
          <Field label="Product name" wide><input required value={product.name} onChange={(event) => { update('name', event.target.value); if (!slugTouched) setProduct((current) => ({...current, slug: {current: slugify(event.target.value)}})) }}/></Field>
          <Field label="Slug" hint="Used as the stable URL-friendly identifier."><input required value={product.slug?.current || ''} onChange={(event) => { setSlugTouched(true); update('slug', {current: slugify(event.target.value)}) }}/></Field>
          <Field label="SKU"><input value={product.sku || ''} onChange={(event) => update('sku', event.target.value)}/></Field>
          <Field label="Category"><select value={product.collection?._ref || ''} onChange={(event) => update('collection', event.target.value ? {_type:'reference',_ref:event.target.value} : null)}><option value="">Choose category</option>{categories.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</select></Field>
          <Field label="Status"><select value={product.status} onChange={(event) => update('status', event.target.value)}>{['draft','active','soldOut','comingSoon','archived'].map((item) => <option key={item} value={item}>{item}</option>)}</select></Field>
          <Field label="Sort order"><input type="number" min="0" value={product.displayOrder} onChange={(event) => update('displayOrder', event.target.value)}/></Field>
          <label className="admin-check"><input type="checkbox" checked={Boolean(product.featured)} onChange={(event) => update('featured', event.target.checked)}/><span>Feature this product</span></label>
        </div></section>
        <section className="admin-panel admin-form-section"><div><p className="admin-eyebrow">STORY & DETAILS</p><h2>How the piece lives</h2></div><div className="admin-form-grid">
          <Field label="Short description" wide><textarea rows={3} maxLength={280} value={product.shortDescription || ''} onChange={(event) => update('shortDescription', event.target.value)}/></Field>
          <Field label="Product story" wide><textarea rows={5} maxLength={1000} value={product.productStory || ''} onChange={(event) => update('productStory', event.target.value)}/></Field>
          <Field label="Dimensions"><input value={product.dimensions || ''} onChange={(event) => update('dimensions', event.target.value)}/></Field>
          <Field label="Weight"><input value={product.weight || ''} onChange={(event) => update('weight', event.target.value)}/></Field>
          <Field label="Materials" hint="One per line." wide><textarea rows={4} value={toLines(product.materials)} onChange={(event) => update('materials', fromLines(event.target.value))}/></Field>
          <Field label="Colors / variants" hint="One per line." wide><textarea rows={4} value={toLines(product.colors)} onChange={(event) => update('colors', fromLines(event.target.value))}/></Field>
          <Field label="Benefits" hint="One per line." wide><textarea rows={4} value={toLines(product.benefits)} onChange={(event) => update('benefits', fromLines(event.target.value))}/></Field>
        </div></section>
      </div>
      <aside className="admin-form-aside">
        <section className="admin-panel admin-form-section"><div><p className="admin-eyebrow">COMMERCE</p><h2>Price & availability</h2></div><Field label="Price (IDR)"><input required type="number" min="0" value={product.price} onChange={(event) => update('price', event.target.value)}/></Field><Field label="Stock status"><select value={product.stockStatus || 'inStock'} onChange={(event) => update('stockStatus', event.target.value)}>{['inStock','lowStock','preOrder','madeToOrder','soldOut'].map((item) => <option key={item} value={item}>{item}</option>)}</select></Field><Field label="Lead time"><input value={product.leadTime || ''} onChange={(event) => update('leadTime', event.target.value)}/></Field><label className="admin-check"><input type="checkbox" checked={Boolean(product.madeToOrder)} onChange={(event) => update('madeToOrder', event.target.checked)}/><span>Made to order</span></label></section>
        <section className="admin-panel admin-form-section"><div><p className="admin-eyebrow">MAIN IMAGE</p><h2>Product photography</h2></div>{imageUrl ? <div className="admin-image-preview"><img src={imageUrl} alt={product.mainImage?.altText || product.name}/><button type="button" onClick={() => update('mainImage', null)}><Trash2 size={15}/> Remove</button></div> : <label className="admin-image-upload"><ImagePlus size={26}/><strong>{state.uploading ? 'Uploading…' : 'Upload image'}</strong><small>JPG, PNG, or WebP · max 4 MB</small><input disabled={state.uploading} type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => upload(event.target.files?.[0])}/></label>}{product.mainImage && <Field label="Alternative text"><input maxLength={160} value={product.mainImage.altText || ''} onChange={(event) => update('mainImage', {...product.mainImage, altText:event.target.value})}/></Field>}</section>
        {!isNew && <button className="admin-danger-button" onClick={archive}><Archive size={16}/> Archive product</button>}
      </aside>
    </div>
  </div>
}
