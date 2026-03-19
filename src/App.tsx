import { useState, useCallback, useRef, useEffect } from 'react'
import type { Scene, LayoutMode } from './lib/types'
import { presets } from './lib/presets'
import { buildScene } from './lib/scene'
import { exportPng, exportGif, download } from './lib/exporter'
import { preloadLogo } from './lib/renderer'
import Preview from './components/Preview'

export default function App() {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [presetId, setPresetId] = useState(presets[0]!.id)
  const [layout, setLayout] = useState<LayoutMode>(presets[0]!.layout)
  const [scene, setScene] = useState<Scene | null>(null)
  const [frameIndex, setFrameIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [exporting, setExporting] = useState(false)
  const timerRef = useRef(0)

  const preset = presets.find((p) => p.id === presetId) ?? presets[0]!

  // 切换预设时同步默认布局 + 预加载 logo
  useEffect(() => {
    setLayout(preset.layout)
    if (preset.logoUrl) {
      preloadLogo(preset.logoUrl)
    }
  }, [preset])

  // 生成场景
  const generate = useCallback(() => {
    if (!question.trim() || !answer.trim()) return
    const s = buildScene(question.trim(), answer.trim(), preset, layout)
    setScene(s)
    setFrameIndex(s.frames.length - 1) // 默认展示最终帧
    setPlaying(false)
  }, [question, answer, preset, layout])

  // 动画播放
  useEffect(() => {
    if (!playing || !scene) return
    let i = 0
    const advance = () => {
      const frame = scene.frames[i]
      if (!frame) {
        setPlaying(false)
        return
      }
      setFrameIndex(i)
      i++
      timerRef.current = window.setTimeout(advance, frame.duration)
    }
    advance()
    return () => clearTimeout(timerRef.current)
  }, [playing, scene])

  const handleExportPng = useCallback(() => {
    if (!scene) return
    const url = exportPng(scene, preset)
    download(url, 'aifaker.png')
  }, [scene, preset])

  const handleExportGif = useCallback(async () => {
    if (!scene) return
    setExporting(true)
    try {
      const url = await exportGif(scene, preset)
      download(url, 'aifaker.gif')
    } finally {
      setExporting(false)
    }
  }, [scene, preset])

  return (
    <div className="app">
      <header>
        <h1>🤖 aiFaker</h1>
        <p className="subtitle">假装 AI 在回答你的问题</p>
      </header>

      <div className="workspace">
        {/* 左边：输入区 */}
        <div className="controls">
          <label>
            选择风格
            <select value={presetId} onChange={(e) => setPresetId(e.target.value)}>
              {presets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            消息布局
            <select value={layout} onChange={(e) => setLayout(e.target.value as LayoutMode)}>
              <option value="all-left">全部左对齐</option>
              <option value="lr">用户右 · AI 左</option>
            </select>
          </label>

          <label>
            你的问题
            <textarea
              rows={3}
              placeholder="随便问点什么..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </label>

          <label>
            AI 的回答
            <textarea
              rows={4}
              placeholder="想让 AI 说什么就说什么 😏"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />
          </label>

          <button className="btn primary" onClick={generate}>
            ✨ 生成预览
          </button>

          {scene && (
            <div className="export-group">
              <button className="btn" onClick={() => { setPlaying(true); setFrameIndex(0) }}>
                ▶ 播放动画
              </button>
              <button className="btn" onClick={handleExportPng}>
                📷 导出 PNG
              </button>
              <button className="btn" onClick={handleExportGif} disabled={exporting}>
                {exporting ? '⏳ 导出中...' : '🎞 导出 GIF'}
              </button>
            </div>
          )}
        </div>

        {/* 右边：预览区 */}
        <div className="preview-area">
          {scene ? (
            <Preview scene={scene} preset={preset} frameIndex={frameIndex} />
          ) : (
            <div className="placeholder">在左侧输入内容后点击「生成预览」</div>
          )}
        </div>
      </div>
    </div>
  )
}
