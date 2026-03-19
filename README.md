# 🤖 aiFaker

生成 GIF 和 PNG 表情包，假装 AI 经过深度思考后给出了神回复。  
本项目的主要目的是**娱乐大众**，拉近 AI 与人们的距离。哈哈

<img width="2698" height="1346" alt="image" src="https://github.com/user-attachments/assets/48f7ca2f-c45a-4029-8776-c695a2343262" />

![aifaker (2)](https://github.com/user-attachments/assets/c457a717-f32f-4fce-b39c-97026b4d9f18)


## 功能

- 输入任意问题和回答，一键生成"AI 在思考"的对话截图
- 支持多种风格预设（ChatGPT 深色/浅色、DeepSeek、Claude、Gemini）
- 导出 **PNG**（最终帧截图）或 **GIF**（带打字动画）
- 浏览器端就地渲染，无需后端

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 技术栈

| 层 | 工具 |
|---|------|
| 框架 | React 18 + TypeScript |
| 构建 | Vite 6 |
| 渲染 | Canvas 2D API |
| GIF 导出 | gifenc |

## 项目结构

```
src/
├── lib/
│   ├── types.ts       # 场景和风格类型定义
│   ├── presets.ts      # 风格预设配置
│   ├── scene.ts        # 场景/时间线生成
│   ├── renderer.ts     # Canvas 渲染器
│   └── exporter.ts     # PNG/GIF 导出
├── components/
│   └── Preview.tsx     # 画布预览组件
├── App.tsx             # 主界面
├── index.css           # 全局样式
└── main.tsx            # 入口
```

## 扩展风格

在 `src/lib/presets.ts` 中添加一个新的 `StylePreset` 对象即可，无需修改渲染或导出代码。

## 许可

MIT
