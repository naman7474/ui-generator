Critical Issues

  - screenshot-to-code import missing
      - File: screenshot-to-code/backend/main.py:27
      - app.include_router(rest_generate.router) is called but rest_generate
  isn’t imported. Add from routes import rest_generate near the other route
  imports.
  - React JSX won’t run without a build/transpiler
      - Files: src/react-host.ts, src/pixelgen.ts
      - You’re serving .jsx with ESM from the static server, but browsers cannot
  execute JSX. Either:
          - Add server-side transpile (recommend): use esbuild to compile JSX to
  ESM JS when writing the bundle (fast and simple), then reference the compiled
  output in index.html; or
          - Switch the generator to output React without JSX
  (React.createElement) or use UMD + Babel Standalone (works but heavier and
  more brittle across multiple files).
      - Without one of these, the generated React app will not load.
  - Port derived from config that doesn’t exist
      - Files: src/react-host.ts, src/pixelgen.ts
      - Using config.port, but src/config.ts doesn’t export a port. Use
  Number(process.env.PORT ?? 3000) locally in these files or extend config.ts to
  include port.

  Correctness & Robustness

  - Bundle entry not respected
      - File: src/react-host.ts
      - You write files and then hardcode index.html + main.jsx scaffolding
  regardless of bundle.entry. If the model returns a different entry, it’s
  ignored. Use bundle.entry:
          - If bundle.entry is html, ensure it exists and reference the correct
  script inside.
          - If it’s js/tsx, add an index.html that loads it as the entry.
  - Missing fallback when App.jsx is absent
      - File: src/react-host.ts
      - If no App.jsx arrives, the scaffolding for main.jsx will fail at
  runtime. Either:
          - Generate a minimal App.jsx if missing, or
          - Detect the primary component file from bundle.files and import that
  in main.jsx.
  - Path traversal on write
      - File: src/react-host.ts
      - path.join(siteDir, file.path) will honor ../ from the LLM. Sanitize
  to prevent escaping the run dir (e.g., normalize and ensure the target path
  starts with siteDir).
  - Fetch typing in Node/TypeScript
      - File: src/pixelgen.ts
      - TypeScript config lacks DOM lib; “fetch” will likely error at compile
  time. Options:
          - Add lib: ["ES2020", "DOM"] to tsconfig.json; or
          - Use undici (import 'undici/register'); or
          - Import node-fetch and use that.
  - Generator endpoint URL hardcoded
      - File: src/pixelgen.ts
      - GENERATOR_API_URL = 'http://localhost:8000' should be configurable (env
  var), so the orchestrator can run in different environments.
  - Convergence stall criterion not implemented
      - Logic described in the plan (stop if improvement <0.5pp over 2
  iterations) isn’t implemented. Add simple tracking to stop earlier when
  improvements stall.

  LLM + Prompting

  - Gemini model preference on checker side
      - File: src/gemini.ts
      - DEFAULT_GEMINI_MODELS doesn’t include gemini-3.0-pro. Add it, preferably
  first. This aligns with your plan and improves output quality.
  - Update payload images are only diffs
      - File: src/pixelgen.ts
      - You currently send only diff images to the update endpoint. Include
  base and target screenshots per device as well (or at least one of them) in
  addition to the diffs. The instructions are richer already, but images give
  the model valuable context.
  - JSON bundle parsing/guardrails in generator
      - File: screenshot-to-code/backend/routes/rest_generate.py:46–85
      - The regex fallback re.search(r'\{.*\}', ...) is greedy and fragile.
  Improve by:
          - Returning JSON delimited by explicit sentinels in the system prompt
  (e.g., START_JSON/END_JSON) and extracting between them.
          - Or implement a small balanced-brace parser to get the first valid
  JSON object.
      - Add a size limit check and truncate long non-JSON preambles to reduce
  parse failures.
  - System prompt refinements (generator)
      - File: screenshot-to-code/backend/routes/rest_generate.py:31
      - Clarify multi-component requirements and the runtime constraints:
          - “Split into components under components/* with descriptive names.”
          - “No build step available; either output non-JSX React
  (React.createElement) or prepare code for server-side transpilation.”
          - If you adopt esbuild, tell the model it can emit JSX and ESM, and
  you will compile.

  Performance & UX

  - Double-capture of base screenshots
      - File: src/pixelgen.ts
      - You capture base once, then compareSites captures again for base and
  target. This is fine for consistency, but if you want to reduce load, you
  could add an option in compareSites to reuse an existing base screenshot
  (requires light refactor).
  - Artifacts URL assembly
      - File: src/pixelgen.ts
      - The artifactsUrl uses config.port and a hardcoded path. It’s more
  reliable to build URLs using the same provider logic as storage.reportUrl() or
  use a single helper so the UI doesn’t break if hosting changes.
  - Error handling and retries
      - File: src/pixelgen.ts
      - Add a simple retry/backoff around the generator REST calls to handle
  transient model/network blips.
  - JSON body size limits
      - Both Node and FastAPI will see large base64 images. You already send
  images only to the generator (Python), which is good. Make sure FastAPI size
  limits are sufficient in prod. Node’s body limit is 1mb — that’s fine for /
  pixelgen/run, but if you expand it later to include images, update the limit.

  Security

  - Sanitize bundle inputs
      - Ensure path values in the returned bundle cannot write outside
  iteration-xx/site/.
      - Consider limiting total size and number of files per iteration to avoid
  resource abuse.

  Quick Fixes Summary

  - Add missing import: screenshot-to-code/backend/main.py:9
      - from routes import rest_generate
  - Use a valid port source
      - src/react-host.ts: compute const port = Number(process.env.PORT ??
  3000); same in src/pixelgen.ts.
  - Handle JSX
      - Preferred: Use esbuild to transpile the bundle on write (fast,
  single dependency). Then adjust index.html to load the compiled JS entry.
  Alternatively, switch to non-JSX React or UMD + Babel.
  - Respect bundle.entry and ensure App.jsx presence or generate minimal
  fallback
      - src/react-host.ts: if bundle.entry is present, wire index.html to it; if
  App.jsx absent, create a minimal export default () => null.
  - Sanitize bundle file paths
      - Reject or rewrite any file with path traversal outside the site dir.
  - Update checker Gemini models
      - src/gemini.ts: put gemini-3.0-pro first in DEFAULT_GEMINI_MODELS.
  - Improve JSON extraction in REST generator
      - screenshot-to-code/backend/routes/rest_generate.py: prefer sentinel-
  based extraction or robust balanced-brace parsing.
