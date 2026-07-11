// Design spec v1 — theme-level control of the invitation (colors, background, ornaments).
// Flat token model: every color on the guest-facing invitation resolves to one of these
// tokens via CSS variables, with the current botanical values as hard fallbacks, so a
// missing/partial spec always renders exactly like today's design.

export interface DesignSpec {
  version: 1
  bgFrom: string        // page gradient start
  bgTo: string          // page gradient end
  cardBg: string        // invitation card surface
  frame: string         // card border / frame
  primary: string       // gold — child name, date, stripes
  primaryLight: string  // stripe gradient midpoint
  ink: string           // body text
  muted: string         // secondary text
  accent: string        // parasha line + primary leaf color
  leaf: string          // secondary leaf color
  divider: string       // divider lines
  wreath: boolean       // show the central ornament
  ornament: string      // botanical | rings | hearts | balloons | none
}

export const DEFAULT_SPEC: DesignSpec = {
  version: 1,
  bgFrom: '#f7f5f0',
  bgTo: '#eee9df',
  cardBg: '#faf6f0',
  frame: '#ebdcb9',
  primary: '#b8963e',
  primaryLight: '#e8c97a',
  ink: '#5a5347',
  muted: '#9a8e7a',
  accent: '#2c3e6b',
  leaf: '#3a4f7a',
  divider: '#c4b48a',
  wreath: true,
  ornament: 'botanical',
}

export interface DesignTemplate {
  slug: string
  name: string
  description: string
  spec: DesignSpec
  // Event types this template is recommended for; undefined = shown for every event type
  eventTypes?: string[]
}

export const TEMPLATES: DesignTemplate[] = [
  {
    slug: 'botanical-classic',
    name: 'בוטני קלאסי',
    description: 'זהב חם, כחול עמוק ורקע שמנת — העיצוב המקורי',
    spec: { ...DEFAULT_SPEC },
  },
  {
    slug: 'olive-grove',
    name: 'כרם זיתים',
    description: 'ירוקי זית רגועים עם זהב טבעי',
    spec: {
      version: 1,
      bgFrom: '#f4f6ee', bgTo: '#e7ecd9', cardBg: '#f9faf3', frame: '#d9e0c5',
      primary: '#7a8b3f', primaryLight: '#b5c078',
      ink: '#4a4a3f', muted: '#8a8a75',
      accent: '#3f513f', leaf: '#5a6e4a', divider: '#a8b088',
      wreath: true,
      ornament: 'botanical',
    },
  },
  {
    slug: 'sea-blue',
    name: 'כחול ים',
    description: 'תכלת ונייבי אלגנטיים על רקע צונן',
    spec: {
      version: 1,
      bgFrom: '#eef5fa', bgTo: '#dce9f2', cardBg: '#f5f9fc', frame: '#cfe0ec',
      primary: '#2e5f8a', primaryLight: '#7fb3d9',
      ink: '#3f4a55', muted: '#7d8a99',
      accent: '#1e3a5f', leaf: '#3a6ea5', divider: '#9db8cc',
      wreath: true,
      ornament: 'botanical',
    },
  },
  {
    slug: 'royal-bordeaux',
    name: 'בורדו מלכותי',
    description: 'בורדו עשיר עם נגיעות זהב חגיגיות',
    spec: {
      version: 1,
      bgFrom: '#faf0ee', bgTo: '#f2dcd9', cardBg: '#fcf7f5', frame: '#ecd5cf',
      primary: '#8a2438', primaryLight: '#d9a05b',
      ink: '#4a3f42', muted: '#99808a',
      accent: '#5f1e2e', leaf: '#a54a5f', divider: '#c49aa5',
      wreath: true,
      ornament: 'botanical',
    },
  },
  {
    slug: 'golden-night',
    name: 'לילה מוזהב',
    description: 'כהה ויוקרתי — זהב זוהר על רקע לילי',
    spec: {
      version: 1,
      bgFrom: '#1f2937', bgTo: '#0f172a', cardBg: '#111827', frame: '#b8963e',
      primary: '#d4af5f', primaryLight: '#f0d78c',
      ink: '#d1d5db', muted: '#9ca3af',
      accent: '#93b4e0', leaf: '#6b8ab8', divider: '#8a713a',
      wreath: true,
      ornament: 'botanical',
    },
  },
  {
    slug: 'blush-romance',
    name: 'רומנטיקה ורודה',
    description: 'ורוד עתיק וזהב ורדים — עדין ורומנטי',
    eventTypes: ['wedding', 'bat_mitzvah', 'birthday'],
    spec: {
      version: 1,
      bgFrom: '#fdf2f4', bgTo: '#fbe4e8', cardBg: '#fffafb', frame: '#f3d3da',
      primary: '#c05f7c', primaryLight: '#eba9bc',
      ink: '#5c4a4e', muted: '#a38b91',
      accent: '#8a4a5e', leaf: '#b87a8c', divider: '#dbaab6',
      wreath: true,
      ornament: 'rings',
    },
  },
  {
    slug: 'champagne',
    name: 'שמפניה',
    description: 'שנהב חם וזהב עמום — אלגנטיות נצחית',
    eventTypes: ['wedding', 'business', 'bar_mitzvah', 'bat_mitzvah'],
    spec: {
      version: 1,
      bgFrom: '#faf7f2', bgTo: '#f0e9dd', cardBg: '#fffdf9', frame: '#e2d5bd',
      primary: '#a58a4e', primaryLight: '#d9c08a',
      ink: '#55503f', muted: '#96907c',
      accent: '#6b5d3f', leaf: '#8a7a55', divider: '#cbbc98',
      wreath: true,
      ornament: 'rings',
    },
  },
  {
    slug: 'lilac-bloom',
    name: 'לילך פורח',
    description: 'סגול לילך רך עם נגיעות פודרה',
    eventTypes: ['bat_mitzvah', 'birthday'],
    spec: {
      version: 1,
      bgFrom: '#f7f3fb', bgTo: '#ece3f5', cardBg: '#fbf8fe', frame: '#ddcdec',
      primary: '#8a5fb5', primaryLight: '#c3a4e3',
      ink: '#4e4358', muted: '#90839c',
      accent: '#5e4478', leaf: '#7d64a0', divider: '#b9a4d1',
      wreath: true,
      ornament: 'hearts',
    },
  },
  {
    slug: 'soft-sky',
    name: 'תכלת רכה',
    description: 'תכלת תינוקית ענוגה — מושלם לברית',
    eventTypes: ['brit', 'bar_mitzvah'],
    spec: {
      version: 1,
      bgFrom: '#f2f8fc', bgTo: '#e2eef7', cardBg: '#f9fcfe', frame: '#cfe2ef',
      primary: '#4a86b0', primaryLight: '#94c0dd',
      ink: '#44505a', muted: '#85929e',
      accent: '#2e5a7d', leaf: '#5a86ab', divider: '#a4c2d6',
      wreath: true,
      ornament: 'botanical',
    },
  },
  {
    slug: 'festive-pop',
    name: 'צבעי חגיגה',
    description: 'אלמוג חם וטורקיז שמח — אנרגיה של מסיבה',
    eventTypes: ['birthday', 'bat_mitzvah'],
    spec: {
      version: 1,
      bgFrom: '#fff7ef', bgTo: '#ffe8d6', cardBg: '#fffcf7', frame: '#f5d5b8',
      primary: '#e2704a', primaryLight: '#f5aa72',
      ink: '#4f4a44', muted: '#9a8f85',
      accent: '#1f8a80', leaf: '#3aa397', divider: '#e8b48c',
      wreath: true,
      ornament: 'balloons',
    },
  },
  {
    slug: 'crisp-navy',
    name: 'נייבי מוקפד',
    description: 'כחול עמוק ואפור נקי — מקצועי ומדויק',
    eventTypes: ['business', 'bar_mitzvah'],
    spec: {
      version: 1,
      bgFrom: '#f4f6f8', bgTo: '#e6eaef', cardBg: '#fafbfc', frame: '#d3dae2',
      primary: '#24425f', primaryLight: '#6d8aa8',
      ink: '#3a4550', muted: '#7e8a96',
      accent: '#16334c', leaf: '#46647f', divider: '#a8b8c6',
      wreath: false,
      ornament: 'none',
    },
  },
]

const HEX_RE = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/

const COLOR_KEYS = [
  'bgFrom', 'bgTo', 'cardBg', 'frame', 'primary', 'primaryLight',
  'ink', 'muted', 'accent', 'leaf', 'divider',
] as const

// The spec is user input all the way down: accept only strict hex colors (anything
// else — including CSS injection attempts — silently falls back to the default).
export function sanitizeSpec(input: unknown): DesignSpec {
  const src = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>
  const out: DesignSpec = { ...DEFAULT_SPEC }
  for (const key of COLOR_KEYS) {
    const v = src[key]
    if (typeof v === 'string' && HEX_RE.test(v)) out[key] = v
  }
  out.wreath = typeof src.wreath === 'boolean' ? src.wreath : DEFAULT_SPEC.wreath
  const ORNAMENT_KINDS = ['botanical', 'rings', 'hearts', 'balloons', 'none']
  out.ornament = typeof src.ornament === 'string' && ORNAMENT_KINDS.includes(src.ornament)
    ? src.ornament
    : DEFAULT_SPEC.ornament
  return out
}

export function specToCssVars(spec: DesignSpec): Record<string, string> {
  return {
    '--inv-bg-from': spec.bgFrom,
    '--inv-bg-to': spec.bgTo,
    '--inv-card-bg': spec.cardBg,
    '--inv-frame': spec.frame,
    '--inv-primary': spec.primary,
    '--inv-primary-light': spec.primaryLight,
    '--inv-ink': spec.ink,
    '--inv-muted': spec.muted,
    '--inv-accent': spec.accent,
    '--inv-leaf': spec.leaf,
    '--inv-divider': spec.divider,
  }
}
