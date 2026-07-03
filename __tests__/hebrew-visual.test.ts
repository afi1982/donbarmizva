import { toVisual } from '@/lib/hebrew-visual'

describe('toVisual', () => {
  it('reverses pure Hebrew so LTR rendering shows it correctly', () => {
    expect(toVisual('דון בראל')).toBe('לארב ןוד')
  })

  it('keeps numbers readable inside Hebrew text', () => {
    const out = toVisual('קק"ל 70, אשדוד')
    expect(out).toContain('70')
    expect(out).not.toContain('07')
  })

  it('keeps a pure date string intact', () => {
    expect(toVisual('9.7.2026')).toBe('9.7.2026')
  })

  it('handles empty and null input', () => {
    expect(toVisual('')).toBe('')
    expect(toVisual(null)).toBe('')
    expect(toVisual(undefined)).toBe('')
  })

  it('keeps emoji intact inside reversed Hebrew text', () => {
    const out = toVisual('שלום דון 🎉')
    expect(out).toContain('🎉')
    expect(out).toContain('ןוד')
  })

  it('round-trips: applying twice returns the original', () => {
    const original = 'שלום דון 2026'
    expect(toVisual(toVisual(original))).toBe(original)
  })
})
