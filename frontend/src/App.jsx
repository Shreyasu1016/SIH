import { useRef, useState } from 'react'
import {
  ArrowRight, CheckCircle2, ChevronDown, Clipboard, Info, RefreshCw,
  Search, ShieldCheck, Sparkles, UploadCloud, X,
} from 'lucide-react'
import Scanner from './components/Scanner'
import SplitFlapText from './components/SplitFlapText'
import LatticeLoader from './components/LatticeLoader'
import './App.css'

const API_BASE_URL = 'http://localhost:8000'
const sourceLabel = (source, language) => {
  const names = { groq: 'Groq', ollama: 'Local AI', rule_based: 'Offline rules' }
  const languageName = language && language !== 'en' ? ` · ${language.toUpperCase()} aware` : ''
  return `${names[source] || source || 'catalogue explanation'}${languageName}`
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
          <div><label>Certification</label><b>{item.certification_flag || (item.certifications?.length ? 'Applicable' : 'Review required')}</b></div>
        </div>
        {certifications.length > 0 && <div className="allied"><label>Conformity marks</label><div className="allied-list">{certifications.map((cert, i) => <span className={`cert-badge ${cert.mandatory ? 'mandatory' : ''}`} key={`${cert.certification_type}-${i}`}><b>{cert.certification_type || 'BIS'}</b> {cert.mandatory ? 'Mandatory' : 'Non-mandatory'}</span>)}</div></div>}
        {Object.keys(relations).some(key => relations[key]?.length) && <details className="allied-details"><summary>Allied standards by relationship</summary>{Object.entries(relations).filter(([, values]) => values?.length).map(([type, values]) => <div className="relation-group" key={type}><label>{type.replaceAll('_', ' ')}</label><div className="allied-list">{values.map((standard, i) => <span key={`${standard.is_number}-${i}`}>{standard.is_number} · {standard.title}</span>)}</div></div>)}</details>}
      </div>}
    </article>
  )
}

export default function App() {
  const [tab, setTab] = useState('input')
  const [query, setQuery] = useState('')
  const [file, setFile] = useState(null)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [requestStatus, setRequestStatus] = useState('idle')
  const [apiOnline, setApiOnline] = useState(null)
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
      setData(result); setTab('results'); setRequestStatus('done')
    } catch (err) { setError(err.message || 'Unable to reach the recommendation service.'); setRequestStatus('error') } finally { setLoading(false) }
  }

  const reset = () => { setData(null); setQuery(''); setFile(null); setError(''); setRequestStatus('idle'); setApiOnline(null); setTab('input') }
  const checkApi = async () => { try { const response = await fetch(`${API_BASE_URL}/health`); setApiOnline(response.ok) } catch { setApiOnline(false) } }
  const tickerWords = requestStatus === 'working' ? ['SCANNING CATALOGUE', 'RANKING EVIDENCE', 'CHECKING RELATIONSHIPS'] : ['READY FOR REQUIREMENT', 'BIS CATALOGUE CONNECTED']
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand"><div className="brand-mark"><ShieldCheck size={20} /></div><div><strong>STANDARD<span> // </span>DESK</strong><small>Government procurement intelligence</small></div></div>
        <div className="topbar-meta"><span className={`status-dot ${apiOnline === false ? 'offline' : ''}`} /> <SplitFlapText words={tickerWords} text="READY FOR REQUIREMENT" flipDuration={120} stagger={60} cycleDelay={2400} charset="alphanumeric" flipsPerChar={8} tileColor="#111827" textColor="#f8fafc" tileRadius={4} gap={6} fontSize={13} loop padTo={28} /> <span className="divider" /> BIS CATALOGUE · 2025.04</div>
        <div className="header-actions"><button className="utility-button" onClick={checkApi}>API STATUS {apiOnline === true ? '· ONLINE' : apiOnline === false ? '· OFFLINE' : ''}</button><button className="utility-button" onClick={reset}>RESET SESSION</button></div>
      </header>
      <div className="workspace">
        <nav className="section-nav" aria-label="Sections">
          <div className="nav-caption">WORKSPACE</div>
          {[['input', '01', 'Input'], ['results', '02', 'Results'], ['about', '03', 'About']].map(([key, number, label]) => <button key={key} className={tab === key ? 'active' : ''} onClick={() => setTab(key)}><span>{number}</span>{label}{key === 'results' && data && <i />}</button>)}
          <div className="nav-footer"><span>SECURE SESSION</span><b>LOCAL API / 8000</b></div>
        </nav>
        <main className="content">
          {tab === 'input' && <section className="input-view">
            <Scanner
              color1="#5227FF" color2="#FF9FFC" color3="#FFFFFF"
              speed={0.5} sweepSpeed={0.25} sweepWidth={1.6} sweepFalloff={6}
              scale={1.5} frequency={2} ripple={0.22} bandDensity={11}
              lineSharpness={5.5} glow={0.22} scanDirection="vertical"
              colorSpread={0.7} brightness={0.85} contrast={1.1} softness={1.4}
              vignette={0.5} scanline grain grainIntensity={0.04}
              opacity={0.13} mouseInteraction mouseRadius={0.5} mouseStrength={0.5}
            />
            <div className="eyebrow">PROCUREMENT / STANDARDS DISCOVERY</div>
            <h1>Find the standard<br /><em>behind the requirement.</em></h1>
            <p className="lede">Translate a technical requirement into an evidence-backed Indian Standard recommendation. Search in plain language or submit a tender document.</p>
            <form onSubmit={recommend} className="input-grid">
              <div className="query-panel panel">
                <div className="panel-label"><span>01 / TEXT BRIEF</span><span className="char-count">{query.length} / 2,000</span></div>
                <textarea value={query} maxLength={2000} onChange={e => setQuery(e.target.value)} placeholder="e.g. Supply and installation of energy-efficient LED street lighting for a municipal road..." />
                <div className="panel-hint"><Info size={14} /> Include material, performance, application or certification details.</div>
              </div>
              <div className="or-rule"><span>OR</span></div>
              <div className="upload-panel panel" onClick={() => fileInput.current?.click()} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); setFile(e.dataTransfer.files[0]) }}>
                <input ref={fileInput} type="file" accept=".pdf,application/pdf" onChange={e => setFile(e.target.files[0])} />
                {file ? <><CheckCircle2 size={27} /><strong>{file.name}</strong><small>{(file.size / 1024 / 1024).toFixed(2)} MB · PDF ready</small><button type="button" className="remove-file" onClick={e => { e.stopPropagation(); setFile(null) }}><X size={14} /> Remove</button></> : <><UploadCloud size={27} /><strong>Drop a PDF here</strong><small>or click to browse · max 10 MB</small></>}
              </div>
              <button className="primary-action" disabled={loading}>{loading ? <><RefreshCw className="spin" size={18} /> ANALYSING REQUIREMENT</> : <>RUN RECOMMENDATION <ArrowRight size={18} /></>}</button>
            </form>
            {error && <div className="error-message">{error}</div>}
            {requestStatus !== 'idle' && <LatticeLoader status={requestStatus} label={`Thinking${data?.explanation_source ? ` (${sourceLabel(data.explanation_source)})` : ''}`} doneLabel="Recommendation ready" errorLabel="Recommendation unavailable" pattern="orbit" grid={3} shape="round" doneColor="#16A34A" errorColor="#DC2626" cellSize={6} gap={2} fontSize={13} step={90} idleOpacity={0.15} glow={false} showTimer />}
          </section>}
          {tab === 'results' && <section className="results-view">
            <div className="results-heading"><div><div className="eyebrow">ANALYSIS / RECOMMENDATIONS</div><h2><SplitFlapText text={data ? `${data.results?.length || 0} relevant standards` : 'Awaiting input'} /></h2></div><button className="quiet-action" onClick={reset}><RefreshCw size={15} /> New search</button></div>
            {loading && <LatticeLoader status="working" label="Thinking" doneLabel="Recommendation ready" errorLabel="Recommendation unavailable" pattern="orbit" grid={3} shape="round" doneColor="#16A34A" errorColor="#DC2626" cellSize={6} gap={2} fontSize={13} step={90} idleOpacity={0.15} glow={false} showTimer />}
            {!loading && data && <><div className="query-summary"><Search size={16} /><span>{data.query || 'Uploaded PDF'}</span><b>{sourceLabel(data.explanation_source, data.language)}</b></div><div className="results-list">{(data.results || []).map((item, i) => <StandardCard key={`${item.is_number}-${i}`} item={item} index={i} />)}</div>{!data.results?.length && <div className="empty-state">No matching standards were returned. Try adding more technical detail.</div>}</>}
            {!data && !loading && <div className="empty-state">Run a search from the Input section to see recommendations.</div>}
          </section>}
          {tab === 'about' && <section className="about-view"><div className="eyebrow">ABOUT / METHOD</div><h1>Public standards,<br /><em>clearer decisions.</em></h1><p className="lede">StandardDesk helps procurement teams move from an open-ended technical brief to an auditable shortlist of Indian Standards.</p><div className="about-cards"><div className="about-card"><span>01</span><h3>Retrieve</h3><p>Semantic search finds relevant standards from the BIS catalogue, beyond exact keyword matches.</p></div><div className="about-card"><span>02</span><h3>Explain</h3><p>Each recommendation includes a plain-language rationale, confidence and catalogue metadata.</p></div><div className="about-card"><span>03</span><h3>Connect</h3><p>Allied standards and certification relationships keep the wider compliance context visible.</p></div></div><div className="about-note"><Clipboard size={18} /><span>Recommendations support professional judgement. Always verify the current standard and tender conditions before issue.</span></div></section>}
        </main>
      </div>
      <footer className="footer"><span>© 2025 STANDARDS DESK</span><span>Ministry-grade interface for responsible procurement</span></footer>
    </div>
  )
}
