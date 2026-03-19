import type { Scene, SceneFrame, StylePreset, LayoutMode } from './types'

/**
 * 从用户输入 + 风格预设生成统一的 Scene。
 * GIF 和 PNG 共享同一份 Scene，只是取不同帧。
 */
export function buildScene(
  question: string,
  answer: string,
  preset: StylePreset,
  layoutOverride?: LayoutMode,
): Scene {
  const frames: SceneFrame[] = []

  // 1. 思考阶段：闪烁 3 次
  for (let i = 0; i < 3; i++) {
    frames.push({ text: preset.thinkingText, duration: 400, showCursor: true })
    frames.push({ text: preset.thinkingText, duration: 200, showCursor: false })
  }

  // 2. 打字阶段：逐字显示 answer
  const chars = [...answer] // 正确处理 emoji / 中文
  for (let i = 1; i <= chars.length; i++) {
    frames.push({
      text: chars.slice(0, i).join(''),
      duration: 60,
      showCursor: true,
    })
  }

  // 3. 完成帧：保持最终文本
  frames.push({ text: answer, duration: 1500, showCursor: false })

  return {
    modelName: preset.modelName,
    question,
    frames,
    preset: preset.id,
    layout: layoutOverride ?? preset.layout,
  }
}
