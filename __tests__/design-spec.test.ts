import { DEFAULT_SPEC, TEMPLATES, sanitizeSpec, specToCssVars } from '@/lib/design/spec'

describe('sanitizeSpec', () => {
  it('returns defaults for null/garbage input', () => {
    expect(sanitizeSpec(null)).toEqual(DEFAULT_SPEC)
    expect(sanitizeSpec('junk')).toEqual(DEFAULT_SPEC)
    expect(sanitizeSpec(42)).toEqual(DEFAULT_SPEC)
  })

  it('accepts valid hex colors', () => {
    const out = sanitizeSpec({ primary: '#ff0000', ink: '#ABC' })
    expect(out.primary).toBe('#ff0000')
    expect(out.ink).toBe('#ABC')
  })

  it('rejects CSS injection attempts and falls back to defaults', () => {
    const out = sanitizeSpec({
      primary: 'red; background: url(https://evil.example/x)',
      ink: 'var(--hack)',
      cardBg: 'url(javascript:alert(1))',
      bgFrom: '#gggggg',
    })
    expect(out.primary).toBe(DEFAULT_SPEC.primary)
    expect(out.ink).toBe(DEFAULT_SPEC.ink)
    expect(out.cardBg).toBe(DEFAULT_SPEC.cardBg)
    expect(out.bgFrom).toBe(DEFAULT_SPEC.bgFrom)
  })

  it('drops unknown keys and pins version to 1', () => {
    const out = sanitizeSpec({ evil: 'x', version: 99, primary: '#123456' })
    expect((out as Record<string, unknown>).evil).toBeUndefined()
    expect(out.version).toBe(1)
  })

  it('coerces wreath to boolean with default true', () => {
    expect(sanitizeSpec({ wreath: false }).wreath).toBe(false)
    expect(sanitizeSpec({ wreath: 'yes' }).wreath).toBe(true)
  })
})

describe('specToCssVars', () => {
  it('maps every color token to an --inv-* variable', () => {
    const vars = specToCssVars(DEFAULT_SPEC)
    expect(vars['--inv-primary']).toBe(DEFAULT_SPEC.primary)
    expect(vars['--inv-bg-from']).toBe(DEFAULT_SPEC.bgFrom)
    expect(vars['--inv-ink']).toBe(DEFAULT_SPEC.ink)
    expect(Object.keys(vars)).toHaveLength(11)
  })
})

describe('TEMPLATES', () => {
  it('all built-in templates survive sanitization unchanged', () => {
    for (const t of TEMPLATES) {
      expect(sanitizeSpec(t.spec)).toEqual(t.spec)
    }
  })

  it('has unique slugs and the classic template equals the default spec', () => {
    const slugs = new Set(TEMPLATES.map(t => t.slug))
    expect(slugs.size).toBe(TEMPLATES.length)
    expect(TEMPLATES[0].spec).toEqual(DEFAULT_SPEC)
  })
})
