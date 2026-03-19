/** 一帧场景描述 */
export interface SceneFrame {
  /** 显示的文字（支持逐字递增来模拟打字效果） */
  text: string
  /** 该帧持续毫秒数 */
  duration: number
  /** 是否显示光标 */
  showCursor: boolean
}

/** 完整场景时间线 */
export interface Scene {
  /** 模型名称，显示在顶部 */
  modelName: string
  /** 用户的提问 */
  question: string
  /** 所有帧列表（GIF 会逐帧渲染，PNG 只取最后一帧） */
  frames: SceneFrame[]
  /** 视觉风格 preset 名称 */
  preset: string
  /** 消息布局方向 */
  layout: LayoutMode
}

/** 消息布局方向 */
export type LayoutMode = 'all-left' | 'lr'

/** 视觉风格配置 */
export interface StylePreset {
  id: string
  label: string
  /** 背景色 */
  bgColor: string
  /** 用户气泡背景色 */
  userBubbleBg: string
  /** AI 气泡背景色 */
  aiBubbleBg: string
  /** 文字颜色（通用/顶栏等） */
  textColor: string
  /** 用户气泡内文字色 */
  userBubbleTextColor: string
  /** AI 文字颜色 */
  aiTextColor: string
  /** 字体 */
  fontFamily: string
  /** 字号 px */
  fontSize: number
  /** 思考中显示的文字 */
  thinkingText: string
  /** 模型名称 */
  modelName: string
  /** 品牌 logo 图片路径（public/ 下），为空则退回圆形文字头像 */
  logoUrl: string
  /** 用户头像背景色 */
  userAvatarColor: string
  /** AI 头像背景色（logo 缺失时使用） */
  aiAvatarColor: string
  /** 气泡圆角半径 */
  bubbleRadius: number
  /** 默认消息布局方向 */
  layout: LayoutMode
}
