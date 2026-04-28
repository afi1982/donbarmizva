import { randomBytes } from 'crypto'

export function generateToken(): string {
  return randomBytes(16).toString('hex')
}

export function isValidToken(token: string): boolean {
  return /^[0-9a-f]{32}$/.test(token)
}
