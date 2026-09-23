import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight, BookOpen, CheckCircle2, Code2, RefreshCw, Sparkles } from 'lucide-react'

export function LandingPage() {
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
          <div key={label} className="rounded-[20px] border border-[#e8e4ef] bg-white p-7 shadow-[0_8px_28px_rgba(37,27,62,.04)]"><div className="flex items-start justify-between"><p className="text-sm text-[#8a8493]">{label}</p><Icon className="h-5 w-5 text-[#8060f2]" /></div><p className="mt-7 text-4xl font-medium tracking-[-0.04em] text-[#171522]">{value}</p><p className="mt-3 text-xs text-[#9993a1]">{foot}</p></div>
        ))}
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.6fr_0.8fr]">
        <section className="rounded-[20px] border border-[#e8e4ef] bg-white p-7 shadow-[0_8px_28px_rgba(37,27,62,.04)]">
          <div className="flex items-center justify-between">
            <div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9b95a3]">Your library</p><h3 className="mt-1 text-lg font-semibold text-[#1b1925]">Recently surfaced standards</h3></div>
            <Link to="/versions" className="text-xs font-medium text-[#7251ed]">View all <ArrowUpRight className="inline h-3.5 w-3.5" /></Link>
          </div>
          <div className="mt-6 overflow-hidden rounded-xl border border-[#eeeaf3]">
            <div className="grid grid-cols-[1.1fr_1.7fr_0.9fr_0.8fr] gap-3 bg-[#faf9fc] px-4 py-3 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#a19baa]"><span>Standard</span><span>Title</span><span>Category</span><span>Status</span></div>
            {[
              ['IS 2925:1984', 'Industrial safety helmets', 'Safety', 'Current'],
              ['IS 4151:2015', 'Motorcycle helmets', 'Transport', 'Current'],
              ['IS 8519:1977', 'Protective equipment', 'Safety', 'Review'],
            ].map(([code, title, category, status]) => (
              <div key={code} className="grid grid-cols-[1.1fr_1.7fr_0.9fr_0.8fr] items-center gap-3 border-t border-[#eeeaf3] px-4 py-3.5 text-xs text-[#5f5a6c]"><span className="font-semibold text-[#292532]">{code}</span><span>{title}</span><span>{category}</span><span className={status === 'Current' ? 'text-[#2c9d6d]' : 'text-[#b87935]'}>{status}</span></div>
            ))}
          </div>
        </section>
        <section className="rounded-[20px] border border-[#e8e4ef] bg-white p-7 shadow-[0_8px_28px_rgba(37,27,62,.04)]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9b95a3]">Infrastructure</p><h3 className="mt-1 text-lg font-semibold text-[#1b1925]">System health</h3>
          <div className="mt-6 space-y-4">{[['Recommendation engine','Operational'],['Standards index','89 standards'],['Database connection','Healthy']].map(([name, value]) => <div key={name} className="flex items-center justify-between border-b border-[#f0edf4] pb-4 text-xs"><span className="flex items-center gap-2 text-[#686274]"><span className="h-2 w-2 rounded-full bg-[#2db477]" />{name}</span><span className="font-medium text-[#302c3a]">{value}</span></div>)}</div>
        </section>
      </div>
    </div>
  )
}
