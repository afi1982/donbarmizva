require('dotenv').config()
const { Client, LocalAuth } = require('whatsapp-web.js')
const qrcode = require('qrcode-terminal')
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
const BASE_URL = process.env.BASE_URL || 'https://donbarmizva.vercel.app'
const MODE = process.argv.includes('--mode')
  ? process.argv[process.argv.indexOf('--mode') + 1]
  : 'invitations'

async function getGuests() {
  if (MODE === 'reminder') {
    const { data, error } = await supabase.from('guests').select('*').eq('status', 'maybe').eq('reminder_sent', false)
    if (error) { console.error('❌ Supabase error:', error.message); process.exit(1) }
    return data || []
  }
  const { data, error } = await supabase.from('guests').select('*').eq('status', 'pending')
  if (error) { console.error('❌ Supabase error:', error.message); process.exit(1) }
  return data || []
}

async function getConfig() {
  const { data } = await supabase.from('invitation_config').select('*').eq('id', 1).single()
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
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('972')) return digits + '@c.us'
  if (digits.startsWith('0')) return '972' + digits.slice(1) + '@c.us'
  return digits + '@c.us'
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

async function main() {
  console.log(`\n🎉 Bar Mitzvah WhatsApp Sender`)
  console.log(`Mode: ${MODE === 'reminder' ? '🔔 תזכורות' : '📤 הזמנות ראשוניות'}\n`)

  const [guests, config] = await Promise.all([getGuests(), getConfig()])

  if (guests.length === 0) {
    console.log('✅ אין מוזמנים לשליחה.')
    process.exit(0)
  }

  console.log(`👥 ${guests.length} מוזמנים לשליחה`)
  console.log('📱 מאתחל WhatsApp — סרוק את ה-QR עם הטלפון...\n')

  const client = new Client({
    authStrategy: new LocalAuth({ clientId: 'barmizva' }),
    puppeteer: { headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] }
  })

  client.on('qr', qr => {
    qrcode.generate(qr, { small: true })
    console.log('\n⬆️  סרוק עם WhatsApp → Settings → Linked Devices\n')
  })

  client.on('ready', async () => {
    console.log('✅ WhatsApp מחובר!\n')

    if (!config) {
      console.error('❌ לא נמצאה הגדרת הזמנה. מלא את פרטי ההזמנה בפאנל הניהול → הזמנה.')
      await client.destroy(); process.exit(1)
    }

    const template = MODE === 'reminder' ? config.reminder_message : config.whatsapp_message

    if (!template) {
      console.error('❌ נוסח ההודעה ריק. מלא אותו בפאנל הניהול → הזמנה → נוסח הודעת WhatsApp.')
      await client.destroy(); process.exit(1)
    }

    let sent = 0, failed = 0

    for (const guest of guests) {
      try {
        const chatId = normalizePhone(guest.phone)
        const message = buildMessage(template, guest, config)
        await client.sendMessage(chatId, message)
        if (MODE === 'reminder') {
          await supabase.from('guests').update({ reminder_sent: true }).eq('id', guest.id)
        }
        console.log(`✓  ${guest.name} (${guest.phone})`)
        sent++
        await sleep(1500)
      } catch (err) {
        console.log(`✗  ${guest.name} — ${err.message}`)
        failed++
      }
    }

    console.log(`\n📊 סיכום: ${sent} נשלחו, ${failed} נכשלו`)
    await client.destroy()
    process.exit(0)
  })

  client.on('auth_failure', () => {
    console.error('❌ שגיאת אימות. מחק את .wwebjs_auth ונסה שוב.')
    process.exit(1)
  })

  client.initialize()
}

main().catch(err => { console.error('Fatal:', err); process.exit(1) })
