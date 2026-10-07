import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import en from '../locales/en.json'
import hi from '../locales/hi.json'

export type Locale = 'en' | 'hi'

type Messages = typeof en

interface LanguageContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: Messages
}

const dictionaries: Record<Locale, Messages> = { en, hi }

const LanguageContext = createContext<LanguageContextValue | null>(null)

/** Provides EN/HI copy for navbar + hero/upload strings (extend as features grow). */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('en')
  const value = useMemo(
    () => ({ locale, setLocale, t: dictionaries[locale] }),
    [locale],
  )
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
