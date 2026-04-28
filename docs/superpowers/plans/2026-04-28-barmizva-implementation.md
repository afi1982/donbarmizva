# Bar Mitzvah System — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full Bar Mitzvah invitation system — admin panel on Vercel to manage guests and design the invitation, WhatsApp sending via local script, and a beautiful botanical RSVP landing page with 3-button response tracking in Supabase.

**Architecture:** Next.js 14 App Router on Vercel with Supabase (PostgreSQL) for data. Admin panel at `/admin` protected by password middleware. RSVP pages at `/rsvp/[token]` use per-guest UUID tokens. WhatsApp messages sent by a local Node.js script using whatsapp-web.js that reads guests from Supabase.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Supabase (@supabase/supabase-js), whatsapp-web.js, Vitest (tests), Vercel (hosting)

---

## File Map

```
BARMIZVA/
├── app/
│   ├── layout.tsx                        # Root layout, RTL, fonts
│   ├── page.tsx                          # Redirect → /admin
│   ├── admin/
│   │   ├── layout.tsx                    # Admin shell with top nav
│   │   ├── page.tsx                      # Dashboard: stats + guest list
│   │   ├── login/page.tsx                # Password login page
│   │   ├── guests/page.tsx               # Add/edit/delete guests
│   │   ├── invitation/page.tsx           # Edit event details + live preview
│   │   └── send/page.tsx                 # Send instructions + script download
│   ├── rsvp/[token]/page.tsx             # Botanical RSVP landing page
│   ├── confirmed/[token]/page.tsx        # "Coming" thank-you
│   ├── maybe/[token]/page.tsx            # "Not sure" holding page
│   └── declined/[token]/page.tsx         # "Not coming" thank-you
├── app/api/
│   ├── admin/login/route.ts              # POST: set auth cookie
│   ├── guests/route.ts                   # GET list, POST create
│   ├── guests/[id]/route.ts              # PUT update, DELETE remove
│   ├── config/route.ts                   # GET config, PUT update
│   └── rsvp/route.ts                     # POST: save RSVP response
├── components/
│   ├── botanical/
│   │   ├── BotanicalLayout.tsx           # Page wrapper with leaves + gradient
│   │   ├── BotanicalLeaves.tsx           # SVG leaf corners (top-right + bottom-left)
│   │   └── BotanicalDivider.tsx          # ✿ ✦ ✿ divider line
│   ├── admin/
│   │   ├── StatsCards.tsx                # 4 status count cards
│   │   ├── GuestTable.tsx                # Guest list with status badges
│   │   ├── GuestForm.tsx                 # Add/edit guest modal form
│   │   └── InvitationPreview.tsx         # Live invitation preview panel
│   └── rsvp/
│       └── RSVPButtons.tsx               # Client component: 3 RSVP buttons
├── lib/
│   ├── supabase.ts                       # Admin + anon Supabase clients
│   ├── tokens.ts                         # generateToken(), isValidToken()
│   └── types.ts                          # Guest, InvitationConfig, GuestStatus
├── middleware.ts                          # Protect /admin/* routes
├── scripts/
│   ├── send-whatsapp.js                  # Local WhatsApp sender
│   └── package.json                      # whatsapp-web.js deps for script
├── __tests__/
│   ├── tokens.test.ts
│   └── rsvp-api.test.ts
├── .env.local                             # Secrets (gitignored)
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

---

## Task 1: Project Initialization

**Files:**
- Create: `package.json`, `next.config.ts`, `tailwind.config.ts`, `.env.local`, `.gitignore`

- [ ] **Step 1: Scaffold Next.js project**

Run from `C:\Users\TempAdmin\Desktop\BARMIZVA`:
```bash
npx create-next-app@14 . --typescript --tailwind --app --no-src-dir --import-alias "@/*" --yes
```
Expected: project files created, `node_modules/` populated.

- [ ] **Step 2: Install dependencies**
```bash
npm install @supabase/supabase-js uuid
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @types/uuid jsdom
```

- [ ] **Step 3: Configure Vitest**

Create `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
  resolve: {
    alias: { '@': resolve(__dirname, '.') },
  },
})
```

Create `vitest.setup.ts`:
```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 4: Add test script to package.json**

In `package.json`, add to `"scripts"`:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Configure next.config.ts**
```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: { serverComponentsExternalPackages: [] },
}

export default nextConfig
```

- [ ] **Step 6: Create .env.local**
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
ADMIN_PASSWORD=choose_a_strong_password_here
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

- [ ] **Step 7: Add .gitignore entries**

Add to `.gitignore`:
```
.env.local
.env*.local
scripts/node_modules/
```

- [ ] **Step 8: Commit**
```bash
git init
git add -A
git commit -m "feat: initialize Next.js 14 project with Vitest"
```

---

## Task 2: Supabase Database Setup

**Files:**
- Create: `lib/supabase.ts`, `lib/types.ts`

- [ ] **Step 1: Create Supabase project**

Go to https://supabase.com → New project → name it `barmizva-don` → choose free tier → save the URL and keys into `.env.local`.

- [ ] **Step 2: Run schema SQL in Supabase SQL editor**

```sql
-- guests table
CREATE TABLE guests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'coming', 'not_coming', 'maybe')),
  responded_at TIMESTAMPTZ,
  reminder_sent BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- invitation_config table (single row)
CREATE TABLE invitation_config (
  id INT PRIMARY KEY DEFAULT 1,
  child_name TEXT NOT NULL DEFAULT 'דון',
  event_date DATE,
  event_time TEXT DEFAULT '19:30',
  parasha TEXT DEFAULT '',
  hebrew_date TEXT DEFAULT '',
  synagogue_name TEXT DEFAULT '',
  address TEXT DEFAULT '',
  city TEXT DEFAULT '',
  parents_names TEXT DEFAULT '',
  siblings_names TEXT DEFAULT '',
  custom_message TEXT DEFAULT 'נשמח לחגוג יחד אתכם את שמחת בר המצווה של בננו היקר',
  whatsapp_message TEXT DEFAULT E'שלום {name} \U0001F389\n\n{custom_message}\n\nלאישור הגעה לחץ כאן:\n{link}',
  reminder_message TEXT DEFAULT E'שלום {name} \U0001F64F\nטרם קיבלנו את אישורך לבר המצווה של דון.\nנשמח לדעת בהקדם \U0001F49B\n\n{link}'
);

INSERT INTO invitation_config (id) VALUES (1);

-- RLS: only service role can access
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitation_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_only_guests"
  ON guests FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_only_config"
  ON invitation_config FOR ALL USING (auth.role() = 'service_role');
```

- [ ] **Step 3: Create lib/types.ts**
```typescript
export type GuestStatus = 'pending' | 'coming' | 'not_coming' | 'maybe'

export interface Guest {
  id: string
  name: string
  phone: string
  token: string
  status: GuestStatus
  responded_at: string | null
  reminder_sent: boolean
  created_at: string
}

export interface InvitationConfig {
  id: number
  child_name: string
  event_date: string | null
  event_time: string
  parasha: string
  hebrew_date: string
  synagogue_name: string
  address: string
  city: string
  parents_names: string
  siblings_names: string
  custom_message: string
  whatsapp_message: string
  reminder_message: string
}
```

- [ ] **Step 4: Create lib/supabase.ts**
```typescript
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Server-side: full access (API routes, Server Components)
export const supabaseAdmin = createClient(url, serviceKey)

// Client-side: limited access
export const supabase = createClient(url, anonKey)
```

- [ ] **Step 5: Commit**
```bash
git add lib/ .env.local
git commit -m "feat: add Supabase schema and client setup"
```

---

## Task 3: Token Utilities (TDD)

**Files:**
- Create: `lib/tokens.ts`, `__tests__/tokens.test.ts`

- [ ] **Step 1: Write failing tests**

Create `__tests__/tokens.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { generateToken, isValidToken } from '@/lib/tokens'

describe('generateToken', () => {
  it('returns a 32-character hex string', () => {
    const token = generateToken()
    expect(token).toMatch(/^[0-9a-f]{32}$/)
  })

  it('returns unique tokens on each call', () => {
    const tokens = new Set(Array.from({ length: 10 }, generateToken))
    expect(tokens.size).toBe(10)
  })
})

describe('isValidToken', () => {
  it('accepts a valid 32-char hex token', () => {
    expect(isValidToken('a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4')).toBe(true)
  })

  it('rejects tokens that are too short', () => {
    expect(isValidToken('abc123')).toBe(false)
  })

  it('rejects tokens with non-hex characters', () => {
    expect(isValidToken('zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz')).toBe(false)
  })

  it('rejects empty string', () => {
    expect(isValidToken('')).toBe(false)
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**
```bash
npm test -- tokens
```
Expected: FAIL — "Cannot find module '@/lib/tokens'"

- [ ] **Step 3: Implement lib/tokens.ts**
```typescript
import { randomBytes } from 'crypto'

export function generateToken(): string {
  return randomBytes(16).toString('hex')
}

export function isValidToken(token: string): boolean {
  return /^[0-9a-f]{32}$/.test(token)
}
```

- [ ] **Step 4: Run tests to confirm they pass**
```bash
npm test -- tokens
```
Expected: PASS — 6 tests pass.

- [ ] **Step 5: Commit**
```bash
git add lib/tokens.ts __tests__/tokens.test.ts
git commit -m "feat: add token generation utilities with tests"
```

---

## Task 4: Admin Auth (Middleware + Login)

**Files:**
- Create: `middleware.ts`, `app/admin/login/page.tsx`, `app/api/admin/login/route.ts`

- [ ] **Step 1: Create middleware.ts**
```typescript
import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === '/admin/login') return NextResponse.next()

  const auth = request.cookies.get('admin_auth')?.value
  if (auth !== process.env.ADMIN_PASSWORD) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  return NextResponse.next()
}

export const config = { matcher: ['/admin/:path*'] }
```

- [ ] **Step 2: Create login API route**

Create `app/api/admin/login/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { password } = await request.json()

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set('admin_auth', password, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  })
  return response
}
```

- [ ] **Step 3: Create login page**

Create `app/admin/login/page.tsx`:
```tsx
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
```

- [ ] **Step 4: Verify dev server starts and /admin redirects to login**
```bash
npm run dev
```
Open http://localhost:3000/admin — should redirect to /admin/login. Enter wrong password → error. Enter correct password → redirects to /admin (404 for now).

- [ ] **Step 5: Commit**
```bash
git add middleware.ts app/admin/ app/api/admin/
git commit -m "feat: add admin password auth with cookie middleware"
```

---

## Task 5: Botanical Design Components

**Files:**
- Create: `components/botanical/BotanicalLeaves.tsx`, `components/botanical/BotanicalLayout.tsx`, `components/botanical/BotanicalDivider.tsx`

- [ ] **Step 1: Create BotanicalLeaves.tsx**
```tsx
export default function BotanicalLeaves() {
  return (
    <>
      {/* Top-right corner */}
      <div className="absolute top-0 left-0 pointer-events-none" aria-hidden>
        <svg width="140" height="140" viewBox="0 0 140 140" fill="none">
          <ellipse cx="22" cy="22" rx="24" ry="13" fill="#8aad7a" opacity="0.35" transform="rotate(-30 22 22)" />
          <ellipse cx="50" cy="11" rx="20" ry="10" fill="#7a9a6a" opacity="0.28" transform="rotate(-55 50 11)" />
          <ellipse cx="11" cy="52" rx="22" ry="11" fill="#6d8f5e" opacity="0.25" transform="rotate(-10 11 52)" />
          <ellipse cx="72" cy="20" rx="15" ry="8" fill="#9ab88a" opacity="0.22" transform="rotate(-70 72 20)" />
          <ellipse cx="33" cy="65" rx="17" ry="9" fill="#7a9a6a" opacity="0.20" transform="rotate(20 33 65)" />
          <circle cx="42" cy="35" r="5.5" fill="#c8a97a" opacity="0.40" />
          <circle cx="24" cy="60" r="4" fill="#c8a97a" opacity="0.30" />
          <circle cx="66" cy="44" r="3.5" fill="#c8a97a" opacity="0.25" />
          <line x1="42" y1="35" x2="22" y2="22" stroke="#8aad7a" strokeWidth="1" opacity="0.40" />
          <line x1="42" y1="35" x2="50" y2="11" stroke="#8aad7a" strokeWidth="1" opacity="0.35" />
          <line x1="24" y1="60" x2="11" y2="52" stroke="#7a9a6a" strokeWidth="1" opacity="0.30" />
          <line x1="66" y1="44" x2="72" y2="20" stroke="#9ab88a" strokeWidth="0.8" opacity="0.25" />
        </svg>
      </div>
      {/* Bottom-left corner (rotated 180°) */}
      <div className="absolute bottom-0 right-0 pointer-events-none rotate-180" aria-hidden>
        <svg width="120" height="120" viewBox="0 0 140 140" fill="none">
          <ellipse cx="22" cy="22" rx="24" ry="13" fill="#8aad7a" opacity="0.30" transform="rotate(-30 22 22)" />
          <ellipse cx="50" cy="11" rx="20" ry="10" fill="#7a9a6a" opacity="0.25" transform="rotate(-55 50 11)" />
          <ellipse cx="11" cy="52" rx="22" ry="11" fill="#6d8f5e" opacity="0.20" transform="rotate(-10 11 52)" />
          <circle cx="42" cy="35" r="5.5" fill="#c8a97a" opacity="0.35" />
          <circle cx="24" cy="60" r="4" fill="#c8a97a" opacity="0.25" />
          <line x1="42" y1="35" x2="22" y2="22" stroke="#8aad7a" strokeWidth="1" opacity="0.35" />
          <line x1="42" y1="35" x2="50" y2="11" stroke="#8aad7a" strokeWidth="1" opacity="0.30" />
        </svg>
      </div>
    </>
  )
}
```

- [ ] **Step 2: Create BotanicalDivider.tsx**
```tsx
export default function BotanicalDivider() {
  return (
    <div className="flex items-center gap-3 my-4 w-full max-w-xs mx-auto">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent to-amber-300/60" />
      <span className="text-amber-400/80 text-xs tracking-widest">✿ ✦ ✿</span>
      <div className="flex-1 h-px bg-gradient-to-l from-transparent to-amber-300/60" />
    </div>
  )
}
```

- [ ] **Step 3: Create BotanicalLayout.tsx**
```tsx
import BotanicalLeaves from './BotanicalLeaves'

interface BotanicalLayoutProps {
  children: React.ReactNode
  className?: string
}

export default function BotanicalLayout({ children, className = '' }: BotanicalLayoutProps) {
  return (
    <div
      className={`min-h-screen relative overflow-hidden flex flex-col items-center justify-center ${className}`}
      style={{ background: 'linear-gradient(160deg, #faf8f5 0%, #f5f0e8 100%)' }}
      dir="rtl"
    >
      <BotanicalLeaves />
      <div className="relative z-10 w-full max-w-sm mx-auto px-6 py-10">
        {children}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Verify components render without errors**
```bash
npm run build
```
Expected: build completes with no TypeScript errors.

- [ ] **Step 5: Commit**
```bash
git add components/
git commit -m "feat: add botanical design component system"
```

---

## Task 6: Guest API Routes (TDD)

**Files:**
- Create: `app/api/guests/route.ts`, `app/api/guests/[id]/route.ts`, `__tests__/rsvp-api.test.ts`

- [ ] **Step 1: Write failing test for guest creation**

Create `__tests__/rsvp-api.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
  },
}))

describe('Guest validation', () => {
  it('rejects guest with empty name', () => {
    const isValid = (name: string, phone: string) =>
      name.trim().length > 0 && phone.trim().length > 6

    expect(isValid('', '0501234567')).toBe(false)
  })

  it('rejects guest with short phone', () => {
    const isValid = (name: string, phone: string) =>
      name.trim().length > 0 && phone.trim().length > 6

    expect(isValid('משפחת כהן', '050')).toBe(false)
  })

  it('accepts valid guest data', () => {
    const isValid = (name: string, phone: string) =>
      name.trim().length > 0 && phone.trim().length > 6

    expect(isValid('משפחת כהן', '0501234567')).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to confirm it passes (pure logic)**
```bash
npm test -- rsvp-api
```
Expected: PASS — 3 tests pass.

- [ ] **Step 3: Create app/api/guests/route.ts**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { generateToken } from '@/lib/tokens'

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('guests')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const { name, phone } = await request.json()

  if (!name?.trim() || !phone?.trim() || phone.trim().length <= 6) {
    return NextResponse.json({ error: 'שם וטלפון נדרשים' }, { status: 400 })
  }

  const token = generateToken()
  const { data, error } = await supabaseAdmin
    .from('guests')
    .insert({ name: name.trim(), phone: phone.trim(), token })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
```

- [ ] **Step 4: Create app/api/guests/[id]/route.ts**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { name, phone } = await request.json()

  if (!name?.trim() || !phone?.trim() || phone.trim().length <= 6) {
    return NextResponse.json({ error: 'שם וטלפון נדרשים' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('guests')
    .update({ name: name.trim(), phone: phone.trim() })
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await supabaseAdmin
    .from('guests')
    .delete()
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return new NextResponse(null, { status: 204 })
}
```

- [ ] **Step 5: Run all tests**
```bash
npm test
```
Expected: PASS — all tests pass.

- [ ] **Step 6: Commit**
```bash
git add app/api/guests/ __tests__/
git commit -m "feat: add guest CRUD API routes with validation"
```

---

## Task 7: Invitation Config API + RSVP API

**Files:**
- Create: `app/api/config/route.ts`, `app/api/rsvp/route.ts`

- [ ] **Step 1: Create app/api/config/route.ts**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('invitation_config')
    .select('*')
    .eq('id', 1)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PUT(request: NextRequest) {
  const body = await request.json()

  // Only allow known config fields
  const allowed = [
    'child_name', 'event_date', 'event_time', 'parasha', 'hebrew_date',
    'synagogue_name', 'address', 'city', 'parents_names', 'siblings_names',
    'custom_message', 'whatsapp_message', 'reminder_message',
  ]
  const update = Object.fromEntries(
    Object.entries(body).filter(([k]) => allowed.includes(k))
  )

  const { data, error } = await supabaseAdmin
    .from('invitation_config')
    .update(update)
    .eq('id', 1)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
```

- [ ] **Step 2: Create app/api/rsvp/route.ts**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { isValidToken } from '@/lib/tokens'

export async function POST(request: NextRequest) {
  const { token, status } = await request.json()

  if (!isValidToken(token)) {
    return NextResponse.json({ error: 'קישור לא תקין' }, { status: 400 })
  }

  const validStatuses = ['coming', 'not_coming', 'maybe']
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: 'סטטוס לא תקין' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('guests')
    .update({ status, responded_at: new Date().toISOString() })
    .eq('token', token)
    .select()
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'מוזמן לא נמצא' }, { status: 404 })
  }

  return NextResponse.json({ ok: true, status })
}
```

- [ ] **Step 3: Commit**
```bash
git add app/api/config/ app/api/rsvp/
git commit -m "feat: add invitation config and RSVP API routes"
```

---

## Task 8: Admin Dashboard Page

**Files:**
- Create: `app/admin/layout.tsx`, `app/admin/page.tsx`, `components/admin/StatsCards.tsx`, `components/admin/GuestTable.tsx`

- [ ] **Step 1: Create StatsCards.tsx**
```tsx
import { Guest, GuestStatus } from '@/lib/types'

const STATUS_CONFIG: Record<GuestStatus | 'total', { label: string; color: string }> = {
  coming:      { label: 'מגיעים',     color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  not_coming:  { label: 'לא מגיעים', color: 'text-red-500 bg-red-50 border-red-200' },
  maybe:       { label: 'לא בטוח',   color: 'text-amber-600 bg-amber-50 border-amber-200' },
  pending:     { label: 'ממתינים',   color: 'text-slate-500 bg-slate-50 border-slate-200' },
  total:       { label: 'סה"כ',      color: 'text-stone-700 bg-stone-50 border-stone-200' },
}

export function countByStatus(guests: Guest[]) {
  return {
    coming:     guests.filter(g => g.status === 'coming').length,
    not_coming: guests.filter(g => g.status === 'not_coming').length,
    maybe:      guests.filter(g => g.status === 'maybe').length,
    pending:    guests.filter(g => g.status === 'pending').length,
    total:      guests.length,
  }
}

export default function StatsCards({ guests }: { guests: Guest[] }) {
  const counts = countByStatus(guests)
  const entries = (['coming', 'not_coming', 'maybe', 'pending'] as GuestStatus[])

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      {entries.map(status => (
        <div key={status} className={`border rounded-xl p-4 text-center ${STATUS_CONFIG[status].color}`}>
          <div className="text-3xl font-black">{counts[status]}</div>
          <div className="text-xs font-medium mt-1">{STATUS_CONFIG[status].label}</div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Create GuestTable.tsx**
```tsx
'use client'
import { Guest, GuestStatus } from '@/lib/types'

const STATUS_BADGE: Record<GuestStatus, string> = {
  coming:     'bg-emerald-100 text-emerald-700',
  not_coming: 'bg-red-100 text-red-600',
  maybe:      'bg-amber-100 text-amber-700',
  pending:    'bg-slate-100 text-slate-500',
}
const STATUS_LABEL: Record<GuestStatus, string> = {
  coming:     'מגיע',
  not_coming: 'לא מגיע',
  maybe:      'לא בטוח',
  pending:    'ממתין',
}

interface Props {
  guests: Guest[]
  onEdit?: (guest: Guest) => void
  onDelete?: (id: string) => void
}

export default function GuestTable({ guests, onEdit, onDelete }: Props) {
  if (guests.length === 0) {
    return (
      <div className="text-center py-12 text-stone-400">
        <div className="text-4xl mb-2">👥</div>
        <p>אין מוזמנים עדיין. הוסף את הראשון!</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {guests.map(guest => (
        <div
          key={guest.id}
          className="flex items-center gap-3 p-3 bg-white border border-stone-100 rounded-xl hover:border-stone-200 transition-colors"
        >
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-stone-800 truncate">{guest.name}</div>
            <div className="text-xs text-stone-400 dir-ltr" dir="ltr">{guest.phone}</div>
          </div>
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${STATUS_BADGE[guest.status]}`}>
            {STATUS_LABEL[guest.status]}
          </span>
          {onEdit && (
            <button
              onClick={() => onEdit(guest)}
              className="text-stone-400 hover:text-stone-600 text-sm transition-colors"
            >
              ✏️
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(guest.id)}
              className="text-stone-300 hover:text-red-400 text-sm transition-colors"
            >
              🗑️
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Create app/admin/layout.tsx**
```tsx
import Link from 'next/link'

const NAV = [
  { href: '/admin', label: '📊 דשבורד' },
  { href: '/admin/guests', label: '👥 מוזמנים' },
  { href: '/admin/invitation', label: '🎨 הזמנה' },
  { href: '/admin/send', label: '📤 שליחה' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-50" dir="rtl">
      <header className="bg-white border-b border-stone-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-6">
          <div className="font-bold text-stone-800 text-sm">✡ בר מצווה | דון</div>
          <nav className="flex gap-1 overflow-x-auto">
            {NAV.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-xs px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-100 whitespace-nowrap transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
```

- [ ] **Step 4: Create app/admin/page.tsx**
```tsx
import { supabaseAdmin } from '@/lib/supabase'
import StatsCards from '@/components/admin/StatsCards'
import GuestTable from '@/components/admin/GuestTable'
import { Guest } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const { data: guests = [] } = await supabaseAdmin
    .from('guests')
    .select('*')
    .order('created_at', { ascending: true })

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-800 mb-6">דשבורד</h1>
      <StatsCards guests={guests as Guest[]} />
      <div className="bg-white rounded-2xl border border-stone-200 p-4">
        <h2 className="font-bold text-stone-700 mb-4">כל המוזמנים</h2>
        <GuestTable guests={guests as Guest[]} />
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Create app/page.tsx**
```tsx
import { redirect } from 'next/navigation'
export default function Home() { redirect('/admin') }
```

- [ ] **Step 6: Verify dashboard loads at /admin**
```bash
npm run dev
```
Open http://localhost:3000/admin → login → see dashboard with stats (all zeros) and empty guest table.

- [ ] **Step 7: Commit**
```bash
git add app/admin/ components/admin/ app/page.tsx
git commit -m "feat: add admin dashboard with stats cards and guest table"
```

---

## Task 9: Guest Management Page

**Files:**
- Create: `app/admin/guests/page.tsx`, `components/admin/GuestForm.tsx`

- [ ] **Step 1: Create GuestForm.tsx**
```tsx
'use client'
import { useState } from 'react'
import { Guest } from '@/lib/types'

interface Props {
  guest?: Guest
  onSave: (name: string, phone: string) => Promise<void>
  onCancel: () => void
}

export default function GuestForm({ guest, onSave, onCancel }: Props) {
  const [name, setName] = useState(guest?.name ?? '')
  const [phone, setPhone] = useState(guest?.phone ?? '')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !phone.trim()) {
      setError('נא למלא שם וטלפון')
      return
    }
    setLoading(true)
    setError('')
    try {
      await onSave(name.trim(), phone.trim())
    } catch (err) {
      setError('שגיאה בשמירה. נסה שוב.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3" dir="rtl">
      <div>
        <label className="text-sm font-medium text-stone-700 block mb-1">שם המוזמן / משפחה</label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="משפחת כהן"
          className="w-full border border-stone-200 rounded-lg px-4 py-2.5 text-right focus:outline-none focus:ring-2 focus:ring-amber-400"
          dir="rtl"
          autoFocus
        />
      </div>
      <div>
        <label className="text-sm font-medium text-stone-700 block mb-1">מספר טלפון</label>
        <input
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="0501234567"
          className="w-full border border-stone-200 rounded-lg px-4 py-2.5 text-left focus:outline-none focus:ring-2 focus:ring-amber-400"
          dir="ltr"
          type="tel"
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-lg py-2.5 font-bold transition-colors"
        >
          {loading ? 'שומר...' : guest ? 'עדכן' : 'הוסף מוזמן'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg py-2.5 font-medium transition-colors"
        >
          ביטול
        </button>
      </div>
    </form>
  )
}
```

- [ ] **Step 2: Create app/admin/guests/page.tsx**
```tsx
'use client'
import { useEffect, useState, useCallback } from 'react'
import { Guest } from '@/lib/types'
import GuestForm from '@/components/admin/GuestForm'
import GuestTable from '@/components/admin/GuestTable'

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editGuest, setEditGuest] = useState<Guest | undefined>()

  const load = useCallback(async () => {
    const res = await fetch('/api/guests')
    if (res.ok) setGuests(await res.json())
  }, [])

  useEffect(() => { load() }, [load])

  async function handleSave(name: string, phone: string) {
    const url = editGuest ? `/api/guests/${editGuest.id}` : '/api/guests'
    const method = editGuest ? 'PUT' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone }),
    })
    if (!res.ok) throw new Error('Save failed')
    await load()
    setShowForm(false)
    setEditGuest(undefined)
  }

  async function handleDelete(id: string) {
    if (!confirm('למחוק את המוזמן?')) return
    await fetch(`/api/guests/${id}`, { method: 'DELETE' })
    await load()
  }

  function handleEdit(guest: Guest) {
    setEditGuest(guest)
    setShowForm(true)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-stone-800">ניהול מוזמנים</h1>
        <button
          onClick={() => { setEditGuest(undefined); setShowForm(true) }}
          className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl font-bold text-sm transition-colors"
        >
          + הוסף מוזמן
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-stone-200 rounded-2xl p-5 mb-6">
          <h2 className="font-bold text-stone-700 mb-4">{editGuest ? 'עריכת מוזמן' : 'מוזמן חדש'}</h2>
          <GuestForm
            guest={editGuest}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditGuest(undefined) }}
          />
        </div>
      )}

      <div className="bg-white rounded-2xl border border-stone-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-stone-700">רשימת מוזמנים ({guests.length})</h2>
        </div>
        <GuestTable guests={guests} onEdit={handleEdit} onDelete={handleDelete} />
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Test add/edit/delete flow**

Run `npm run dev`, navigate to /admin/guests:
- Add a guest → appears in list ✓
- Edit guest → name/phone update ✓
- Delete guest → confirm dialog → removed ✓

- [ ] **Step 4: Commit**
```bash
git add app/admin/guests/ components/admin/GuestForm.tsx
git commit -m "feat: add guest management page with add/edit/delete"
```

---

## Task 10: Invitation Editor Page

**Files:**
- Create: `app/admin/invitation/page.tsx`, `components/admin/InvitationPreview.tsx`

- [ ] **Step 1: Create InvitationPreview.tsx**
```tsx
import { InvitationConfig } from '@/lib/types'
import BotanicalLeaves from '@/components/botanical/BotanicalLeaves'
import BotanicalDivider from '@/components/botanical/BotanicalDivider'

export default function InvitationPreview({ config }: { config: Partial<InvitationConfig> }) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-8 text-center"
      style={{ background: 'linear-gradient(160deg, #faf8f5 0%, #f5f0e8 100%)', minHeight: 420 }}
      dir="rtl"
    >
      <BotanicalLeaves />
      <div className="relative z-10">
        <p className="text-stone-400 text-xs tracking-widest mb-3">נשמח לחגוג עמכם</p>
        <h1 className="font-serif text-5xl font-black text-stone-800 mb-2">
          {config.child_name || 'שם הילד'}
        </h1>
        <p className="text-stone-500 text-sm mb-1">חוגג בר מצווה</p>
        <BotanicalDivider />
        <div className="text-stone-600 text-sm leading-8 space-y-0.5">
          {config.parasha && <p className="font-bold text-stone-800">{config.parasha}</p>}
          {config.hebrew_date && <p>{config.hebrew_date}</p>}
          {config.event_time && <p>שעה {config.event_time}</p>}
          {config.event_date && (
            <p>{new Date(config.event_date).toLocaleDateString('he-IL')}</p>
          )}
          {config.synagogue_name && (
            <p className="font-bold text-stone-800 mt-2">{config.synagogue_name}</p>
          )}
          {(config.address || config.city) && (
            <p>{[config.address, config.city].filter(Boolean).join(', ')}</p>
          )}
        </div>
        {config.parents_names && (
          <>
            <BotanicalDivider />
            <p className="text-stone-500 text-xs">{config.parents_names}</p>
          </>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create app/admin/invitation/page.tsx**
```tsx
'use client'
import { useEffect, useState } from 'react'
import { InvitationConfig } from '@/lib/types'
import InvitationPreview from '@/components/admin/InvitationPreview'

const FIELDS: { key: keyof InvitationConfig; label: string; type?: string; rows?: number }[] = [
  { key: 'child_name',      label: 'שם הבר מצווה' },
  { key: 'event_date',      label: 'תאריך האירוע', type: 'date' },
  { key: 'event_time',      label: 'שעת קבלת שבת' },
  { key: 'parasha',         label: 'שם הפרשה' },
  { key: 'hebrew_date',     label: 'תאריך עברי' },
  { key: 'synagogue_name',  label: 'שם בית הכנסת' },
  { key: 'address',         label: 'כתובת' },
  { key: 'city',            label: 'עיר' },
  { key: 'parents_names',   label: 'שמות ההורים' },
  { key: 'siblings_names',  label: 'שמות האחים' },
  { key: 'custom_message',  label: 'נוסח חופשי להזמנה', rows: 3 },
  { key: 'whatsapp_message',label: 'תבנית הודעת WhatsApp', rows: 4 },
  { key: 'reminder_message',label: 'תבנית הודעת תזכורת', rows: 4 },
]

export default function InvitationPage() {
  const [config, setConfig] = useState<Partial<InvitationConfig>>({})
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/config').then(r => r.json()).then(setConfig)
  }, [])

  function handleChange(key: keyof InvitationConfig, value: string) {
    setConfig(prev => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true)
    await fetch('/api/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    })
    setSaved(true)
    setSaving(false)
  }

  return (
    <div dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-stone-800">עריכת ההזמנה</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white px-5 py-2 rounded-xl font-bold text-sm transition-colors"
        >
          {saving ? 'שומר...' : saved ? '✓ נשמר' : 'שמור'}
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="space-y-4">
          {FIELDS.map(({ key, label, type, rows }) => (
            <div key={key}>
              <label className="text-sm font-medium text-stone-700 block mb-1">{label}</label>
              {rows ? (
                <textarea
                  value={(config[key] as string) ?? ''}
                  onChange={e => handleChange(key, e.target.value)}
                  rows={rows}
                  className="w-full border border-stone-200 rounded-lg px-4 py-2.5 text-right text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                  dir="rtl"
                />
              ) : (
                <input
                  type={type ?? 'text'}
                  value={(config[key] as string) ?? ''}
                  onChange={e => handleChange(key, e.target.value)}
                  className="w-full border border-stone-200 rounded-lg px-4 py-2.5 text-right text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  dir={type === 'date' ? 'ltr' : 'rtl'}
                />
              )}
            </div>
          ))}
        </div>
        {/* Live preview */}
        <div className="sticky top-24 self-start">
          <p className="text-sm font-medium text-stone-600 mb-3">תצוגה מקדימה</p>
          <InvitationPreview config={config} />
          <p className="text-xs text-stone-400 mt-2 text-center">
            {`{name}`} = שם מוזמן | {`{link}`} = קישור RSVP | {`{custom_message}`} = הנוסח הנ"ל
          </p>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verify live preview updates as you type**

Run `npm run dev` → /admin/invitation → edit child_name → preview updates immediately. Save → toast appears.

- [ ] **Step 4: Commit**
```bash
git add app/admin/invitation/ components/admin/InvitationPreview.tsx
git commit -m "feat: add invitation editor with live botanical preview"
```

---

## Task 11: RSVP Landing Page + Response Pages

**Files:**
- Create: `components/rsvp/RSVPButtons.tsx`, `app/rsvp/[token]/page.tsx`, `app/confirmed/[token]/page.tsx`, `app/maybe/[token]/page.tsx`, `app/declined/[token]/page.tsx`

- [ ] **Step 1: Create RSVPButtons.tsx (client component)**
```tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RSVPButtons({ token }: { token: string }) {
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()

  async function respond(status: 'coming' | 'not_coming' | 'maybe') {
    setLoading(status)
    const res = await fetch('/api/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, status }),
    })
    if (res.ok) {
      const redirect = { coming: 'confirmed', not_coming: 'declined', maybe: 'maybe' }[status]
      router.push(`/${redirect}/${token}`)
    } else {
      setLoading(null)
    }
  }

  return (
    <div className="flex flex-col gap-3 w-full max-w-xs mx-auto" dir="rtl">
      <button
        onClick={() => respond('coming')}
        disabled={!!loading}
        className="w-full py-3.5 rounded-full font-bold text-white text-sm transition-all
          bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700
          disabled:opacity-60 shadow-md shadow-emerald-200"
      >
        {loading === 'coming' ? '...' : '✓  מגיע בשמחה!'}
      </button>
      <button
        onClick={() => respond('maybe')}
        disabled={!!loading}
        className="w-full py-3.5 rounded-full font-bold text-stone-600 text-sm transition-all
          border-2 border-dashed border-amber-300 bg-amber-50/60 hover:bg-amber-100/60
          disabled:opacity-60"
      >
        {loading === 'maybe' ? '...' : '🤔  עדיין לא בטוח'}
      </button>
      <button
        onClick={() => respond('not_coming')}
        disabled={!!loading}
        className="w-full py-3 rounded-full font-medium text-stone-400 text-sm transition-all
          border border-stone-200 hover:bg-stone-100
          disabled:opacity-60"
      >
        {loading === 'not_coming' ? '...' : '✕  לא אוכל להגיע'}
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Create app/rsvp/[token]/page.tsx**
```tsx
import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import { isValidToken } from '@/lib/tokens'
import BotanicalLayout from '@/components/botanical/BotanicalLayout'
import BotanicalDivider from '@/components/botanical/BotanicalDivider'
import RSVPButtons from '@/components/rsvp/RSVPButtons'

export default async function RSVPPage({ params }: { params: { token: string } }) {
  if (!isValidToken(params.token)) notFound()

  const [{ data: guest }, { data: config }] = await Promise.all([
    supabaseAdmin.from('guests').select('*').eq('token', params.token).single(),
    supabaseAdmin.from('invitation_config').select('*').eq('id', 1).single(),
  ])

  if (!guest || !config) notFound()

  const eventDateStr = config.event_date
    ? new Date(config.event_date).toLocaleDateString('he-IL')
    : ''

  return (
    <BotanicalLayout>
      <div className="text-center" dir="rtl">
        <p className="text-stone-400 text-xs tracking-widest mb-4">שלום, {guest.name} ❤</p>
        <h1 className="font-serif text-5xl font-black text-stone-800 mb-2">{config.child_name}</h1>
        <p className="text-stone-500 text-sm mb-1">חוגג בר מצווה</p>
        <BotanicalDivider />
        <div className="text-stone-600 text-sm leading-8 mb-6">
          {config.parasha && <p className="font-bold text-stone-800">{config.parasha}</p>}
          {config.hebrew_date && <p>{config.hebrew_date}</p>}
          {config.event_time && <p>שעה {config.event_time}</p>}
          {eventDateStr && <p>{eventDateStr}</p>}
          {config.synagogue_name && (
            <p className="font-bold text-stone-800 mt-1">{config.synagogue_name}</p>
          )}
          {(config.address || config.city) && (
            <p>{[config.address, config.city].filter(Boolean).join(', ')}</p>
          )}
        </div>
        <p className="font-bold text-stone-700 mb-5 text-sm">האם תוכלו להגיע?</p>
        <RSVPButtons token={params.token} />
        {config.parents_names && (
          <p className="text-stone-400 text-xs mt-8">{config.parents_names}</p>
        )}
      </div>
    </BotanicalLayout>
  )
}
```

- [ ] **Step 3: Create confirmed, maybe, declined pages**

Create `app/confirmed/[token]/page.tsx`:
```tsx
import BotanicalLayout from '@/components/botanical/BotanicalLayout'
import BotanicalDivider from '@/components/botanical/BotanicalDivider'

export default function ConfirmedPage() {
  return (
    <BotanicalLayout>
      <div className="text-center" dir="rtl">
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="font-serif text-3xl font-black text-stone-800 mb-2">תודה על האישור!</h1>
        <BotanicalDivider />
        <p className="text-stone-600 text-sm leading-7">
          שמחים שתוכלו להגיע!<br />
          נשמח לראותכם בשמחת בר המצווה של דון 💛
        </p>
        <p className="text-stone-400 text-xs mt-8 tracking-widest">✿ ✦ ✿</p>
      </div>
    </BotanicalLayout>
  )
}
```

Create `app/maybe/[token]/page.tsx`:
```tsx
import BotanicalLayout from '@/components/botanical/BotanicalLayout'
import BotanicalDivider from '@/components/botanical/BotanicalDivider'

export default function MaybePage() {
  return (
    <BotanicalLayout>
      <div className="text-center" dir="rtl">
        <div className="text-5xl mb-4">🌿</div>
        <h1 className="font-serif text-3xl font-black text-stone-800 mb-2">קיבלנו!</h1>
        <BotanicalDivider />
        <p className="text-stone-600 text-sm leading-7">
          תודה, הבנו שאתם עדיין לא בטוחים.<br />
          ניצור איתכם קשר בוואטסאפ לאישור סופי 💛
        </p>
        <p className="text-stone-400 text-xs mt-8">תזכורת תישלח אליכם בקרוב</p>
        <p className="text-stone-400 text-xs mt-4 tracking-widest">✿ ✦ ✿</p>
      </div>
    </BotanicalLayout>
  )
}
```

Create `app/declined/[token]/page.tsx`:
```tsx
import BotanicalLayout from '@/components/botanical/BotanicalLayout'
import BotanicalDivider from '@/components/botanical/BotanicalDivider'

export default function DeclinedPage() {
  return (
    <BotanicalLayout>
      <div className="text-center" dir="rtl">
        <div className="text-5xl mb-4">💙</div>
        <h1 className="font-serif text-3xl font-black text-stone-800 mb-2">תודה על הידיעה</h1>
        <BotanicalDivider />
        <p className="text-stone-600 text-sm leading-7">
          חבל שלא תוכלו להגיע.<br />
          נשמח לחגוג איתכם בהזדמנויות אחרות 💛
        </p>
        <p className="text-stone-400 text-xs mt-8 tracking-widest">✿ ✦ ✿</p>
      </div>
    </BotanicalLayout>
  )
}
```

- [ ] **Step 4: Test full RSVP flow end-to-end**

1. Add a test guest via /admin/guests
2. Copy the token from Supabase dashboard
3. Visit http://localhost:3000/rsvp/[token]
4. Click "מגיע" → should redirect to /confirmed/[token]
5. Check Supabase — guest status should be 'coming'

- [ ] **Step 5: Commit**
```bash
git add app/rsvp/ app/confirmed/ app/maybe/ app/declined/ components/rsvp/
git commit -m "feat: add botanical RSVP landing page and response pages"
```

---

## Task 12: Send Page (Admin)

**Files:**
- Create: `app/admin/send/page.tsx`

- [ ] **Step 1: Create app/admin/send/page.tsx**
```tsx
import { supabaseAdmin } from '@/lib/supabase'
import { Guest } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function SendPage() {
  const { data: guests = [] } = await supabaseAdmin
    .from('guests')
    .select('*')
    .order('created_at', { ascending: true })

  const pending = (guests as Guest[]).filter(g => g.status === 'pending')
  const maybe   = (guests as Guest[]).filter(g => g.status === 'maybe' && !g.reminder_sent)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://your-app.vercel.app'

  return (
    <div dir="rtl">
      <h1 className="text-2xl font-bold text-stone-800 mb-2">שליחת הזמנות</h1>
      <p className="text-stone-500 text-sm mb-8">
        הסקריפט רץ על המחשב שלך ושולח הודעות ישירות מהוואטסאפ שלך
      </p>

      {/* Setup instructions */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-6">
        <h2 className="font-bold text-stone-800 mb-4">⚙️ הגדרה ראשונה (פעם אחת בלבד)</h2>
        <ol className="space-y-3 text-sm text-stone-600 list-decimal list-inside">
          <li>ודא ש-<strong>Node.js</strong> מותקן: פתח Command Prompt והרץ <code className="bg-stone-100 px-1 rounded">node -v</code></li>
          <li>פתח את תיקיית <code className="bg-stone-100 px-1 rounded">scripts/</code> בפרויקט</li>
          <li>הרץ: <code className="bg-stone-100 px-1 rounded">npm install</code> בתוך תיקיית scripts</li>
          <li>ערוך את <code className="bg-stone-100 px-1 rounded">scripts/.env</code> עם מפתחות Supabase ו-BASE_URL</li>
        </ol>
      </div>

      {/* Send invitations */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="font-bold text-stone-800">📤 שלח הזמנות ראשוניות</h2>
            <p className="text-stone-400 text-xs mt-1">{pending.length} מוזמנים ממתינים לשליחה</p>
          </div>
        </div>
        <div className="bg-stone-900 text-green-400 rounded-xl p-4 font-mono text-sm mb-4" dir="ltr">
          cd scripts<br />
          node send-whatsapp.js
        </div>
        <p className="text-stone-500 text-xs">
          ✓ סרוק את קוד ה-QR שיופיע בטרמינל עם הוואטסאפ שלך<br />
          ✓ ההודעות נשלחות לכל {pending.length} המוזמנים שטרם קיבלו הזמנה<br />
          ✓ ניתן לסגור לאחר שכל ההודעות נשלחו
        </p>
      </div>

      {/* Send reminders */}
      <div className="bg-white rounded-2xl border border-amber-100 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="font-bold text-stone-800">🔔 שלח תזכורת ל"לא בטוח"</h2>
            <p className="text-stone-400 text-xs mt-1">{maybe.length} מוזמנים שטרם אישרו</p>
          </div>
        </div>
        <div className="bg-stone-900 text-green-400 rounded-xl p-4 font-mono text-sm mb-4" dir="ltr">
          cd scripts<br />
          node send-whatsapp.js --mode reminder
        </div>
        <p className="text-stone-500 text-xs">
          ✓ שולח הודעת תזכורת רק למוזמנים שבחרו "לא בטוח" ועדיין לא קיבלו תזכורת<br />
          ✓ מסמן reminder_sent=true לאחר שליחה
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**
```bash
git add app/admin/send/
git commit -m "feat: add send page with whatsapp script instructions"
```

---

## Task 13: WhatsApp Sender Script

**Files:**
- Create: `scripts/send-whatsapp.js`, `scripts/package.json`, `scripts/.env.example`

- [ ] **Step 1: Create scripts/package.json**
```json
{
  "name": "barmizva-whatsapp-sender",
  "version": "1.0.0",
  "description": "Local WhatsApp sender for Bar Mitzvah invitations",
  "main": "send-whatsapp.js",
  "scripts": { "send": "node send-whatsapp.js", "reminder": "node send-whatsapp.js --mode reminder" },
  "dependencies": {
    "whatsapp-web.js": "^1.23.0",
    "qrcode-terminal": "^0.12.0",
    "@supabase/supabase-js": "^2.39.0",
    "dotenv": "^16.4.0"
  }
}
```

- [ ] **Step 2: Create scripts/.env.example**
```bash
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
BASE_URL=https://your-app.vercel.app
```

- [ ] **Step 3: Create scripts/send-whatsapp.js**
```javascript
require('dotenv').config()
const { Client, LocalAuth } = require('whatsapp-web.js')
const qrcode = require('qrcode-terminal')
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
const MODE = process.argv.includes('--mode') 
  ? process.argv[process.argv.indexOf('--mode') + 1] 
  : 'invitations'

async function getGuests() {
  if (MODE === 'reminder') {
    const { data } = await supabase
      .from('guests')
      .select('*')
      .eq('status', 'maybe')
      .eq('reminder_sent', false)
    return data || []
  }
  // Default: send to pending guests only
  const { data } = await supabase
    .from('guests')
    .select('*')
    .eq('status', 'pending')
  return data || []
}

async function getConfig() {
  const { data } = await supabase
    .from('invitation_config')
    .select('*')
    .eq('id', 1)
    .single()
  return data
}

function buildMessage(template, guest, config) {
  const link = `${BASE_URL}/rsvp/${guest.token}`
  return template
    .replace(/{name}/g, guest.name)
    .replace(/{link}/g, link)
    .replace(/{custom_message}/g, config.custom_message || '')
}

function normalizePhone(phone) {
  // Israeli format: 05X-XXXXXXX → 9725XXXXXXXX
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('0')) return '972' + digits.slice(1) + '@c.us'
  if (digits.startsWith('972')) return digits + '@c.us'
  return digits + '@c.us'
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function main() {
  console.log(`\n🎉 Bar Mitzvah WhatsApp Sender`)
  console.log(`Mode: ${MODE === 'reminder' ? '🔔 תזכורות' : '📤 הזמנות ראשוניות'}`)

  const [guests, config] = await Promise.all([getGuests(), getConfig()])

  if (guests.length === 0) {
    console.log('\n✅ אין מוזמנים לשליחה.')
    process.exit(0)
  }

  console.log(`\n👥 ${guests.length} מוזמנים לשליחה`)
  console.log('\n📱 מאתחל WhatsApp — סרוק את ה-QR עם הטלפון...\n')

  const client = new Client({
    authStrategy: new LocalAuth({ clientId: 'barmizva' }),
    puppeteer: { headless: true, args: ['--no-sandbox'] }
  })

  client.on('qr', qr => {
    qrcode.generate(qr, { small: true })
    console.log('\n⬆️ סרוק את הקוד הזה עם WhatsApp שלך (Settings → Linked Devices)\n')
  })

  client.on('ready', async () => {
    console.log('✅ WhatsApp מחובר!\n')

    const template = MODE === 'reminder'
      ? config.reminder_message
      : config.whatsapp_message

    let sent = 0, failed = 0

    for (const guest of guests) {
      try {
        const chatId = normalizePhone(guest.phone)
        const message = buildMessage(template, guest, config)
        await client.sendMessage(chatId, message)

        // Mark as sent in Supabase
        if (MODE === 'reminder') {
          await supabase.from('guests').update({ reminder_sent: true }).eq('id', guest.id)
        }

        console.log(`✓ ${guest.name} (${guest.phone})`)
        sent++

        // Delay between messages to avoid rate limiting
        await sleep(1500)
      } catch (err) {
        console.log(`✗ ${guest.name} (${guest.phone}) — ${err.message}`)
        failed++
      }
    }

    console.log(`\n📊 סיכום: ${sent} נשלחו, ${failed} נכשלו`)
    await client.destroy()
    process.exit(0)
  })

  client.on('auth_failure', () => {
    console.error('❌ שגיאת אימות WhatsApp. מחק את תיקיית .wwebjs_auth ונסה שוב.')
    process.exit(1)
  })

  client.initialize()
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
```

- [ ] **Step 4: Install script dependencies**
```bash
cd scripts
npm install
cd ..
```
Expected: `scripts/node_modules/` created (already gitignored).

- [ ] **Step 5: Test script against dev Supabase**

Create one test guest in /admin/guests. Then:
```bash
cd scripts
cp .env.example .env
# Edit .env with actual Supabase credentials and BASE_URL=http://localhost:3000
node send-whatsapp.js
```
Expected: QR code appears, scan with phone, message sent to test guest, status in Supabase remains 'pending' (reminder_sent not applicable here).

- [ ] **Step 6: Commit**
```bash
cd ..
git add scripts/
git commit -m "feat: add whatsapp-web.js local sender script"
```

---

## Task 14: Root Layout + Fonts + Global Styles

**Files:**
- Modify: `app/layout.tsx`, `app/globals.css`

- [ ] **Step 1: Update app/layout.tsx**
```tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'בר מצווה | דון בר אל',
  description: 'הזמנה לבר המצווה של דון בר אל',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@300;400;700;900&family=Heebo:wght@300;400;500;600;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
```

- [ ] **Step 2: Update app/globals.css**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body { font-family: 'Heebo', sans-serif; }
  .font-serif { font-family: 'Frank Ruhl Libre', serif; }
}
```

- [ ] **Step 3: Update tailwind.config.ts**
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Heebo', 'sans-serif'],
        serif: ['Frank Ruhl Libre', 'serif'],
      },
      colors: {
        botanical: {
          leaf:  '#8aad7a',
          gold:  '#c8a97a',
          cream: '#faf8f5',
        },
      },
    },
  },
  plugins: [],
}
export default config
```

- [ ] **Step 4: Run full build**
```bash
npm run build
```
Expected: build passes with no TypeScript errors.

- [ ] **Step 5: Commit**
```bash
git add app/layout.tsx app/globals.css tailwind.config.ts
git commit -m "feat: configure fonts, global styles, and Tailwind theme"
```

---

## Task 15: Vercel Deployment

**Files:**
- No new files — configuration in Vercel dashboard

- [ ] **Step 1: Push to GitHub**
```bash
git remote add origin https://github.com/YOUR_USERNAME/barmizva-don.git
git push -u origin main
```

- [ ] **Step 2: Connect to Vercel**

Go to https://vercel.com/new → Import Git repository → select `barmizva-don`.

- [ ] **Step 3: Set environment variables in Vercel dashboard**

In Project Settings → Environment Variables, add:
```
NEXT_PUBLIC_SUPABASE_URL        = (your supabase URL)
NEXT_PUBLIC_SUPABASE_ANON_KEY   = (your anon key)
SUPABASE_SERVICE_ROLE_KEY       = (your service role key)
ADMIN_PASSWORD                  = (your chosen password)
NEXT_PUBLIC_BASE_URL            = https://your-project.vercel.app
```

- [ ] **Step 4: Deploy and verify**

Click Deploy in Vercel. After deploy:
1. Visit `https://your-project.vercel.app/admin` → login works ✓
2. Add a guest → appears in dashboard ✓
3. Visit `/rsvp/[token]` → botanical page loads ✓
4. Click "מגיע" → redirects to /confirmed ✓
5. Check Supabase → status updated ✓

- [ ] **Step 5: Update scripts/.env with production BASE_URL**
```bash
# In scripts/.env, update:
BASE_URL=https://your-project.vercel.app
```

- [ ] **Step 6: Final commit**
```bash
git add .
git commit -m "chore: production deployment configuration"
git push
```

---

## Self-Review

**Spec coverage check:**
- ✓ Admin panel with all invitation details editable — Task 10
- ✓ Guest management (name + phone) — Tasks 6, 9
- ✓ WhatsApp sending via whatsapp-web.js — Task 13
- ✓ Botanical design (white + SVG leaves) — Tasks 5, 11
- ✓ RSVP landing page with 3 buttons — Task 11
- ✓ "לא בטוח" special page — Task 11 (app/maybe/[token])
- ✓ Follow-up reminder flow — Tasks 7 (reminder_sent field), 12 (send page), 13 (--mode reminder)
- ✓ Responses captured in Supabase — Tasks 2, 7
- ✓ Vercel hosting — Task 15
- ✓ Supabase free tier — Task 2
- ✓ Password-protected admin — Task 4
- ✓ Dashboard stats — Task 8
- ✓ Personalized RSVP links with tokens — Tasks 3, 11

**Placeholder scan:** No TBD/TODO/placeholders found. All code blocks are complete.

**Type consistency check:**
- `Guest` and `GuestStatus` defined in Task 2 → used consistently in Tasks 8, 9, 11, 13
- `InvitationConfig` defined in Task 2 → used in Tasks 10, 11, 13
- `generateToken()` and `isValidToken()` defined in Task 3 → used in Tasks 6, 11
- `supabaseAdmin` defined in Task 2 → used consistently across all API routes
- API response shape from `/api/guests` matches `Guest[]` type throughout
