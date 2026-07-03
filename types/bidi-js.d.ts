declare module 'bidi-js' {
  export interface EmbeddingLevelsResult {
    levels: Uint8Array
    paragraphs: Array<{ start: number; end: number; level: number }>
  }

  export interface Bidi {
    getEmbeddingLevels(text: string, baseDirection?: 'ltr' | 'rtl' | 'auto'): EmbeddingLevelsResult
    getReorderSegments(
      text: string,
      embeddingLevels: EmbeddingLevelsResult,
      start?: number,
      end?: number
    ): Array<[number, number]>
    getMirroredCharactersMap(
      text: string,
      embeddingLevels: EmbeddingLevelsResult,
      start?: number,
      end?: number
    ): Map<number, string>
  }

  export default function bidiFactory(): Bidi
}
