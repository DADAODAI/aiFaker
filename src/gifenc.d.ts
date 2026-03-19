declare module 'gifenc' {
  export function GIFEncoder(): GIFEncoderInstance
  export function quantize(rgba: Uint8ClampedArray, maxColors: number): number[][]
  export function applyPalette(rgba: Uint8ClampedArray, palette: number[][]): Uint8Array

  interface GIFEncoderInstance {
    writeFrame(
      index: Uint8Array,
      width: number,
      height: number,
      opts?: { palette?: number[][]; delay?: number; dispose?: number },
    ): void
    finish(): void
    bytes(): Uint8Array
  }
}
