export interface ParsedConfig {
  title1: string
  title2: string
  tagline: string
  prayer_time_label: string
  meal_label: string
  custom_message: string
}

export function parseCustomMessage(customMessageText: string | null | undefined): ParsedConfig {
  const defaultVals = {
    title1: 'הנכם מוזמנים לטקס העלייה לתורה',
    title2: 'של בננו האהוב',
    tagline: 'חוגג בר מצווה',
    prayer_time_label: 'תפילת שחרית',
    meal_label: 'קידוש וארוחה לאחר התפילה',
    custom_message: '',
  }

  if (!customMessageText) return defaultVals

  try {
    const parsed = JSON.parse(customMessageText)
    if (parsed && typeof parsed === 'object') {
      return {
        title1: parsed.title1 || defaultVals.title1,
        title2: parsed.title2 || defaultVals.title2,
        tagline: parsed.tagline || defaultVals.tagline,
        prayer_time_label: parsed.prayer_time_label || defaultVals.prayer_time_label,
        meal_label: parsed.meal_label || defaultVals.meal_label,
        custom_message: parsed.custom_message || '',
      }
    }
  } catch {
    // If not JSON, it is a plain custom message
    return {
      ...defaultVals,
      custom_message: customMessageText,
    }
  }

  return defaultVals
}
