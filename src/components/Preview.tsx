import { useRef, useEffect, useState } from 'react'
import type { Scene, StylePreset } from '../lib/types'
import { renderFrame, CANVAS_W, measureCanvasHeight } from '../lib/renderer'

interface Props {
  scene: Scene | null
  preset: StylePreset
  /** 当前预览帧索引（动画播放用） */
  frameIndex: number
}

export default function Preview({ scene, preset, frameIndex }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [canvasH, setCanvasH] = useState(400)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !scene) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const frame = scene.frames[frameIndex] ?? scene.frames[scene.frames.length - 1]
    if (!frame) return
    // 用最终帧的文本计算画布高度（保证动画过程中尺寸稳定）
    const lastText = scene.frames[scene.frames.length - 1]?.text ?? frame.text
    const h = measureCanvasHeight(scene.question, lastText, preset)
    setCanvasH(h)
    renderFrame(ctx, frame, scene.question, preset, scene.layout, h)
  }, [scene, preset, frameIndex])

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_W}
      height={canvasH}
      style={{ borderRadius: 12, maxWidth: '100%', height: 'auto' }}
    />
  )
}
