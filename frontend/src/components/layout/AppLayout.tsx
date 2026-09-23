import { Outlet, useLocation, NavLink } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Navbar } from './Navbar'
import { BarChart3, BookOpen, ChevronDown, FileText, FolderKanban, LayoutDashboard, Settings, ShieldCheck } from 'lucide-react'

const sidebarSections = [
  {
    label: 'WORKSPACE',
    items: [
      { to: '/', label: 'Overview', icon: LayoutDashboard },
      { to: '/versions', label: 'Standards library', icon: BookOpen, count: '89' },
      { to: '/upload', label: 'Tender analysis', icon: FileText },
      { to: '/checklist', label: 'Certifications', icon: ShieldCheck },
    ],
  },
  {
    label: 'OUTPUT',
    items: [
      { to: '/report', label: 'Reports', icon: BarChart3 },
      { to: '/gaps', label: 'Settings', icon: Settings },
    ],
  },
]

export function AppLayout() {
  const location = useLocation()

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fcfbfd]">
      <aside className="fixed inset-y-0 left-0 z-[60] hidden w-[232px] bg-[#171522] px-4 py-5 text-white lg:block">
        <NavLink to="/" className="flex items-center gap-2 px-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7351ed]"><FolderKanban className="h-4 w-4" /></span>
          <span><span className="block text-[15px] font-semibold tracking-tight">procure<span className="text-[#a88dff]">pro</span></span><span className="block text-[8px] uppercase tracking-[0.16em] text-[#8b8799]">procurement intelligence</span></span>
        </NavLink>
        <div className="mt-10 rounded-lg border border-[#373143] bg-[#211d2d] px-3 py-2.5">
          <p className="text-[9px] uppercase tracking-[0.14em] text-[#898496]">Active project</p>
          <div className="mt-1 flex items-center justify-between text-xs font-medium"><span>General workspace</span><ChevronDown className="h-3.5 w-3.5 text-[#aaa4b7]" /></div>
        </div>
        <div className="mt-9 space-y-8">
          {sidebarSections.map((section) => (
            <div key={section.label}>
              <p className="px-2 text-[9px] font-semibold tracking-[0.18em] text-[#777184]">{section.label}</p>
              <nav className="mt-3 space-y-1">
                {section.items.map(({ to, label, icon: Icon, count }) => (
                  <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `flex items-center justify-between rounded-lg px-2.5 py-2.5 text-xs transition ${isActive ? 'bg-[#302848] text-white' : 'text-[#9a95a7] hover:bg-[#242032] hover:text-white'}`}>
                    <span className="flex items-center gap-3"><Icon className="h-4 w-4" />{label}</span>{count && <span className="text-[10px] text-[#a991ff]">{count}</span>}
                  </NavLink>
                ))}
              </nav>
            </div>
          ))}
        </div>
      </aside>
      <Navbar />
      <main className="mx-auto max-w-[1380px] px-6 py-8 md:px-10 md:py-12 lg:ml-[232px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
