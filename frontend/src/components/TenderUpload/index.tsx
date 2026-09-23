import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, FileUp, Loader2, Type } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { GlassCard } from '../ui/GlassCard'
import { recommendDocument, recommendText } from '../../api/client'

type UploadState = 'idle' | 'dragging' | 'uploading' | 'success' | 'error'

/** Drag-and-drop upload + paste-text toggle — mock only, navigates to dashboard. */
export function TenderUpload() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [state, setState] = useState<UploadState>('idle')
  const [fileName, setFileName] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [pasteMode, setPasteMode] = useState(false)
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)

  const simulateUpload = useCallback((file: File) => {
    setSelectedFile(file)
    setFileName(file.name)
    setState('uploading')
    setError(null)
    window.setTimeout(() => setState('success'), 400)
  }, [])

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) simulateUpload(file)
    else setState('idle')
  }

  const onAnalyze = async () => {
    if (state !== 'success' && !text.trim()) return
    setError(null)
    setState('uploading')
    try {
      const result = selectedFile && !pasteMode
        ? await recommendDocument(selectedFile)
        : await recommendText(text.trim())
      navigate('/dashboard', { state: { recommendation: result } })
    } catch (requestError) {
      setState('error')
      setError(requestError instanceof Error ? requestError.message : 'Unable to contact the backend.')
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold md:text-4xl">{t.upload.title}</h1>
        <p className="mt-2 text-slate-400">Submit a tender PDF or paste a specification for live standards recommendations.</p>
      </div>

      <GlassCard>
        <button
          type="button"
          onClick={() => setPasteMode((v) => !v)}
          className={`mb-4 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition ${
            pasteMode ? 'bg-teal-500/20 text-teal-200' : 'bg-white/5 text-slate-300 hover:bg-white/10'
          }`}
        >
          <Type className="h-4 w-4" />
          {t.upload.pasteToggle}
        </button>

        <AnimatePresence mode="wait">
          {pasteMode ? (
            <motion.div
              key="paste"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={10}
                placeholder={t.upload.pastePlaceholder}
                className="w-full rounded-2xl border border-white/10 bg-navy-900/60 p-4 text-sm text-slate-100 outline-none ring-sky-500/40 placeholder:text-slate-500 focus:ring-2"
              />
            </motion.div>
          ) : (
            <motion.label
              key="drop"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              onDragOver={(e) => {
                e.preventDefault()
                setState('dragging')
              }}
              onDragLeave={() => setState((s) => (s === 'dragging' ? 'idle' : s))}
              onDrop={onDrop}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-16 transition ${
                state === 'dragging'
                  ? 'border-sky-400 bg-sky-500/10'
                  : state === 'success'
                    ? 'border-emerald-400/50 bg-emerald-500/5'
                    : 'border-white/15 bg-white/[0.03] hover:border-sky-400/40'
              }`}
            >
              <input
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) simulateUpload(f)
                }}
              />
              {state === 'uploading' ? (
                <Loader2 className="h-12 w-12 animate-spin text-sky-400" />
              ) : state === 'success' ? (
                <CheckCircle2 className="h-12 w-12 text-emerald-400" />
              ) : (
                <FileUp className="h-12 w-12 text-sky-400" />
              )}
              <p className="mt-4 font-medium text-slate-100">
                {state === 'uploading'
                  ? 'Uploading…'
                  : state === 'success'
                    ? fileName
                    : t.upload.drop}
              </p>
              {state === 'idle' || state === 'dragging' ? (
                <p className="mt-1 text-sm text-slate-500">{t.upload.browse}</p>
              ) : null}
            </motion.label>
          )}
        </AnimatePresence>

        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={onAnalyze}
          disabled={state !== 'success' && !text.trim()}
          className="mt-6 w-full rounded-xl bg-gradient-to-r from-sky-500 to-violet-600 px-6 py-3 font-semibold text-white shadow-lg shadow-sky-500/25 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {t.upload.analyze}
        </motion.button>
        {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
      </GlassCard>
    </div>
  )
}
