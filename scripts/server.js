require('dotenv').config()
const express = require('express')
const { Client, LocalAuth } = require('whatsapp-web.js')
const qrcode = require('qrcode-terminal')
const { createClient } = require('@supabase/supabase-js')

const app = express()
app.use(express.json())

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  if (req.method === 'OPTIONS') return res.sendStatus(200)
  next()
})

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
const BASE_URL = 'https://donbarmizva.vercel.app'

let waStatus = 'initializing'
let client

function normalizePhone(phone) {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('972')) return digits
  if (digits.startsWith('0')) return '972' + digits.slice(1)
  return digits
}

async function resolveChat(phone) {
  const number = normalizePhone(phone)
  const numberId = await client.getNumberId(number)
  if (!numberId) throw new Error(`המספר ${phone} אינו רשום ב-WhatsApp`)
  return numberId._serialized
}

function buildMessage(template, guest) {
  const shortUrl = `${BASE_URL}/r/${guest.token.slice(0, 8)}`
  return template
    .replace(/\\n/g, '\n')
    .replace(/{name}/g, guest.name)
    .replace(/{link}/g, shortUrl)
    .replace(/{custom_message}/g, '')
}

async function captureInvitation(token, shortUrl) {
  const { MessageMedia } = require('whatsapp-web.js')
  const url = `${BASE_URL}/invite-preview/${token}?url=${encodeURIComponent(shortUrl)}`
  const browser = client.pupBrowser
  const page = await browser.newPage()
  try {
    await page.setViewport({ width: 430, height: 900, deviceScaleFactor: 2 })
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 })
    await new Promise(r => setTimeout(r, 1200))
    const screenshot = await page.screenshot({ encoding: 'base64', type: 'jpeg', quality: 92, fullPage: true })
    return new MessageMedia('image/jpeg', screenshot, 'invitation.jpg')
  } finally {
    await page.close()
  }
}

function initWhatsApp() {
  client = new Client({
    authStrategy: new LocalAuth({ clientId: 'barmizva' }),
    puppeteer: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-features=IsolateOrigins,site-per-process',
        '--disable-site-isolation-trials',
      ]
    }
  })

  client.on('qr', qr => {
    waStatus = 'qr'
    qrcode.generate(qr, { small: true })
    console.log('\n⬆️  סרוק עם WhatsApp → Settings → Linked Devices\n')
  })

  client.on('ready', () => {
    waStatus = 'connected'
    console.log('\n✅ WhatsApp מחובר! השרת מוכן לשליחת הודעות\n')
  })

  client.on('auth_failure', () => {
    waStatus = 'error'
    console.error('❌ שגיאת אימות — מחק .wwebjs_auth ונסה שוב')
  })

  client.on('disconnected', () => {
    waStatus = 'disconnected'
    console.log('❌ WhatsApp התנתק — הפעל מחדש את השרת')
  })

  client.initialize()
}

app.get('/status', (req, res) => {
  res.json({ status: waStatus })
})

app.post('/send', async (req, res) => {
  if (waStatus !== 'connected') {
    return res.status(503).json({ error: `WhatsApp לא מחובר (${waStatus})` })
  }

  const { guestId, mode = 'invite' } = req.body
  if (!guestId) return res.status(400).json({ error: 'חסר guestId' })

  try {
    const [{ data: guest, error: gErr }, { data: config }] = await Promise.all([
      supabase.from('guests').select('*').eq('id', guestId).single(),
      supabase.from('invitation_config').select('*').eq('id', 1).single()
    ])

    if (gErr || !guest) return res.status(404).json({ error: 'אורח לא נמצא' })
    if (!config) return res.status(400).json({ error: 'הגדרות הזמנה חסרות — מלא בלשונית "הזמנה"' })

    const template = mode === 'reminder' ? config.reminder_message : config.whatsapp_message
    if (!template) return res.status(400).json({ error: 'נוסח ההודעה ריק' })

    const message = buildMessage(template, guest)
    const shortUrl = `${BASE_URL}/r/${guest.token.slice(0, 8)}`
    const chatId = await resolveChat(guest.phone)

    try {
      const media = await captureInvitation(guest.token, shortUrl)
      const caption = `שלום ${guest.name} 🎉`
      await client.sendMessage(chatId, media, { caption })
    } catch (screenshotErr) {
      console.warn(`⚠️  screenshot נכשל, שולח טקסט בלבד: ${screenshotErr.message}`)
      await client.sendMessage(chatId, message)
    }

    if (mode === 'reminder') {
      await supabase.from('guests').update({ reminder_sent: true }).eq('id', guestId)
    } else {
      await supabase.from('guests').update({ invited_at: new Date().toISOString() }).eq('id', guestId)
    }

    console.log(`✓ נשלח ל-${guest.name} (${guest.phone})`)
    res.json({ success: true, name: guest.name })
  } catch (err) {
    console.error(`✗ שגיאה:`, err.message)
    res.status(500).json({ error: err.message })
  }
})

app.post('/send-all', async (req, res) => {
  if (waStatus !== 'connected') {
    return res.status(503).json({ error: 'WhatsApp לא מחובר' })
  }

  const { mode = 'invite' } = req.body

  try {
    let query = supabase.from('guests').select('*')
    if (mode === 'reminder') {
      query = query.eq('status', 'maybe').eq('reminder_sent', false)
    } else {
      query = query.eq('status', 'pending').is('invited_at', null)
    }

    const [{ data: guests, error: gErr }, { data: config }] = await Promise.all([
      query,
      supabase.from('invitation_config').select('*').eq('id', 1).single()
    ])

    if (gErr) return res.status(500).json({ error: gErr.message })
    if (!guests || guests.length === 0) return res.json({ success: true, sent: 0, message: 'אין מוזמנים לשליחה' })
    if (!config) return res.status(400).json({ error: 'הגדרות הזמנה חסרות' })

    const template = mode === 'reminder' ? config.reminder_message : config.whatsapp_message
    if (!template) return res.status(400).json({ error: 'נוסח ההודעה ריק' })

    let sent = 0, failed = 0
    const results = []

    for (const guest of guests) {
      try {
        const message = buildMessage(template, guest)
        const chatId = await resolveChat(guest.phone)
        try {
          const media = await captureInvitation(guest.token)
          await client.sendMessage(chatId, media, { caption: message })
        } catch {
          await client.sendMessage(chatId, message)
        }
        if (mode === 'reminder') {
          await supabase.from('guests').update({ reminder_sent: true }).eq('id', guest.id)
        } else {
          await supabase.from('guests').update({ invited_at: new Date().toISOString() }).eq('id', guest.id)
        }
        sent++
        results.push({ name: guest.name, success: true })
        console.log(`✓ ${guest.name}`)
        await new Promise(r => setTimeout(r, 1500))
      } catch (err) {
        failed++
        results.push({ name: guest.name, success: false, error: err.message })
        console.log(`✗ ${guest.name}: ${err.message}`)
      }
    }

    console.log(`\n📊 סיכום: ${sent} נשלחו, ${failed} נכשלו`)
    res.json({ success: true, sent, failed, results })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

const PORT = 3333
app.listen(PORT, () => {
  console.log(`\n🎉 שרת Bar Mitzvah WhatsApp`)
  console.log(`🌐 רץ על http://localhost:${PORT}`)
  console.log('📱 מאתחל WhatsApp...\n')
  initWhatsApp()
})
