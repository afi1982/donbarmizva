// Event-type registry — the single source of truth that adapts the whole system
// (admin form labels, guest-page texts, generated images, calendar links) to the
// kind of celebration being managed.

export type EventType = 'bar_mitzvah' | 'bat_mitzvah' | 'wedding' | 'brit' | 'birthday' | 'business'

export interface EventTypeDef {
  key: EventType
  name: string
  emoji: string
  celebrantLabel: string      // admin label for the child_name field
  celebrantFallback: string   // shown when child_name is empty
  venueLabel: string          // admin label for synagogue_name
  headlineLabel: string       // admin label for the parasha/headline field
  parentsLabel: string        // admin label for parents_names
  prefixParasha: boolean      // add 'פרשת' when missing
  prefixVenue: boolean        // add 'בבית הכנסת' when missing
  showBsd: boolean            // render בס"ד on the invitation
  defaults: {
    title1: string
    title2: string
    tagline: string
    prayer_time_label: string
    meal_label: string
    custom_message: string
  }
  calendarTitle: (name: string) => string
  thanksDefault: (name: string) => string
}

export const EVENT_TYPES: EventTypeDef[] = [
  {
    key: 'bar_mitzvah', name: 'בר מצווה', emoji: '🕍',
    celebrantLabel: 'שם חתן הבר מצווה', celebrantFallback: 'בר מצווה',
    venueLabel: 'שם בית הכנסת / האולם', headlineLabel: 'שורת כותרת (לדוג׳: פרשת מטות)',
    parentsLabel: 'שמות ההורים',
    prefixParasha: true, prefixVenue: true, showBsd: true,
    defaults: {
      title1: 'הנכם מוזמנים לטקס העלייה לתורה',
      title2: 'של בננו האהוב',
      tagline: 'חוגג בר מצווה',
      prayer_time_label: 'תפילת שחרית',
      meal_label: 'סעודת מצווה תיערך מיד לאחר התפילה',
      custom_message: 'נשמח לחגוג יחד אתכם את שמחת בר המצווה של בננו היקר',
    },
    calendarTitle: name => `בר מצווה של ${name}`,
    thanksDefault: name => `נשמח לראותכם בשמחת בר המצווה של ${name}`,
  },
  {
    key: 'bat_mitzvah', name: 'בת מצווה', emoji: '🎀',
    celebrantLabel: 'שם כלת הבת מצווה', celebrantFallback: 'בת מצווה',
    venueLabel: 'מקום האירוע', headlineLabel: 'שורת כותרת (לא חובה)',
    parentsLabel: 'שמות ההורים',
    prefixParasha: false, prefixVenue: false, showBsd: true,
    defaults: {
      title1: 'הנכם מוזמנים לחגוג עימנו',
      title2: 'את בת המצווה של בתנו האהובה',
      tagline: 'חוגגת בת מצווה',
      prayer_time_label: 'קבלת פנים',
      meal_label: 'ארוחת ערב חגיגית תוגש במהלך האירוע',
      custom_message: 'נשמח לחגוג יחד אתכם את שמחת הבת מצווה של בתנו היקרה',
    },
    calendarTitle: name => `בת מצווה של ${name}`,
    thanksDefault: name => `נשמח לראותכם בשמחת הבת מצווה של ${name}`,
  },
  {
    key: 'wedding', name: 'חתונה', emoji: '💍',
    celebrantLabel: 'שמות בני הזוג (לדוג׳: דנה ♥ יוסי)', celebrantFallback: 'החתונה שלנו',
    venueLabel: 'שם האולם / הגן', headlineLabel: 'שורת פתיחה (לא חובה)',
    parentsLabel: 'שמות ההורים / המשפחות',
    prefixParasha: false, prefixVenue: false, showBsd: true,
    defaults: {
      title1: 'הנכם מוזמנים לחגוג עימנו',
      title2: 'את היום המאושר בחיינו',
      tagline: 'מתחתנים! 💍',
      prayer_time_label: 'קבלת פנים',
      meal_label: 'חופה וקידושין בהמשך הערב',
      custom_message: 'נרגשים ומאושרים להזמינכם לחלוק עימנו את שמחת נישואינו',
    },
    calendarTitle: name => `החתונה של ${name}`,
    thanksDefault: name => `נשמח לראותכם בחתונה של ${name}`,
  },
  {
    key: 'brit', name: 'ברית', emoji: '👶',
    celebrantLabel: 'שם הרך הנולד (אפשר להשאיר ריק)', celebrantFallback: 'ברית מילה',
    venueLabel: 'מקום האירוע', headlineLabel: 'שורת כותרת (לא חובה)',
    parentsLabel: 'שמות ההורים',
    prefixParasha: false, prefixVenue: false, showBsd: true,
    defaults: {
      title1: 'בשמחה ובהודיה לה׳',
      title2: 'הנכם מוזמנים לברית המילה של בננו',
      tagline: 'ברוך הבא!',
      prayer_time_label: 'הברית תתקיים',
      meal_label: 'סעודת מצווה תוגש לאחר הברית',
      custom_message: 'נשמח לחלוק עימכם את שמחתנו הגדולה',
    },
    calendarTitle: name => (name && name !== 'ברית מילה' ? `ברית המילה של ${name}` : 'ברית מילה'),
    thanksDefault: () => 'נשמח לראותכם בשמחתנו הגדולה',
  },
  {
    key: 'birthday', name: 'יום הולדת', emoji: '🎂',
    celebrantLabel: 'שם החוגג/ת', celebrantFallback: 'יום הולדת',
    venueLabel: 'מקום המסיבה', headlineLabel: 'שורת כותרת (לדוג׳: חוגגים 10!)',
    parentsLabel: 'ממי ההזמנה (לא חובה)',
    prefixParasha: false, prefixVenue: false, showBsd: false,
    defaults: {
      title1: 'חוגגים יום הולדת!',
      title2: 'ואתם מוזמנים לחגוג איתנו',
      tagline: 'חוגג/ת יום הולדת 🎉',
      prayer_time_label: 'המסיבה מתחילה',
      meal_label: 'מוזיקה, הפתעות ואוכל טוב',
      custom_message: 'בואו לעשות לנו שמח — מחכים לכם!',
    },
    calendarTitle: name => `יום הולדת של ${name}`,
    thanksDefault: name => `נתראה במסיבה של ${name}! 🎉`,
  },
  {
    key: 'business', name: 'אירוע עסקי', emoji: '💼',
    celebrantLabel: 'שם האירוע', celebrantFallback: 'אירוע חברה',
    venueLabel: 'מקום האירוע', headlineLabel: 'כותרת משנה (לא חובה)',
    parentsLabel: 'מטעם (שם החברה / המארגנים)',
    prefixParasha: false, prefixVenue: false, showBsd: false,
    defaults: {
      title1: 'הנכם מוזמנים',
      title2: 'לאירוע מיוחד',
      tagline: '',
      prayer_time_label: 'התכנסות',
      meal_label: 'כיבוד קל יוגש במהלך האירוע',
      custom_message: 'נשמח לראותכם בין אורחינו',
    },
    calendarTitle: name => name,
    thanksDefault: () => 'תודה על האישור — נתראה באירוע!',
  },
]

export function getEventDef(type?: string | null): EventTypeDef {
  return EVENT_TYPES.find(t => t.key === type) ?? EVENT_TYPES[0]
}

// Shared display formatting used by the RSVP page, the preview page and the image route
export function formatParasha(raw: string | null | undefined, def: EventTypeDef): string {
  const clean = raw?.trim() || ''
  if (!clean) return ''
  if (!def.prefixParasha) return clean
  return clean.startsWith('פרשת') || clean.startsWith('שבת') ? clean : `פרשת ${clean}`
}

export function formatVenue(raw: string | null | undefined, def: EventTypeDef): string {
  const clean = raw?.trim() || ''
  if (!clean) return ''
  if (!def.prefixVenue) return clean
  return clean.startsWith('בבית') || clean.startsWith('בית') ? clean : `בבית הכנסת ${clean}`
}
