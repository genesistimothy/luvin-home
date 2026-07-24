import {useEffect, useMemo, useState} from 'react'
import {BarChart3, Boxes, ExternalLink, FileText, LogOut, Menu, Settings, ShoppingBag, X} from 'lucide-react'
import {adminRequest} from './adminApi'
import {DashboardPage} from './DashboardPage'
import {ProductsPage} from './ProductsPage'
import {ProductFormPage} from './ProductFormPage'
import './admin.css'

export function navigateAdmin(path) {
  window.history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

export function AdminLink({to, children, className = '', onClick = null}) {
  return <a href={to} className={className} onClick={(event) => {
    event.preventDefault()
    onClick?.()
    navigateAdmin(to)
  }}>{children}</a>
}

function LoginPage() {
  const params = new URLSearchParams(window.location.search)
  return <main className="admin-auth-page">
    <section className="admin-auth-card">
      <div className="admin-brand-mark">LH</div>
      <p className="admin-eyebrow">LUVIN HOME</p>
      <h1>Welcome back.</h1>
      <p>Sign in with your approved Google account to manage the Luvin collection.</p>
      {params.get('error') && <div className="admin-alert admin-alert-error">Sign-in could not be completed. Please try again.</div>}
      <a className="admin-primary-button admin-google-button" href="/api/auth/login">
        <span className="admin-google-g">G</span> Continue with Google
      </a>
      <a className="admin-muted-link" href="/">Return to Luvin Home</a>
    </section>
  </main>
}

function AccessDeniedPage() {
  return <main className="admin-auth-page">
    <section className="admin-auth-card">
      <div className="admin-brand-mark">LH</div>
      <p className="admin-eyebrow">ACCESS DENIED</p>
      <h1>This account is not approved.</h1>
      <p>Ask the Luvin Home owner to add your Google email to the admin allowlist.</p>
      <a className="admin-primary-button" href="/api/auth/login">Use another account</a>
      <a className="admin-muted-link" href="/">Return to website</a>
    </section>
  </main>
}

function LoadingScreen() {
  return <main className="admin-loading"><div className="admin-spinner"/><p>Preparing your workspace…</p></main>
}

const navigation = [
  {label: 'Dashboard', path: '/admin', icon: BarChart3},
  {label: 'Products', path: '/admin/products', icon: ShoppingBag},
  {label: 'Categories', path: '/admin/categories', icon: Boxes},
  {label: 'Content', path: '/admin/content', icon: FileText},
  {label: 'Settings', path: '/admin/settings', icon: Settings},
]

function PlaceholderPage({title, contentLink = false}) {
  return <div className="admin-page admin-placeholder-page">
    <p className="admin-eyebrow">COMING SOON</p>
    <h1>{title}</h1>
    <p>This workspace is reserved for the next Luvin Admin release.</p>
    {contentLink && <a className="admin-secondary-button" href="https://luvin-home.sanity.studio" target="_blank" rel="noreferrer">Open Sanity Studio <ExternalLink size={16}/></a>}
  </div>
}

function Shell({user, path, onLogout}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const page = useMemo(() => {
    if (path === '/admin') return <DashboardPage/>
    if (path === '/admin/products') return <ProductsPage/>
    if (path === '/admin/products/new') return <ProductFormPage id={null}/>
    if (path.startsWith('/admin/products/')) return <ProductFormPage id={decodeURIComponent(path.split('/').pop())}/>
    if (path === '/admin/categories') return <PlaceholderPage title="Categories"/>
    if (path === '/admin/content') return <PlaceholderPage title="Content" contentLink/>
    if (path === '/admin/settings') return <PlaceholderPage title="Settings"/>
    return <DashboardPage/>
  }, [path])

  return <div className="admin-root">
    <aside className={`admin-sidebar ${menuOpen ? 'is-open' : ''}`}>
      <div className="admin-sidebar-brand"><span className="admin-brand-mark">LH</span><span><strong>LUVIN HOME</strong><small>Editorial workspace</small></span></div>
      <button className="admin-sidebar-close" aria-label="Close admin navigation" onClick={() => setMenuOpen(false)}><X/></button>
      <nav aria-label="Admin navigation">
        {navigation.map(({label, path: itemPath, icon: Icon}) => {
          const active = itemPath === '/admin' ? path === itemPath : path.startsWith(itemPath)
          return <AdminLink key={itemPath} to={itemPath} onClick={() => setMenuOpen(false)} className={active ? 'is-active' : ''}><Icon size={18}/>{label}</AdminLink>
        })}
      </nav>
      <div className="admin-sidebar-footer"><span>Sanity connected</span><small>Production dataset</small></div>
    </aside>
    {menuOpen && <button className="admin-sidebar-backdrop" aria-label="Close admin navigation" onClick={() => setMenuOpen(false)}/>} 
    <div className="admin-workspace">
      <header className="admin-topbar">
        <button className="admin-menu-button" aria-label="Open admin navigation" onClick={() => setMenuOpen(true)}><Menu/></button>
        <div className="admin-user"><span>{user.picture ? <img src={user.picture} alt=""/> : user.name?.slice(0, 1)}</span><div><strong>{user.name}</strong><small>{user.email}</small></div></div>
        <button className="admin-logout" onClick={onLogout}><LogOut size={16}/> Logout</button>
      </header>
      <section className="admin-content">{page}</section>
    </div>
  </div>
}

export default function AdminApp() {
  const [path, setPath] = useState(window.location.pathname.replace(/\/$/, '') || '/admin')
  const [session, setSession] = useState({loading: true, authenticated: false, user: null})

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname.replace(/\/$/, '') || '/admin')
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  useEffect(() => {
    adminRequest('/api/auth/session').then(setSession).catch(() => setSession({loading: false, authenticated: false, user: null}))
  }, [])

  if (path === '/admin/access-denied') return <AccessDeniedPage/>
  if (session.loading) return <LoadingScreen/>
  if (!session.authenticated) return <LoginPage/>
  if (path === '/admin/login') {
    navigateAdmin('/admin')
    return <LoadingScreen/>
  }

  const logout = async () => {
    await adminRequest('/api/auth/logout', {method: 'POST'})
    setSession({loading: false, authenticated: false, user: null})
    navigateAdmin('/admin/login')
  }
  return <Shell user={session.user || {name: 'Luvin Admin', email: '', picture: ''}} path={path} onLogout={logout}/>
}
