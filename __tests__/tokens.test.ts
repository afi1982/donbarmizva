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
