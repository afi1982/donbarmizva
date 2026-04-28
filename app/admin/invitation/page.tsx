'use client'
import { useEffect, useState } from 'react'
import { InvitationConfig } from '@/lib/types'
import InvitationPreview from '@/components/admin/InvitationPreview'

const DEFAULT_WHATSAPP = ``
const DEFAULT_REMINDER = ``

const BASIC_FIELDS: { key: keyof InvitationConfig; label: string; type?: string }[] = [
  { key: 'child_name',      label: 'שם הבר מצווה' },
  { key: 'event_date',      label: 'תאריך האירוע', type: 'date' },
  { key: 'event_time',      label: 'שעת האירוע' },
  { key: 'parasha',         label: 'שם הפרשה' },
  { key: 'hebrew_date',     label: 'תאריך עברי (לדוגמה: כ״ה אייר תשפ״ה)' },
  { key: 'synagogue_name',  label: 'שם בית הכנסת' },
  { key: 'address',         label: 'כתובת' },
  { key: 'city',            label: 'עיר' },
  { key: 'parents_names',   label: 'שמות ההורים' },
  { key: 'siblings_names',  label: 'שמות האחים' },
]

export default function InvitationPage() {
  const [config, setConfig] = useState<Partial<InvitationConfig>>({})
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/config', { cache: 'no-store' }).then(r => r.json()).then(setConfig)
  }, [])

  function handleChange(key: keyof InvitationConfig, value: string) {
    setConfig(prev => ({ ...prev, [key]: value }))
    setSaved(false)
    setSaveError(null)
  }

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    try {
      const res = await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
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
        <h1 className="text-2xl font-bold text-stone-800">עריכת ההזמנה</h1>
        <div className="flex items-center gap-3">
          {saveError && (
            <span className="text-red-600 text-xs font-bold bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg">
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
          {/* Basic fields */}
          {BASIC_FIELDS.map(({ key, label, type }) => (
            <div key={key}>
              <label className="text-sm font-medium text-stone-700 block mb-1">{label}</label>
              <input
                type={type ?? 'text'}
                value={(config[key] as string) ?? ''}
                onChange={e => handleChange(key, e.target.value)}
                dir={type === 'date' ? 'ltr' : 'rtl'}
                className="w-full border border-stone-200 rounded-lg px-4 py-2.5 text-right text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          ))}

          {/* Custom message */}
          <div>
            <label className="text-sm font-medium text-stone-700 block mb-1">נוסח חופשי להזמנה</label>
            <textarea
              value={(config.custom_message as string) ?? ''}
              onChange={e => handleChange('custom_message', e.target.value)}
              rows={3} dir="rtl"
              className="w-full border border-stone-200 rounded-lg px-4 py-2.5 text-right text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
            />
          </div>

          {/* WhatsApp message */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-stone-700">הודעת WhatsApp</label>
              <button
                onClick={() => handleChange('whatsapp_message', DEFAULT_WHATSAPP)}
                className="text-xs text-amber-600 hover:text-amber-800 underline"
              >
                אפס לברירת מחדל
              </button>
            </div>
            <div className="text-xs text-stone-400 mb-1">
              <code className="bg-stone-100 px-1 rounded">{'{name}'}</code> = שם המוזמן &nbsp;|&nbsp;
              <code className="bg-stone-100 px-1 rounded">{'{link}'}</code> = הלינק המלא לאישור (אל תכתוב URL ידנית!)
            </div>
            <textarea
              value={(config.whatsapp_message as string) ?? ''}
              onChange={e => handleChange('whatsapp_message', e.target.value)}
              rows={6} dir="rtl"
              className="w-full border border-stone-200 rounded-lg px-4 py-2.5 text-right text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none font-mono"
            />
          </div>

          {/* Reminder message */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-stone-700">הודעת תזכורת</label>
              <button
                onClick={() => handleChange('reminder_message', DEFAULT_REMINDER)}
                className="text-xs text-amber-600 hover:text-amber-800 underline"
              >
                אפס לברירת מחדל
              </button>
            </div>
            <div className="text-xs text-stone-400 mb-1">
              <code className="bg-stone-100 px-1 rounded">{'{name}'}</code> = שם המוזמן &nbsp;|&nbsp;
              <code className="bg-stone-100 px-1 rounded">{'{link}'}</code> = הלינק המלא
            </div>
            <textarea
              value={(config.reminder_message as string) ?? ''}
              onChange={e => handleChange('reminder_message', e.target.value)}
              rows={5} dir="rtl"
              className="w-full border border-stone-200 rounded-lg px-4 py-2.5 text-right text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none font-mono"
            />
          </div>
        </div>

        <div className="sticky top-24 self-start">
          <p className="text-sm font-medium text-stone-600 mb-3">תצוגה מקדימה</p>
          <InvitationPreview config={config} />
          <p className="text-xs text-stone-400 mt-2 text-center">הקישור האישי ייווצר אוטומטית לכל מוזמן</p>
        </div>
      </div>
    </div>
  )
}
