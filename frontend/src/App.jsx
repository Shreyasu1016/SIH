import { useRef, useState } from 'react'
import {
  ArrowRight, BarChart3, CheckCircle2, ChevronDown, Clipboard, FileJson,
  FileText, HelpCircle, Info, LayoutDashboard, Menu, RefreshCw, Search,
  Settings, ShieldCheck, Sparkles, UploadCloud, X,
} from 'lucide-react'
import Scanner from './components/Scanner'
import SplitFlapText from './components/SplitFlapText'
import LatticeLoader from './components/LatticeLoader'
import MagicBento from './components/MagicBento'
import './App.css'

const API_BASE_URL = 'http://localhost:8000'
const sourceLabel = (source, language) => {
  const names = { groq: 'Groq', ollama: 'Local AI', rule_based: 'Offline rules' }
  const languageName = language && language !== 'en' ? ` · ${language.toUpperCase()} aware` : ''
  return `${names[source] || source || 'Catalogue explanation'}${languageName}`
}

function Score({ value }) {
  const percent = Math.round((Number(value) || 0) * 100)
  return <div className="score"><div className="score-track"><span style={{ width: `${Math.min(100, percent)}%` }} /></div><b>{percent}%</b></div>
}

function StandardCard({ item, index }) {
  const [open, setOpen] = useState(index === 0)
  const metadata = item.version_info || {}
  const relations = item.allied_standards || {}
  const certifications = item.certifications || []
  return (
    <article className={`standard-card ${open ? 'is-open' : ''}`}>
      <button className="standard-header" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className="rank">{String(index + 1).padStart(2, '0')}</span>
        <span className="standard-title"><strong>{item.is_number || 'Standard'}</strong><span>{item.title || 'Untitled standard'}</span></span>
        <Score value={item.confidence ?? item.similarity_score} />
        <ChevronDown className="chevron" size={18} />
      </button>
      {open && <div className="standard-body">
        <div className="explanation"><Sparkles size={16} /><p>{item.explanation || 'This standard aligns with the submitted procurement requirement.'}</p></div>
        <div className="meta-grid">
          <div><label>Latest version</label><b>{metadata.latest_version || '—'}</b></div>
          <div><label>Reaffirmed</label><b>{metadata.reaffirmation_year || '—'}</b></div>
          <div><label>Certification</label><b>{item.certification_flag || (certifications.length ? 'Applicable' : 'Review required')}</b></div>
        </div>
        {certifications.length > 0 && <div className="allied"><label>Conformity marks</label><div className="allied-list">{certifications.map((cert, i) => <span className={`cert-badge ${cert.mandatory ? 'mandatory' : ''}`} key={`${cert.certification_type}-${i}`}><b>{cert.certification_type || 'BIS'}</b> {cert.mandatory ? 'Mandatory' : 'Non-mandatory'}</span>)}</div></div>}
        {Object.keys(relations).some(key => relations[key]?.length) && <details className="allied-details"><summary>Allied standards by relationship</summary>{Object.entries(relations).filter(([, values]) => values?.length).map(([type, values]) => <div className="relation-group" key={type}><label>{type.replaceAll('_', ' ')}</label><div className="allied-list">{values.map((standard, i) => <span key={`${standard.is_number}-${i}`}>{standard.is_number} · {standard.title}</span>)}</div></div>)}</details>}
      </div>}
    </article>
  )
}

export default function App() {
  const [query, setQuery] = useState('')
  const [file, setFile] = useState(null)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [requestStatus, setRequestStatus] = useState('idle')
  const [apiOnline, setApiOnline] = useState(null)
  const [mobileNav, setMobileNav] = useState(false)
  const fileInput = useRef(null)

  const recommend = async (event) => {
    event?.preventDefault()
    if (!query.trim() && !file) return setError('Describe a requirement or upload a PDF to begin.')
    setLoading(true); setRequestStatus('working'); setError('')
    try {
      const options = file
        ? (() => { const body = new FormData(); body.append('file', file); return { body } })()
        : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: query.trim(), top_k: 5 }) }
      const endpoint = file ? '/api/recommend-from-document' : '/api/recommend'
      const response = await fetch(`${API_BASE_URL}${endpoint}`, { method: 'POST', ...options })
      const result = await response.json()
      if (!response.ok) throw new Error(result.detail || 'The recommendation service could not complete this request.')
      setData(result); setRequestStatus('done')
      document.querySelector('#results')?.scrollIntoView({ behavior: 'smooth' })
    } catch (err) { setError(err.message || 'Unable to reach the recommendation service.'); setRequestStatus('error') } finally { setLoading(false) }
  }

  const reset = () => { setData(null); setQuery(''); setFile(null); setError(''); setRequestStatus('idle'); setApiOnline(null) }
  const checkApi = async () => { try { const response = await fetch(`${API_BASE_URL}/health`); setApiOnline(response.ok) } catch { setApiOnline(false) } }
  const tickerWords = requestStatus === 'working' ? ['SCANNING CATALOGUE', 'RANKING EVIDENCE', 'CHECKING RELATIONSHIPS'] : ['READY FOR REQUIREMENT', 'BIS CATALOGUE CONNECTED']
  const nav = [['dashboard', 'Overview', LayoutDashboard], ['input', 'New analysis', Search], ['results', 'Results', BarChart3], ['settings', 'Settings', Settings]]
  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? 'is-visible' : ''}`}>
        <div className="brand"><div className="brand-mark"><ShieldCheck size={19} /></div><div><strong>PROCURE<span>PRO</span></strong><small>Procurement intelligence</small></div></div>
        <div className="workspace-selector"><span className="workspace-avatar">MP</span><span><b>Municipal procurement</b><small>Workspace</small></span><ChevronDown size={15} /></div>
        <div className="nav-caption">WORKSPACE</div>
        <nav>{nav.slice(0, 3).map(([key, label, Icon]) => <a href={key === 'input' ? '#hero' : `#${key}`} className={key === 'dashboard' ? 'active' : ''} key={key} onClick={() => setMobileNav(false)}><Icon size={17} />{label}{key === 'results' && data && <i />}</a>)}</nav>
        <div className="nav-caption manage-caption">MANAGE</div>
        <nav><a href="#health" onClick={() => setMobileNav(false)}><Settings size={17} />System health</a><a href="#developer" onClick={() => setMobileNav(false)}><FileJson size={17} />Developer API</a></nav>
        <div className="sidebar-bottom"><a href="#footer"><HelpCircle size={17} />Help centre</a><div className="profile"><span className="profile-avatar">AK</span><span><b>Admin workspace</b><small>admin@procurepro.in</small></span><ChevronDown size={15} /></div></div>
      </aside>
      <div className="main-shell">
        <header className="topbar"><button className="mobile-menu" onClick={() => setMobileNav(!mobileNav)} aria-label="Open navigation"><Menu size={20} /></button><div className="breadcrumb">Workspace <span>/</span> Overview</div><div className="topbar-meta"><span className={`status-dot ${apiOnline === false ? 'offline' : ''}`} /> <SplitFlapText words={tickerWords} text="READY FOR REQUIREMENT" flipDuration={120} stagger={60} cycleDelay={2400} charset="alphanumeric" flipsPerChar={8} tileColor="#18233a" textColor="#dbeafe" tileRadius={3} gap={4} fontSize={11} loop padTo={22} /></div><button className="top-action" onClick={checkApi}>API STATUS {apiOnline === true ? '· ONLINE' : apiOnline === false ? '· OFFLINE' : ''}</button><button className="avatar-button">AK</button></header>
        <main className="content">
          <section className="page-header"><div><div className="eyebrow">PROCUREMENT WORKSPACE</div><h1>Good morning, <em>Akash.</em></h1><p>Turn technical requirements into confident, evidence-backed standards.</p></div><button className="outline-button" onClick={reset}><RefreshCw size={15} /> Reset session</button></section>
          <section className="hero" id="hero">
            <div className="hero-copy"><div className="eyebrow accent">AI-POWERED STANDARDS DISCOVERY</div><h2>Find the standard<br /><em>behind the requirement.</em></h2><p>Describe a procurement need in any language or upload a tender document. ProcurePro maps it to the right Indian Standards.</p>
              <form onSubmit={recommend} className="input-grid"><div className="query-panel panel"><div className="panel-label"><span>TEXT BRIEF</span><span className="char-count">{query.length} / 2,000</span></div><textarea value={query} maxLength={2000} onChange={e => setQuery(e.target.value)} placeholder="e.g. Energy-efficient LED street lighting for a municipal road..." /><div className="panel-hint"><Info size={14} /> Supports English, Hindi and regional languages.</div></div><div className="or-rule"><span>OR</span></div><div className="upload-panel panel" onClick={() => fileInput.current?.click()} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); setFile(e.dataTransfer.files[0]) }}><input ref={fileInput} type="file" accept=".pdf,application/pdf" onChange={e => setFile(e.target.files[0])} />{file ? <><CheckCircle2 size={24} /><strong>{file.name}</strong><small>{(file.size / 1024 / 1024).toFixed(2)} MB · PDF ready</small><button type="button" className="remove-file" onClick={e => { e.stopPropagation(); setFile(null) }}><X size={14} /> Remove</button></> : <><UploadCloud size={24} /><strong>Drop a tender PDF here</strong><small>or click to browse · max 10 MB</small></>}</div><button className="primary-action" disabled={loading}>{loading ? <><RefreshCw className="spin" size={17} /> ANALYSING REQUIREMENT</> : <>RUN RECOMMENDATION <ArrowRight size={17} /></>}</button></form>
              {error && <div className="error-message">{error}</div>}{requestStatus !== 'idle' && <LatticeLoader status={requestStatus} label={`Thinking${data?.explanation_source ? ` (${sourceLabel(data.explanation_source)})` : ''}`} doneLabel="Recommendation ready" errorLabel="Recommendation unavailable" pattern="orbit" grid={3} shape="round" doneColor="#16A34A" errorColor="#DC2626" cellSize={6} gap={2} fontSize={13} step={90} idleOpacity={0.15} glow={false} showTimer />}
            </div>
            <div className="scanner-half"><div className="scanner-caption"><span className="scanner-pulse" /> LIVE CATALOGUE SCANNER</div><Scanner color1="#5227FF" color2="#4F46E5" color3="#22D3EE" speed={0.5} sweepSpeed={0.25} sweepWidth={1.6} sweepFalloff={6} scale={1.5} frequency={2} ripple={0.22} bandDensity={11} lineSharpness={5.5} glow={0.35} scanDirection="vertical" colorSpread={0.9} brightness={1.15} opacity={1} mouseInteraction={true} mouseRadius={0.5} mouseStrength={0.5} /></div>
          </section>
          <MagicBento className="stat-grid"><div><span>QUERIES THIS MONTH</span><strong>1,284</strong><small className="positive">↑ 18.4% from last month</small></div><div><span>STANDARDS INDEXED</span><strong>24,691</strong><small>Across 42 BIS categories</small></div><div><span>AVG. CONFIDENCE</span><strong>92.8%</strong><small className="positive">↑ 3.2% this quarter</small></div><div><span>API STATUS</span><strong className={apiOnline === false ? 'bad' : 'good'}>{apiOnline === false ? 'Offline' : 'Operational'}</strong><small>Last checked just now</small></div></MagicBento>
          <section className="lower-grid" id="results"><MagicBento className="results-column"><div className="section-heading"><div><div className="eyebrow">RECENT ANALYSIS</div><h2>{data ? `${data.results?.length || 0} relevant standards` : 'Your recommendations'}</h2></div><button className="text-button" onClick={() => document.querySelector('#hero')?.scrollIntoView({ behavior: 'smooth' })}>+ New analysis</button></div>{data ? <><div className="query-summary"><Search size={16} /><span>{data.query || 'Uploaded PDF'}</span><b>{sourceLabel(data.explanation_source, data.language)}</b></div>{(data.results || []).map((item, i) => <StandardCard key={`${item.is_number}-${i}`} item={item} index={i} />)}</> : <div className="empty-state"><FileText size={28} /><b>No analyses yet</b><span>Run your first recommendation above to see standards here.</span></div>}</MagicBento><div className="system-column"><MagicBento className="health-card" id="health"><div className="section-heading"><div><div className="eyebrow">SYSTEM HEALTH</div><h2>All systems operational</h2></div><span className="health-dot" /></div><div className="health-row"><span>Recommendation API</span><b>Operational</b></div><div className="health-row"><span>BIS standards catalogue</span><b>Synced · 2h ago</b></div><div className="health-row"><span>Explanation engine</span><b>Operational</b></div></MagicBento><MagicBento className="json-card" id="developer"><div className="json-header"><span><FileJson size={16} /> DEVELOPER API</span><button aria-label="Copy API endpoint"><Clipboard size={15} /></button></div><code><span className="json-key">POST</span> /api/recommend<br /><span className="json-muted">Accepts multilingual briefs and returns ranked standards.</span></code></MagicBento></div></section>
        </main>
        <footer className="footer" id="footer"><span>© 2025 PROCUREPRO</span><span>Evidence-backed procurement intelligence</span><span>Privacy · Documentation</span></footer>
      </div>
    </div>
  )
}
