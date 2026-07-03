'use client'
import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { InvitationConfig } from '@/lib/types'
import InvitationPreview from '@/components/admin/InvitationPreview'
import {
  DesignSpec, DEFAULT_SPEC, TEMPLATES, sanitizeSpec, specToCssVars,
} from '@/lib/design/spec'

const COLOR_FIELDS: { key: keyof DesignSpec; label: string }[] = [
  { key: 'primary',      label: 'צבע ראשי (שם, תאריך, פסים)' },
  { key: 'primaryLight', label: 'צבע ראשי בהיר (הברקת הפסים)' },
  { key: 'ink',          label: 'צבע טקסט' },
  { key: 'muted',        label: 'טקסט משני' },
  { key: 'accent',       label: 'הדגשה (פרשה) + עלים' },
  { key: 'leaf',         label: 'עלים משני' },
  { key: 'divider',      label: 'קווי הפרדה' },
  { key: 'cardBg',       label: 'רקע הכרטיס' },
  { key: 'frame',        label: 'מסגרת הכרטיס' },
  { key: 'bgFrom',       label: 'רקע העמוד — עליון' },
  { key: 'bgTo',         label: 'רקע העמוד — תחתון' },
]

function specsEqual(a: DesignSpec, b: DesignSpec) {
  return JSON.stringify(a) === JSON.stringify(b)
}

export default function DesignStudioPage() {
  const [config, setConfig] = useState<Partial<InvitationConfig>>({})
  const [draft, setDraft] = useState<DesignSpec>(DEFAULT_SPEC)
  const [published, setPublished] = useState<DesignSpec | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const [actionError, setActionError] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/design', { cache: 'no-store' }).then(async r => {
        if (!r.ok) throw new Error((await r.json().catch(() => ({})))?.error || `שגיאה ${r.status}`)
        return r.json()
      }),
      fetch('/api/config', { cache: 'no-store' }).then(r => r.json()).catch(() => ({})),
    ])
      .then(([d, c]) => {
        setDraft(sanitizeSpec(d.draft))
        setPublished(d.published ? sanitizeSpec(d.published) : null)
        setConfig(c)
      })
      .catch(err => setLoadError((err as Error).message))
      .finally(() => setLoading(false))
  }, [])

  const vars = useMemo(() => specToCssVars(draft) as CSSProperties, [draft])
  const isDirty = published ? !specsEqual(draft, published) : !specsEqual(draft, DEFAULT_SPEC)
  const activeTemplate = TEMPLATES.find(t => specsEqual(t.spec, draft))

  function update(patch: Partial<DesignSpec>) {
    setDraft(prev => ({ ...prev, ...patch }))
    setSavedAt(null)
    setActionError('')
  }

  async function saveDraft(): Promise<boolean> {
    setSaving(true)
    setActionError('')
    try {
      const res = await fetch('/api/design', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spec: draft }),
      })
      if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error || `שגיאה ${res.status}`)
      setSavedAt(new Date())
      return true
    } catch (err) {
      setActionError((err as Error).message)
      return false
    } finally {
      setSaving(false)
    }
  }

  async function publish() {
    setPublishing(true)
    setActionError('')
    try {
      const saved = await saveDraft()
      if (!saved) return
      const res = await fetch('/api/design/publish', { method: 'POST' })
      if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error || `שגיאה ${res.status}`)
      setPublished(draft)
    } catch (err) {
      setActionError((err as Error).message)
    } finally {
      setPublishing(false)
    }
  }

  if (loading) return <div className="text-slate-400 text-sm">טוען סטודיו...</div>

  return (
    <div dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">סטודיו עיצוב</h1>
          <p className="text-slate-400 text-sm">בחר תבנית, כוונן צבעים — ופרסם כשמוכן. האורחים רואים רק עיצוב שפורסם.</p>
        </div>
        <div className="flex items-center gap-2">
          {actionError && (
            <span className="text-red-400 text-xs font-bold bg-red-500/10 border border-red-500/30 px-3 py-1.5 rounded-lg">❌ {actionError}</span>
          )}
          {savedAt && !actionError && (
            <span className="text-emerald-400 text-xs">✓ טיוטה נשמרה</span>
          )}
          <button
            onClick={saveDraft}
            disabled={saving || publishing}
            className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 px-4 py-2 rounded-xl font-bold text-sm transition-colors"
          >
            {saving ? 'שומר...' : 'שמור טיוטה'}
          </button>
          <button
            onClick={publish}
            disabled={saving || publishing}
            className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white px-5 py-2 rounded-xl font-bold text-sm transition-colors"
          >
            {publishing ? 'מפרסם...' : '🚀 פרסם לאורחים'}
          </button>
        </div>
      </div>

      {loadError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4 text-sm text-red-300">
          ⚠️ {loadError} — ייתכן שטבלת העיצובים טרם נוצרה ב-Supabase.
        </div>
      )}

      {isDirty && !loadError && (
        <div className="bg-sky-500/10 border border-sky-500/30 rounded-xl px-4 py-2.5 mb-4 text-xs text-sky-300">
          ✏️ יש שינויים שטרם פורסמו — האורחים עדיין רואים את {published ? 'העיצוב המפורסם הקודם' : 'עיצוב ברירת המחדל'}.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* Template gallery */}
          <section aria-label="גלריית תבניות">
            <h2 className="font-bold text-slate-200 text-sm mb-3">🎨 תבניות עיצוב</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {TEMPLATES.map(t => {
                const isActive = activeTemplate?.slug === t.slug
                return (
                  <button
                    key={t.slug}
                    onClick={() => update({ ...t.spec })}
                    aria-pressed={isActive}
                    className={`text-right rounded-xl border-2 overflow-hidden transition-all focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                      isActive ? 'border-amber-500 shadow-md' : 'border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <div
                      className="h-16 flex items-center justify-center"
                      style={{ background: `linear-gradient(180deg, ${t.spec.bgFrom}, ${t.spec.bgTo})` }}
                    >
                      <div
                        className="w-16 h-10 rounded-sm border flex flex-col justify-between overflow-hidden"
                        style={{ background: t.spec.cardBg, borderColor: t.spec.frame }}
                      >
                        <div className="h-1" style={{ background: `linear-gradient(90deg, ${t.spec.primary}, ${t.spec.primaryLight}, ${t.spec.primary})` }} />
                        <div className="text-center text-[9px] font-black" style={{ color: t.spec.primary }}>דון</div>
                        <div className="h-1" style={{ background: `linear-gradient(90deg, ${t.spec.primary}, ${t.spec.primaryLight}, ${t.spec.primary})` }} />
                      </div>
                    </div>
                    <div className="px-2.5 py-2 bg-slate-900">
                      <p className="text-xs font-bold text-slate-200">{isActive ? '✓ ' : ''}{t.name}</p>
                      <p className="text-[10px] text-slate-400 leading-tight">{t.description}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </section>

          {/* Wreath toggle */}
          <section aria-label="אלמנטים">
            <h2 className="font-bold text-slate-200 text-sm mb-3">🌿 אלמנטים בוטניים</h2>
            <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={draft.wreath}
                onChange={e => update({ wreath: e.target.checked })}
                className="w-4 h-4 accent-amber-600"
              />
              הצג זר פרחים מעל השם
            </label>
          </section>

          {/* Advanced colors */}
          <section aria-label="צבעים מתקדמים">
            <button
              onClick={() => setShowAdvanced(v => !v)}
              aria-expanded={showAdvanced}
              className="font-bold text-slate-200 text-sm mb-3 flex items-center gap-1.5"
            >
              <span className={`transition-transform inline-block ${showAdvanced ? 'rotate-90' : ''}`}>◀</span>
              🎛️ כוונון צבעים מדויק
            </button>
            {showAdvanced && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-900 border border-slate-800 rounded-xl p-4">
                {COLOR_FIELDS.map(({ key, label }) => (
                  <label key={key} className="flex items-center justify-between gap-2 text-xs text-slate-300">
                    <span>{label}</span>
                    <span className="flex items-center gap-1.5" dir="ltr">
                      <input
                        type="color"
                        value={(draft[key] as string).slice(0, 7)}
                        onChange={e => update({ [key]: e.target.value } as Partial<DesignSpec>)}
                        aria-label={label}
                        className="w-8 h-8 rounded cursor-pointer border border-slate-800 p-0.5 bg-slate-900"
                      />
                      <code className="text-[10px] text-slate-400 w-14">{draft[key] as string}</code>
                    </span>
                  </label>
                ))}
              </div>
            )}
          </section>

          <button
            onClick={() => update({ ...DEFAULT_SPEC })}
            className="text-xs text-amber-400 hover:text-amber-300 underline"
          >
            ↺ שחזר לעיצוב המקורי
          </button>
        </div>

        {/* Live preview — CSS vars from the draft wrap the same preview component */}
        <div className="sticky top-24 self-start">
          <p className="text-sm font-medium text-slate-300 mb-3">
            תצוגה חיה {activeTemplate ? `— ${activeTemplate.name}` : '— עיצוב מותאם אישית'}
          </p>
          <div style={vars}>
            <InvitationPreview config={config} showWreath={draft.wreath} />
          </div>
          <p className="text-xs text-slate-400 mt-2 text-center">כך תיראה ההזמנה אצל האורחים אחרי פרסום</p>
        </div>
      </div>
    </div>
  )
}
