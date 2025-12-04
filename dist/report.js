"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeBatchReport = exports.writeReport = exports.buildBatchHtml = exports.buildSingleHtml = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const style_diff_1 = require("./style-diff");
const markdown_1 = require("./markdown");
const gemini_1 = require("./gemini");
const toPosixPath = (value) => value.split(path_1.default.sep).join('/');
const formatPercent = (value) => `${(value * 100).toFixed(2)}%`;
const isFiniteNumber = (value) => typeof value === 'number' && Number.isFinite(value);
const formatNumber = (value) => (isFiniteNumber(value) ? value.toLocaleString() : '–');
const formatMs = (value) => (isFiniteNumber(value) ? `${value.toFixed(0)} ms` : '–');
const buildSingleJson = (result) => ({
    runId: result.runId,
    timestamps: {
        generatedAt: new Date().toISOString(),
    },
    outputDir: result.outputDir,
    base: {
        url: result.base.url,
        label: result.base.label,
        screenshot: path_1.default.basename(result.base.screenshotPath),
        timing: result.base.timing,
    },
    target: {
        url: result.target.url,
        label: result.target.label,
        screenshot: path_1.default.basename(result.target.screenshotPath),
        timing: result.target.timing,
    },
    diff: {
        diffPixels: result.diff.diffPixels,
        totalPixels: result.diff.totalPixels,
        similarity: result.diff.similarity,
        diffImage: path_1.default.basename(result.diff.diffPath),
    },
    styleDiff: result.styleDiff,
    fixPrompt: undefined,
});
const buildBatchJson = (batch) => ({
    batchId: batch.batchId,
    baseRoot: batch.baseRoot,
    targetRoot: batch.targetRoot,
    paths: batch.paths,
    summary: batch.summary,
    pages: batch.pages.map((p) => ({
        runId: p.runId,
        base: {
            url: p.base.url,
            timing: p.base.timing,
            screenshot: path_1.default.basename(p.base.screenshotPath),
        },
        target: {
            url: p.target.url,
            timing: p.target.timing,
            screenshot: path_1.default.basename(p.target.screenshotPath),
        },
        diff: {
            diffPixels: p.diff.diffPixels,
            totalPixels: p.diff.totalPixels,
            similarity: p.diff.similarity,
            diffImage: path_1.default.basename(p.diff.diffPath),
        },
        outputDir: p.outputDir,
        styleDiff: p.styleDiff,
    })),
    outputDir: batch.outputDir,
});
const renderStyleDifferences = (differences) => {
    if (!differences || differences.length === 0)
        return '';
    const sections = {};
    differences.forEach((diff) => {
        const sectionKey = diff.section || 'Global';
        if (!sections[sectionKey])
            sections[sectionKey] = [];
        sections[sectionKey].push(diff);
    });
    const renderSectionRows = (sectionName, entries) => {
        const groupedByCategory = {};
        entries.forEach((entry) => {
            const cat = entry.category || 'Misc';
            if (!groupedByCategory[cat])
                groupedByCategory[cat] = [];
            groupedByCategory[cat].push(entry);
        });
        const sectionTitle = sectionName === 'Global' ? 'Global / Shared Styles' : sectionName;
        return `
      <tr style="background: #dbeafe;">
        <td colspan="5" style="padding: 10px 16px; font-weight: 700; color: #1d4ed8;">Section: ${sectionTitle}</td>
      </tr>
      ${Object.keys(groupedByCategory).sort().map(cat => `
        <tr style="background: #f1f5f9;">
          <td colspan="5" style="padding: 8px 16px; font-weight: 700; color: #475569; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">${cat}</td>
        </tr>
        ${groupedByCategory[cat].map(d => {
            const sectionLines = [];
            if (d.sectionPathTarget) {
                sectionLines.push(`<div style="font-size: 11px; color: #0f172a; margin-bottom: 2px; font-weight: 600;">Target: ${d.sectionPathTarget}</div>`);
            }
            else if (d.sectionPath) {
                sectionLines.push(`<div style="font-size: 11px; color: #64748b; margin-bottom: 4px;">${d.sectionPath}</div>`);
            }
            if (d.sectionPathBase && d.sectionPathBase !== d.sectionPathTarget) {
                sectionLines.push(`<div style="font-size: 11px; color: #94a3b8; margin-bottom: 4px;">Base: ${d.sectionPathBase}</div>`);
            }
            return `
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px 16px;">
              ${sectionLines.join('')}
              ${d.text ? `<div style="font-weight: 600; color: #0f172a; margin-bottom: 2px;">${d.text}</div>` : ''}
              <code style="font-size: 11px; color: #475569; background: #e2e8f0; padding: 2px 5px; border-radius: 4px; word-break: break-all;">${d.tagName} ${d.selector}</code>
            </td>
            <td style="padding: 10px 16px; color: #334155; font-weight: 500;">${d.property}</td>
            <td style="padding: 10px 16px; color: #64748b; text-decoration: line-through;">${d.baseValue}</td>
            <td style="padding: 10px 16px; color: #0f172a; font-weight: 600;">${d.targetValue}</td>
            <td style="padding: 10px 16px;">
              <span style="font-size: 12px; font-weight: 600; color: ${d.diff.startsWith('+') ? '#dc2626' : (d.diff === 'changed' ? '#d97706' : '#166534')}; background: ${d.diff.startsWith('+') ? '#fef2f2' : (d.diff === 'changed' ? '#fffbeb' : '#f0fdf4')}; padding: 2px 8px; border-radius: 99px; white-space: nowrap;">${d.diff}</span>
            </td>
          </tr>
          `;
        }).join('')}
      `).join('')}
    `;
    };
    return `
    <div class="card" style="margin-top: 14px; padding: 0; overflow: hidden;">
      <div class="label" style="padding: 16px 16px 12px; border-bottom: 1px solid #e2e8f0;">Actionable Insights</div>
      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left;">
          <thead>
            <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
              <th style="padding: 10px 16px; font-weight: 600; color: #64748b;">Element</th>
              <th style="padding: 10px 16px; font-weight: 600; color: #64748b;">Property</th>
              <th style="padding: 10px 16px; font-weight: 600; color: #64748b;">Base</th>
              <th style="padding: 10px 16px; font-weight: 600; color: #64748b;">Target</th>
              <th style="padding: 10px 16px; font-weight: 600; color: #64748b;">Diff</th>
            </tr>
          </thead>
          <tbody>
            ${Object.keys(sections).sort().map(section => renderSectionRows(section, sections[section])).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
};
const buildSingleHtml = (payload) => {
    const createdAt = payload.timestamps.generatedAt;
    const baseImg = encodeURI(toPosixPath(payload.base.screenshot));
    const targetImg = encodeURI(toPosixPath(payload.target.screenshot));
    const diffImg = encodeURI(toPosixPath(payload.diff.diffImage));
    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Visual Report - ${payload.runId}</title>
  <style>
    :root { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #0f172a; background: #f8fafc; }
    * { box-sizing: border-box; }
    body { margin: 0; padding: 32px 18px 48px; }
    .page { max-width: 1100px; margin: 0 auto; }
    h1 { margin: 0; font-size: 30px; letter-spacing: -0.02em; }
    p { margin: 0; color: #475569; }
    .hero { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px; }
    .pill { display: inline-flex; align-items: center; gap: 6px; padding: 8px 12px; border-radius: 999px; background: #e0f2fe; color: #075985; font-weight: 700; font-size: 12px; }
    .card { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px; box-shadow: 0 10px 26px rgba(15, 23, 42, 0.08); margin-bottom: 14px; }
    .muted { color: #64748b; font-size: 14px; }
    .grid { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }
    .row { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 12px; align-items: start; }
    figure { margin: 0; }
    figure img { width: 100%; border-radius: 12px; border: 1px solid #e2e8f0; background: #0f172a; }
    .stat { font-size: 28px; font-weight: 800; }
    .label { font-weight: 700; color: #334155; font-size: 13px; text-transform: uppercase; letter-spacing: 0.04em; }
    .btn-primary { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 10px 14px; border-radius: 12px; border: none; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #fff; font-weight: 700; text-decoration: none; }
    .chips { display: flex; gap: 10px; flex-wrap: wrap; }
  </style>
</head>
<body>
  <div class="page">
    <div class="hero">
      <div>
        <div class="pill">Run ${payload.runId}</div>
        <h1>Visual comparison report</h1>
        <p>Generated ${createdAt}</p>
      </div>
      <div style="display: flex; gap: 8px;">
        <a class="btn-primary" href="./report.json">View raw JSON</a>
        ${payload.styleDiff && payload.styleDiff.differences.length > 0 ? '<a class="btn-primary" href="./fix-prompt.md" style="background: linear-gradient(135deg, #9333ea, #7e22ce);">View Fix Prompt</a>' : ''}
      </div>
    </div>

    <div class="grid">
      <div class="card">
        <div class="label">Visual similarity</div>
        <div class="stat">${formatPercent(payload.diff.similarity)}</div>
        <div class="muted">${formatNumber(payload.diff.diffPixels)} pixels differed of ${formatNumber(payload.diff.totalPixels)}</div>
      </div>
      <div class="card">
        <div class="label">Load time (ms)</div>
        <div class="chips">
          <span class="pill" style="background:#dcfce7;color:#166534;">Base ${formatMs(payload.base.timing.loadTimeMs)}</span>
          <span class="pill" style="background:#fee2e2;color:#9f1239;">Target ${formatMs(payload.target.timing.loadTimeMs)}</span>
        </div>
      </div>
      <div class="card">
        <div class="label">URLs</div>
        <div class="muted"><strong>Base:</strong> <a href="${payload.base.url}">${payload.base.url}</a></div>
        <div class="muted"><strong>Target:</strong> <a href="${payload.target.url}">${payload.target.url}</a></div>
      </div>
    </div>

    <div class="row" style="margin-top: 8px;">
      <figure class="card">
        <div class="label">Base page (${payload.base.label || 'base'})</div>
        <img src="${baseImg}" alt="Base screenshot" />
      </figure>
      <figure class="card">
        <div class="label">Target page (${payload.target.label || 'target'})</div>
        <img src="${targetImg}" alt="Target screenshot" />
      </figure>
    </div>

    <div class="card" style="margin-top: 8px;">
       <div class="label">Diff Heatmap</div>
       <img src="${diffImg}" alt="Diff heatmap" style="width: 100%; border-radius: 8px; border: 1px solid #e2e8f0;" />
    </div>

    ${payload.fixPrompt ? `
    <div class="card" style="margin-top: 14px;">
      <div class="label" style="margin-bottom: 12px;">AI Fix Recommendation</div>
      <div style="background: #fff; padding: 16px; border-radius: 8px; font-size: 14px; color: #334155; border: 1px solid #e2e8f0; line-height: 1.6;">
        ${(0, markdown_1.markdownToHtml)(payload.fixPrompt)}
      </div>
    </div>
    ` : ''}

    ${payload.styleDiff ? renderStyleDifferences(payload.styleDiff.differences) : ''}
  </div>
</body>
</html>`;
};
exports.buildSingleHtml = buildSingleHtml;
const buildBatchHtml = (payload) => {
    const batchRoot = payload.outputDir || '.';
    const pageCards = payload.pages
        .map((page, idx) => {
        const pageLabel = payload.paths[idx] ?? page.base.url ?? page.runId ?? `Page ${idx + 1}`;
        const pageDir = page.outputDir || (page.runId ? path_1.default.join(batchRoot, page.runId) : batchRoot);
        let prefix = '';
        try {
            const relativeDir = toPosixPath(path_1.default.relative(batchRoot, pageDir));
            prefix = relativeDir && relativeDir !== '.' ? `${relativeDir}/` : '';
        }
        catch {
            prefix = '';
        }
        const baseImg = encodeURI(`${prefix}${page.base.screenshot ?? ''}`);
        const targetImg = encodeURI(`${prefix}${page.target.screenshot ?? ''}`);
        const diffImg = encodeURI(`${prefix}${page.diff.diffImage ?? ''}`);
        return `
        <div class="card">
          <div class="label">${pageLabel}</div>
          <div class="muted" style="margin: 4px 0 8px;">
            Similarity ${formatPercent(page.diff.similarity)} · Base ${formatMs(page.base.timing.loadTimeMs)} / Target ${formatMs(page.target.timing.loadTimeMs)}
            ${page.styleDiff && page.styleDiff.differences.length > 0 ? ` · <a href="${prefix}fix-prompt.md" style="color: #7e22ce; font-weight: 600;">View Fix Prompt</a>` : ''}
          </div>
          <div class="row">
            <figure>
              <div class="label">Base</div>
              <img src="${baseImg}" alt="Base screenshot for ${pageLabel}" />
            </figure>
            <figure>
              <div class="label">Target</div>
              <img src="${targetImg}" alt="Target screenshot for ${pageLabel}" />
            </figure>
            <figure>
              <div class="label">Diff</div>
              <img src="${diffImg}" alt="Diff heatmap for ${pageLabel}" />
            </figure>
          </div>
          ${page.styleDiff ? renderStyleDifferences(page.styleDiff.differences) : ''}
        </div>
      `;
    })
        .join('\n');
    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Batch Visual Report - ${payload.batchId}</title>
  <style>
    :root { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #0f172a; background: #f8fafc; }
    * { box-sizing: border-box; }
    body { margin: 0; padding: 32px 18px 48px; }
    .page { max-width: 1100px; margin: 0 auto; }
    h1 { margin: 0; font-size: 30px; letter-spacing: -0.02em; }
    p { margin: 0; color: #475569; }
    .hero { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px; }
    .pill { display: inline-flex; align-items: center; gap: 6px; padding: 8px 12px; border-radius: 999px; background: #e0f2fe; color: #075985; font-weight: 700; font-size: 12px; }
    .card { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px; box-shadow: 0 10px 26px rgba(15, 23, 42, 0.08); margin-bottom: 14px; }
    .muted { color: #64748b; font-size: 14px; }
    .grid { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }
    .row { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px; align-items: start; }
    figure { margin: 0; }
    figure img { width: 100%; border-radius: 12px; border: 1px solid #e2e8f0; background: #0f172a; }
    .stat { font-size: 28px; font-weight: 800; }
    .label { font-weight: 700; color: #334155; font-size: 13px; text-transform: uppercase; letter-spacing: 0.04em; }
    .btn-primary { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 10px 14px; border-radius: 12px; border: none; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #fff; font-weight: 700; text-decoration: none; }
    .chips { display: flex; gap: 10px; flex-wrap: wrap; }
  </style>
</head>
<body>
  <div class="page">
    <div class="hero">
      <div>
        <div class="pill">Batch ${payload.batchId}</div>
        <h1>Whole-site visual report</h1>
        <p>${payload.paths.length} pages compared | ${payload.baseRoot} → ${payload.targetRoot}</p>
      </div>
      <a class="btn-primary" href="./batch-report.json">View raw JSON</a>
    </div>

    <div class="grid">
      <div class="card">
        <div class="label">Average similarity</div>
        <div class="stat">${formatPercent(payload.summary.averageSimilarity)}</div>
        <div class="muted">Avg differing pixels: ${formatNumber(payload.summary.averageDiffPixels)}</div>
      </div>
      <div class="card">
        <div class="label">Average load (ms)</div>
        <div class="chips">
          <span class="pill" style="background:#dcfce7;color:#166534;">Base ${formatMs(payload.summary.averageBaseLoadMs)}</span>
          <span class="pill" style="background:#fee2e2;color:#9f1239;">Target ${formatMs(payload.summary.averageTargetLoadMs)}</span>
        </div>
      </div>
      <div class="card">
        <div class="label">Scope</div>
        <div class="muted">Base root: <a href="${payload.baseRoot}">${payload.baseRoot}</a></div>
        <div class="muted">Target root: <a href="${payload.targetRoot}">${payload.targetRoot}</a></div>
        <div class="muted">Pages: ${payload.paths.length}</div>
      </div>
    </div>

    <div style="margin-top: 12px; display: grid; gap: 12px;">
      ${pageCards}
    </div>
  </div>
</body>
</html>`;
};
exports.buildBatchHtml = buildBatchHtml;
const writeReport = async (result) => {
    const reportPath = path_1.default.join(result.outputDir, 'report.json');
    const payload = buildSingleJson(result);
    if (result.styleDiff && result.styleDiff.differences.length > 0) {
        // Try to generate AI prompt
        try {
            const prompt = await (0, gemini_1.generateAiFixPrompt)(result.base.screenshotPath, result.target.screenshotPath, result.diff.diffPath, result.styleDiff.differences);
            await promises_1.default.writeFile(path_1.default.join(result.outputDir, 'fix-prompt.md'), prompt, 'utf-8');
            payload.fixPrompt = prompt;
        }
        catch (err) {
            console.error('Failed to generate AI fix prompt, falling back to static:', err);
            const staticPrompt = (0, style_diff_1.generateFixPrompt)(result.styleDiff.differences);
            await promises_1.default.writeFile(path_1.default.join(result.outputDir, 'fix-prompt.md'), staticPrompt, 'utf-8');
            payload.fixPrompt = staticPrompt;
        }
    }
    await promises_1.default.writeFile(reportPath, JSON.stringify(payload, null, 2), 'utf-8');
    await promises_1.default.writeFile(path_1.default.join(result.outputDir, 'report.html'), (0, exports.buildSingleHtml)(payload), 'utf-8');
    return reportPath;
};
exports.writeReport = writeReport;
const writeBatchReport = async (batch) => {
    const reportPath = path_1.default.join(batch.outputDir, 'batch-report.json');
    const payload = buildBatchJson(batch);
    await promises_1.default.writeFile(reportPath, JSON.stringify(payload, null, 2), 'utf-8');
    await promises_1.default.writeFile(path_1.default.join(batch.outputDir, 'batch-report.html'), (0, exports.buildBatchHtml)(payload), 'utf-8');
    return reportPath;
};
exports.writeBatchReport = writeBatchReport;
