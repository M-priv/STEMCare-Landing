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

Before launch, update `https://stemcare.health/` in `index.html`, `public/robots.txt`, and `public/sitemap.xml` if the production domain changes.

## Notes

- Uses the STEMCare visual language from the app landing page: clinical blue/teal accents, safety badges, glass-style product panels, and workflow language.
- Uses Floema-inspired reactive scroll patterns: sticky narrative panels, scroll-linked movement, changing visual states, and editorial pacing.
- Avoids claiming autonomous diagnosis, prescribing, or completed regulatory certification. The copy frames STEMCare as clinician-controlled and safety-governed.
- The pilot CTA currently uses `hello@stemcare.health`; update that mailto before deployment if the launch address differs.
