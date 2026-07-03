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
  wreath: boolean       // show the floral wreath
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
}

export interface DesignTemplate {
  slug: string
  name: string
  description: string
  spec: DesignSpec
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
