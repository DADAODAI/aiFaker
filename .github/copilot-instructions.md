# aiFaker - Project Guidelines

## Product Goal
- Generate GIF/PNG meme images that mimic AI thinking and replying, for entertainment and AI outreach.
- Tone: playful, humorous, clearly fictional. Never optimize for deception or real-product impersonation.

## Architecture
- Pipeline: user input → scene build → Canvas render → PNG/GIF export.
- GIF and PNG share the same Scene/timeline; only the export step differs.
- AI reply styles live in `src/lib/presets.ts` as `StylePreset` objects — add new styles there.
- Rendering logic (`src/lib/renderer.ts`) is decoupled from UI components.

## Build and Test
```bash
npm install        # install dependencies
npm run dev        # Vite dev server with HMR
npm run build      # production build (tsc + vite build)
npm run preview    # preview production build
```

## Conventions
- Chinese-first UI and default content.
- Keep rendering deterministic for the same input + preset.
- New presets: add to `src/lib/presets.ts`, no renderer changes needed.
- Asset dirs: fonts/, stickers/, backgrounds/ when assets are introduced.

## Content Boundaries
- Keep comedy light; avoid targeting protected groups, real-person impersonation, or misleading political content.
- Use parody cues and fictional model names (e.g. "FakeGPT-4o", "Fraud Opus").
