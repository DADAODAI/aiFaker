import type { SceneFrame, StylePreset, LayoutMode } from './types'

const CANVAS_W = 960
const PADDING = 48
const AVATAR_SIZE = 44
const LINE_HEIGHT_FACTOR = 1.5
const HEADER_H = 60 // 顶栏区域高度
const BUBBLE_GAP = 24 // 两个气泡之间间距
const BOTTOM_PAD = 36 // 底部留白

// ---- Logo 预加载缓存 ----
const logoCache = new Map<string, HTMLImageElement | null>()

/** 预加载 logo 图片并缓存。加载失败则缓存 null。 */
export function preloadLogo(url: string): Promise<HTMLImageElement | null> {
  if (logoCache.has(url)) return Promise.resolve(logoCache.get(url)!)
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => { logoCache.set(url, img); resolve(img) }
    img.onerror = () => { logoCache.set(url, null); resolve(null) }
    img.src = url
  })
}

/**
 * 根据问答文本 + 最长回答帧动态计算画布高度。
 * 需要一个临时 canvas context 来测量文字。
 */
export function measureCanvasHeight(
  question: string,
  answerText: string,
  preset: StylePreset,
): number {
  const canvas = document.createElement('canvas')
  canvas.width = CANVAS_W
  const ctx = canvas.getContext('2d')!
  const qH = measureBubbleHeight(ctx, question, preset)
  const aH = measureBubbleHeight(ctx, answerText, preset)
  return HEADER_H + qH + BUBBLE_GAP + aH + BOTTOM_PAD
}

/** 在 canvas 上绘制一帧 */
export function renderFrame(
  ctx: CanvasRenderingContext2D,
  frame: SceneFrame,
  question: string,
  preset: StylePreset,
  layout: LayoutMode = 'all-left',
  canvasH?: number,
) {
  const w = CANVAS_W
  const h = canvasH ?? measureCanvasHeight(question, frame.text, preset)
  ctx.canvas.width = w
  ctx.canvas.height = h

  // 背景
  ctx.fillStyle = preset.bgColor
  ctx.fillRect(0, 0, w, h)

  // 顶部模型名
  ctx.fillStyle = preset.textColor
  ctx.font = `bold 16px ${preset.fontFamily}`
  ctx.textAlign = 'center'
  ctx.fillText(preset.modelName, w / 2, 34)

  // ---- 用户气泡 ----
  const userY = HEADER_H
  drawBubble(ctx, question, userY, preset, true, layout, false)

  // ---- AI 回复气泡 ----
  const aiY = userY + measureBubbleHeight(ctx, question, preset) + BUBBLE_GAP
  drawBubble(ctx, frame.text, aiY, preset, false, layout, frame.showCursor)
}

function drawBubble(
  ctx: CanvasRenderingContext2D,
  text: string,
  y: number,
  preset: StylePreset,
  isUser: boolean,
  layout: LayoutMode,
  showCursor: boolean,
) {
  const w = CANVAS_W
  const fontSize = preset.fontSize
  const radius = preset.bubbleRadius
  ctx.font = `${fontSize}px ${preset.fontFamily}`

  // 布局计算: 'lr' 模式下用户靠右，AI 靠左
  const isRight = layout === 'lr' && isUser

  const avatarGap = 12
  const bubbleW = w - PADDING * 2 - AVATAR_SIZE - avatarGap

  let avatarX: number
  let bubbleX: number

  if (isRight) {
    // 头像在最右、气泡在头像左侧
    avatarX = w - PADDING - AVATAR_SIZE / 2
    bubbleX = PADDING
  } else {
    // 头像在最左、气泡在头像右侧
    avatarX = PADDING + AVATAR_SIZE / 2
    bubbleX = PADDING + AVATAR_SIZE + avatarGap
  }

  const lines = wrapText(ctx, text, bubbleW - 24)
  const lineH = fontSize * LINE_HEIGHT_FACTOR
  const bubbleH = Math.max(lines.length * lineH + 20, 50)

  // ---- 头像 ----
  drawAvatar(ctx, avatarX, y + AVATAR_SIZE / 2, preset, isUser)

  // ---- 气泡背景 ----
  ctx.fillStyle = isUser ? preset.userBubbleBg : preset.aiBubbleBg
  roundRect(ctx, bubbleX, y, bubbleW, bubbleH, radius)
  ctx.fill()

  // 气泡边框
  ctx.strokeStyle = isUser
    ? adjustAlpha(preset.textColor, 0.1)
    : adjustAlpha(preset.aiTextColor, 0.15)
  ctx.lineWidth = 1
  roundRect(ctx, bubbleX, y, bubbleW, bubbleH, radius)
  ctx.stroke()

  // ---- 文字 ----
  ctx.fillStyle = isUser ? preset.userBubbleTextColor : preset.aiTextColor
  ctx.font = `${fontSize}px ${preset.fontFamily}`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  lines.forEach((line, i) => {
    ctx.fillText(line, bubbleX + 12, y + 10 + i * lineH)
  })

  // 光标
  if (showCursor) {
    const lastLine = lines[lines.length - 1] ?? ''
    const cursorX = bubbleX + 12 + ctx.measureText(lastLine).width + 2
    const cursorY = y + 10 + (lines.length - 1) * lineH
    ctx.fillStyle = preset.aiTextColor
    ctx.fillRect(cursorX, cursorY, 2, fontSize)
  }
}

function drawAvatar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  preset: StylePreset,
  isUser: boolean,
) {
  const r = AVATAR_SIZE / 2
  const logoImg = isUser ? null : logoCache.get(preset.logoUrl) ?? null

  if (!isUser && logoImg) {
    // 圆形裁剪 + 绘制 logo
    ctx.save()
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.clip()
    ctx.drawImage(logoImg, cx - r, cy - r, AVATAR_SIZE, AVATAR_SIZE)
    ctx.restore()
  } else {
    // 圆形色块 + 文字
    ctx.fillStyle = isUser ? preset.userAvatarColor : preset.aiAvatarColor
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.font = `bold 16px ${preset.fontFamily}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(isUser ? '你' : 'AI', cx, cy)
  }
}

export function measureBubbleHeight(
  ctx: CanvasRenderingContext2D,
  text: string,
  preset: StylePreset,
): number {
  const bubbleW = CANVAS_W - PADDING * 2 - AVATAR_SIZE - 12 - 24
  ctx.font = `${preset.fontSize}px ${preset.fontFamily}`
  const lines = wrapText(ctx, text, bubbleW)
  return Math.max(lines.length * preset.fontSize * LINE_HEIGHT_FACTOR + 20, 50)
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const chars = [...text]
  const lines: string[] = []
  let current = ''
  for (const ch of chars) {
    if (ch === '\n') {
      lines.push(current)
      current = ''
      continue
    }
    const test = current + ch
    if (ctx.measureText(test).width > maxWidth && current.length > 0) {
      lines.push(current)
      current = ch
    } else {
      current = test
    }
  }
  if (current) lines.push(current)
  if (lines.length === 0) lines.push('')
  return lines
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
}

function adjustAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

export { CANVAS_W }
