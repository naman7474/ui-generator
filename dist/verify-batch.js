"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const comparator_1 = require("./comparator");
const report_1 = require("./report");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const run = async () => {
    const baseHtml = `
    <!DOCTYPE html>
    <html>
    <head><style>
      body { margin: 0; padding: 0; font-family: sans-serif; }
      .container { padding: 20px; background: #eee; }
    </style></head>
    <body>
      <div class="container" id="main">
        <h1>Hello World</h1>
      </div>
    </body>
    </html>
  `;
    const targetHtml = `
    <!DOCTYPE html>
    <html>
    <head><style>
      body { margin: 0; padding: 0; font-family: sans-serif; }
      .container { padding: 30px; background: #eee; } /* Changed padding */
    </style></head>
    <body>
      <div class="container" id="main">
        <h1>Hello World</h1>
      </div>
    </body>
    </html>
  `;
    await promises_1.default.writeFile('base.html', baseHtml);
    await promises_1.default.writeFile('target.html', targetHtml);
    const cwd = process.cwd();
    const baseUrl = `file://${path_1.default.join(cwd, 'base.html')}`;
    const targetUrl = `file://${path_1.default.join(cwd, 'target.html')}`;
    const outputDir = path_1.default.join(cwd, 'test-batch-output');
    console.log('Comparing sites...');
    const result = await (0, comparator_1.compareSites)(baseUrl, targetUrl, { base: 'Base', target: 'Target' }, { outputDir });
    const batchResult = {
        batchId: 'test-batch',
        baseRoot: baseUrl,
        targetRoot: targetUrl,
        paths: ['/'],
        summary: {
            averageSimilarity: result.diff.similarity,
            averageDiffPixels: result.diff.diffPixels,
            averageBaseLoadMs: result.base.timing.loadTimeMs,
            averageTargetLoadMs: result.target.timing.loadTimeMs,
        },
        pages: [result],
        outputDir,
    };
    console.log('Writing batch report...');
    const reportPath = await (0, report_1.writeBatchReport)(batchResult);
    console.log(`Batch report written to ${reportPath}`);
    const reportContent = await promises_1.default.readFile(path_1.default.join(outputDir, 'batch-report.html'), 'utf-8');
    if (reportContent.includes('Layout & Style Differences') && reportContent.includes('padding-top: +10.0px')) {
        console.log('SUCCESS: Batch report contains style differences.');
    }
    else {
        console.error('FAILURE: Batch report missing style differences.');
    }
    // Clean up
    await promises_1.default.unlink('base.html');
    await promises_1.default.unlink('target.html');
    // await fs.rm(outputDir, { recursive: true, force: true });
};
run().catch(console.error);
