import type { Scene, StylePreset } from './types'
import { renderFrame, CANVAS_W, measureCanvasHeight } from './renderer'

/**
 * 导出 PNG：渲染场景最后一帧，返回 data URL
 */
export function exportPng(scene: Scene, preset: StylePreset): string {
  const lastFrame = scene.frames[scene.frames.length - 1]!
  const h = measureCanvasHeight(scene.question, lastFrame.text, preset)
  const canvas = document.createElement('canvas')
  canvas.width = CANVAS_W
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  renderFrame(ctx, lastFrame, scene.question, preset, scene.layout, h)
  return canvas.toDataURL('image/png')
}

/**
 * 导出 GIF：逐帧渲染并编码，返回 Blob URL
 * 使用 gifenc 库在浏览器端就地编码，无需服务端。
 */
export async function exportGif(scene: Scene, preset: StylePreset): Promise<string> {
  const { GIFEncoder, quantize, applyPalette } = await import('gifenc')

  const gif = GIFEncoder()
  // GIF 所有帧必须统一尺寸，用最终帧（文本最多）的高度
  const lastFrame = scene.frames[scene.frames.length - 1]!
  const h = measureCanvasHeight(scene.question, lastFrame.text, preset)
  const canvas = document.createElement('canvas')
  canvas.width = CANVAS_W
  canvas.height = h
  const ctx = canvas.getContext('2d')!

  for (const frame of scene.frames) {
    renderFrame(ctx, frame, scene.question, preset, scene.layout, h)
    const imageData = ctx.getImageData(0, 0, CANVAS_W, h)
    const palette = quantize(imageData.data, 256)
    const index = applyPalette(imageData.data, palette)
    gif.writeFrame(index, CANVAS_W, h, {
      palette,
      delay: frame.duration,
    })
  }

  gif.finish()
  const bytes = gif.bytes()
  const blob = new Blob([new Uint8Array(bytes)], { type: 'image/gif' })
  return URL.createObjectURL(blob)
}

/** 触发浏览器下载 */
export function download(url: string, filename: string) {
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}
