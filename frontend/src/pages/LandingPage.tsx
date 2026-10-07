import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, BookOpen, CheckCircle2, Code2, RefreshCw, Search, Sparkles, SlidersHorizontal } from 'lucide-react'
import { getHealth, searchStandards, type BackendHealth, type BackendRecommendation } from '../api/client'
import Scanner from '../components/Scanner'
import MagicBento from '../components/MagicBento'

export function LandingPage() {
  const [health, setHealth] = useState<BackendHealth | null>(null)
  const [latency, setLatency] = useState<number | null>(null)
  const [query, setQuery] = useState('')
  const [standards, setStandards] = useState<BackendRecommendation[]>([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState('')

  const checkHealth = async () => {
    const started = performance.now()
    try {
      const result = await getHealth()
      setHealth(result)
      setLatency(Math.round(performance.now() - started))
    } catch {
      setHealth(null)
      setLatency(null)
    }
  }

  useEffect(() => {
    void checkHealth()
  }, [])

  const runSearch = async () => {
    if (!query.trim()) return
    setSearching(true)
    setSearchError('')
    try {
      const result = await searchStandards(query.trim())
      setStandards(result.results)
    } catch (error) {
      setStandards([])
      setSearchError(error instanceof Error ? error.message : 'Search failed.')
    } finally {
      setSearching(false)
    }
  }

  return (
    <div className="relative pb-16">
      <div className="mb-8 flex items-end justify-between gap-6">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#667083]"><span className="h-2 w-2 rounded-full bg-[#29b77b]" /> System operational</p>
          <h1 className="mt-5 text-4xl font-medium tracking-[-0.04em] text-[#12111a] md:text-5xl">Good morning, Shreyas<span className="text-[#7753ed]">.</span></h1>
          <p className="mt-2 text-base text-[#858190]">Here’s the pulse of your procurement intelligence workspace.</p>
        </div>
        <a href="https://github.com/Shreyasu1016/SIH" target="_blank" rel="noreferrer" className="hidden items-center gap-2 rounded-xl border border-[#e5e1ec] bg-white px-5 py-3 text-sm font-medium text-[#484553] shadow-sm md:flex"><Code2 className="h-4 w-4" /> View repository <ArrowUpRight className="h-4 w-4" /></a>
      </div>
      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="relative min-h-[375px] overflow-hidden rounded-[20px] bg-[#1a1728] p-10 text-white shadow-[0_24px_50px_rgba(34,22,67,0.14)] md:p-11">
        <Scanner
          color1="#5227FF"
          color2="#FF9FFC"
          color3="#FFFFFF"
          speed={0.5}
          sweepSpeed={0.25}
          sweepWidth={1.6}
          sweepFalloff={6}
          scale={1.5}
          frequency={2}
          ripple={0.22}
          bandDensity={11}
          lineSharpness={5.5}
          glow={0.22}
          scanDirection="vertical"
          colorSpread={0.7}
          brightness={1}
          contrast={1.15}
          softness={1.4}
          vignette={0.45}
          scanline
          grain
          grainIntensity={0.05}
          opacity={0.26}
          mouseInteraction
          mouseRadius={0.5}
          mouseStrength={0.5}
          className="hero-scanner"
        />
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(ellipse_at_20%_50%,rgba(164,128,255,.3),transparent_55%),linear-gradient(110deg,transparent,rgba(91,54,180,.12))]" />
        <div className="absolute inset-y-0 right-0 w-1/2 opacity-25 [background-image:linear-gradient(rgba(172,138,255,.28)_1px,transparent_1px),linear-gradient(90deg,rgba(172,138,255,.2)_1px,transparent_1px)] [background-size:36px_36px] [transform:perspective(450px)_rotateY(-18deg)]" />
        <div className="relative z-10 max-w-[520px]">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#b9a4ff]"><Sparkles className="h-4 w-4" /> Procurement intelligence</p>
          <h2 className="mt-6 text-4xl font-semibold leading-[1.08] tracking-[-0.04em] md:text-5xl">Make every tender<br /><span className="text-[#9a77ff]">decision defensible.</span></h2>
          <p className="mt-5 max-w-[470px] text-base leading-7 text-[#aaa4b7]">Find the right standards, spot compliance gaps, and move from brief to confident recommendation in less time.</p>
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <Link to="/upload" className="inline-flex items-center gap-2 rounded-[10px] bg-[#7048ef] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(112,72,239,.3)]">Explore standards <ArrowUpRight className="h-4 w-4" /></Link>
            <span className="inline-flex items-center gap-2 text-sm font-medium text-[#c2bdca]"><RefreshCw className="h-4 w-4" /> Refresh status</span>
          </div>
        </div>
        <div className="absolute bottom-7 right-8 text-right text-xs text-[#c5b9dc]"><p className="font-semibold uppercase tracking-[0.14em]">Live signal</p><p className="mt-1 text-sm text-white/90">Standards intelligence</p></div>
      </motion.section>
      <div className="mt-5 grid gap-5 md:grid-cols-3">
        {[
          { label: 'Standards indexed', value: '89', Icon: BookOpen, foot: 'Updated 2 min ago' },
          { label: 'Recommendations', value: '1,248', Icon: Sparkles, foot: 'Across 312 tenders' },
          { label: 'Compliance checks', value: '7,892', Icon: CheckCircle2, foot: '98.4% pass rate' },
        ].map(({ label, value, Icon, foot }) => (
          <MagicBento key={label} textAutoHide enableStars enableSpotlight enableBorderGlow enableTilt enableMagnetism clickEffect spotlightRadius={300} particleCount={12} glowColor="132, 0, 255">
            <div className="rounded-[20px] border border-[#e8e4ef] bg-white p-7 shadow-[0_8px_28px_rgba(37,27,62,.04)]"><div className="flex items-start justify-between"><p className="text-sm text-[#8a8493]"> {label}</p><Icon className="h-5 w-5 text-[#8060f2]" /></div><p className="mt-7 text-4xl font-medium tracking-[-0.04em] text-[#171522]">{value}</p><p className="mt-3 text-xs text-[#9993a1]">{foot}</p></div>
          </MagicBento>
        ))}
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.6fr_0.8fr]">
        <section className="rounded-[20px] border border-[#e8e4ef] bg-white p-7 shadow-[0_8px_28px_rgba(37,27,62,.04)]">
          <div className="flex items-center justify-between">
            <div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9b95a3]">Your library</p><h3 className="mt-1 text-lg font-semibold text-[#1b1925]">Recently surfaced standards</h3></div>
            <Link to="/versions" className="text-xs font-medium text-[#7251ed]">View all <ArrowUpRight className="inline h-3.5 w-3.5" /></Link>
          </div>
          <div className="mt-6 flex gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-lg border border-[#e8e4ef] px-3">
              <Search className="h-4 w-4 text-[#aaa4b2]" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') void runSearch() }} placeholder="Search by standard, topic or code…" className="w-full bg-transparent py-3 text-sm text-[#302c3a] outline-none placeholder:text-[#aaa4b2]" />
            </div>
            <button type="button" onClick={() => void runSearch()} disabled={searching} className="rounded-lg bg-[#7048ef] px-4 text-xs font-semibold text-white disabled:opacity-50">Search</button>
            <button type="button" className="hidden items-center gap-1 rounded-lg border border-[#e8e4ef] px-3 text-xs text-[#686274] sm:flex"><SlidersHorizontal className="h-3.5 w-3.5" /> Filters</button>
          </div>
          {searchError && <p className="mt-3 text-xs text-[#b5475b]">{searchError}</p>}
          <div className="mt-4 overflow-hidden rounded-xl border border-[#eeeaf3]">
            <div className="grid grid-cols-[1.1fr_1.7fr_0.9fr_0.8fr] gap-3 bg-[#faf9fc] px-4 py-3 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#a19baa]"><span>Standard</span><span>Title</span><span>Category</span><span>Status</span></div>
            {standards.length ? standards.map((standard) => (
              <div key={standard.is_number} className="grid grid-cols-[1.1fr_1.7fr_0.9fr_0.8fr] items-center gap-3 border-t border-[#eeeaf3] px-4 py-3.5 text-xs text-[#5f5a6c]"><span className="font-semibold text-[#292532]">{standard.is_number}</span><span>{standard.title}</span><span>BIS</span><span className="text-[#2c9d6d]">{Math.round(standard.similarity_score * 100)}% match</span></div>
            )) : <div className="px-4 py-8 text-center text-xs text-[#9993a1]">{searching ? 'Searching the standards catalogue…' : 'Search the live BIS standards catalogue.'}</div>}
          </div>
        </section>
        <section className="rounded-[20px] border border-[#e8e4ef] bg-white p-7 shadow-[0_8px_28px_rgba(37,27,62,.04)]">
          <div className="flex items-center justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9b95a3]">Infrastructure</p><h3 className="mt-1 text-lg font-semibold text-[#1b1925]">System health</h3></div><span className={`text-xs font-medium ${health ? 'text-[#2c9d6d]' : 'text-[#b5475b]'}`}>{health ? 'Operational' : 'Offline'}</span></div>
          <div className="mt-6 space-y-4">{[
            ['API gateway', health ? 'Connected' : 'Connection needs attention'],
            ['Data layer', health?.database.dialect ? `${health.database.dialect.toUpperCase()} database` : 'Unavailable'],
            ['Response time', latency ? `${latency} ms` : 'Waiting for first ping'],
          ].map(([name, value]) => <div key={name} className="flex items-center justify-between border-b border-[#f0edf4] pb-4 text-xs"><span className="flex items-center gap-2 text-[#686274]"><span className={`h-2 w-2 rounded-full ${health ? 'bg-[#2db477]' : 'bg-[#d36a6a]'}`} />{name}</span><span className="font-medium text-[#302c3a]">{value}</span></div>)}</div>
          <div className="mt-5 rounded-lg bg-[#faf9fc] p-3 text-[11px] text-[#777181]">{health ? JSON.stringify({ status: health.status, service: health.service, database: health.database }) : 'Failed to fetch. Start the backend to activate live data.'}</div>
          <button type="button" onClick={() => void checkHealth()} className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#7048ef]"><RefreshCw className="h-3.5 w-3.5" /> Test connection</button>
        </section>
      </div>
    </div>
  )
}
