# Visual & Performance Checker

A production-ready helper that compares two URLs for pixel-level visual differences and load-time performance using Playwright and Pixelmatch. Artifacts (screenshots, diff image, JSON report) are written per run for auditing.

## Prerequisites
- Node.js 18+
- Playwright downloads are included when installing dependencies.

## Install & Build
```bash
npm install
npm run build
```

## CLI Usage
```bash
# Basic comparison
npm run cli -- --base https://example.com --target https://staging.example.com

# Custom viewport and stricter diffing (viewport-only screenshots by default)
npm run cli -- \
  --base https://example.com \
  --target https://staging.example.com \
  --viewport 1440x900 \
  --threshold 0.05 \
  --out ./artifacts

# Multi-device compare (desktop and mobile)
npm run cli -- --base https://example.com --target https://staging.example.com --devices desktop,mobile

# Crawl and compare multiple pages (up to 10 pages discovered on base site)
npm run cli -- --base https://example.com --target https://staging.example.com --crawl --max-pages 10

# Crawl only a section (include/exclude globs)
npm run cli -- --base https://example.com --target https://staging.example.com --crawl \
  --include "/blog/**,/docs/**" --exclude "/blog/drafts/**" --max-pages 50
```

Key flags:
- `--base`, `--target`: URLs to compare (required)
- `--crawl`: crawl the base site and compare matching paths on the target
- `--max-pages`: limit number of pages when crawling (default 20)
- `--viewport <WIDTHxHEIGHT>` and `--device-scale-factor <n>`: keep captures aligned
- `--wait-until`: `load|domcontentloaded|networkidle` (default `networkidle`)
- `--threshold`: Pixelmatch threshold (default `0.1`); lower is stricter
- `--post-wait`: ms to wait after load before taking screenshots (default 2000)
- `--full-page` / `--no-full-page`: full-page screenshot toggle (default inherits from `FULL_PAGE_SCREENSHOT`, which is off; so viewport-only by default)
- `--no-headless`: show browser for debugging
- `--devices`: comma-separated list of devices, e.g. `desktop,mobile`
- `--include`, `--exclude`: comma-separated glob patterns to filter crawled paths

Artifacts land in `artifacts/<run-id>/` with `base.png`, `target.png`, `diff.png`, and `report.json`.
Batch runs land in `artifacts/<batch-id>/` with per-page sub-runs and a `batch-report.json`.

Note: visual diffs are computed on the overlapping viewport area (min width/height of both captures) to avoid counting extra page length as a false-positive difference. Use consistent viewports/full-page settings for best alignment.

## API Server
```bash
npm start            # assumes `npm run build` has been run
# or
npm run dev          # ts-node dev mode
```

Frontend UI is served from `/public` when the server is running: open `http://localhost:3000` to configure runs (single page or crawl), set thresholds, waits, viewport, full-page, headless, and run comparisons. Artifacts are exposed at `/artifacts/...`.

`POST /compare`
```json
{
  "baseUrl": "https://example.com",
  "targetUrl": "https://staging.example.com",
  "labels": { "base": "prod", "target": "new" },
  "options": {
    "threshold": 0.1,
    "waitUntil": "networkidle",
    "navigationTimeoutMs": 300000,
    "viewport": { "width": 1280, "height": 720 }
  }
}
```

`POST /compare/batch` (crawls base, matches paths on target)
```json
{
  "baseUrl": "https://example.com",
  "targetUrl": "https://staging.example.com",
  "maxPages": 10,
  "options": {
    "threshold": 0.1,
    "waitUntil": "networkidle",
    "navigationTimeoutMs": 120000,
    "viewport": { "width": 1280, "height": 720 }
  }
}
```

Response:
```json
{
  "result": {
    "runId": "run-...",
    "outputDir": ".../artifacts/run-...",
    "base": { "screenshotPath": "...", "timing": { "loadTimeMs": 2400 } },
    "target": { "screenshotPath": "...", "timing": { "loadTimeMs": 1800 } },
    "diff": { "diffPixels": 0, "similarity": 1, "diffPath": ".../diff.png" }
  }
}
```

Health check: `GET /health` → `{ "status": "ok" }`

## Configuration
Environment variables (all optional):
- `VIEWPORT_WIDTH`, `VIEWPORT_HEIGHT`, `DEVICE_SCALE_FACTOR`
- `FULL_PAGE_SCREENSHOT` (set to `true` to enable full-page; default is viewport-only for consistent dimensions)
- `NAVIGATION_WAIT_STATE` (`load|domcontentloaded|networkidle`)
- `NAVIGATION_TIMEOUT_MS` (default `120000`; set to `0` to disable timeouts)
- `PIXELMATCH_THRESHOLD` (default `0.1`)
- `OUTPUT_DIR` (default `./artifacts`)
- `HEADLESS` (set to `false` to show browser)
- `POST_LOAD_WAIT_MS` (default `2000`)
- `PORT` (API server port, default `3000`)

## Docker
A Playwright-ready image is provided.
```bash
docker build -t checker .
# Run API server
docker run --rm -p 3000:3000 -v "$(pwd)/artifacts:/app/artifacts" checker
```
Mount `./artifacts` to persist reports outside the container.

## Production Notes
- Uses Playwright for deterministic, isolated browser contexts and Navigation Timing for load metrics.
- Pixelmatch threshold defaults to `0.1` to smooth over anti-aliasing while catching real diffs; tune per use-case.
- All runs are timestamped and write an immutable report for auditability.
- Avoid flaky comparisons by running on consistent hardware/network; consider averaging multiple runs if needed.
