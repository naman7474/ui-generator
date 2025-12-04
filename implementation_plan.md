# AI Pixel-to-Pixel Website Generator — Implementation Plan (React, Multi‑Component)

This plan integrates the checker (Node/TypeScript + Playwright) and the screenshot-to-code generator (Python/FastAPI) to build an iterative, AI‑driven, pixel‑diff guided website generator that reaches ≥90% visual similarity at desktop and mobile breakpoints.

---

## Goals & Success Criteria

- Generate a working multi‑component React app (React + Tailwind) from a base URL’s screenshot(s).
- Iterate automatically: compare base vs locally hosted generated site, analyze pixel + style diffs, and refine the code via an LLM loop.
- Achieve visual similarity ≥90% at both desktop and mobile.
- Produce artifacts per iteration (screenshots, diffs, code, reports) and a single summary.
- Use Gemini 3 Pro (with images) for feedback/instructions and/or generation where applicable.

---

## Codebases In Scope

- Checker (Node/TS) — core pieces you’ll touch/use:
  - `src/comparator.ts` — captures screenshots, computes pixel diffs, and extracts styles.
  - `src/style-diff.ts` — computed styles extraction + semantic diffs.
  - `src/report.ts` — report generation (JSON + HTML), AI fix prompt helper already wired to Gemini.
  - `src/server.ts` — Express server and API.
  - `src/gemini.ts` — Gemini helper using `@google/generative-ai` and file uploads.
  - Static hosting: `/artifacts` is served by Express for all generated assets and reports.

- screenshot-to-code (Python/FastAPI) — core pieces you’ll touch/use:
  - `backend/routes/generate_code.py` — streaming WS code generation pipeline.
  - `backend/prompts/__init__.py` + `prompts/types.py` — prompt assembly (create/update, images, imported code).
  - `backend/models/gemini.py` + `backend/llm.py` — Gemini integration and model registry.
  - `backend/codegen/utils.py` — `extract_html_content` from LLM output.
  - `backend/main.py` — FastAPI app and route registration.

---

## High‑Level Architecture & Flow

1. User provides a Base URL and desired stack (e.g., `html_tailwind`, `react_tailwind`).
2. Checker captures screenshots of the Base URL (desktop and/or mobile) using Playwright.
3. Screenshots are sent to screenshot-to-code to generate an initial React bundle (iteration 0). The generated files are written locally and hosted under `/artifacts` without a build step (ESM CDN imports).
4. Checker compares Base URL vs the generated page URL for each device:
   - Pixel diff (PNG heatmap + similarity)
   - Computed style diff (semantic list)
5. If any device similarity < threshold (default 0.90), create an LLM feedback package:
   - Diff images + structured style diffs
   - Current generated HTML context
   - Clear instructions (“align target to base”)
6. Send an “update” request to screenshot-to-code (with previous React code as imported code + feedback) to produce a refined React bundle.
7. Repeat steps 4–6 until threshold met for all devices or iteration cap reached.
8. Persist all artifacts and build a summary report containing per-iteration stats and final outputs.

---

## Implementation Phases

### Phase 0 — Environment & Config

- Set the following env vars:
  - Checker (`.env` at repo root):
    - `GOOGLE_API_KEY` (used by `src/gemini.ts`)
  - screenshot-to-code (`screenshot-to-code/backend/.env`):
    - `GEMINI_API_KEY` (Gemini 3 Pro)
- Ensure Playwright is available to the Node service (Chromium bundled/in CI step).
- Define standard ports: Checker on `:3000`, screenshot-to-code backend on `:8000`.

References:
- Gemini JS/Python usage patterns in `gemini help.md` (already in repo).

---

## Phase 1 — Checker: Screenshot + Hosting + Orchestration

1) Add a first‑class screenshot endpoint leveraging Playwright
- File: `src/server.ts`
- Add `POST /screenshot` accepting `{ url: string, device: 'desktop'|'mobile', fullPage?: boolean }`.
- Implement using a small helper (new): `src/screenshot.ts`
  - Reuse `getViewportForDevice` logic from `src/comparator.ts`.
  - Return `{ dataUrl: string, path: string }` where `path` is saved under a run folder in `/artifacts`.

2) Add React bundle host helper
- File: `src/react-host.ts` (new)
- Functions:
  - `writeReactBundle(runDir: string, bundle: ReactBundle): Promise<{ localUrl: string, entryPath: string }>` writes multiple files (`index.html`, `main.jsx`, `App.jsx`, `components/*`) under `runDir`.
  - If missing, scaffold:
    - `index.html` with Tailwind CDN, `<div id="root"></div>`, and `<script type="module" src="./main.jsx"></script>`.
    - `main.jsx` importing React from `https://esm.sh/react@18` and ReactDOM from `https://esm.sh/react-dom@18/client` and rendering `<App />`.
  - Returns hosted URL like `http://localhost:3000/artifacts/<relative>/index.html`.

3) Add LLM feedback packager (checker‑side “checker LLM”)
- File: `src/llm-feedback.ts` (new)
- Purpose: produce concise, actionable instructions for the generator from diffs.
- Use `src/gemini.ts` to call Gemini 3 Pro with images:
  - Inputs: base screenshot(s), generated screenshot(s), diff heatmap(s), and JSON style diffs for each device.
  - Output: markdown instructions with explicit, selector‑anchored fixes.
- Note: this module complements screenshot-to-code’s own prompts; we’ll pass its output as the “user” update instruction.

4) Build the PixelGen orchestrator
- File: `src/pixelgen.ts` (new)
- Export: `runPixelGen({ baseUrl, stack, devices, threshold, minSimilarity, maxIterations, fullPage, headless })`.
- Steps per run:
  - Create a run id and run root at `artifacts/pixelgen/<runId>/`.
  - For each device, capture Base screenshot to `iteration-00/<device>/base.png`.
  - Call screenshot-to-code “create” (REST; Phase 2) with the base screenshot (desktop only by default), `stack: 'react_tailwind'`, and receive a React bundle manifest.
  - Write bundle to `iteration-00/site/` via `writeReactBundle`, get `localUrl`.
  - For each device, compare `baseUrl` vs `localUrl` using `compareSites` (device‑aware):
    - Save `target.png`, `diff.png`, and `style-diff.json`.
  - Evaluate similarity across devices. If all ≥ `minSimilarity` (default 0.90) → done.
  - Else for `i = 1..maxIterations`:
    - Build feedback via `llm-feedback` using all device artifacts from `iteration-(i-1)`.
    - Call screenshot-to-code “update” (REST; Phase 2) with:
      - `currentBundle` (files from previous iteration; if needed also pass a concatenated text context),
      - `images` (base + diff images; at least one per device),
      - `instructions` (from `llm-feedback`),
      - `stack: 'react_tailwind'`.
    - Write updated bundle to `iteration-<i>/site/`.
    - Re‑compare across devices and evaluate similarity; stop criteria below.
- Stop conditions (choose first):
  - All device similarities ≥ threshold (default 0.90).
  - `maxIterations` reached (default 5).
  - Convergence stall: last 2 iterations improved <0.5% cumulatively.

5) Expose API to kick off generation
- File: `src/server.ts`
- Add `POST /pixelgen/run` accepting:
  - `{ baseUrl: string, stack: string, devices?: ('desktop'|'mobile')[], minSimilarity?: number, maxIterations?: number, fullPage?: boolean, headless?: boolean, threshold?: number }`
- Respond with:
  - `jobId`, `artifactsUrl`, `iterations`, per‑device similarity history, `finalLocalUrl`.
- Optional: `GET /pixelgen/:jobId` to fetch progress/status.json and assets.

6) Persist per‑iteration artifacts
- Directory layout:
  - `artifacts/pixelgen/<runId>/`
    - `iteration-00/`
      - `desktop/` and/or `mobile/`: `base.png`, `target.png`, `diff.png`, `style-diff.json`
      - `site/` React bundle files (e.g., `index.html`, `main.jsx`, `App.jsx`, `components/*`)
    - `iteration-01/` …
    - `summary.json` — includes device similarities per iteration, stop reason, final URLs.

---

## Phase 2 — screenshot-to-code: Add React bundle REST endpoints and Gemini 3 Pro

1) Add REST endpoints (non‑streaming) alongside WS
- File: `screenshot-to-code/backend/routes/rest_generate.py` (new)
- Register in `backend/main.py` via `app.include_router(rest_generate.router)`.
- Endpoints:
  - `POST /api/generate-from-image`
    - Body: `{ stack: 'react_tailwind', image: string /* data URL */, model?: string }`
    - Builds prompt via `create_prompt(..., input_mode='image', generation_type='create', ...)` and prepends a system instruction to return a JSON React bundle manifest (schema below).
    - Calls Gemini model (default `gemini-3.0-pro`) through existing `models.stream_gemini_response` and accumulates chunks.
    - Parse returned JSON to `{ bundle, model }`.
  - `POST /api/update-from-diff`
    - Body: `{ stack: 'react_tailwind', currentBundle?: ReactBundle, currentHtml?: string, instructions: string, images?: string[], model?: string }`
    - Use imported‑code update path. Convert `currentBundle` into a single contextual text (concatenate file contents in stable order) as history[0], then pass `instructions` + `images` as history[1].
    - Prepend the same “return JSON bundle manifest” instruction; parse output JSON and return `{ bundle, model }`.

React Bundle Manifest (strict JSON)
```
type ReactBundle = {
  entry: string; // e.g. "index.html"
  files: Array<{ path: string; content: string }>;
};
```
- Error handling: return `{ error }` with 4xx/5xx on failures.

2) Add Gemini 3 Pro constant and default
- File: `screenshot-to-code/backend/llm.py`
  - Add `GEMINI_3_0_PRO = "gemini-3.0-pro"` in `Llm` enum.
  - Add to `MODEL_PROVIDER` and `GEMINI_MODELS` set.
- File: `screenshot-to-code/backend/routes/generate_code.py`
  - In `ModelSelectionStage._get_variant_models`, prefer `Llm.GEMINI_3_0_PRO` where appropriate (for image modes when Gemini key present).
- File: `screenshot-to-code/backend/models/gemini.py`
  - The existing `google.genai` client works with 3.0 Pro; set default generate config per `gemini help.md` patterns.
  - If needed, allow optional `thinking_config` for 2.5; for 3.0 Pro use standard generation config with `max_output_tokens`.

3) Optional: swap Python’s screenshot endpoint to use Checker’s Playwright
- Not required for the core loop. If desired, deprecate `routes/screenshot.py` and delegate to Checker’s `/screenshot` endpoint so a single code path captures images.

---

## Phase 3 — UI wiring (optional to start)

- Checker UI: add a simple “Generate from URL” card in `public/index.html` that posts to `/pixelgen/run` with Base URL, devices, and stack. Show per‑iteration results and final artifact/report links.
- screenshot-to-code UI can remain unchanged; power users can continue using it independently.

---

## Prompting & Feedback Details

- Checker‑side feedback (Gemini 3 Pro) via `src/llm-feedback.ts` should:
  - Summarize top diffs by section (Header, Hero, Footer, etc.).
  - Propose concrete CSS/HTML fixes with selectors and exact values.
  - Call out layout shifts from diff heatmaps.
  - Input: For each device, provide: base.png, target.png, diff.png and the `styleDiff.differences` JSON from `src/style-diff.ts`.
  - Output: Markdown instructions. We pass this into the screenshot-to-code “update” REST endpoint as the user message, along with images.

- screenshot-to-code generation tips (React bundle):
  - For the initial “create”, default to desktop screenshot only to synthesize a responsive baseline and ask the model to split into multiple components (`components/*`) using Tailwind utilities.
  - For “update”, always include: current bundle context + device diffs + the feedback markdown. Instruct the model to preserve file names and only modify necessary files.
  - Explicitly instruct: “Output strict JSON only, matching the ReactBundle schema. Do not wrap in code fences. Do not include commentary.”

- Gemini usage:
  - JS (checker): reuse `src/gemini.ts` or JS examples from `gemini help.md`.
  - Python (generator): reuse `google.genai` patterns in `backend/models/gemini.py`. Default to `model="gemini-3.0-pro"`.

---

## Comparison, Convergence, and Thresholds

- Two devices: `desktop` (1280×720, dpr 1, isMobile false) and `mobile` (375×667, dpr 2, isMobile true).
- `pixelmatch` threshold from Checker config (default 0.1) applies to diff.
- Overall success is min(similarityDesktop, similarityMobile) ≥ 0.90.
- Convergence stall: if best of both devices improves <0.5 percentage points in two consecutive iterations, stop and return best result.

---

## Artifacts & Reporting

- Per iteration and device save:
  - `base.png`, `target.png`, `diff.png`.
  - `style-diff.json` (Checker’s `StyleComparisonResult`).
  - `fix-prompt.md` (Checker’s per‑iteration feedback sent to generator).
  - `site/index.html` (generated code for that iteration).
- Write a run‑level `summary.json` with:
  - Run id, base URL, selected stack, devices
  - Iteration stats by device: similarity, diff pixels, load times
  - Stop reason and final URLs
- Optional: emit a compact `report.html` per iteration using `src/report.ts` style (or link to the single‑page report already generated per compare run).

---

## Concrete File‑Level Changes

Checker (Node/TypeScript):
- Add: `src/screenshot.ts`
  - `capture(url, device, options) -> { path, dataUrl }` using Playwright; mirror parts of `captureSite`.
- Add: `src/react-host.ts`
  - `writeReactBundle(runDir, bundle) -> { localUrl, entryPath }` (adds ESM + CDN scaffolding if missing)
- Add: `src/llm-feedback.ts`
  - `buildFeedback({ baseImg, targetImg, diffImg, styleDiffsByDevice }) -> markdown` using `src/gemini.ts` and file uploads.
- Add: `src/pixelgen.ts`
  - Orchestration loop as described.
- Update: `src/server.ts`
  - `POST /screenshot` → uses `src/screenshot.ts`.
  - `POST /pixelgen/run` → calls `runPixelGen` and returns summary.


screenshot-to-code (Python/FastAPI):
- Add: `backend/routes/rest_generate.py`
  - `POST /api/generate-from-image` and `POST /api/update-from-diff` returning a React bundle manifest.
- Update: `backend/main.py`
  - `app.include_router(rest_generate.router)`.
- Update: `backend/llm.py`
  - Add `GEMINI_3_0_PRO` to `Llm`, include in `MODEL_PROVIDER` + `GEMINI_MODELS`.
- Update: `backend/routes/generate_code.py`
  - Prefer `Llm.GEMINI_3_0_PRO` when Gemini is selected for image modes.
- Validate: `backend/models/gemini.py`
  - Ensure `generate_content_stream` usage is OK for `gemini-3.0-pro`.
  - Add a small parser utility (e.g., `backend/utils/bundle_parse.py`) to safely extract the first valid JSON matching the ReactBundle schema.

---

## API Contracts (draft)

- Checker `POST /pixelgen/run`
  - Request: `{ baseUrl, stack, devices?: ['desktop','mobile'], minSimilarity?: number, maxIterations?: number, fullPage?: boolean, headless?: boolean, threshold?: number }`
  - Response: `{ jobId, artifactsUrl, iterations: Array<{ i, similarities: Record<'desktop'|'mobile', number> }>, finalLocalUrl, stopReason }`

- Checker `POST /screenshot`
  - Request: `{ url: string, device: 'desktop'|'mobile', fullPage?: boolean }`
  - Response: `{ dataUrl: string, path: string }`

- screenshot-to-code `POST /api/generate-from-image`
  - Request: `{ stack: 'react_tailwind', image: string /* data URL */, model?: string }`
  - Response: `{ bundle: ReactBundle, model: string }`

- screenshot-to-code `POST /api/update-from-diff`
  - Request: `{ stack: 'react_tailwind', currentBundle?: ReactBundle, currentHtml?: string, instructions: string, images?: string[], model?: string }`
  - Response: `{ bundle: ReactBundle, model: string }`

---

## Testing & Validation

- Unit: mock REST generator to return canned HTML, validate the orchestrator loop, artifact writing, and stopping logic.
- E2E (local):
  - Start both servers. Run `POST /pixelgen/run` against public sites with simple layouts.
  - Verify per‑iteration similarity increases and stops near/above 90%.
  - Validate both desktop and mobile diffs.

---

## Risks & Mitigations

- Generated HTML may reference external fonts/images → accept minor variance; optionally inline critical assets in future iterations.
- Large or highly dynamic pages → add `postLoadWaitMs` and controlled scrolling (already in checker) to improve stability.
- Model output drift (“rebuild” vs “patch”) → always use imported‑code update path, and include explicit instructions + diffs per iteration.
- Network/API rate limits → set `maxIterations`, timeouts, and add backoffs.

---

## Rollout Plan

1. Phase 1 (Checker): build orchestrator, local hosting, and REST surface.
2. Phase 2 (screenshot-to-code): add REST endpoints + Gemini 3 Pro model support.
3. Wire together end‑to‑end in dev; validate against a small set of URLs.
4. Optional: add the minimal UI entry in Checker’s `/` to trigger `/pixelgen/run` and show results.

---

## Notes on Gemini 3 Pro Usage

- JS (checker) can reuse `src/gemini.ts` for image + text prompts (file uploads via `GoogleAIFileManager`).
- Python (generator) already uses `google.genai`; set `model="gemini-3.0-pro"` in REST endpoints and/or the variant selection. See `gemini help.md` for examples, including thinking config (for 2.5 models) and system instructions.

---

## Done Definition

- `POST /pixelgen/run` produces a run directory containing per‑iteration assets, a `summary.json`, and a final hosted page `site/index.html` reaching ≥90% similarity on both desktop and mobile for typical marketing pages.
- Logs include per‑iteration similarity, time per step, and the selected model.
