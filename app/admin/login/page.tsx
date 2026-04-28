'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      router.push('/admin')
    } else {
      setError('סיסמה שגויה')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50" dir="rtl">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg w-80 space-y-4">
        <div className="text-center">
          <div className="text-3xl mb-2">✡</div>
          <h1 className="text-xl font-bold text-stone-800">מערכת ניהול</h1>
          <p className="text-stone-400 text-sm">בר המצווה של דון</p>
        </div>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="סיסמה"
          className="w-full border border-stone-200 rounded-lg px-4 py-3 text-right focus:outline-none focus:ring-2 focus:ring-amber-400"
          dir="rtl"
          autoFocus
        />
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <button
          type="submit"
          className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-lg py-3 font-bold transition-colors"
        >
          כניסה
        </button>
      </form>
    </div>
  )
}
