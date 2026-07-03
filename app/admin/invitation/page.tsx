'use client'
import { useEffect, useState } from 'react'
import { InvitationConfig } from '@/lib/types'
import InvitationPreview from '@/components/admin/InvitationPreview'
import { parseCustomMessage } from '@/lib/config-helper'
import { EVENT_TYPES, EventTypeDef, getEventDef } from '@/lib/events'

const DEFAULT_WHATSAPP = ``
const DEFAULT_REMINDER = ``

function basicFields(def: EventTypeDef): { key: keyof InvitationConfig; label: string; type?: string }[] {
  return [
    { key: 'child_name',      label: def.celebrantLabel },
    { key: 'event_date',      label: 'תאריך האירוע', type: 'date' },
    { key: 'event_time',      label: 'שעת האירוע' },
    { key: 'parasha',         label: def.headlineLabel },
    { key: 'hebrew_date',     label: 'תאריך עברי (לא חובה, לדוגמה: כ״ה אייר תשפ״ה)' },
    { key: 'synagogue_name',  label: def.venueLabel },
    { key: 'address',         label: 'כתובת' },
    { key: 'city',            label: 'עיר' },
    { key: 'parents_names',   label: def.parentsLabel },
    { key: 'siblings_names',  label: 'שמות האחים (לא חובה)' },
  ]
}

export default function InvitationPage() {
  const [config, setConfig] = useState<Partial<InvitationConfig>>({})
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Layout text fields states
  const [title1, setTitle1] = useState('')
  const [title2, setTitle2] = useState('')
  const [tagline, setTagline] = useState('')
  const [prayerTimeLabel, setPrayerTimeLabel] = useState('')
  const [mealLabel, setMealLabel] = useState('')
  const [plainCustomMessage, setPlainCustomMessage] = useState('')

  useEffect(() => {
    fetch('/api/config', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        setConfig(data)
        const p = parseCustomMessage(data.custom_message)
        setTitle1(p.title1)
        setTitle2(p.title2)
        setTagline(p.tagline)
        setPrayerTimeLabel(p.prayer_time_label)
        setMealLabel(p.meal_label)
        setPlainCustomMessage(p.custom_message)
      })
  }, [])

  // Sync state changes to config.custom_message in real time so preview matches
  useEffect(() => {
    if (config.id) {
      const serialized = JSON.stringify({
        title1,
        title2,
        tagline,
        prayer_time_label: prayerTimeLabel,
        meal_label: mealLabel,
        custom_message: plainCustomMessage,
      })
      setConfig(prev => {
        if (prev.custom_message === serialized) return prev
        return { ...prev, custom_message: serialized }
      })
    }
  }, [title1, title2, tagline, prayerTimeLabel, mealLabel, plainCustomMessage, config.id])

  function handleChange(key: keyof InvitationConfig, value: string) {
    setConfig(prev => ({ ...prev, [key]: value }))
    setSaved(false)
    setSaveError(null)
  }

  const eventDef = getEventDef(config.event_type)

  function selectEventType(key: string) {
    if (key === config.event_type) return
    handleChange('event_type', key)
    const def = getEventDef(key)
    if (confirm(`להחליף את נוסחי הטקסט לנוסחים מוכנים של ${def.name}? (הפרטים — שמות, תאריך, כתובת — נשמרים)`)) {
      setTitle1(def.defaults.title1)
      setTitle2(def.defaults.title2)
      setTagline(def.defaults.tagline)
      setPrayerTimeLabel(def.defaults.prayer_time_label)
      setMealLabel(def.defaults.meal_label)
      setPlainCustomMessage(def.defaults.custom_message)
      setSaved(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    try {
      const finalCustomMessage = JSON.stringify({
        title1,
        title2,
        tagline,
        prayer_time_label: prayerTimeLabel,
        meal_label: mealLabel,
        custom_message: plainCustomMessage,
      })

      const finalConfig = {
        ...config,
        custom_message: finalCustomMessage,
      }

      const res = await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalConfig),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `שגיאה ${res.status}`)
      setSaved(true)
    } catch (err: unknown) {
      setSaveError((err as Error).message)
    }
    setSaving(false)
  }

  return (
    <div dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-100">עריכת ההזמנה</h1>
        <div className="flex items-center gap-3">
          {saveError && (
            <span className="text-red-400 text-xs font-bold bg-red-500/10 border border-red-500/30 px-3 py-1.5 rounded-lg">
              ❌ {saveError}
            </span>
          )}
          <button onClick={handleSave} disabled={saving}
            className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white px-5 py-2 rounded-xl font-bold text-sm transition-colors">
            {saving ? 'שומר...' : saved ? '✓ נשמר' : 'שמור'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="border-b border-slate-800 pb-3 mb-2">
            <h3 className="font-bold text-slate-200 text-sm">🎉 סוג האירוע</h3>
            <p className="text-xs text-slate-400">בחירת סוג האירוע מתאימה את השדות, הנוסחים והתבניות</p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2" role="radiogroup" aria-label="סוג האירוע">
            {EVENT_TYPES.map(t => {
              const active = eventDef.key === t.key
              return (
                <button
                  key={t.key}
                  onClick={() => selectEventType(t.key)}
                  role="radio"
                  aria-checked={active}
                  className={`flex flex-col items-center gap-1 rounded-xl border-2 px-2 py-3 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                    active
                      ? 'border-amber-500 bg-amber-500/10 shadow-[0_0_14px_rgba(232,201,122,0.12)]'
                      : 'border-slate-800 bg-slate-900 hover:border-slate-600'
                  }`}
                >
                  <span className="text-2xl">{t.emoji}</span>
                  <span className={`text-xs font-bold ${active ? 'text-amber-300' : 'text-slate-300'}`}>{t.name}</span>
                </button>
              )
            })}
          </div>

          <div className="border-b border-slate-800 pb-3 mb-2 mt-6">
            <h3 className="font-bold text-slate-200 text-sm">✍️ עריכת מלל ההזמנה הדיגיטלית</h3>
            <p className="text-xs text-slate-400">ניתן לשנות כל מילה המופיעה על גבי כרטיס ההזמנה</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-200 block mb-1">כותרת עליונה שורה 1</label>
              <input value={title1} onChange={e => { setTitle1(e.target.value); setSaved(false) }}
                className="w-full border border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-500 rounded-lg px-4 py-2.5 text-right text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-200 block mb-1">כותרת עליונה שורה 2</label>
              <input value={title2} onChange={e => { setTitle2(e.target.value); setSaved(false) }}
                className="w-full border border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-500 rounded-lg px-4 py-2.5 text-right text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <label className="text-sm font-medium text-slate-200 block mb-1">תת-כותרת לשם (לדוג&apos; &quot;חוגג בר מצווה&quot;)</label>
              <input value={tagline} onChange={e => { setTagline(e.target.value); setSaved(false) }}
                className="w-full border border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-500 rounded-lg px-4 py-2.5 text-right text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
            <div className="col-span-1">
              <label className="text-sm font-medium text-slate-200 block mb-1">כיתוב תפילה (לדוג&apos; &quot;תפילת שחרית&quot;)</label>
              <input value={prayerTimeLabel} onChange={e => { setPrayerTimeLabel(e.target.value); setSaved(false) }}
                className="w-full border border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-500 rounded-lg px-4 py-2.5 text-right text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
            <div className="col-span-1">
              <label className="text-sm font-medium text-slate-200 block mb-1">כיתוב ארוחה (לדוג&apos; &quot;קידוש וארוחה לאחר התפילה&quot;)</label>
              <input value={mealLabel} onChange={e => { setMealLabel(e.target.value); setSaved(false) }}
                className="w-full border border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-500 rounded-lg px-4 py-2.5 text-right text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-200 block mb-1">נוסח ברכה / מלל חופשי בתחתית</label>
            <textarea value={plainCustomMessage} onChange={e => { setPlainCustomMessage(e.target.value); setSaved(false) }} rows={2}
              className="w-full border border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-500 rounded-lg px-4 py-2.5 text-right text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
          </div>

          <div className="border-b border-slate-800 pb-3 my-4">
            <h3 className="font-bold text-slate-200 text-sm">📅 פרטי אירוע וכתובות</h3>
          </div>

          {/* Basic fields */}
          {basicFields(eventDef).map(({ key, label, type }) => (
            <div key={key}>
              <label className="text-sm font-medium text-slate-200 block mb-1">{label}</label>
              <input
                type={type ?? 'text'}
                value={(config[key] as string) ?? ''}
                onChange={e => handleChange(key, e.target.value)}
                dir={type === 'date' ? 'ltr' : 'rtl'}
                className="w-full border border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-500 rounded-lg px-4 py-2.5 text-right text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          ))}

          <div className="border-b border-slate-800 pb-3 my-4">
            <h3 className="font-bold text-slate-200 text-sm">💌 עמודי תודה (מוצגים לאורח אחרי התשובה)</h3>
            <p className="text-xs text-slate-400">השאר ריק לנוסח ברירת המחדל. אפשר להשתמש ב-<code className="bg-slate-800 px-1 rounded">{'{name}'}</code> לשם המוזמן</p>
          </div>

          {([
            { key: 'thanks_confirmed', label: 'תודה למי שאישר הגעה 🎉' },
            { key: 'thanks_maybe',     label: 'תודה למי שעדיין לא בטוח 🤔' },
            { key: 'thanks_declined',  label: 'תודה למי שלא מגיע 💙' },
          ] as { key: keyof InvitationConfig; label: string }[]).map(({ key, label }) => (
            <div key={key}>
              <label className="text-sm font-medium text-slate-200 block mb-1">{label}</label>
              <textarea
                value={(config[key] as string) ?? ''}
                onChange={e => handleChange(key, e.target.value)}
                rows={2} dir="rtl"
                className="w-full border border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-500 rounded-lg px-4 py-2.5 text-right text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
              />
            </div>
          ))}

          <div className="border-b border-slate-800 pb-3 my-4">
            <h3 className="font-bold text-slate-200 text-sm">📱 הגדרות שליחה בוואטסאפ</h3>
          </div>

          {/* WhatsApp message */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-slate-200">נוסח הודעת WhatsApp ראשונית</label>
              <button
                onClick={() => handleChange('whatsapp_message', DEFAULT_WHATSAPP)}
                className="text-xs text-amber-400 hover:text-amber-300 underline"
              >
                אפס לברירת מחדל
              </button>
            </div>
            <div className="text-xs text-slate-400 mb-1">
              <code className="bg-slate-800 px-1 rounded">{'{name}'}</code> = שם המוזמן &nbsp;|&nbsp;
              <code className="bg-slate-800 px-1 rounded">{'{link}'}</code> = הלינק המלא לאישור (אל תכתוב URL ידנית!)
            </div>
            <textarea
              value={(config.whatsapp_message as string) ?? ''}
              onChange={e => handleChange('whatsapp_message', e.target.value)}
              rows={6} dir="rtl"
              className="w-full border border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-500 rounded-lg px-4 py-2.5 text-right text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none font-mono"
            />
          </div>

          {/* Reminder message */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-slate-200">הודעת תזכורת</label>
              <button
                onClick={() => handleChange('reminder_message', DEFAULT_REMINDER)}
                className="text-xs text-amber-400 hover:text-amber-300 underline"
              >
                אפס לברירת מחדל
              </button>
            </div>
            <div className="text-xs text-slate-400 mb-1">
              <code className="bg-slate-800 px-1 rounded">{'{name}'}</code> = שם המוזמן &nbsp;|&nbsp;
              <code className="bg-slate-800 px-1 rounded">{'{link}'}</code> = הלינק המלא
            </div>
            <textarea
              value={(config.reminder_message as string) ?? ''}
              onChange={e => handleChange('reminder_message', e.target.value)}
              rows={5} dir="rtl"
              className="w-full border border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-500 rounded-lg px-4 py-2.5 text-right text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none font-mono"
            />
          </div>
        </div>

        <div className="sticky top-24 self-start">
          <p className="text-sm font-medium text-slate-300 mb-3">תצוגה מקדימה של ההזמנה</p>
          <InvitationPreview config={config} />
          <p className="text-xs text-slate-400 mt-2 text-center">הקישור האישי ייווצר אוטומטית לכל מוזמן</p>
        </div>
      </div>
    </div>
  )
}
