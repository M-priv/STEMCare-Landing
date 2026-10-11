# STEMCare Landing Site

Standalone launch landing site for STEMCare.

This repository is intentionally separate from the main STEMCare app. It explains the product thesis before the app launch, with clinician and clinical-lead-facing positioning.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deploy

The project is ready for a static Vite deployment. For Vercel, import the GitHub repository and use:

- Framework preset: `Vite`
- Build command: `npm run build`
- Output directory: `dist`

Before launch, ensure `https://stemcare.co.uk/` is updated in `index.html`, `public/robots.txt`, and `public/sitemap.xml` if any alternate staging domain is used.

## Live demo mode

The MedGemma demo (`/demo`) is deterministic by default: responses come from
ported policy engines in the browser and no data leaves the visitor's device.
An optional live path routes model generation through a server-side proxy:

- `VITE_DEMO_LIVE_MODE="true"` — client flag enabling `/api/gemini` calls
- `GEMINI_API_KEY` — server-side only; **never** prefix with `VITE_`
- `DEMO_GEMINI_MODEL` — model override (default `gemini-3.1-flash-lite`)
- `DEMO_LIVE_KILL_SWITCH="true"` — instantly forces deterministic fallback

The proxy (`api/gemini.ts` + `src/demo/lib/liveEngine.ts`) is role-locked
(four fixed roles, prompts built server-side), gates every model response
through the assistive-only policy before it reaches the client, rate-limits
per IP, and falls back to the deterministic engines on any failure. See
`DEMO_TESTING.md` for the partner test guide.

## Notes

- Uses the STEMCare visual language from the app landing page: clinical blue/teal accents, safety badges, glass-style product panels, and workflow language.
- Uses Floema-inspired reactive scroll patterns: sticky narrative panels, scroll-linked movement, changing visual states, and editorial pacing.
- Avoids claiming autonomous diagnosis, prescribing, or completed regulatory certification. The copy frames STEMCare as clinician-controlled and safety-governed.
- The pilot CTA currently uses `stemglobalmanagement@gmail.com`; update that mailto before deployment if the launch address differs.
