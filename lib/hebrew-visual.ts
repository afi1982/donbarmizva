import bidiFactory from 'bidi-js'

// Satori (next/og) draws glyphs strictly left-to-right with no bidi support,
// so Hebrew comes out mirrored. This reorders a logical-order string into
// visual order (RTL paragraph base) so LTR rendering displays it correctly —
// Hebrew runs are reversed, numbers/latin runs stay intact.
const bidi = bidiFactory()

export function toVisual(str: string | null | undefined): string {
  if (!str) return ''
  const embeddingLevels = bidi.getEmbeddingLevels(str, 'rtl')
  // bidi-js indices are UTF-16 code units — split accordingly, not by code point
  const chars = str.split('')

  // Mirror paired characters (parentheses, brackets) inside RTL runs
  const mirrored = bidi.getMirroredCharactersMap(str, embeddingLevels)
  mirrored.forEach((char, index) => { chars[index] = char })

  const segments = bidi.getReorderSegments(str, embeddingLevels)
  segments.forEach(([start, end]) => {
    const slice = chars.slice(start, end + 1).reverse()
    for (let i = start; i <= end; i++) chars[i] = slice[i - start]
  })

  // Reversal flips surrogate pairs (emoji) — swap them back into valid order
  for (let i = 0; i < chars.length - 1; i++) {
    const a = chars[i].charCodeAt(0)
    const b = chars[i + 1].charCodeAt(0)
    if (a >= 0xdc00 && a <= 0xdfff && b >= 0xd800 && b <= 0xdbff) {
      const tmp = chars[i]
      chars[i] = chars[i + 1]
      chars[i + 1] = tmp
      i++
    }
  }
  return chars.join('')
}
