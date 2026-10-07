import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, ChevronDown, Languages, Menu, Sparkles, X, Clock3 } from 'lucide-react'
import { useLanguage, type Locale } from '../../context/LanguageContext'
import { getHealth, type BackendHealth } from '../../api/client'

const links = [
  { to: '/', key: 'home' as const },
  { to: '/upload', key: 'upload' as const },
  { to: '/dashboard', key: 'dashboard' as const },
  { to: '/versions', key: 'versions' as const },
  { to: '/checklist', key: 'checklist' as const },
  { to: '/gaps', key: 'gaps' as const },
  { to: '/report', key: 'report' as const },
]

const localeLabels: Record<Locale, string> = {
  en: 'English',
  hi: 'हिन्दी',
}

export function Navbar() {
  const { t, locale, setLocale } = useLanguage()
  const [open, setOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [health, setHealth] = useState<BackendHealth | null>(null)
  const [healthLatency, setHealthLatency] = useState<number | null>(null)
  const location = useLocation()

  useEffect(() => {
    setOpen(false)
    setLangOpen(false)
  }, [location.pathname])

  useEffect(() => {
    let active = true
    const checkHealth = async () => {
      const started = performance.now()
      try {
        const result = await getHealth()
        if (active) {
          setHealth(result)
          setHealthLatency(Math.round(performance.now() - started))
        }
      } catch {
        if (active) {
          setHealth(null)
          setHealthLatency(null)
        }
      }
    }
    void checkHealth()
    return () => {
      active = false
    }
  }, [])

  return (
    <header className="sticky top-0 z-50 border-b border-[#e8e6ef] bg-[#fcfbfd]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[78px] max-w-[1380px] items-center justify-between gap-4 px-6 md:px-10 lg:ml-[232px]">
        <div className="flex items-center gap-5">
          <button type="button" className="rounded-md p-2 text-[#4b4a59] hover:bg-[#f0edf7] lg:hidden" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Link to="/" className="group flex items-center gap-2 lg:hidden">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6040e8] shadow-lg shadow-[#6040e8]/20">
              <Sparkles className="h-4 w-4 text-white" />
            </span>
            <span className="font-display text-lg font-bold tracking-tight text-[#171624]">Norm<span className="text-[#7251ed]">AI</span></span>
          </Link>
          <div className="hidden items-center gap-3 lg:flex">
            <button type="button" className="rounded-md p-2 text-[#4b4a59] hover:bg-[#f0edf7]" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
              <Menu className="h-5 w-5" />
            </button>
            <span className="text-sm text-[#aaa6b8]">Workspace</span>
            <span className="text-[#c7c3ce]">/</span>
            <span className="text-sm font-semibold text-[#242231]">Overview</span>
          </div>
        </div>

        <nav className="hidden items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm transition ${
                  isActive
                    ? 'bg-[#dce9e1] text-[#183d36]'
                    : 'text-[#60716a] hover:bg-[#e7ece7] hover:text-[#183d36]'
                }`
              }
            >
              {t.nav[l.key]}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2 text-sm text-[#7f7b8c] md:flex">
            <Clock3 className="h-4 w-4" />
            Sep 23, 2026
          </div>
          <button type="button" className="relative rounded-md p-2 text-[#777384] hover:bg-[#f0edf7]" aria-label="Notifications">
            <Bell className="h-[19px] w-[19px]" />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#7251ed]" />
          </button>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ddd0ff] text-xs font-semibold text-[#6949d9]">AS</span>
          <div className="hidden">
          <span
            className="hidden items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-[#718078] xl:flex"
            title={health ? `Database: ${health.database.dialect || 'unknown'}` : 'Backend unavailable'}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${health ? 'bg-[#0f766e]' : 'bg-[#b45309]'}`} />
            {health ? `API ${healthLatency}ms · ${health.database.dialect || 'db'}` : 'API offline'}
          </span>
          <div className="relative">
            <button
              type="button"
              onClick={() => setLangOpen((v) => !v)}
              className="glass flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-[#36524a]"
            >
              <Languages className="h-4 w-4 text-[#0f766e]" />
              <span className="hidden sm:inline">{localeLabels[locale]}</span>
              <ChevronDown className={`h-3.5 w-3.5 transition ${langOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {langOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.96 }}
                  className="glass-strong absolute right-0 mt-2 min-w-[140px] overflow-hidden rounded-xl py-1"
                >
                  {(Object.keys(localeLabels) as Locale[]).map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => {
                        setLocale(code)
                        setLangOpen(false)
                      }}
                      className={`block w-full px-4 py-2 text-left text-sm ${
                        locale === code ? 'bg-[#dce9e1] text-[#183d36]' : 'text-[#60716a] hover:bg-[#e7ece7]'
                      }`}
                    >
                      {localeLabels[code]}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          </div>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-[#dce3dc] lg:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-3">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.to === '/'}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2.5 text-sm ${
                      isActive ? 'bg-[#dce9e1] text-[#183d36]' : 'text-[#60716a]'
                    }`
                  }
                >
                  {t.nav[l.key]}
                </NavLink>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
