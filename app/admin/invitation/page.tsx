'use client'
import { useEffect, useState } from 'react'
import { InvitationConfig } from '@/lib/types'
import InvitationPreview from '@/components/admin/InvitationPreview'

const FIELDS: { key: keyof InvitationConfig; label: string; type?: string; rows?: number }[] = [
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
  { key: 'custom_message',  label: 'נוסח חופשי להזמנה', rows: 3 },
  { key: 'whatsapp_message', label: 'הודעת WhatsApp — {name} = שם, {link} = הלינק המלא לאישור הגעה', rows: 5 },
  { key: 'reminder_message', label: 'הודעת תזכורת — {name} = שם, {link} = הלינק המלא', rows: 4 },
]

export default function InvitationPage() {
  const [config, setConfig] = useState<Partial<InvitationConfig>>({})
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/config').then(r => r.json()).then(setConfig)
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
          {saveError && <span className="text-red-500 text-xs">{saveError}</span>}
          <button onClick={handleSave} disabled={saving}
            className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white px-5 py-2 rounded-xl font-bold text-sm transition-colors">
            {saving ? 'שומר...' : saved ? '✓ נשמר' : 'שמור'}
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          {FIELDS.map(({ key, label, type, rows }) => (
            <div key={key}>
              <label className="text-sm font-medium text-stone-700 block mb-1">{label}</label>
              {rows ? (
                <textarea value={(config[key] as string) ?? ''} onChange={e => handleChange(key, e.target.value)}
                  rows={rows} dir="rtl"
                  className="w-full border border-stone-200 rounded-lg px-4 py-2.5 text-right text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
              ) : (
                <input type={type ?? 'text'} value={(config[key] as string) ?? ''} onChange={e => handleChange(key, e.target.value)}
                  dir={type === 'date' ? 'ltr' : 'rtl'}
                  className="w-full border border-stone-200 rounded-lg px-4 py-2.5 text-right text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              )}
            </div>
          ))}
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
